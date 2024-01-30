'use client'
import React, { useState } from 'react'
import { Button } from './ui/button'
import axios from 'axios'

type Props = { isPro: boolean }

const SubscriptionButton = (props: Props) => {
    const [loading, setLoading] = useState(false)

    // If u go to the "Manage Subscriptions" we need to enable the |customer Portal link| to do that go to this link -> `https://dashboard.stripe.com/test/settings/billing/portal`
    const handleSubscription = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/stripe')
            window.location.href = response.data.url // This gonna redirected to the stripe page.
        } catch (error) {
            console.log('catch error handleSubscription ::', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button disabled={loading} onClick={handleSubscription}>
            {props.isPro ? "Manage Subscriptions" : "Get Pro"}
        </Button>
    )
}

export default SubscriptionButton