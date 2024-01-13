'use client'
import React from 'react'
import { useChat } from 'ai/react' // use for streaming text UI

import { Input } from './ui/input'
import { Send } from 'lucide-react'
import { Button } from './ui/button'
import MessageList from './MessageList'

type Props = {}

const ChatComponent = (props: Props) => {
    const { input, handleInputChange, handleSubmit, messages } = useChat(); // This will handle the all the logic (send BE and get res, effects, etc.)
    // whenever we hit enter It will send the message to our chatGPT endPoint and it will return us with the streaming output from chatGPT.

    // press |handleSubmit| -> send current |messages| into our API (/api/chat) <- this is the default endPoint and we can change it if we want -> useChat({api: '/api/test'}); 


    return (
        <div className=' relative max-h-screen overflow-scroll scrollbar-hide'>
            {/* header */}
            <div className=' sticky top-0 inset-x-0 p-2 bg-white h-fit'>
                <h3 className=' text-xl font-bold'>Chat</h3>
            </div>

            {/* message list */}
            <MessageList messages={messages} />

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