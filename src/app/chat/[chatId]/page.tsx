// /chat/121h1323

import ChatSideBar from '@/components/ChatSideBar';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import React from 'react'

type Props = {
    params: {
        chatId: string;
    }

}

// This is server component
const ChatPage = async ({ params: { chatId } }: Props) => {
    const { userId } = await auth();

    if (!userId) {
        return redirect('/sign-in')
    }

    // Trying to get all the chat that user has
    const _chats = await db.select().from(chats).where(eq(chats.userId, userId))
    if (!_chats) {
        return redirect('/')
    }

    if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
        return redirect("/")
    }

    return (
        <div className='flex max-h-screen overflow-scroll'>
            <div className='flex w-full max-h-screen overflow-scroll'>
                {/* chat sidebar */}
                <div className='flex-[1] max-w-xs bg-slate-500'>
                    {/* <h1>hello</h1> */}
                    <ChatSideBar chats={_chats} chatId={parseInt(chatId)} />
                </div>

                {/* pdf viewer */}
                <div className=' max-h-screen p-4 overflow-scroll flex-[5] bg-stone-600'>
                    <h1>hello 2</h1>
                    {/* <PDFViewer/> */}
                </div>

                {/* chat component */}
                <div className='flex-[3] border-l-4 border-l-slate-200'>
                    <h1>hello 3</h1>
                    {/* <ChatComponent/> */}
                </div>
            </div>
        </div>
    )
}

export default ChatPage