import { NextResponse } from "next/server"

// /api/create-chat
// whenever they hit a POST endpoint, this code will be run.
export async function POST(req: Request, res: Response) {
    try {
        const body = await req.json()
        const { file_key, file_name } = body

        console.log('function POST', file_key, file_name)

        return NextResponse.json({ message: "success" })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 }
        )
    }
}