import { db } from '@/lib/db'
import { userSubscriptions } from '@/lib/db/schema'
import { stripe } from '@/lib/stripe'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Stripe is going to send back to us, whenever the transaction succeeds or failed.  

export async function POST(req: Request) { // This req made by stripe itself.
    const body = await req.text()

    // check webhook is indeed coming from stripe itself
    const signature = headers().get('Stripe-Signature') as string

    let event: Stripe.Event

    // How we get that env -> STRIPE_WEBHOOK_SIGNING_SECRET
    // go to - https://dashboard.stripe.com/test/webhooks/create?endpoint_location=local
    // download stripe CLI and install, In mycase I used brew installation
    // open new terminal and run this comman - stripe login (this will login to ur stripe acc)
    // run this command on ur terminal `stripe listen --forward-to localhost:3000/api/webhook`
    // now u can see ur STRIPE_WEBHOOK_SIGNING_SECRET(it is a secret key) in the terminal
    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SIGNING_SECRET as string)
    } catch (error) {
        console.log('error webhook catch ::', error)
        return new NextResponse('webhook error', { status: 400 })
    }

    const session = event.data.object as Stripe.Checkout.Session

    // new subscription created
    if (event.type === 'checkout.session.completed') {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        )
        if (!session?.metadata?.userId) { // we pass this metadata previously /api/stripe
            return new NextResponse('no userID ::', { status: 400 })
        }

        // we insert into DB
        await db.insert(userSubscriptions).values({
            userId: session.metadata.userId,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
        })
    }

    // if recurrent the subscription
    if (event.type === 'invoice.payment_succeeded') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

        // we update the inserted DB data
        await db.update(userSubscriptions).set({
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }).where(eq(userSubscriptions.stripeSubscriptionId, subscription.id))
    }

    // status has to be 200, so that the webhook knows that it has finished its job.
    // if doen't have status 200, stripe thinks something went wrong and keep sending messages to the endpoint.
    return new NextResponse(null, { status: 200 })
}