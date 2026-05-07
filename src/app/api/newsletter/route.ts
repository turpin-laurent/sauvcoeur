import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// GET /api/newsletter — liste des abonnés (admin)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin()
      .from('sc_newsletter')
      .select('*')
      .order('subscribed_at', { ascending: false })
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('[API/newsletter GET]', err)
    return NextResponse.json([], { status: 500 })
  }
}

// POST /api/newsletter — s'abonner
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

    const { error } = await supabaseAdmin()
      .from('sc_newsletter')
      .insert({ email: email.toLowerCase().trim() })

    if (error) {
      // Doublon = déjà abonné
      if (error.code === '23505') return NextResponse.json({ already: true })
      throw error
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API/newsletter POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/newsletter?email=xxx — désabonner
export async function DELETE(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email')
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

    const { error } = await supabaseAdmin()
      .from('sc_newsletter')
      .delete()
      .eq('email', email)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API/newsletter DELETE]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
