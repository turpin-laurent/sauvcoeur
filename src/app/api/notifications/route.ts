import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// GET /api/notifications — liste les notifs admin (50 dernières)
export async function GET() {
  try {
    const sb = supabaseAdmin()
    const { data, error } = await sb
      .from('sc_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('[API/notifications GET]', err)
    return NextResponse.json([], { status: 500 })
  }
}

// POST /api/notifications — créer une notification
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, title, message, data: extraData } = body
    if (!type || !title || !message) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }
    const sb = supabaseAdmin()
    const { error } = await sb.from('sc_notifications').insert({ type, title, message, data: extraData ?? {} })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API/notifications POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH /api/notifications — marquer comme lu (body: {id} ou {all: true})
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const sb = supabaseAdmin()
    if (body.all) {
      const { error } = await sb.from('sc_notifications').update({ read: true }).eq('read', false)
      if (error) throw error
    } else if (body.id) {
      const { error } = await sb.from('sc_notifications').update({ read: true }).eq('id', body.id)
      if (error) throw error
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API/notifications PATCH]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
