import { Configuration, OpenAIApi } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

export const runtime = 'edge'

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()

        // Ask OpenAI for a streaming chat completion given the prompt
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo', // very fast model
            messages,
            stream: true // animation like chat bot
        })

        // Ask OpenAI for a streaming chat completion given the prompt
        const stream = OpenAIStream(response)
        // Respond with the stream
        return new StreamingTextResponse(stream)
    } catch (error) {
        console.warn('error - /api/chat POST method ::', error)
    }
}