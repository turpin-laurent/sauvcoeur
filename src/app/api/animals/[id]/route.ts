import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// GET /api/animals/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sb = supabaseAdmin()
    const { data, error } = await sb.from('sc_animals').select('*').eq('id', id).single()
    if (error) return NextResponse.json(null, { status: 404 })
    return NextResponse.json(data)
  } catch (err) {
    console.error('[API/animals/id GET]', err)
    return NextResponse.json(null, { status: 500 })
  }
}

// PATCH /api/animals/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const patch  = await req.json()
    const sb     = supabaseAdmin()
    const { error } = await sb.from('sc_animals').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API/animals/id PATCH]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/animals/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sb = supabaseAdmin()
    const { error } = await sb.from('sc_animals').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API/animals/id DELETE]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
