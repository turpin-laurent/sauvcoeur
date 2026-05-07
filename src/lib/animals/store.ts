// ── Persistance localStorage — animaux, bannières, session admin ──

export interface StoredAnimal {
  id: string
  status: 'lost' | 'found' | 'to_adopt'
  species: string
  nac_type?: string            // sous-type NAC si species === 'other'
  gender: string
  name?: string
  age_years?: number
  color?: string
  specific_signs?: string
  microchip_icad?: string
  location_city: string
  last_seen_location?: string  // adresse ou lieu précis de dernière observation
  last_seen_at?: string        // ISO datetime
  contact_type?: 'email' | 'phone' | 'facebook'  // mode de contact choisi
  contact_email: string
  contact_phone?: string
  contact_facebook?: string
  photos: string[]             // data-URLs base64
  created_at: string
  moderation_status: 'pending' | 'approved' | 'rejected'
  boosted: boolean
  pinned: boolean
  author_id: string            // email de l'utilisateur
  author_name: string
}

// ── Newsletter subscribers ─────────────────────────────────────
export interface NewsletterSubscriber {
  email: string
  subscribed_at: string
}

// ── Admin account ──────────────────────────────────────────────
export interface AdminAccount {
  id: string
  email: string
  password: string
  name: string
  created_at: string
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

const ANIMALS_KEY      = 'sauvcoeur_animals'
const BANNERS_KEY      = 'sauvcoeur_banners'
const ADMIN_KEY        = 'sauvcoeur_admin'
const PROS_KEY         = 'sauvcoeur_pros'
const NEWSLETTER_KEY   = 'sauvcoeur_newsletter'
const ADMIN_ACCOUNTS_KEY = 'sauvcoeur_admin_accounts'

const DEFAULT_ADMIN_ACCOUNTS: AdminAccount[] = [
  { id: 'admin1', email: 'sauvcoeur974@gmail.com', password: 'Nutella974!', name: 'Admin principal', created_at: '2026-01-01T00:00:00Z' },
]

const DEFAULT_BANNERS: StoredBanner[] = [
  { id: 'b1', slot: 'Liste annonces — haut', url: 'https://www.facebook.com/SauvCoeurReunion', text: 'Votre publicité ici — Soutenez SauvCœur.re', active: true },
  { id: 'b2', slot: 'Détail annonce — haut', url: 'https://www.facebook.com/SauvCoeurReunion', text: 'Votre publicité ici — Soutenez SauvCœur.re', active: true },
  { id: 'b3', slot: 'Détail annonce — bas',  url: 'https://www.facebook.com/SauvCoeurReunion', text: 'Votre publicité ici — Soutenez SauvCœur.re', active: true },
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

// ── Newsletter ────────────────────────────────────────────────
export function getNewsletterSubscribers(): NewsletterSubscriber[] { return read(NEWSLETTER_KEY, []) }
export function addNewsletterSubscriber(email: string) {
  const list = getNewsletterSubscribers()
  if (list.find(s => s.email.toLowerCase() === email.toLowerCase())) return false // déjà inscrit
  list.unshift({ email: email.toLowerCase(), subscribed_at: new Date().toISOString() })
  write(NEWSLETTER_KEY, list)
  return true
}
export function removeNewsletterSubscriber(email: string) {
  write(NEWSLETTER_KEY, getNewsletterSubscribers().filter(s => s.email !== email.toLowerCase()))
}

// ── Admin accounts ────────────────────────────────────────────
export function getAdminAccounts(): AdminAccount[] { return read(ADMIN_ACCOUNTS_KEY, DEFAULT_ADMIN_ACCOUNTS) }
export function saveAdminAccount(account: AdminAccount) {
  const list = getAdminAccounts()
  const idx  = list.findIndex(a => a.id === account.id)
  if (idx >= 0) list[idx] = account; else list.unshift(account)
  write(ADMIN_ACCOUNTS_KEY, list)
}
export function deleteAdminAccount(id: string) {
  write(ADMIN_ACCOUNTS_KEY, getAdminAccounts().filter(a => a.id !== id))
}
export function validateAdminLogin(email: string, password: string): AdminAccount | null {
  const accounts = getAdminAccounts()
  return accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password) ?? null
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
