'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, PawPrint, AlertTriangle, CheckCircle2, Upload, ChevronRight, X, Phone, Mail } from 'lucide-react'

// Facebook n'existe pas dans lucide-react — icône inline SVG
function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
    </svg>
  )
}
import { COMMUNES_974 } from '@/lib/geo/communes974'
import { containsSaleKeywords } from '@/lib/validators/animal'
import { saveAnimal, filesToBase64, getAnimalById } from '@/lib/animals/store'
import { useAuth } from '@/lib/auth/context'

const STEPS = ['Statut', 'Animal', 'Localisation', 'Contact & Photos', 'Confirmation']

type Status  = 'lost' | 'found' | 'to_adopt'
type Species = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
type Gender  = 'male' | 'female' | 'unknown'
type ContactType = 'email' | 'phone' | 'facebook'

const NAC_OPTIONS = [
  { value: 'tortue',      label: 'Tortue' },
  { value: 'perroquet',   label: 'Perroquet' },
  { value: 'cochon_d_inde', label: 'Cochon d\'Inde' },
  { value: 'hamster',     label: 'Hamster' },
  { value: 'furet',       label: 'Furet' },
  { value: 'reptile',     label: 'Reptile / Lézard' },
  { value: 'serpent',     label: 'Serpent' },
  { value: 'poisson',     label: 'Poisson' },
  { value: 'chinchilla',  label: 'Chinchilla' },
  { value: 'rat',         label: 'Rat / Souris' },
  { value: 'nac_autre',   label: 'Autre NAC' },
]

interface FormData {
  status:              Status | ''
  species:             Species | ''
  nac_type:            string
  gender:              Gender
  name:                string
  age_years:           string
  color:               string
  specific_signs:      string
  microchip_icad:      string
  location_city:       string
  last_seen_location:  string
  last_seen_at:        string
  contact_type:        ContactType
  contact_email:       string
  contact_phone:       string
  contact_facebook:    string
  photos:              File[]
  boost:               boolean
}

const STATUS_OPTIONS = [
  { value: 'lost'     as Status, emoji: '😢', label: 'Animal perdu',  desc: 'Mon animal a disparu' },
  { value: 'found'    as Status, emoji: '🔍', label: 'Animal trouvé', desc: "J'ai trouvé un animal" },
  { value: 'to_adopt' as Status, emoji: '🏠', label: 'À adopter',     desc: 'Je cherche une famille pour mon animal' },
]
const SPECIES_OPTIONS = [
  { value: 'dog'    as Species, label: 'Chien',  emoji: '🐕' },
  { value: 'cat'    as Species, label: 'Chat',   emoji: '🐱' },
  { value: 'bird'   as Species, label: 'Oiseau', emoji: '🐦' },
  { value: 'rabbit' as Species, label: 'Lapin',  emoji: '🐰' },
  { value: 'other'  as Species, label: 'NAC',    emoji: '🐾' },
]

// ── Watermark via Canvas ──────────────────────────────────────
async function applyWatermark(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width  = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)

        // Filigrane SauvCœur — bas droite
        const fontSize = Math.max(14, Math.round(img.width * 0.025))
        ctx.font      = `bold ${fontSize}px sans-serif`
        const text    = '🐾 SauvCœur.re'
        const margin  = Math.round(fontSize * 0.6)
        const tw      = ctx.measureText(text).width
        const th      = fontSize + margin

        // Fond semi-transparent
        ctx.fillStyle = 'rgba(0,0,0,0.45)'
        ctx.beginPath()
        ctx.roundRect(
          canvas.width - tw - margin * 2 - margin,
          canvas.height - th - margin,
          tw + margin * 2, th,
          6
        )
        ctx.fill()

        // Texte blanc
        ctx.fillStyle = 'rgba(255,255,255,0.92)'
        ctx.fillText(
          text,
          canvas.width - tw - margin * 2,
          canvas.height - margin * 1.2
        )

        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-1 flex-1">
          <div className={[
            'flex items-center justify-center rounded-full text-xs font-bold w-7 h-7 shrink-0 transition-colors',
            i < current   ? 'bg-emerald-600 text-white' :
            i === current ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500' :
                            'bg-slate-100 text-slate-400',
          ].join(' ')}>
            {i < current ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 ${i < current ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

const DRAFT_KEY = 'sc_draft_id'

export default function NouvelleAnnoncePage() {
  const router = useRouter()
  const { user } = useAuth()

  const animalId = useRef<string>(
    typeof window !== 'undefined'
      ? (sessionStorage.getItem(DRAFT_KEY) || `animal_${Date.now()}`)
      : `animal_${Date.now()}`
  )

  const [step,       setStep]       = useState(0)
  const [saving,     setSaving]     = useState(false)
  const [icadError,  setIcadError]  = useState('')
  const [saleError,  setSaleError]  = useState('')
  const [errors,     setErrors]     = useState<Partial<Record<keyof FormData, string>>>({})
  const [previews,   setPreviews]   = useState<string[]>([])

  const [form, setForm] = useState<FormData>({
    status: '', species: '', nac_type: '', gender: 'unknown',
    name: '', age_years: '', color: '', specific_signs: '',
    microchip_icad: '', location_city: '',
    last_seen_location: '', last_seen_at: '',
    contact_type: 'email',
    contact_email: user?.email ?? '',
    contact_phone: user?.phone ?? '',
    contact_facebook: '',
    photos: [], boost: false,
  })

  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, animalId.current)
  }, [])

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const validateIcad = (val: string) => {
    if (!val) { setIcadError(''); return true }
    if (!/^\d{15}$/.test(val)) { setIcadError('Le numéro I-CAD doit contenir exactement 15 chiffres'); return false }
    setIcadError(''); return true
  }
  const validateSigns = (val: string) => {
    if (containsSaleKeywords(val)) { setSaleError('Les annonces de vente sont interdites sur SauvCœur.re'); return false }
    setSaleError(''); return true
  }

  const validateStep1 = () => {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.species)        e.species        = "Sélectionnez un type d'animal"
    if (form.species === 'other' && !form.nac_type) e.nac_type = 'Précisez le type de NAC'
    if (!form.name.trim())    e.name           = 'Le nom est obligatoire'
    if (!form.age_years)      e.age_years      = "L'âge est obligatoire"
    if (!form.color.trim())   e.color          = 'La couleur est obligatoire'
    if (!form.specific_signs.trim()) e.specific_signs = 'Les signes distinctifs sont obligatoires'
    if (icadError)            e.microchip_icad = icadError
    if (saleError)            e.specific_signs = saleError
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep3 = () => {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (form.contact_type === 'email'    && !form.contact_email.trim())    e.contact_email    = 'L\'email est obligatoire'
    if (form.contact_type === 'phone'    && !form.contact_phone.trim())    e.contact_phone    = 'Le téléphone est obligatoire'
    if (form.contact_type === 'facebook' && !form.contact_facebook.trim()) e.contact_facebook = 'Le lien Facebook est obligatoire'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const canNext = () => {
    if (step === 0) return !!form.status
    if (step === 2) return !!form.location_city
    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 3 && !validateStep3()) return
    setStep(s => s + 1)
  }

  // Ajouter photos avec filigrane
  const handleAddPhotos = useCallback(async (files: File[]) => {
    const combined = [...form.photos, ...files].slice(0, 3)
    set('photos', combined)
    // Générer les prévisualisations avec watermark
    const wm = await Promise.all(combined.map(f => applyWatermark(f)))
    setPreviews(wm)
  }, [form.photos])

  const handleSubmit = async () => {
    setSaving(true)
    // Utiliser les photos avec watermark si disponibles, sinon base64 brut
    const photos = previews.length > 0 ? previews : await filesToBase64(form.photos)

    saveAnimal({
      id:                animalId.current,
      status:            form.status as Status,
      species:           form.species as Species,
      nac_type:          form.nac_type || undefined,
      gender:            form.gender,
      name:              form.name.trim() || undefined,
      age_years:         form.age_years ? Number(form.age_years) : undefined,
      color:             form.color.trim() || undefined,
      specific_signs:    form.specific_signs.trim() || undefined,
      microchip_icad:    form.microchip_icad || undefined,
      location_city:     form.location_city,
      last_seen_location: form.last_seen_location.trim() || undefined,
      last_seen_at:      form.last_seen_at || undefined,
      contact_type:      form.contact_type,
      contact_email:     form.contact_type === 'email'    ? form.contact_email    : (user?.email ?? ''),
      contact_phone:     form.contact_type === 'phone'    ? form.contact_phone    : undefined,
      contact_facebook:  form.contact_type === 'facebook' ? form.contact_facebook : undefined,
      photos,
      created_at:        new Date().toISOString(),
      moderation_status: 'pending',
      boosted:           false,
      pinned:            false,
      author_id:         user?.email ?? 'anonymous',
      author_name:       user?.name  ?? 'Anonyme',
    })

    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animalName:  form.name || 'Animal sans nom',
          species:     form.species,
          city:        form.location_city,
          status:      form.status,
          authorName:  user?.name  ?? 'Anonyme',
          authorEmail: user?.email ?? form.contact_email,
        }),
      })
    } catch { /* non bloquant */ }

    setSaving(false)

    if (form.boost) {
      router.push(`/boost/${animalId.current}`)
    } else {
      sessionStorage.removeItem(DRAFT_KEY)
      router.push('/animaux/confirmation')
    }
  }

  const fieldClass = (key: keyof FormData) =>
    `w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${errors[key] ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-emerald-500'}`

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Publier une annonce</h1>
      <p className="text-slate-500 text-sm mb-6">Gratuit · Modéré sous 24h · Champs obligatoires marqués *</p>

      <StepIndicator current={step} />

      {/* ÉTAPE 0 — Statut */}
      {step === 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-slate-800">Quelle est la situation ?</h2>
          {STATUS_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => set('status', opt.value)}
              className={['w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition-all', form.status === opt.value ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400' : 'border-slate-200 bg-white hover:bg-slate-50'].join(' ')}>
              <span className="text-3xl">{opt.emoji}</span>
              <div>
                <p className="font-semibold text-slate-900">{opt.label}</p>
                <p className="text-sm text-slate-500">{opt.desc}</p>
              </div>
              {form.status === opt.value && <CheckCircle2 className="h-5 w-5 text-emerald-500 ml-auto shrink-0" />}
            </button>
          ))}
        </div>
      )}

      {/* ÉTAPE 1 — Animal */}
      {step === 1 && (
        <div className="space-y-5">
          {/* Type */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Type d'animal <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-5 gap-2">
              {SPECIES_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => set('species', opt.value)}
                  className={['flex flex-col items-center gap-1 rounded-xl border py-3 px-1 text-xs font-semibold transition-all', form.species === opt.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'].join(' ')}>
                  <span className="text-xl">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.species && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />{errors.species}</p>}
          </div>

          {/* Sous-type NAC */}
          {form.species === 'other' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-semibold text-amber-800">🐾 Nouveaux Animaux de Compagnie (NAC)</p>
              <label className="text-sm font-medium text-slate-700 block mb-1">Type de NAC <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {NAC_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => set('nac_type', opt.value)}
                    className={['rounded-xl border px-3 py-2 text-sm text-left transition-colors', form.nac_type === opt.value ? 'border-amber-500 bg-amber-100 text-amber-800 font-semibold' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'].join(' ')}>
                    {form.nac_type === opt.value && '✓ '}{opt.label}
                  </button>
                ))}
              </div>
              {errors.nac_type && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />{errors.nac_type}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Nom <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex : Rex"
                className={fieldClass('name')} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Âge <span className="text-red-500">*</span></label>
              <input type="number" min={0} max={30} value={form.age_years} onChange={e => set('age_years', e.target.value)} placeholder="En années"
                className={fieldClass('age_years')} />
              {errors.age_years && <p className="mt-1 text-xs text-red-600">{errors.age_years}</p>}
            </div>
          </div>

          {/* Sexe */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Sexe <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              {([['male','Mâle'],['female','Femelle'],['unknown','Inconnu']] as [Gender,string][]).map(([v,l]) => (
                <button key={v} onClick={() => set('gender', v)}
                  className={['flex-1 rounded-xl border py-2 text-sm font-medium transition-colors', form.gender === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'].join(' ')}>{l}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Couleur / robe <span className="text-red-500">*</span></label>
            <input type="text" value={form.color} onChange={e => set('color', e.target.value)} placeholder="Ex : Fauve et noir, tigré gris…"
              className={fieldClass('color')} />
            {errors.color && <p className="mt-1 text-xs text-red-600">{errors.color}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Signes distinctifs <span className="text-red-500">*</span></label>
            <textarea rows={3} value={form.specific_signs}
              onChange={e => { set('specific_signs', e.target.value); validateSigns(e.target.value) }}
              placeholder="Collier, tatouage, comportement particulier, lieu de disparition…"
              className={`${fieldClass('specific_signs')} resize-none`} />
            {(errors.specific_signs || saleError) && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />{errors.specific_signs || saleError}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Numéro I-CAD <span className="text-xs text-slate-400 font-normal">(optionnel)</span>
            </label>
            <input type="text" inputMode="numeric" maxLength={15} value={form.microchip_icad}
              onChange={e => { set('microchip_icad', e.target.value); validateIcad(e.target.value) }}
              placeholder="15 chiffres"
              className="w-full rounded-xl border border-slate-200 focus:border-emerald-500 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-wider" />
            {icadError && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />{icadError}</p>}
            {form.microchip_icad.length === 15 && !icadError && <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Numéro I-CAD valide</p>}
          </div>
        </div>
      )}

      {/* ÉTAPE 2 — Localisation */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="font-semibold text-slate-800 mb-1">Commune <span className="text-red-500">*</span></h2>
            <p className="text-sm text-slate-500 mb-3 flex items-start gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              Seule la commune est affichée publiquement. Vos coordonnées GPS restent privées.
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {COMMUNES_974.map(c => (
                <button key={c.slug} onClick={() => set('location_city', c.name)}
                  className={['rounded-xl border px-3 py-2.5 text-sm text-left transition-colors', form.location_city === c.name ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'].join(' ')}>
                  {form.location_city === c.name && <CheckCircle2 className="inline h-3 w-3 mr-1" />}
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {form.status === 'lost' && (
            <div className="space-y-4 bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-sm font-semibold text-red-700 flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                Dernière observation (recommandé)
              </p>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Lieu précis de la dernière observation</label>
                <input type="text" value={form.last_seen_location}
                  onChange={e => set('last_seen_location', e.target.value)}
                  placeholder="Ex : Rue des Bois, quartier Moufia, Saint-Denis"
                  className="w-full rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Date et heure de la disparition</label>
                <input type="datetime-local" value={form.last_seen_at}
                  onChange={e => set('last_seen_at', e.target.value)}
                  max={new Date().toISOString().slice(0, 16)}
                  className="w-full rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-400" />
              </div>
              <p className="text-xs text-red-500">Ces informations seront affichées en rouge sur votre annonce.</p>
            </div>
          )}
        </div>
      )}

      {/* ÉTAPE 3 — Contact + Photos */}
      {step === 3 && (
        <div className="space-y-5">
          {/* Contact multi-options */}
          <div>
            <h2 className="font-semibold text-slate-800 mb-3">Comment vous contacter ? <span className="text-red-500">*</span></h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {([
                { v: 'email'    as ContactType, label: 'Email',    Icon: Mail },
                { v: 'phone'    as ContactType, label: 'Téléphone', Icon: Phone },
                { v: 'facebook' as ContactType, label: 'Facebook',  Icon: IconFacebook },
              ]).map(({ v, label, Icon }) => (
                <button key={v} onClick={() => set('contact_type', v)}
                  className={['flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 px-2 text-xs font-semibold transition-all', form.contact_type === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'].join(' ')}>
                  <Icon className="h-5 w-5" />
                  {label}
                  {form.contact_type === v && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                </button>
              ))}
            </div>

            {form.contact_type === 'email' && (
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Adresse email <span className="text-red-500">*</span></label>
                <input type="email" value={form.contact_email}
                  onChange={e => set('contact_email', e.target.value)} placeholder="vous@exemple.re"
                  className={fieldClass('contact_email')} />
                {errors.contact_email && <p className="mt-1 text-xs text-red-600">{errors.contact_email}</p>}
                <p className="text-xs text-slate-400 mt-1">🔒 Visible uniquement des personnes qui vous contactent via le formulaire.</p>
              </div>
            )}
            {form.contact_type === 'phone' && (
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Numéro de téléphone <span className="text-red-500">*</span></label>
                <input type="tel" value={form.contact_phone}
                  onChange={e => set('contact_phone', e.target.value)} placeholder="0692 00 00 00"
                  className={fieldClass('contact_phone')} />
                {errors.contact_phone && <p className="mt-1 text-xs text-red-600">{errors.contact_phone}</p>}
                <p className="text-xs text-slate-400 mt-1">📞 Votre numéro sera visible sur l'annonce.</p>
              </div>
            )}
            {form.contact_type === 'facebook' && (
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Lien de votre profil Facebook <span className="text-red-500">*</span></label>
                <input type="url" value={form.contact_facebook}
                  onChange={e => set('contact_facebook', e.target.value)} placeholder="https://facebook.com/votre.profil"
                  className={fieldClass('contact_facebook')} />
                {errors.contact_facebook && <p className="mt-1 text-xs text-red-600">{errors.contact_facebook}</p>}
                <p className="text-xs text-slate-400 mt-1">Les intéressés seront redirigés vers votre profil Facebook.</p>
              </div>
            )}
          </div>

          {/* Photos */}
          <div>
            <h2 className="font-semibold text-slate-800 mb-1">Photos <span className="text-xs text-slate-400 font-normal">(2 à 3 photos recommandées)</span></h2>
            <p className="text-sm text-slate-500 mb-3">Une bonne photo multiplie les chances de retrouver ou d'adopter. Un filigrane SauvCœur.re sera ajouté automatiquement.</p>

            {form.photos.length < 3 && (
              <label className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-3 text-slate-400 hover:border-emerald-400 hover:bg-emerald-50 transition-colors cursor-pointer">
                <Upload className="h-8 w-8" />
                <p className="text-sm font-medium text-center">Cliquez pour ajouter des photos</p>
                <p className="text-xs">JPG, PNG · Max 5 Mo · {3 - form.photos.length} photo(s) restante(s)</p>
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={e => {
                    const newFiles = Array.from(e.target.files ?? [])
                    handleAddPhotos([...form.photos, ...newFiles].slice(0, 3).slice(form.photos.length))
                  }} />
              </label>
            )}

            {previews.length > 0 && (
              <div className="flex gap-3 flex-wrap mt-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt=""
                      className="h-24 w-24 rounded-xl object-cover border-2 border-slate-200" />
                    <button type="button"
                      onClick={() => {
                        const newPhotos = form.photos.filter((_, j) => j !== i)
                        const newPreviews = previews.filter((_, j) => j !== i)
                        set('photos', newPhotos)
                        setPreviews(newPreviews)
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-md">Principale</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ÉTAPE 4 — Confirmation */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-800">Vérification avant publication</h2>
          <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
            {[
              ['Type',    `${SPECIES_OPTIONS.find(o => o.value === form.species)?.label ?? '—'}${form.nac_type ? ` — ${NAC_OPTIONS.find(n => n.value === form.nac_type)?.label ?? form.nac_type}` : ''}`],
              ['Statut',  STATUS_OPTIONS.find(o => o.value === form.status)?.label ?? '—'],
              ['Nom',     form.name || '—'],
              ['Âge',     form.age_years ? `${form.age_years} an(s)` : '—'],
              ['Sexe',    form.gender === 'male' ? 'Mâle' : form.gender === 'female' ? 'Femelle' : 'Inconnu'],
              ['Couleur', form.color || '—'],
              ['I-CAD',   form.microchip_icad || '—'],
              ['Commune', form.location_city  || '—'],
              ['Contact', form.contact_type === 'email' ? form.contact_email : form.contact_type === 'phone' ? form.contact_phone : form.contact_facebook],
              ['Photos',  previews.length > 0 ? `${previews.length} photo(s) ✓` : 'Aucune'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-900 truncate ml-2 max-w-[60%] text-right">{value}</span>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            ⏳ Votre annonce sera vérifiée par notre équipe avant d'être publiée (sous 24h).
          </div>

          <p className="text-sm font-semibold text-slate-800 pt-2">Option de visibilité</p>

          <button type="button" onClick={() => set('boost', false)}
            className={['w-full text-left rounded-2xl border-2 p-4 transition-all', !form.boost ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:bg-slate-50'].join(' ')}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900">Gratuit</p>
              {!form.boost && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">Publication standard, modérée sous 24h.</p>
          </button>

          <button type="button" onClick={() => set('boost', true)}
            className={['w-full text-left rounded-2xl border-2 p-4 transition-all', form.boost ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-white hover:bg-slate-50'].join(' ')}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900 flex items-center gap-2">
                ⚡ Annonce Boostée
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">4,99 €</span>
              </p>
              {form.boost && <CheckCircle2 className="h-5 w-5 text-orange-500" />}
            </div>
            <ul className="text-sm text-slate-600 mt-2 space-y-0.5">
              <li>✅ Story sur notre page Facebook</li>
              <li>✅ En tête des résultats</li>
              <li>✅ Badge ⚡ visible</li>
            </ul>
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 gap-3">
        {step > 0
          ? <button onClick={() => setStep(s => s - 1)}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium hover:bg-slate-50 transition-colors">
              Retour
            </button>
          : <div className="flex-1" />
        }

        {step < STEPS.length - 1
          ? <button
              onClick={step === 1 || step === 3 ? handleNext : () => { if (canNext()) setStep(s => s + 1) }}
              disabled={step !== 1 && step !== 3 && !canNext()}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white py-3 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-colors">
              Suivant <ChevronRight className="h-4 w-4" />
            </button>
          : <button onClick={handleSubmit} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white py-3 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors">
              <PawPrint className="h-4 w-4" />
              {saving ? 'Enregistrement…' : form.boost ? 'Continuer vers le paiement →' : "Publier l'annonce"}
            </button>
        }
      </div>
    </main>
  )
}
