import { Pinecone } from "@pinecone-database/pinecone"
import { convertToAscii } from "./utils"
import { getEmbeddings } from "./embeddings"

export async function getMatchesFromEmbeddings(embeddings: number[], fileKey: string) {
    // take the query vector, It's going to search through the pinecone for the top five similar vector.
    try {
        const client = new Pinecone({
            environment: process.env.PINECONE_ENVIRONMENT!,
            apiKey: process.env.PINECONE_API_KEY!,
        })
        const pineconeIndex = await client.index("chatpdf")
        const namespace = pineconeIndex.namespace(convertToAscii(fileKey)) // I think -> in that namespace our pdf vectors located at
        const queryResult = await namespace.query({
            topK: 5,
            vector: embeddings,
            includeMetadata: true // we can get back the text, the original text from the query the similar vectors.
        });

        return queryResult.matches || []; // top 5 vectors
    } catch (error) {
        console.log("error query embeddings", error)
    }
}

export async function getContext(query: string, fileKey: string) { // query -> pass whenenver we ask the question.  // filekey -> we need the namespace 
    // why we want namespace(filekey)
    // whenever we push vectors within the pinwcone, we actually add a namespace prop.
    // so now we need to get the correct namespace so that we search the vector DB for within the correct namespace.
    // so that we're not searching for infomation from other PDFs

    const queryEmbeddings = await getEmbeddings(query) // this function is using openAI - we convert string to vector

    const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey)
    // console.log('matches >>>>>>>>>>>>', matches)
    // looking all the matching vectors. 
    // if the score less than 70%, It's probably irrelevant. we want to ignore that. 
    const qualifyingDocs = matches?.filter((match) => match.score && match.score > 0.7);

    type Metadata = {
        text: string;
        pageNumber: number;
    }

    let docs = qualifyingDocs?.map((match) => (match.metadata as Metadata).text); // get text array from it. ["Document 1", "Document 2", "Document 3", "Document 4", "Document 5"]
    return docs?.join('\n').substring(0, 3000) // ["Document 1", "Document 2", "Document 3", "Document 4", "Document 5"] -- Join the array of strings with a new line.
    // output - 
    // Document 1
    // Document 2
    // Document 3
    // Document 4
    // Document 5
}