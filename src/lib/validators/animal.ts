import { z } from 'zod'

// Mots-clés bloquant la vente d'animaux
const SALE_KEYWORDS = /\b(prix|vente|vends|vendre|euros?|€|eur\b|pay[ée]r?|achet|tarif|gratuit contre bon soin)\b/i

const ICAD_REGEX = /^\d{15}$/

export const animalFormSchema = z.object({
  status: z.enum(['lost', 'found', 'to_adopt']),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other']),
  gender: z.enum(['male', 'female', 'unknown']).default('unknown'),
  name: z.string().max(80).optional(),
  age_years: z.number().int().min(0).max(30).optional(),
  breed_id: z.number().int().positive().optional(),
  color: z.string().max(100).optional(),
  specific_signs: z
    .string()
    .max(1000)
    .optional()
    .refine(
      (val) => !val || !SALE_KEYWORDS.test(val),
      { message: 'Les annonces de vente sont interdites sur SauvCoeur.re' }
    ),
  microchip_icad: z
    .string()
    .optional()
    .refine(
      (val) => !val || ICAD_ICAD_REGEX_valid(val),
      { message: 'Le numéro I-CAD doit contenir exactement 15 chiffres' }
    ),
  location_city: z.string().min(2).max(100),
  // Coordonnées GPS : optionnelles, jamais exposées publiquement
  location_lat: z.number().min(-21.5).max(-20.7).optional(),
  location_lng: z.number().min(55.1).max(55.9).optional(),
  photos: z.array(z.string().url()).max(6).default([]),
})

function ICAD_ICAD_REGEX_valid(val: string) {
  return ICAD_REGEX.test(val)
}

export type AnimalFormValues = z.infer<typeof animalFormSchema>

// Validation de la description globale (champ libre)
export function containsSaleKeywords(text: string): boolean {
  return SALE_KEYWORDS.test(text)
}
