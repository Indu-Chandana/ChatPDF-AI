// initialization of the Stipe Library.
import Stripe from 'stripe'

// to get STRIPE_KEY: got to Stripe console -> create new acc (new project)->  press developers page -> u can see the api keys
export const stripe = new Stripe(process.env.STRIPE_API_KEY as string, {
    apiVersion: '2023-10-16',
    typescript: true
})