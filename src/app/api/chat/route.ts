import { Configuration, OpenAIApi } from 'openai-edge'
import { Message, OpenAIStream, StreamingTextResponse } from 'ai'
import { db } from '@/lib/db'
import { chats, messages as _messages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { getContext } from '@/lib/context'

export const runtime = 'edge'

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

export async function POST(req: Request) {
    try {
        const { messages, chatId } = await req.json() // messages comes from | useChat |

        const _chats = await db.select().from(chats).where(eq(chats.id, chatId)) // for get the filekey
        // console.log('_chats -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+', _chats)
        if (_chats.length != 1) {
            return NextResponse.json({ 'error': 'chat not found' }, { status: 404 })
        }

        const fileKey = _chats[0].fileKey
        // get last message
        const lastMessage = messages[messages.length - 1];

        const context = await getContext(lastMessage.content, fileKey) // This should return us whole paragraph of relevant vectors.

        // console.log('context \\\\\\\\\\\\\\\\\\\\\\\\', context)
        // now feeding the context into chatGPT
        const prompt = {
            role: "system",
            content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
            The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
            AI is a well-behaved and well-mannered individual.
            AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
            AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
            AI assistant is a big fan of Pinecone and Vercel.
            START CONTEXT BLOCK
            ${context}
            END OF CONTEXT BLOCK
            AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
            If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
            AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
            AI assistant will not invent anything that is not drawn directly from the context.
            `,
        };

        // Ask OpenAI for a streaming chat completion given the prompt
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo', // very fast model
            messages: [
                prompt, ...messages.filter((message: Message) => message.role === "user")
            ],
            stream: true // animation like chat bot - send req to OpenAI instead waiting for generate whole res,  it send me chunk by chunck 
        })
        // console.log('response --------------------------------', response)
        // I send - Hello
        // res(bot) - Hello, How can I help you.

        // Ask OpenAI for a streaming chat completion given the prompt
        const stream = OpenAIStream(response, {
            onStart: async () => {
                // save user message into db
                await db.insert(_messages).values({
                    chatId,
                    content: lastMessage.content,
                    role: 'user'
                })
            },
            onCompletion: async (completion) => {
                // save ai message into db
                await db.insert(_messages).values({
                    chatId,
                    content: completion,
                    role: 'system'
                })
            }
        })
        // Respond with the stream

        // I think - we are using |useChat()| for our form.  therefore we need to return back our res friendly with 'ai' library (vercel ai sdk)
        return new StreamingTextResponse(stream)
    } catch (error) {
        console.warn('error - /api/chat POST method ::', error)
    }
}