import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

// Désactiver le body parser Next.js — Stripe envoie du raw text
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createSupabaseServiceClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const proId = sub.metadata.pro_id
      if (!proId) break

      await supabase
        .from('directory_pros')
        .update({
          stripe_sub_id: sub.id,
          stripe_status: sub.status,
          sort_boost: sub.status === 'active' ? 10 : 0,
          is_verified: sub.status === 'active',
        })
        .eq('id', proId)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const proId = sub.metadata.pro_id
      if (!proId) break

      await supabase
        .from('directory_pros')
        .update({ stripe_status: 'canceled', sort_boost: 0, is_verified: false })
        .eq('id', proId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
