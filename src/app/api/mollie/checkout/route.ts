import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { animalId, amount = '4.99', description } = await req.json()

    if (!process.env.MOLLIE_API_KEY) {
      return NextResponse.json({ error: 'MOLLIE_API_KEY non configurée' }, { status: 500 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sauvcoeur.re'

    const res = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`,
      },
      body: JSON.stringify({
        amount:      { currency: 'EUR', value: amount },
        description: description ?? `Boost annonce SauvCoeur.re — ${animalId}`,
        redirectUrl: `${siteUrl}/animaux/${animalId}?boost=success&payment_id={id}`,
        webhookUrl:  `${siteUrl}/api/mollie/webhook`,
        metadata:    { animalId },
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      console.error('[MOLLIE] Checkout error:', err)
      return NextResponse.json({ error: 'Erreur Mollie' }, { status: 500 })
    }

    const payment = await res.json()
    const checkoutUrl = payment._links?.checkout?.href

    return NextResponse.json({ checkoutUrl, paymentId: payment.id })
  } catch (err) {
    console.error('[MOLLIE] Checkout error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
