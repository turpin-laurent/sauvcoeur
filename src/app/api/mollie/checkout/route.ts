import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { animalId, proId, type, amount = '4.99', description } = await req.json()

    if (!process.env.MOLLIE_API_KEY) {
      return NextResponse.json({ error: 'MOLLIE_API_KEY non configurée' }, { status: 500 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sauvcoeur.re'

    // Construire redirectUrl et metadata selon le type
    let redirectUrl: string
    let metadata: Record<string, string>
    let desc: string

    if (proId) {
      redirectUrl = `${siteUrl}/annuaire?payment=success&pro_id=${proId}&payment_id={id}`
      metadata    = { proId, type: type ?? 'pro_featured' }
      desc        = description ?? `Mise en avant annuaire SauvCoeur.re — ${proId}`
    } else {
      redirectUrl = `${siteUrl}/animaux/${animalId}?boost=success&payment_id={id}`
      metadata    = { animalId }
      desc        = description ?? `Boost annonce SauvCoeur.re — ${animalId}`
    }

    const res = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`,
      },
      body: JSON.stringify({
        amount:      { currency: 'EUR', value: amount },
        description: desc,
        redirectUrl,
        webhookUrl:  `${siteUrl}/api/mollie/webhook`,
        metadata,
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
