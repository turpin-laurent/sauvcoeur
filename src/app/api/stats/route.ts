import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const sb = supabaseAdmin()

    // Toutes les requêtes en parallèle
    const [animalsRes, membresRes, prosRes] = await Promise.all([
      sb.from('sc_animals').select('id, status, location_city, moderation_status'),
      sb.from('sc_users').select('id', { count: 'exact', head: true }),
      sb.from('sc_pros').select('id', { count: 'exact', head: true }).eq('moderation_status', 'approved'),
    ])

    const animals = animalsRes.data ?? []
    const approved = animals.filter(a => a.moderation_status === 'approved')

    // Communes uniques couvertes par des annonces approuvées
    const communes = new Set(approved.map(a => a.location_city).filter(Boolean))

    // "Retrouvés" = animaux avec status found ou to_adopt approuvés
    // On utilise le total des animaux approuvés comme "annonces actives"
    const actives   = approved.length
    const retrouves = approved.filter(a => a.status === 'found').length
    const membres   = membresRes.count ?? 0
    const pros      = prosRes.count ?? 0

    return NextResponse.json({
      annonces_actives:  actives,
      animaux_retrouves: retrouves,
      membres:           membres,
      communes:          communes.size,
      pros:              pros,
    })
  } catch (err) {
    console.error('[API/stats]', err)
    // Valeurs de fallback si erreur
    return NextResponse.json({
      annonces_actives:  0,
      animaux_retrouves: 0,
      membres:           0,
      communes:          0,
      pros:              0,
    })
  }
}
