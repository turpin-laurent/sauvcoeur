'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, PawPrint, AlertTriangle, CheckCircle2, Upload, ChevronRight, X } from 'lucide-react'
import { COMMUNES_974 } from '@/lib/geo/communes974'
import { containsSaleKeywords } from '@/lib/validators/animal'
import { saveAnimal, filesToBase64, getAnimalById } from '@/lib/animals/store'
import { useAuth } from '@/lib/auth/context'

const STEPS = ['Statut', 'Animal', 'Localisation', 'Photos', 'Confirmation']

type Status  = 'lost' | 'found' | 'to_adopt'
type Species = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
type Gender  = 'male' | 'female' | 'unknown'

interface FormData {
  status:              Status | ''
  species:             Species | ''
  gender:              Gender
  name:                string
  age_years:           string
  color:               string
  specific_signs:      string
  microchip_icad:      string
  location_city:       string
  last_seen_location:  string   // perdu uniquement
  last_seen_at:        string   // perdu uniquement — datetime-local
  contact_email:       string
  photos:              File[]
  boost:               boolean
}

const STATUS_OPTIONS = [
  { value: 'lost'     as Status, emoji: '😢', label: 'Animal perdu',  desc: 'Mon animal a disparu' },
  { value: 'found'    as Status, emoji: '🔍', label: 'Animal trouvé', desc: "J'ai trouvé un animal" },
  { value: 'to_adopt' as Status, emoji: '🏠', label: 'À adopter',     desc: 'Je cherche une famille pour mon animal' },
]
const SPECIES_OPTIONS = [
  { value: 'dog'    as Species, label: 'Chien'  },
  { value: 'cat'    as Species, label: 'Chat'   },
  { value: 'bird'   as Species, label: 'Oiseau' },
  { value: 'rabbit' as Species, label: 'Lapin'  },
  { value: 'other'  as Species, label: 'Autre'  },
]

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

  // ID stable pour éviter les doublons si retour arrière depuis la page boost
  const animalId = useRef<string>(
    typeof window !== 'undefined'
      ? (sessionStorage.getItem(DRAFT_KEY) || `animal_${Date.now()}`)
      : `animal_${Date.now()}`
  )

  const [step,      setStep]      = useState(0)
  const [saving,    setSaving]    = useState(false)
  const [icadError, setIcadError] = useState('')
  const [saleError, setSaleError] = useState('')
  const [errors,    setErrors]    = useState<Partial<Record<keyof FormData, string>>>({})
  const [form, setForm] = useState<FormData>({
    status: '', species: '', gender: 'unknown',
    name: '', age_years: '', color: '', specific_signs: '',
    microchip_icad: '', location_city: '',
    last_seen_location: '', last_seen_at: '',
    contact_email: user?.email ?? '',
    photos: [], boost: false,
  })

  // Stocker l'ID en sessionStorage dès le montage pour éviter les doublons
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
    if (!form.species)        e.species        = 'Sélectionnez un type d\'animal'
    if (!form.name.trim())    e.name           = 'Le nom est obligatoire'
    if (!form.age_years)      e.age_years      = "L'âge est obligatoire"
    if (!form.color.trim())   e.color          = 'La couleur est obligatoire'
    if (!form.specific_signs.trim()) e.specific_signs = 'Les signes distinctifs sont obligatoires'
    if (icadError)            e.microchip_icad = icadError
    if (saleError)            e.specific_signs = saleError
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const canNext = () => {
    if (step === 0) return !!form.status
    if (step === 2) return !!form.location_city
    if (step === 3) return !!form.contact_email
    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    setSaving(true)
    const photos = await filesToBase64(form.photos)

    saveAnimal({
      id:                animalId.current,
      status:            form.status as Status,
      species:           form.species as Species,
      gender:            form.gender,
      name:              form.name.trim() || undefined,
      age_years:         form.age_years ? Number(form.age_years) : undefined,
      color:             form.color.trim() || undefined,
      specific_signs:    form.specific_signs.trim() || undefined,
      microchip_icad:      form.microchip_icad || undefined,
      location_city:       form.location_city,
      last_seen_location:  form.last_seen_location.trim() || undefined,
      last_seen_at:        form.last_seen_at || undefined,
      contact_email:       form.contact_email,
      contact_phone:       undefined,
      photos,
      created_at:        new Date().toISOString(),
      moderation_status: 'pending',   // ← toujours en attente de modération
      boosted:           false,
      pinned:            false,
      author_id:         user?.email ?? 'anonymous',
      author_name:       user?.name  ?? 'Anonyme',
    })

    // Notifier l'admin par email
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
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.species && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />{errors.species}</p>}
          </div>

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

          {/* Couleur */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Couleur / robe <span className="text-red-500">*</span></label>
            <input type="text" value={form.color} onChange={e => set('color', e.target.value)} placeholder="Ex : Fauve et noir, tigré gris…"
              className={fieldClass('color')} />
            {errors.color && <p className="mt-1 text-xs text-red-600">{errors.color}</p>}
          </div>

          {/* Signes distinctifs */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Signes distinctifs <span className="text-red-500">*</span></label>
            <textarea rows={3} value={form.specific_signs}
              onChange={e => { set('specific_signs', e.target.value); validateSigns(e.target.value) }}
              placeholder="Collier, tatouage, comportement particulier, lieu de disparition…"
              className={`${fieldClass('specific_signs')} resize-none`} />
            {(errors.specific_signs || saleError) && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />{errors.specific_signs || saleError}</p>}
          </div>

          {/* I-CAD (optionnel) */}
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

          {/* Dernière observation — uniquement pour les annonces "perdu" */}
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
              <p className="text-xs text-red-500">Ces informations seront affichées en rouge sur votre annonce pour aider les gens à mieux vous aider.</p>
            </div>
          )}
        </div>
      )}

      {/* ÉTAPE 3 — Contact + Photos */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h2 className="font-semibold text-slate-800 mb-3">Email de contact <span className="text-red-500">*</span></h2>
            <input type="email" required value={form.contact_email}
              onChange={e => set('contact_email', e.target.value)} placeholder="vous@exemple.re"
              className={fieldClass('contact_email')} />
            <p className="text-xs text-slate-400 mt-1">🔒 Visible uniquement des personnes qui vous contactent via le formulaire.</p>
          </div>

          <div>
            <h2 className="font-semibold text-slate-800 mb-1">Photos <span className="text-xs text-slate-400 font-normal">(2 à 3 photos recommandées)</span></h2>
            <p className="text-sm text-slate-500 mb-3">Une bonne photo multiplie les chances de retrouver ou d'adopter.</p>

            {form.photos.length < 3 && (
              <label className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-3 text-slate-400 hover:border-emerald-400 hover:bg-emerald-50 transition-colors cursor-pointer">
                <Upload className="h-8 w-8" />
                <p className="text-sm font-medium text-center">Cliquez pour ajouter des photos</p>
                <p className="text-xs">JPG, PNG · Max 5 Mo · {3 - form.photos.length} photo(s) restante(s)</p>
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={e => {
                    const newFiles = Array.from(e.target.files ?? [])
                    const combined = [...form.photos, ...newFiles].slice(0, 3)
                    set('photos', combined)
                  }} />
              </label>
            )}

            {form.photos.length > 0 && (
              <div className="flex gap-3 flex-wrap mt-3">
                {form.photos.map((f, i) => (
                  <div key={i} className="relative">
                    <img src={URL.createObjectURL(f)} alt=""
                      className="h-24 w-24 rounded-xl object-cover border-2 border-slate-200" />
                    <button type="button"
                      onClick={() => set('photos', form.photos.filter((_, j) => j !== i))}
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

      {/* ÉTAPE 4 — Boost + Confirmation */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-800">Vérification avant publication</h2>
          <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
            {[
              ['Type',    SPECIES_OPTIONS.find(o => o.value === form.species)?.label ?? '—'],
              ['Statut',  STATUS_OPTIONS.find(o => o.value === form.status)?.label   ?? '—'],
              ['Nom',     form.name || '—'],
              ['Âge',     form.age_years ? `${form.age_years} an(s)` : '—'],
              ['Sexe',    form.gender === 'male' ? 'Mâle' : form.gender === 'female' ? 'Femelle' : 'Inconnu'],
              ['Couleur', form.color || '—'],
              ['I-CAD',   form.microchip_icad || '—'],
              ['Commune', form.location_city  || '—'],
              ['Photos',  form.photos.length > 0 ? `${form.photos.length} photo(s) ✓` : 'Aucune'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-900">{value}</span>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            ⏳ Votre annonce sera vérifiée par notre équipe avant d'être publiée (sous 24h).
          </div>

          {/* Option Boost */}
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
              onClick={step === 1 ? handleNext : () => { if (canNext()) setStep(s => s + 1) }}
              disabled={step !== 1 && !canNext()}
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
