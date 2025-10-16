import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'GET') return res.status(405).end()

  const subs = await stripe.subscriptions.list({ limit: 100, status: 'all', expand: ['data.customer', 'data.items.data.price.product'] })
  const rows = subs.data.map((s) => {
    const cust = s.customer as any
    const price = s.items.data[0]?.price
    return {
      id: s.id,
      email: cust?.email || null,
      customer: cust?.id,
      status: s.status,
      current_period_end: s.current_period_end * 1000,
      price_id: price?.id,
      product: (price?.product as any)?.name || null,
      amount: price?.unit_amount || null,
      interval: price?.recurring?.interval || null,
    }
  })
  res.json({ memberships: rows })
}
