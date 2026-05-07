import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// GET /api/admins — liste tous les comptes admin
export async function GET() {
  try {
    const sb = supabaseAdmin()
    const { data, error } = await sb
      .from('sc_admins')
      .select('id, email, name, created_at')   // password exclu volontairement
      .order('created_at')
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('[API/admins GET]', err)
    return NextResponse.json([], { status: 500 })
  }
}

// POST /api/admins — créer ou mettre à jour un admin
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, email, name, password } = body
    if (!id || !email || !name || !password) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }
    const sb = supabaseAdmin()
    const { error } = await sb.from('sc_admins').upsert(
      { id, email, name, password },
      { onConflict: 'id' }
    )
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API/admins POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
