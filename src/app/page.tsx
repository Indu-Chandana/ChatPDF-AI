import { Button } from "@/components/ui/button";
import { UserButton, auth, useAuth } from "@clerk/nextjs";
import Link from "next/dist/client/link";
import { ArrowRight, LogIn } from 'lucide-react'
import FileUpload from "@/components/FileUpload";
import { checkSubscription } from "@/lib/subdcription";
import SubscriptionButton from "@/components/SubscriptionButton";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function Home() { //async will make sure that it's a server component.
  // This entire code block is going to run once on the server to generate the HTML code.
  // Then this HTML code is going to be directly sent back to the client for it to be rendered.

  const { userId, user, getToken, sessionId, } = await auth();
  const isAuth = !!userId; // Good practice null | string convert into boolean
  const isPro = await checkSubscription() // we can check the subscription details in DB

  // get the first created chat
  let firstChat;
  if (userId) {
    firstChat = await db.select().from(chats).where(eq(chats.userId, userId))
    if (firstChat) {
      firstChat = firstChat[0]
    }
  }

  console.log('isAuth', isAuth, userId, user, getToken, sessionId,)
  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
            <UserButton afterSignOutUrl="/" />
          </div>

          <div className="flex mt-2">
            {isAuth && firstChat &&
              <Link href={`/chat/${firstChat.id}`}>
                <Button>Go to Chats <ArrowRight className="ml-2" /></Button>
              </Link>
            }
            <div className="ml-3"><SubscriptionButton isPro={isPro} /></div>
          </div>
          <p className="max-w-xl mt-1 text-lg text-slate-600">Join millions of students, researchers and professionals to instantly answer questions and understand reasearch with AI</p>

          <div className="w-full mt-4">
            {isAuth ? (
              <FileUpload />
            ) : (
              <Link href="/sign-in">
                <Button>Login to get Started!
                  {/* add icon lucide */}
                  <LogIn className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
