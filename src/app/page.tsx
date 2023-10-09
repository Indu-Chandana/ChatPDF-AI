import { Button } from "@/components/ui/button";
import { UserButton, auth } from "@clerk/nextjs";

export default async function Home() { //async will make sure that it's a server component.
  // This entire code block is going to run once on the server to generate the HTML code.
  // Then this HTML code is going to be directly sent back to the client for it to be rendered.

  const { userId } = await auth()
  const isAuth = !!userId; // Good practice null | string convert into boolean

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
            <UserButton afterSignOutUrl="/" />
          </div>

          <div className="flex mt-2">
            <Button>Go to Chats</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
