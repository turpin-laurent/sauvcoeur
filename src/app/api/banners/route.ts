import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const DEFAULT_BANNERS = [
  { id: 'b1', slot: 'Liste annonces — haut', url: 'https://www.facebook.com/SauvCoeurReunion', text: 'Votre publicité ici — Soutenez SauvCœur.re', active: true },
  { id: 'b2', slot: 'Détail annonce — haut', url: 'https://www.facebook.com/SauvCoeurReunion', text: 'Votre publicité ici — Soutenez SauvCœur.re', active: true },
  { id: 'b3', slot: 'Détail annonce — bas',  url: 'https://www.facebook.com/SauvCoeurReunion', text: 'Votre publicité ici — Soutenez SauvCœur.re', active: true },
]

// GET /api/banners
export async function GET() {
  try {
    const sb = supabaseAdmin()
    const { data, error } = await sb.from('sc_banners').select('*').order('id')
    if (error) throw error
    // Si la table est vide, retourner les défauts
    return NextResponse.json(data && data.length > 0 ? data : DEFAULT_BANNERS)
  } catch (err) {
    console.error('[API/banners GET]', err)
    return NextResponse.json(DEFAULT_BANNERS)
  }
}

// POST /api/banners — upsert une ou plusieurs bannières
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const banners = Array.isArray(body) ? body : [body]
    const sb = supabaseAdmin()
    const { error } = await sb.from('sc_banners').upsert(banners, { onConflict: 'id' })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API/banners POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
