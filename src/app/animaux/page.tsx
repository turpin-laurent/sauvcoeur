import { supabaseAdmin } from '@/lib/supabase/admin'
import type { PublicAnimal, AnimalStatus, AnimalSpecies } from '@/types'
import AnimauxClient from './AnimauxClient'

// Rendu dynamique : on ne cache jamais, chaque visite relit la BDD
export const dynamic = 'force-dynamic'

async function getAnimals(): Promise<PublicAnimal[]> {
  try {
    const { data } = await supabaseAdmin()
      .from('sc_animals')
      .select('*')
      .order('pinned',      { ascending: false })
      .order('boosted',     { ascending: false })
      .order('created_at',  { ascending: false })
    return (data ?? []).map((a: any) => ({
      id: a.id,
      status: a.status as AnimalStatus,
      species: a.species as AnimalSpecies,
      gender: a.gender,
      name: a.name,
      age_years: a.age_years,
      color: a.color,
      specific_signs: a.specific_signs,
      photos: a.photos ?? [],
      location_city: a.location_city,
      moderation_status: a.moderation_status,
      created_at: a.created_at,
      boosted: a.boosted,
      pinned: a.pinned,
    } as PublicAnimal & { boosted?: boolean; pinned?: boolean }))
  } catch {
    return []
  }
}

export default async function AnimauxPage() {
  const animals = await getAnimals()
  return <AnimauxClient initialAnimals={animals} />
}
