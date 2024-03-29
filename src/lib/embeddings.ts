import { OpenAIApi, Configuration } from 'openai-edge'

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(config)

// this function purely converts a text into a vector
export async function getEmbeddings(text: string) {
    try {
        const response = await openai.createEmbedding({
            model: 'text-embedding-ada-002',
            input: text.replace(/\n/g, " ")
        })


        const result = await response.json();
        // console.log('result -)-)-)-)-)-)-)-', process.env.OPENAI_API_KEY, result)
        return result.data[0].embedding as number[] // It's going to be a vector.
    } catch (error) {
        console.log('error calling openai embeddings api ::', error)
        throw error
    }
}