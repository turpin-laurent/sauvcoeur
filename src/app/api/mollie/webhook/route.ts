import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

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

    // Récupérer le statut du paiement auprès de Mollie
    const res = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MOLLIE_API_KEY}` },
    })

    if (!res.ok) return NextResponse.json({ ok: false }, { status: 500 })

    const payment = await res.json()
    console.log(`[MOLLIE WEBHOOK] Payment ${paymentId} → status: ${payment.status}`, payment.metadata)

    if (payment.status === 'paid') {
      const sb = supabaseAdmin()
      const { animalId, proId, type } = payment.metadata ?? {}

      // ── Boost d'annonce animale ──────────────────────────────────
      if (animalId) {
        const { error } = await sb
          .from('sc_animals')
          .update({ boosted: true })
          .eq('id', animalId)
        if (error) {
          console.error('[MOLLIE WEBHOOK] Erreur update animal boosted:', error)
        } else {
          console.log(`[MOLLIE WEBHOOK] Animal ${animalId} → boosted = true`)
        }
      }

      // ── Inscription pro mise en avant ────────────────────────────
      if (proId && type === 'pro_featured') {
        const { error } = await sb
          .from('sc_pros')
          .update({ is_featured: true, moderation_status: 'approved' })
          .eq('id', proId)
        if (error) {
          console.error('[MOLLIE WEBHOOK] Erreur update pro featured:', error)
        } else {
          console.log(`[MOLLIE WEBHOOK] Pro ${proId} → is_featured = true`)
        }
      }
    }

    // Mollie attend un 200 pour confirmer la réception
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[MOLLIE WEBHOOK] Error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
