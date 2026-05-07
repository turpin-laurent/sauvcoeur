import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// DELETE /api/admins/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sb = supabaseAdmin()

    // Vérifier qu'il reste au moins 1 admin
    const { count } = await sb.from('sc_admins').select('id', { count: 'exact', head: true })
    if ((count ?? 0) <= 1) {
      return NextResponse.json({ error: 'Impossible de supprimer le dernier administrateur' }, { status: 400 })
    }

    const { error } = await sb.from('sc_admins').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API/admins DELETE]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH /api/admins/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const sb = supabaseAdmin()
    const patch: Record<string, string> = {}
    if (body.name)     patch.name     = body.name
    if (body.email)    patch.email    = body.email
    if (body.password) patch.password = body.password
    const { error } = await sb.from('sc_admins').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API/admins PATCH]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
