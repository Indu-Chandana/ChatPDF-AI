// import { Pinecone, Vector, utils as PineconeUtils } from "@pinecone-database/pinecone"
import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server"

// this PDF loader will be able to read from the file system and give us the text of that PDF file.
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { Document, RecursiveCharacterTextSplitter } from '@pinecone-database/doc-splitter'
import md5 from 'md5'

import { getEmbeddings } from "./embeddings"
import { convertToAscii } from "./utils"

////////////////////////////////// Pinecone resent V not Working //////////////////////////////////////////////////////////////
let pinecone: Pinecone | null = null

// this going to help us initialize the pinecone
// export const getPineconeClient = async () => {
//     if (!pinecone) {
//         pinecone = new Pinecone({
//             apiKey: process.env.PINECONE_API_KEY!,
//             environment: process.env.PINECONE_ENVIRONMENT!
//         })
//     }

//     return pinecone
// }
////////////////////////////////// Pinecone resent V not Working //////////////////////////////////////////////////////////////

export const getPineconeClient = () => {
    return new Pinecone({
        environment: process.env.PINECONE_ENVIRONMENT!,
        apiKey: process.env.PINECONE_API_KEY!,
    });
};

type PDFPage = {
    pageContent: string;
    metadata: {
        loc: { pageNumber: number }
    }
}

// load S3 into pinecone
export async function loadS3IntoPinecone(fileKey: string) {
    // 1. obtain the pdf -> dowload and read from pdf --------------------------------------------------------
    console.log('downloading s# into file system ++++++++')

    const file_name = await downloadFromS3(fileKey) // time to download the pdf

    if (!file_name) {
        throw new Error("could not download from s3 ------------_________")
    }

    // how do we get all the text from the PDF -> we can do it by lang-chain library
    const loader = new PDFLoader(file_name)
    const pages = (await loader.load()) as PDFPage[]; // It will return us all the pages within the PDF.
    console.log('pages .%%%%%%%%%%%%%%%.', pages)

    // 2. split and segment the pdf-------------------------------------------------------------------------------

    // pages = Array(13)
    // documents = Array(100)
    const documents = await Promise.all(pages.map(PrepareDocument)) // pages -> [] we map one by one 

    console.log('documents :():', documents)

    // 3. vectorise and embed individual documents ------------------------------------------------------------------
    const vectors = await Promise.all(documents.flat().map(embedDocument))

    // 4. upload to pinecone --------------------------------------------------------------------------------------------
    const client = await getPineconeClient()

    const pineconeIndex: any = client.Index('chatpdf')

    const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

    console.log("inserting vectors into pinecone");
    await namespace.upsert(vectors);

    return documents[0]; //ALl console.log are in here -> https://docs.google.com/document/d/1Gz5PF6saq8YSnAPnsIAfwICoGWc2G1-3Cc6iJadcct0/edit?usp=sharing
    // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    ////////////////////////////////// Pinecone resent V not Working //////////////////////////////////////////////////////////////
    // console.log('inserting vectors into pinecone.')

    // const namespace = convertToAscii(fileKey)

    // console.log('namespace ::', namespace)
    // // pineconeIndex.upsert()

    // // PineconeUtils.chunkedUpsert(pineconeIndex, vectors, namespace, 10)

    // await namespace.upsert(vectors);

    // return documents[0]
    ////////////////////////////////// Pinecone resent V not Working //////////////////////////////////////////////////////////////
}

async function embedDocument(doc: Document) {
    try {
        const embeddings = await getEmbeddings(doc.pageContent)

        // we id the vector within pinecone.
        const hash = md5(doc.pageContent)

        return {
            id: hash,
            values: embeddings,
            metadata: {
                text: doc.metadata.text,
                pageNumber: doc.metadata.pageNumber
            }
        } as PineconeRecord
    } catch (error) {
        console.log('error embedding document', error)
        throw error
    }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
    const enc = new TextEncoder()
    return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes))
}

// one of the object of the array
async function PrepareDocument(page: PDFPage) {
    let { pageContent, metadata } = page
    pageContent = pageContent.replace(/\n/g, ' ') // we replace all the /n with empty strings

    // split the docs
    const splitter = new RecursiveCharacterTextSplitter()
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent,
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text: truncateStringByBytes(pageContent, 36000) // This text might be too long for pinecone to handle. That's why we truncate.
            }
        })
    ])

    console.log('docs --------', docs)
    return docs // 1Page split into five six paragraphs 
}