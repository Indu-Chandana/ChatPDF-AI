// check pro subscription exist with in the DB

import { auth } from "@clerk/nextjs"
import { db } from "./db"
import { userSubscriptions } from "./db/schema"
import { eq } from "drizzle-orm"

// There are 60 seconds in a minute, and each second is comprised of 1000 milliseconds. 
const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const checkSubscription = async () => {
    const { userId } = await auth()
    if (!userId) {
        return false
    }

    const _userSubscriptions = await db.select().from(userSubscriptions).where(eq(userSubscriptions.userId, userId))
    if (!_userSubscriptions[0]) { return false } // there are not subscripted.

    const userSubscription = _userSubscriptions[0]
    const isValid = userSubscription.stripePriceId && userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now() // it is bigger that date of now 

    return !!isValid; // this convert into a boolean
}