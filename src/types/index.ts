export type UserRole = 'user' | 'asso' | 'pro' | 'admin'
export type AnimalStatus = 'lost' | 'found' | 'to_adopt' | 'adopted' | 'deceased'
export type AnimalGender = 'male' | 'female' | 'unknown'
export type AnimalSpecies = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type ProCategory = 'vet' | 'sitter' | 'educator' | 'groomer' | 'rescue'
export type ModerationStatus = 'pending' | 'approved' | 'rejected'

export interface Profile {
  id: string
  user_type: UserRole
  display_name: string
  phone?: string
  city?: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface PublicAnimal {
  id: string
  status: AnimalStatus
  species: AnimalSpecies
  gender: AnimalGender
  breed_id?: number
  name?: string
  age_years?: number
  specific_signs?: string
  color?: string
  photos: string[]
  location_city: string
  moderation_status: ModerationStatus
  published_at?: string
  created_at: string
}

export interface AdoptionRequest {
  id: string
  user_id: string
  animal_id: string
  status: RequestStatus
  motivation?: string
  certificate_signed_at?: string
  cool_off_ends_at?: string
  finalized_at?: string
  created_at: string
}

export interface DirectoryPro {
  id: string
  profile_id: string
  category: ProCategory
  business_name: string
  description?: string
  address?: string
  city: string
  phone?: string
  website?: string
  is_verified: boolean
  stripe_status?: string
  sort_boost: number
}

export interface AdoptionEligibility {
  eligible: boolean
  reason?: 'no_approved_request' | 'certificate_not_signed' | 'cool_off_period' | 'already_adopted'
  cool_off_ends_at?: string
  request_id?: string
}
