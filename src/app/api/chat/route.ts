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

        // I send - Hello
        // res(bot) - Hello, How can I help you.

        // Ask OpenAI for a streaming chat completion given the prompt
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo', // very fast model
            messages,
            stream: true // animation like chat bot - send req to OpenAI instead waiting for generate whole res,  it send me chunk by chunck 
        })

        // Ask OpenAI for a streaming chat completion given the prompt
        const stream = OpenAIStream(response)
        // Respond with the stream

        // I think - we are using |useChat()| for our form.  therefore we need to return back our res friendly with 'ai' library (vercel ai sdk)
        return new StreamingTextResponse(stream)
    } catch (error) {
        console.warn('error - /api/chat POST method ::', error)
    }
}