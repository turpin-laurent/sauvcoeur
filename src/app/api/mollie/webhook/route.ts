import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Mollie envoie un POST avec `id` dans le body quand le statut change
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const params = new URLSearchParams(body)
    const paymentId = params.get('id')

    if (!paymentId || !process.env.MOLLIE_API_KEY) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // Récupérer le statut du paiement
    const res = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MOLLIE_API_KEY}` },
    })

    if (!res.ok) return NextResponse.json({ ok: false }, { status: 500 })

    const payment = await res.json()
    console.log(`[MOLLIE WEBHOOK] Payment ${paymentId} → status: ${payment.status}, animalId: ${payment.metadata?.animalId}`)

    // En prod avec Supabase : mettre à jour la BDD ici
    // await supabase.from('animals').update({ boosted: true }).eq('id', payment.metadata?.animalId)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[MOLLIE WEBHOOK] Error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
