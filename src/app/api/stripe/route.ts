// /api/stripe

import { db } from "@/lib/db"
import { userSubscriptions } from "@/lib/db/schema"
import { stripe } from "@/lib/stripe"
import { auth, currentUser } from "@clerk/nextjs"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

const return_url = process.env.NEXT_BASE_URL + '/';

export async function GET() {
    try {
        const { userId } = await auth()
        // check the user
        const user = await currentUser()
        if (!userId) {
            return new NextResponse('unauthorized', { status: 401 })
        }

        // check if there are subscriped to the pro /
        // if there are sub -> there are trying to cancel the account
        // if there are NOT sub -> That means there's no role within the DB - that means they are trying to sub

        const _userSubscriptions = await db.select().from(userSubscriptions).where(eq(userSubscriptions.userId, userId))

        if (_userSubscriptions[0] && _userSubscriptions[0].stripeCustomerId) {
            // trying to cancel at the billing portal
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: _userSubscriptions[0].stripeCustomerId,
                return_url
            })
            return NextResponse.json({ url: stripeSession.url })
        }

        // user's first timetrying to subscribe
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: return_url,
            cancel_url: return_url,
            payment_method_types: ['card'],
            mode: 'subscription',
            billing_address_collection: 'auto',
            customer_email: user?.emailAddresses[0].emailAddress,
            line_items: [
                {
                    price_data: {
                        currency: "USD",
                        product_data: {
                            name: "ChatPDF Pro",
                            description: "Unlimited PDF sessions!"
                        },
                        unit_amount: 2000, // which represent 20 dollars a month
                        recurring: { // need to recurrer every mounth, thats how the subscription works.
                            interval: "month"
                        }
                    },
                    quantity: 1
                }
            ],
            metadata: { userId } // we need the userID, because whenever we finish the transaction, STRIPE is send a webhook back to our API endpoint again.
            // and within the endpoint, we need to be able to access who actually did the transaction.
        })
        return NextResponse.json({ url: stripeSession.url })
    } catch (error) {
        console.log('stripe catch error ::', error)
        return new NextResponse('internal server error', { status: 500 })
    }
}