import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const { error } = await supabaseAdmin()
      .from('sc_animals')
      .insert({
        id: `debug_${Date.now()}`,
        status: 'found',
        species: 'dog',
        gender: 'unknown',
        location_city: 'Test',
        moderation_status: 'pending',
        boosted: false,
        pinned: false,
        photos: [],
      })

    if (error) return NextResponse.json({ insert_error: error.message, code: error.code, hint: error.hint })
    return NextResponse.json({ insert: 'ok' })
  } catch (err: any) {
    return NextResponse.json({ exception: err.message })
  }
}
