import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const paymentId = searchParams.get('id')

    if (!paymentId) {
      return NextResponse.json({ error: 'payment_id requis' }, { status: 400 })
    }

    if (!process.env.MOLLIE_API_KEY) {
      return NextResponse.json({ error: 'MOLLIE_API_KEY non configurée' }, { status: 500 })
    }

    const res = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MOLLIE_API_KEY}` },
    })

    if (!res.ok) {
      return NextResponse.json({ status: 'error' }, { status: 500 })
    }

    const payment = await res.json()
    // status: 'paid' | 'pending' | 'failed' | 'canceled' | 'expired'
    return NextResponse.json({
      status:   payment.status,
      paid:     payment.status === 'paid',
      animalId: payment.metadata?.animalId,
    })
  } catch (err) {
    console.error('[MOLLIE] Verify error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
