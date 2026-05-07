import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// POST /api/admin-login — valider les identifiants admin
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const sb = supabaseAdmin()
    const { data, error } = await sb
      .from('sc_admins')
      .select('id, email, name, password')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (error) throw error

    if (!data) return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 })
    if (data.password !== password) return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 })

    return NextResponse.json({ ok: true, admin: { id: data.id, email: data.email, name: data.name } })
  } catch (err) {
    console.error('[API/admin-login POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
