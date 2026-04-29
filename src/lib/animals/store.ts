// ── Persistance localStorage — animaux, bannières, session admin ──

export interface StoredAnimal {
  id: string
  status: 'lost' | 'found' | 'to_adopt'
  species: string
  gender: string
  name?: string
  age_years?: number
  color?: string
  specific_signs?: string
  microchip_icad?: string
  location_city: string
  last_seen_location?: string  // adresse ou lieu précis de dernière observation
  last_seen_at?: string        // ISO datetime
  contact_email: string
  contact_phone?: string
  photos: string[]             // data-URLs base64
  created_at: string
  moderation_status: 'pending' | 'approved' | 'rejected'
  boosted: boolean
  pinned: boolean
  author_id: string            // email de l'utilisateur
  author_name: string
}

export interface StoredPro {
  id: string
  business_name: string
  contact_name: string
  category: string  // 'vet' | 'sitter' | 'educator' | 'groomer' | 'rescue' | 'asso'
  description?: string
  city: string
  phone?: string
  email?: string
  website?: string
  is_verified: boolean
  is_featured: boolean       // payant €19/mois — en avant dans sa catégorie
  is_association: boolean    // association (inscription gratuite)
  created_at: string
}

export interface StoredBanner {
  id: string
  slot: string
  url: string
  text: string
  active: boolean
  image?: string   // base64 data-URL (468×60)
}

const ANIMALS_KEY = 'sauvcoeur_animals'
const BANNERS_KEY = 'sauvcoeur_banners'
const ADMIN_KEY   = 'sauvcoeur_admin'
const PROS_KEY    = 'sauvcoeur_pros'

const DEFAULT_BANNERS: StoredBanner[] = [
  { id: 'b1', slot: 'Liste annonces — haut', url: 'https://facebook.com/sauvcoeur974', text: 'Votre publicité ici — Soutenez SauvCœur.re', active: true },
  { id: 'b2', slot: 'Détail annonce — haut', url: 'https://facebook.com/sauvcoeur974', text: 'Votre publicité ici — Soutenez SauvCœur.re', active: true },
  { id: 'b3', slot: 'Détail annonce — bas',  url: 'https://facebook.com/sauvcoeur974', text: 'Votre publicité ici — Soutenez SauvCœur.re', active: true },
]

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback }
  catch { return fallback }
}
function write(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

// ── Animals ───────────────────────────────────────────────────
export function getAnimals(): StoredAnimal[]            { return read(ANIMALS_KEY, []) }
export function getAnimalById(id: string): StoredAnimal | undefined {
  return getAnimals().find(a => a.id === id)
}
export function saveAnimal(animal: StoredAnimal) {
  const list = getAnimals()
  const idx  = list.findIndex(a => a.id === animal.id)
  if (idx >= 0) list[idx] = animal; else list.unshift(animal)
  write(ANIMALS_KEY, list)
}
export function updateAnimal(id: string, patch: Partial<StoredAnimal>) {
  write(ANIMALS_KEY, getAnimals().map(a => a.id === id ? { ...a, ...patch } : a))
}
export function deleteAnimal(id: string) {
  write(ANIMALS_KEY, getAnimals().filter(a => a.id !== id))
}

// ── Banners ───────────────────────────────────────────────────
export function getBanners(): StoredBanner[] { return read(BANNERS_KEY, DEFAULT_BANNERS) }
export function saveBanners(b: StoredBanner[]) { write(BANNERS_KEY, b) }

// ── Session admin 48h ─────────────────────────────────────────
export function setAdminSession()  { write(ADMIN_KEY, { expires: Date.now() + 48 * 3600 * 1000 }) }
export function isAdminValid(): boolean {
  const s = read<{ expires: number } | null>(ADMIN_KEY, null)
  return !!s && s.expires > Date.now()
}
export function clearAdminSession() {
  if (typeof window !== 'undefined') localStorage.removeItem(ADMIN_KEY)
}

// ── Pros (annuaire) ───────────────────────────────────────────
export function getPros(): StoredPro[]              { return read(PROS_KEY, []) }
export function savePro(pro: StoredPro) {
  const list = getPros()
  const idx  = list.findIndex(p => p.id === pro.id)
  if (idx >= 0) list[idx] = pro; else list.unshift(pro)
  write(PROS_KEY, list)
}
export function updatePro(id: string, patch: Partial<StoredPro>) {
  write(PROS_KEY, getPros().map(p => p.id === id ? { ...p, ...patch } : p))
}
export function deletePro(id: string) {
  write(PROS_KEY, getPros().filter(p => p.id !== id))
}

// ── Utilitaire : photos File[] → base64[] ─────────────────────
export function filesToBase64(files: File[]): Promise<string[]> {
  return Promise.all(files.map(f => new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload  = () => resolve(r.result as string)
    r.onerror = reject
    r.readAsDataURL(f)
  })))
}
