import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return NextResponse.json({ error: 'Variables manquantes', url: !!url, key: !!key })
  }

  try {
    const { data, error } = await supabaseAdmin()
      .from('sc_animals')
      .select('count')
      .limit(1)

    if (error) return NextResponse.json({ error: error.message, code: error.code })
    return NextResponse.json({ ok: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message })
  }
}
