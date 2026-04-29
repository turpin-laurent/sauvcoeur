'use client'

import React, { useState, useEffect } from 'react'
import { BadgeCheck, Phone, Globe, MapPin, Star, Plus, X, Send, Check, Building2, Stethoscope, GraduationCap, Home, Scissors, Heart, ShoppingBag, Smile } from 'lucide-react'
import { COMMUNES_974 } from '@/lib/geo/communes974'
import { getPros, savePro, type StoredPro } from '@/lib/animals/store'

// ── Configuration catégories ──────────────────────────────────
const CATEGORIES: { id: string; label: string; icon: React.ReactNode; emoji: string }[] = [
  { id: 'all',       label: 'Tous',                         icon: <Building2 className="h-4 w-4" />,    emoji: '🏢' },
  { id: 'vet',       label: 'Vétérinaires & santé',         icon: <Stethoscope className="h-4 w-4" />,  emoji: '🩺' },
  { id: 'rescue',    label: 'Associations & refuges',       icon: <Heart className="h-4 w-4" />,         emoji: '❤️' },
  { id: 'sitter',    label: 'Garde & pensions',             icon: <Home className="h-4 w-4" />,          emoji: '🏠' },
  { id: 'education', label: 'Éducation & comportement',    icon: <GraduationCap className="h-4 w-4" />, emoji: '🎓' },
  { id: 'groomer',   label: 'Toilettage',                   icon: <Scissors className="h-4 w-4" />,      emoji: '✂️' },
  { id: 'shop',      label: 'Animaleries & alimentation',   icon: <ShoppingBag className="h-4 w-4" />,   emoji: '🛒' },
  { id: 'leisure',   label: 'Loisirs & services animaliers',icon: <Smile className="h-4 w-4" />,         emoji: '🎉' },
]

const CAT_LABEL: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label]))
const CAT_EMOJI: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.id, c.emoji]))

// ── Données mock initiales ────────────────────────────────────
const MOCK_PROS: StoredPro[] = [
  { id: 'p1', business_name: 'Clinique Vétérinaire du Volcan', contact_name: 'Dr. Martin', category: 'vet',      description: 'Soins généraux, urgences 24h/24, chirurgie.',               city: 'Saint-Pierre', phone: '0262 00 00 01', email: '', website: 'https://example.com', is_verified: true,  is_featured: true,  is_association: false, created_at: '2026-04-01T00:00:00Z' },
  { id: 'p2', business_name: 'Cabinet Vétérinaire Nord',       contact_name: 'Dr. Dupont', category: 'vet',      description: 'Consultations sur RDV, vaccination, stérilisation.',       city: 'Saint-Denis',  phone: '0262 00 00 02', email: '', website: '',                   is_verified: true,  is_featured: false, is_association: false, created_at: '2026-04-02T00:00:00Z' },
  { id: 'p3', business_name: 'Patte Douce Pet-sitting',        contact_name: 'Lola T.',    category: 'sitter',   description: 'Garde à domicile, promenades, soins quotidiens.',          city: 'Saint-Paul',   phone: '0692 00 00 03', email: '', website: '',                   is_verified: true,  is_featured: true,  is_association: false, created_at: '2026-04-03T00:00:00Z' },
  { id: 'p4', business_name: 'Éducation Canine Réunion',       contact_name: 'Paul M.',    category: 'education', description: 'Rééducation comportementale, cours collectifs.',           city: 'Le Tampon',    phone: '0692 00 00 04', email: '', website: '',                   is_verified: false, is_featured: false, is_association: false, created_at: '2026-04-04T00:00:00Z' },
  { id: 'p5', business_name: 'SPA Réunion',                    contact_name: 'Julie R.',   category: 'rescue',    description: 'Refuge pour chiens et chats, adoptions et secours.',      city: 'Saint-Denis',  phone: '0262 00 00 05', email: '', website: 'https://example.com', is_verified: true,  is_featured: false, is_association: true,  created_at: '2026-04-05T00:00:00Z' },
]

// ── Formulaire d'inscription ──────────────────────────────────
function RegisterModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    business_name: '', contact_name: '', category: '',
    city: '', phone: '', email: '', website: '', description: '',
    is_association: false, want_featured: false,
  })
  const [step,   setStep]   = useState<'form' | 'plan' | 'done'>('form')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.business_name.trim()) e.business_name = 'Obligatoire'
    if (!form.contact_name.trim())  e.contact_name  = 'Obligatoire'
    if (!form.category)             e.category      = 'Obligatoire'
    if (!form.city)                 e.city          = 'Obligatoire'
    if (!form.phone.trim())         e.phone         = 'Obligatoire'
    if (!form.email.trim())         e.email         = 'Obligatoire'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmitForm = () => {
    if (!validate()) return
    setStep('plan')
  }

  const handleConfirm = async (featured: boolean) => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    const pro: StoredPro = {
      id:             `pro_${Date.now()}`,
      business_name:  form.business_name,
      contact_name:   form.contact_name,
      category:       form.category,
      city:           form.city,
      phone:          form.phone,
      email:          form.email,
      website:        form.website,
      description:    form.description,
      is_verified:    false,    // sera validé par admin
      is_featured:    featured,
      is_association: form.is_association,
      created_at:     new Date().toISOString(),
    }
    savePro(pro)
    setSaving(false)
    setStep('done')
    setTimeout(() => { onSuccess(); onClose() }, 2000)
  }

  const inputCls = (k?: string) => `w-full rounded-xl border ${k && errors[k] ? 'border-red-400' : 'border-slate-200'} px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500`

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="font-bold text-slate-900">S'inscrire à l'annuaire</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 'form' ? 'Vos informations' : step === 'plan' ? 'Choisir votre formule' : 'Inscription reçue !'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6">
          {/* ÉTAPE 1 — Formulaire */}
          {step === 'form' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Nom de l'établissement / structure *</label>
                <input value={form.business_name} onChange={e => set('business_name', e.target.value)}
                  placeholder="Clinique Vétérinaire du Sud…" className={inputCls('business_name')} />
                {errors.business_name && <p className="text-xs text-red-600 mt-1">{errors.business_name}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Votre nom (responsable) *</label>
                <input value={form.contact_name} onChange={e => set('contact_name', e.target.value)}
                  placeholder="Dr. Martin / Mme Dupont" className={inputCls('contact_name')} />
                {errors.contact_name && <p className="text-xs text-red-600 mt-1">{errors.contact_name}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Catégorie *</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls('category')}>
                  <option value="">Sélectionner…</option>
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                  ))}
                </select>
                {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Commune *</label>
                <select value={form.city} onChange={e => set('city', e.target.value)} className={inputCls('city')}>
                  <option value="">Sélectionner…</option>
                  {COMMUNES_974.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                </select>
                {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Téléphone *</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="0262 00 00 00" className={inputCls('phone')} />
                  {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="contact@exemple.re" className={inputCls('email')} />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Site web (optionnel)</label>
                <input type="url" value={form.website} onChange={e => set('website', e.target.value)}
                  placeholder="https://…" className={inputCls()} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Description courte (optionnel)</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  rows={3} placeholder="Décrivez vos services…" className={`${inputCls()} resize-none`} />
              </div>
              <label className="flex items-start gap-3 cursor-pointer bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <input type="checkbox" checked={form.is_association} onChange={e => set('is_association', e.target.checked)}
                  className="accent-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Je représente une association loi 1901</p>
                  <p className="text-xs text-blue-600 mt-0.5">L'inscription de base est gratuite pour les associations. Des justificatifs pourront être demandés.</p>
                </div>
              </label>

              <button onClick={handleSubmitForm}
                className="w-full bg-emerald-600 text-white rounded-xl py-3.5 font-semibold hover:bg-emerald-700 transition-colors">
                Continuer →
              </button>
            </div>
          )}

          {/* ÉTAPE 2 — Choix du plan */}
          {step === 'plan' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Choisissez votre formule pour <strong>{form.business_name}</strong> dans la catégorie <em>{CAT_LABEL[form.category]}</em>.</p>

              {/* Gratuit */}
              <div className="border-2 border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-lg">{form.is_association ? 'Association' : 'Standard'}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">Gratuit</p>
                  </div>
                  <span className="text-3xl">{form.is_association ? '🤝' : '📋'}</span>
                </div>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Fiche dans l'annuaire</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Nom, téléphone, commune</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Vérification par l'équipe SauvCœur</li>
                  <li className="flex items-center gap-2 text-slate-400"><X className="h-4 w-4" /> Pas mis en avant dans la catégorie</li>
                </ul>
                <button onClick={() => handleConfirm(false)} disabled={saving}
                  className="w-full border-2 border-slate-300 text-slate-700 rounded-xl py-3 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-60">
                  {saving ? 'Inscription…' : 'S\'inscrire gratuitement'}
                </button>
              </div>

              {/* Featured — uniquement pour les pros (pas les assos) */}
              {!form.is_association && (
                <div className="border-2 border-orange-400 rounded-2xl p-5 space-y-3 bg-orange-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-orange-800 text-lg flex items-center gap-2">
                        ⭐ En avant
                        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">POPULAIRE</span>
                      </p>
                      <p className="text-3xl font-bold text-orange-700 mt-1">19 € <span className="text-base font-normal text-orange-500">/ mois</span></p>
                    </div>
                    <span className="text-3xl">🏆</span>
                  </div>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-orange-500" /> Tout ce qui est inclus dans Standard</li>
                    <li className="flex items-center gap-2"><Star className="h-4 w-4 text-orange-500 fill-orange-500" /> En tête de votre catégorie</li>
                    <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-orange-500" /> Badge "Pro Vérifié ⭐" sur votre fiche</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-orange-500" /> Résiliation à tout moment</li>
                  </ul>
                  <button onClick={() => handleConfirm(true)} disabled={saving}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3 font-semibold transition-colors disabled:opacity-60">
                    {saving ? 'Inscription…' : 'Démarrer à 19 € / mois →'}
                  </button>
                  <p className="text-xs text-center text-orange-600">Notre équipe vous contactera pour le paiement.</p>
                </div>
              )}

              <button onClick={() => setStep('form')} className="w-full text-slate-500 text-sm hover:text-slate-700 transition-colors py-2">
                ← Modifier mes informations
              </button>
            </div>
          )}

          {/* ÉTAPE 3 — Confirmation */}
          {step === 'done' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-xl">Inscription reçue !</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Votre fiche sera vérifiée et publiée sous <strong>24 à 48h</strong> par notre équipe.<br />
                Vous recevrez un email de confirmation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Carte Pro ────────────────────────────────────────────────
function ProCard({ pro }: { pro: StoredPro }) {
  const emoji = CAT_EMOJI[pro.category] ?? '🐾'
  return (
    <div className={[
      'rounded-2xl border bg-white p-4 flex gap-4 hover:shadow-sm transition-shadow',
      pro.is_featured ? 'border-orange-300 ring-1 ring-orange-200' : 'border-slate-200',
    ].join(' ')}>
      <div className={[
        'h-14 w-14 shrink-0 rounded-xl flex items-center justify-center text-2xl',
        pro.is_featured ? 'bg-orange-50' : 'bg-emerald-50',
      ].join(' ')}>
        {emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="font-semibold text-slate-900 flex items-center gap-1.5 flex-wrap">
              {pro.business_name}
              {pro.is_featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                  <Star className="h-3 w-3 fill-orange-500 text-orange-500" /> En avant
                </span>
              )}
              {pro.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  <BadgeCheck className="h-3.5 w-3.5" /> Vérifié
                </span>
              )}
              {pro.is_association && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  🤝 Association
                </span>
              )}
            </p>
            <p className="text-sm text-slate-500">{CAT_LABEL[pro.category] ?? pro.category}</p>
          </div>
        </div>

        {pro.description && (
          <p className="mt-1.5 text-sm text-slate-600 line-clamp-2">{pro.description}</p>
        )}

        <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
          {pro.city && (
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {pro.city}</span>
          )}
          {pro.phone && (
            <a href={`tel:${pro.phone}`} className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
              <Phone className="h-3.5 w-3.5" /> {pro.phone}
            </a>
          )}
          {pro.website && (
            <a href={pro.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
              <Globe className="h-3.5 w-3.5" /> Site web
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────
export default function AnnuairePage() {
  const [category,  setCategory]  = useState('all')
  const [pros,      setPros]      = useState<StoredPro[]>(MOCK_PROS)
  const [showForm,  setShowForm]  = useState(false)

  useEffect(() => {
    const stored = getPros()
    if (stored.length > 0) {
      // Merge stored + mock (avoid duplicates)
      const storedIds = new Set(stored.map(p => p.id))
      setPros([...stored, ...MOCK_PROS.filter(p => !storedIds.has(p.id))])
    }
  }, [])

  const reload = () => {
    const stored = getPros()
    const storedIds = new Set(stored.map(p => p.id))
    setPros([...stored, ...MOCK_PROS.filter(p => !storedIds.has(p.id))])
  }

  const filtered = pros
    .filter(p => category === 'all' || p.category === category)
    .sort((a, b) => {
      // 1. Featured en premier
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
      // 2. Vérifiés ensuite
      if (a.is_verified !== b.is_verified) return a.is_verified ? -1 : 1
      return 0
    })

  const catCounts: Record<string, number> = {}
  pros.forEach(p => {
    catCounts[p.category] = (catCounts[p.category] ?? 0) + 1
    catCounts.all = (catCounts.all ?? 0) + 1
  })

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {showForm && (
        <RegisterModal onClose={() => setShowForm(false)} onSuccess={reload} />
      )}

      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Annuaire des professionnels</h1>
          <p className="text-slate-500 text-sm mt-1">
            Vétérinaires, éducateurs, pet-sitters de confiance à La Réunion (974)
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap">
          <Plus className="h-4 w-4" />
          S'inscrire à l'annuaire
        </button>
      </div>

      {/* Bannière info */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 flex items-start gap-3">
        <Star className="h-5 w-5 text-orange-500 fill-orange-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-orange-800 text-sm">Mettez votre activité en avant</p>
          <p className="text-xs text-orange-700 mt-0.5">
            Les fiches <strong>⭐ En avant</strong> apparaissent en tête de leur catégorie pour seulement 19 € / mois.
            Associations : inscription <strong>gratuite</strong>.
          </p>
        </div>
      </div>

      {/* Filtre catégories */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setCategory(cat.id)}
            className={[
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              category === cat.id
                ? 'bg-emerald-600 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
            ].join(' ')}>
            {cat.emoji} {cat.label}
            {catCounts[cat.id] > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${category === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {catCounts[cat.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="font-medium">Aucun professionnel dans cette catégorie pour l'instant.</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-emerald-600 text-sm font-medium hover:underline">
            Soyez le premier à vous inscrire →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Featured en tête avec séparateur */}
          {filtered.filter(p => p.is_featured).length > 0 && (
            <>
              <div className="flex items-center gap-2 text-xs text-orange-600 font-semibold uppercase tracking-wide">
                <Star className="h-3.5 w-3.5 fill-orange-500" /> En avant
              </div>
              {filtered.filter(p => p.is_featured).map(pro => <ProCard key={pro.id} pro={pro} />)}
              {filtered.filter(p => !p.is_featured).length > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wide pt-2">
                  <div className="flex-1 h-px bg-slate-200" /> Autres professionnels <div className="flex-1 h-px bg-slate-200" />
                </div>
              )}
            </>
          )}
          {filtered.filter(p => !p.is_featured).map(pro => <ProCard key={pro.id} pro={pro} />)}
        </div>
      )}

      {/* CTA bas de page */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
        <p className="font-semibold text-slate-800">Vous êtes professionnel du monde animal ?</p>
        <p className="text-sm text-slate-500">
          Rejoignez l'annuaire SauvCœur.re et gagnez en visibilité auprès des propriétaires d'animaux à La Réunion.
        </p>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="h-4 w-4" /> Inscrire mon établissement
        </button>
      </div>
    </main>
  )
}
