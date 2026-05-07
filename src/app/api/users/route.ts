import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// GET /api/users — liste tous les membres (admin seulement)
export async function GET() {
  try {
    const sb = supabaseAdmin()
    const { data, error } = await sb
      .from('sc_users')
      .select('id, email, name, newsletter, city, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('[API/users GET]', err)
    return NextResponse.json([], { status: 500 })
  }
}

// POST /api/users — inscription ou mise à jour du profil
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, email, name, password_enc, newsletter, city, phone, avatar } = body
    if (!id || !email || !name) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const sb = supabaseAdmin()

    // Vérifier si l'utilisateur existe déjà (login cross-browser)
    const { data: existing } = await sb
      .from('sc_users')
      .select('id, password_enc')
      .eq('id', id)
      .maybeSingle()

    if (existing && body.check_only) {
      return NextResponse.json({ exists: true, password_enc: existing.password_enc })
    }

    const isNew = !existing

    const { error } = await sb.from('sc_users').upsert(
      { id, email, name, password_enc, newsletter: newsletter ?? false, city, phone, avatar },
      { onConflict: 'id' }
    )
    if (error) throw error

    // Notification dashboard uniquement pour les nouvelles inscriptions
    if (isNew && !body.check_only) {
      await sb.from('sc_notifications').insert({
        type:    'new_member',
        title:   `Nouveau membre : ${name}`,
        message: `${email}${newsletter ? ' · inscrit newsletter' : ''}${city ? ` · ${city}` : ''}`,
        data:    { id, email, name, newsletter: newsletter ?? false },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API/users POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
