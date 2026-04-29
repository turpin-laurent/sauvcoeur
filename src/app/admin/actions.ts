'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { sendRejectionEmail } from '@/lib/email'

export async function approveAnimal(animalId: string) {
  const supabase = await createSupabaseServiceClient()

  const { error } = await supabase
    .from('animals')
    .update({ moderation_status: 'approved', published_at: new Date().toISOString() })
    .eq('id', animalId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/moderation')
  revalidatePath('/animaux')
}

export async function rejectAnimal(animalId: string, reason: string) {
  const supabase = await createSupabaseServiceClient()

  // Récupère l'email de l'auteur pour notification
  const { data: animal } = await supabase
    .from('animals')
    .select('author_id, name')
    .eq('id', animalId)
    .single()

  if (animal) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', animal.author_id)
      .single()

    const { data: authUser } = await supabase.auth.admin.getUserById(animal.author_id)

    if (authUser?.user?.email) {
      await sendRejectionEmail({
        to: authUser.user.email,
        authorName: profile?.display_name ?? 'Utilisateur',
        animalName: animal.name ?? 'votre animal',
        reason,
      })
    }
  }

  const { error } = await supabase
    .from('animals')
    .update({ moderation_status: 'rejected', rejection_reason: reason })
    .eq('id', animalId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/moderation')
}

export async function checkAdoptionEligibility(animalId: string) {
  const supabase = await createSupabaseServiceClient()
  const { data, error } = await supabase
    .rpc('check_adoption_eligibility', { p_animal_id: animalId })

  if (error) throw new Error(error.message)
  return data
}
