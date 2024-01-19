'use client'
import React, { useEffect } from 'react'
import { useChat } from 'ai/react' // use for streaming text UI
import axios from 'axios'
import { Message } from 'ai'

import { Input } from './ui/input'
import { Send } from 'lucide-react'
import { Button } from './ui/button'
import MessageList from './MessageList'
import { useQuery } from '@tanstack/react-query'

type Props = { chatId: number }

const ChatComponent = ({ chatId }: Props) => {
    const { data, isLoading } = useQuery({
        queryKey: ["chat", chatId], // uniquely identify this query made to the backend
        queryFn: async () => {
            const response = await axios.post<Message[]>('/api/get-messages', { chatId })
            return response.data
        }
    })

    const { input, handleInputChange, handleSubmit, messages } = useChat({
        api: "/api/chat",
        body: { // additional objects that can be passed back to our backend
            chatId
        },
        initialMessages: data || [],
    }); // This will handle the all the logic (send BE and get res, effects, etc.)
    // whenever we hit enter It will send the message to our chatGPT endPoint and it will return us with the streaming output from chatGPT.

    // press |handleSubmit| -> send current |messages| into our API (/api/chat) <- this is the default endPoint and we can change it if we want -> useChat({api: '/api/test'}); 

    useEffect(() => { // this useEffect use for chat scroll effect.
        const messageContainer = document.getElementById('message-container')
        if (messageContainer) {
            messageContainer.scrollTo({
                top: messageContainer.scrollHeight,
                behavior: "smooth"
            })
        }
    }, [messages])

    return (
        // id='message-container' --> this use for chat scroll effect
        <div className=' relative max-h-screen overflow-scroll scrollbar-hide' id='message-container'>
            {/* header */}
            <div className=' sticky top-0 inset-x-0 p-2 bg-white h-fit'>
                <h3 className=' text-xl font-bold'>Chat</h3>
            </div>

            {/* message list */}
            <MessageList messages={messages} isLoading={isLoading} />

            <form onSubmit={handleSubmit} className=' sticky bottom-0 inset-x-0 px-2 py-4 bg-white'>
                <div className='flex'>
                    <Input value={input} onChange={handleInputChange} placeholder='Ask any question...' className=' w-full' />
                    <Button className=" bg-blue-600 ml-2"><Send className='h-4 w-4' /></Button>
                </div>
            </form>
        </div>
    )
}

export default ChatComponent