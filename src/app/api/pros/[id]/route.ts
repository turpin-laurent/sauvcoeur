import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// PATCH /api/pros/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const patch  = await req.json()
    const { error } = await supabaseAdmin().from('sc_pros').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API/pros/id PATCH]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/pros/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await supabaseAdmin().from('sc_pros').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API/pros/id DELETE]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
