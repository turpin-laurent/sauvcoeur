import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// GET /api/pros
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin()
      .from('sc_pros')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('[API/pros GET]', err)
    return NextResponse.json([], { status: 500 })
  }
}

// POST /api/pros — créer / mettre à jour un pro
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id || !body.business_name || !body.category || !body.city) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }
    const { error } = await supabaseAdmin()
      .from('sc_pros')
      .upsert(body, { onConflict: 'id' })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API/pros POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
