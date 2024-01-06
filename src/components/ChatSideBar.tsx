'use client'

import { DrizzleChat } from '@/lib/db/schema'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { PlusCircle } from 'lucide-react'

type Props = {
    chats: DrizzleChat[],
    chatId: number
}

const ChatSideBar = ({ chatId, chats }: Props) => {
    return (
        <div className=' w-full h-screen p-4 text-gray-200 bg-gray-900'>
            <Link href='/'>

                <Button className=' w-full border-dashed border-white border'><PlusCircle className='mr-2 w-4 h-4' /> NewChat</Button>
            </Link>
            <div className="flex flex-col gap-2 mt-4">
                {chats.map(chat => (
                    <Link key={chat.id} href={`/chat/${chat.id}`}>
                        <div className=' rounded-lg'><h1>working on it ...</h1></div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default ChatSideBar