'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  BadgeCheck, Phone, Globe, MapPin, Star, Plus, X, Check,
  Building2, Stethoscope, GraduationCap, Home, Scissors,
  Heart, ShoppingBag, Smile, Camera, ExternalLink,
} from 'lucide-react'
import { NewsletterBanner } from '@/components/home/NewsletterBanner'
import { COMMUNES_974 } from '@/lib/geo/communes974'
import type { StoredPro } from '@/lib/animals/store'

// ── Icône Facebook SVG ────────────────────────────────────────
function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
    </svg>
  )
}

// ── Configuration catégories ──────────────────────────────────
const CATEGORIES: { id: string; label: string; icon: React.ReactNode; emoji: string }[] = [
  { id: 'all',       label: 'Tous',                          icon: <Building2 className="h-4 w-4" />,    emoji: '🏢' },
  { id: 'vet',       label: 'Vétérinaires & santé',          icon: <Stethoscope className="h-4 w-4" />,  emoji: '🩺' },
  { id: 'rescue',    label: 'Associations & refuges',        icon: <Heart className="h-4 w-4" />,         emoji: '❤️' },
  { id: 'sitter',    label: 'Garde & pensions',              icon: <Home className="h-4 w-4" />,          emoji: '🏠' },
  { id: 'education', label: 'Éducation & comportement',     icon: <GraduationCap className="h-4 w-4" />, emoji: '🎓' },
  { id: 'groomer',   label: 'Toilettage',                    icon: <Scissors className="h-4 w-4" />,      emoji: '✂️' },
  { id: 'shop',      label: 'Animaleries & alimentation',    icon: <ShoppingBag className="h-4 w-4" />,   emoji: '🛒' },
  { id: 'leisure',   label: 'Loisirs & services',            icon: <Smile className="h-4 w-4" />,         emoji: '🎉' },
]

const CAT_LABEL: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label]))
const CAT_EMOJI: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.id, c.emoji]))

// ── Palettes couleurs par catégorie ──────────────────────────
type CatPalette = {
  iconBg: string; iconText: string; cardBorder: string
  cardAccent: string; pillActive: string; pillActiveTxt: string; badge: string
}

const CAT_PALETTE: Record<string, CatPalette> = {
  vet:       { iconBg: 'bg-blue-100',   iconText: 'text-blue-600',   cardBorder: 'border-blue-100',   cardAccent: 'border-l-blue-400',   pillActive: 'bg-blue-600',   pillActiveTxt: 'text-white', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  rescue:    { iconBg: 'bg-rose-100',   iconText: 'text-rose-600',   cardBorder: 'border-rose-100',   cardAccent: 'border-l-rose-400',   pillActive: 'bg-rose-500',   pillActiveTxt: 'text-white', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  sitter:    { iconBg: 'bg-violet-100', iconText: 'text-violet-600', cardBorder: 'border-violet-100', cardAccent: 'border-l-violet-400', pillActive: 'bg-violet-600', pillActiveTxt: 'text-white', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  education: { iconBg: 'bg-amber-100',  iconText: 'text-amber-600',  cardBorder: 'border-amber-100',  cardAccent: 'border-l-amber-400',  pillActive: 'bg-amber-500',  pillActiveTxt: 'text-white', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  groomer:   { iconBg: 'bg-teal-100',   iconText: 'text-teal-600',   cardBorder: 'border-teal-100',   cardAccent: 'border-l-teal-400',   pillActive: 'bg-teal-600',   pillActiveTxt: 'text-white', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  shop:      { iconBg: 'bg-orange-100', iconText: 'text-orange-600', cardBorder: 'border-orange-100', cardAccent: 'border-l-orange-400', pillActive: 'bg-orange-500', pillActiveTxt: 'text-white', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
  leisure:   { iconBg: 'bg-green-100',  iconText: 'text-green-600',  cardBorder: 'border-green-100',  cardAccent: 'border-l-green-400',  pillActive: 'bg-green-600',  pillActiveTxt: 'text-white', badge: 'bg-green-50 text-green-700 border-green-200' },
}
const DEFAULT_PALETTE: CatPalette = {
  iconBg: 'bg-slate-100', iconText: 'text-slate-500', cardBorder: 'border-slate-200',
  cardAccent: 'border-l-slate-400', pillActive: 'bg-slate-700', pillActiveTxt: 'text-white',
  badge: 'bg-slate-50 text-slate-600 border-slate-200',
}

function getPalette(cat: string): CatPalette {
  return CAT_PALETTE[cat] ?? DEFAULT_PALETTE
}

// ── Formulaire d'inscription ──────────────────────────────────
function RegisterModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const logoRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    business_name: '', contact_name: '', category: '',
    city: '', phone: '', email: '', website: '', facebook: '', description: '',
    is_association: false,
  })
  const [logo,   setLogo]   = useState('')
  const [step,   setStep]   = useState<'form' | 'plan' | 'done'>('form')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setLogo(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

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

  const handleSubmitForm = () => { if (!validate()) return; setStep('plan') }

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
      facebook:       form.facebook,
      logo:           logo || undefined,
      description:    form.description,
      is_verified:    false,
      is_featured:    featured,
      is_association: form.is_association,
      created_at:     new Date().toISOString(),
    }
    await fetch('/api/pros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pro),
    }).catch(() => {})
    setSaving(false)
    setStep('done')
    setTimeout(() => { onSuccess(); onClose() }, 2000)
  }

  const inputCls = (k?: string) =>
    `w-full rounded-xl border ${k && errors[k] ? 'border-red-400' : 'border-slate-200'} px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500`

  const emoji = form.category ? CAT_EMOJI[form.category] ?? '🐾' : '🐾'

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
          {step === 'form' && (
            <div className="space-y-4">

              {/* Logo upload */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Logo / Photo (optionnel)</label>
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    {logo
                      ? <img src={logo} alt="logo" className="h-16 w-16 rounded-2xl object-cover border border-slate-200" />
                      : <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl border border-dashed border-slate-300">
                          {emoji}
                        </div>
                    }
                    <button type="button" onClick={() => logoRef.current?.click()}
                      className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 text-white rounded-full p-1.5 hover:bg-emerald-700 transition-colors shadow">
                      <Camera className="h-3 w-3" />
                    </button>
                    <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                  </div>
                  <div className="text-xs text-slate-400 leading-relaxed">
                    Ajoutez le logo ou une photo de votre établissement.<br />
                    Formats acceptés : JPG, PNG. Taille max : 2 Mo.
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-4">
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
                  <label className="text-sm font-medium text-slate-700 block mb-1">Site internet (optionnel)</label>
                  <input type="url" value={form.website} onChange={e => set('website', e.target.value)}
                    placeholder="https://monsite.re" className={inputCls()} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Page Facebook (optionnel)</label>
                  <div className="relative">
                    <IconFacebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1877F2]" />
                    <input value={form.facebook} onChange={e => set('facebook', e.target.value)}
                      placeholder="https://facebook.com/ma-page" className={`${inputCls()} pl-9`} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Description (optionnel)</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)}
                    rows={3} placeholder="Décrivez vos services…" className={`${inputCls()} resize-none`} />
                </div>
                <label className="flex items-start gap-3 cursor-pointer bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                  <input type="checkbox" checked={form.is_association} onChange={e => set('is_association', e.target.checked)}
                    className="accent-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Je représente une association loi 1901</p>
                    <p className="text-xs text-blue-600 mt-0.5">L'inscription de base est gratuite pour les associations.</p>
                  </div>
                </label>
              </div>

              <button onClick={handleSubmitForm}
                className="w-full bg-emerald-600 text-white rounded-xl py-3.5 font-semibold hover:bg-emerald-700 transition-colors">
                Continuer →
              </button>
            </div>
          )}

          {step === 'plan' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Choisissez votre formule pour <strong>{form.business_name}</strong> dans la catégorie <em>{CAT_LABEL[form.category]}</em>.</p>

              <div className="border-2 border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-lg">{form.is_association ? 'Association' : 'Standard'}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">Gratuit</p>
                  </div>
                  <span className="text-3xl">{form.is_association ? '🤝' : '📋'}</span>
                </div>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Fiche détaillée avec logo</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Téléphone, site web, Facebook cliquables</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> URL unique : annuaire/votre-id</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Vérification par l'équipe SauvCœur</li>
                  <li className="flex items-center gap-2 text-slate-400"><X className="h-4 w-4" /> Pas mis en avant dans la catégorie</li>
                </ul>
                <button onClick={() => handleConfirm(false)} disabled={saving}
                  className="w-full border-2 border-slate-300 text-slate-700 rounded-xl py-3 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-60">
                  {saving ? 'Inscription…' : 'S\'inscrire gratuitement'}
                </button>
              </div>

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
                    <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-orange-500" /> Badge "Pro Vérifié ⭐"</li>
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

// ── Carte Pro (grille compacte + cliquable) ───────────────────
function ProCard({ pro }: { pro: StoredPro }) {
  const palette = getPalette(pro.category)
  const emoji   = CAT_EMOJI[pro.category] ?? '🐾'

  return (
    <Link href={`/annuaire/${pro.id}`}
      className={[
        'group relative bg-white rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 block',
        pro.is_featured
          ? `${palette.cardBorder} border-l-4 ${palette.cardAccent}`
          : 'border-slate-200',
      ].join(' ')}>

      {/* Badge featured */}
      {pro.is_featured && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 z-10">
          <Star className="h-3 w-3 fill-orange-500 text-orange-500" /> En avant
        </span>
      )}

      <div className="p-4">
        {/* En-tête avec logo */}
        <div className="flex items-start gap-3">
          {/* Logo ou emoji */}
          <div className="shrink-0">
            {pro.logo
              ? <img src={pro.logo} alt={pro.business_name}
                  className="h-12 w-12 rounded-xl object-cover border border-slate-100 shadow-sm" />
              : <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl ${palette.iconBg}`}>
                  {emoji}
                </div>
            }
          </div>

          <div className="flex-1 min-w-0 pr-14">
            <p className="font-semibold text-slate-900 text-sm leading-tight line-clamp-1 group-hover:text-emerald-700 transition-colors">
              {pro.business_name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {pro.is_verified && (
                <span className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-px text-xs font-medium ${palette.badge}`}>
                  <BadgeCheck className="h-3 w-3" /> Vérifié
                </span>
              )}
              {pro.is_association && (
                <span className="inline-flex items-center gap-0.5 rounded-full border border-blue-200 bg-blue-50 px-1.5 py-px text-xs font-medium text-blue-700">
                  🤝 Asso
                </span>
              )}
              <span className={`rounded-full border px-1.5 py-px text-xs ${palette.badge}`}>
                {CAT_LABEL[pro.category] ?? pro.category}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {pro.description && (
          <p className="mt-2.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {pro.description}
          </p>
        )}

        {/* Localisation */}
        {pro.city && (
          <div className="mt-2.5 flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3 w-3 shrink-0" /> {pro.city}
          </div>
        )}

        {/* Liens rapides (non-nav pour ne pas propager le Link parent) */}
        <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 flex-wrap">
          {pro.phone && (
            <a href={`tel:${pro.phone}`} onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
              <Phone className="h-3 w-3" /> Appeler
            </a>
          )}
          {pro.website && (
            <a href={pro.website.startsWith('http') ? pro.website : `https://${pro.website}`}
              target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
              <Globe className="h-3 w-3" /> Site web
            </a>
          )}
          {pro.facebook && (
            <a href={pro.facebook.startsWith('http') ? pro.facebook : `https://facebook.com/${pro.facebook}`}
              target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:border-[#1877F2] hover:text-[#1877F2] hover:bg-blue-50 transition-colors">
              <IconFacebook className="h-3 w-3" /> Facebook
            </a>
          )}
          <span className="ml-auto text-xs text-slate-300 group-hover:text-emerald-500 flex items-center gap-0.5 transition-colors">
            Voir la fiche <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Page ─────────────────────────────────────────────────────
export default function AnnuairePage() {
  const [category, setCategory] = useState('all')
  const [pros,     setPros]     = useState<StoredPro[]>([])
  const [showForm, setShowForm] = useState(false)

  const reload = () => {
    fetch('/api/pros').then(r => r.json()).then(setPros).catch(() => {})
  }

  useEffect(() => { reload() }, [])

  const filtered = pros
    .filter(p => category === 'all' || p.category === category)
    .sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
      if (a.is_verified !== b.is_verified) return a.is_verified ? -1 : 1
      return 0
    })

  const catCounts: Record<string, number> = {}
  pros.forEach(p => {
    catCounts[p.category] = (catCounts[p.category] ?? 0) + 1
    catCounts.all = (catCounts.all ?? 0) + 1
  })

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {showForm && <RegisterModal onClose={() => setShowForm(false)} onSuccess={reload} />}

      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Annuaire des professionnels</h1>
          <p className="text-slate-500 text-sm mt-1">
            Vétérinaires, éducateurs, pet-sitters de confiance à La Réunion (974)
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-medium border border-orange-200 rounded-full px-3 py-1.5 bg-orange-50 hover:bg-orange-100 transition-colors">
            <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
            En avant · 19 €/mois
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap">
            <Plus className="h-4 w-4" />
            S'inscrire
          </button>
        </div>
      </div>

      {/* Filtres catégories */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => {
          const pal   = cat.id !== 'all' ? getPalette(cat.id) : DEFAULT_PALETTE
          const active = category === cat.id
          return (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={[
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors border',
                active
                  ? `${pal.pillActive} ${pal.pillActiveTxt} border-transparent`
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              ].join(' ')}>
              {cat.emoji} {cat.label}
              {(catCounts[cat.id] ?? 0) > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${active ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {catCounts[cat.id]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Grille pros */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">🐾</p>
          <p className="font-medium text-slate-500">Aucun professionnel dans cette catégorie pour l'instant.</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-emerald-600 text-sm font-medium hover:underline">
            Soyez le premier à vous inscrire →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.some(p => p.is_featured) && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-orange-500" /> En avant
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.filter(p => p.is_featured).map(pro => <ProCard key={pro.id} pro={pro} />)}
              </div>
            </div>
          )}

          {filtered.some(p => !p.is_featured) && (
            <div className="space-y-2">
              {filtered.some(p => p.is_featured) && (
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Autres professionnels</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.filter(p => !p.is_featured).map(pro => <ProCard key={pro.id} pro={pro} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CTA bas de page */}
      <div className="flex items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 flex-wrap">
        <div>
          <p className="font-semibold text-slate-800 text-sm">Vous êtes professionnel du monde animal ?</p>
          <p className="text-xs text-slate-500 mt-0.5">Rejoignez l'annuaire et gagnez en visibilité à La Réunion.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap">
          <Plus className="h-4 w-4" /> Inscrire mon établissement
        </button>
      </div>

      <NewsletterBanner context="annuaire" />
    </main>
  )
}
