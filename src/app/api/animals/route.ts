import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// GET /api/animals — liste (toutes pour admin, approuvées pour public)
export async function GET(req: NextRequest) {
  try {
    const admin = req.headers.get('x-admin') === '1'
    const sb    = supabaseAdmin()

    let query = sb.from('sc_animals').select('*').order('pinned', { ascending: false }).order('boosted', { ascending: false }).order('created_at', { ascending: false })

    if (!admin) query = query.eq('moderation_status', 'approved')

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('[API/animals GET]', err)
    return NextResponse.json([], { status: 500 })
  }
}

// POST /api/animals — créer une annonce
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id || !body.status || !body.species || !body.location_city) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const sb = supabaseAdmin()
    const { error } = await sb.from('sc_animals').upsert(body, { onConflict: 'id' })
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API/animals POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
