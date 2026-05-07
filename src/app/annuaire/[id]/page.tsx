'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, MapPin, Phone, Globe, Star, BadgeCheck,
  Mail, ExternalLink, Building2, Stethoscope,
  GraduationCap, Home, Scissors, Heart, ShoppingBag, Smile,
} from 'lucide-react'
import type { StoredPro } from '@/lib/animals/store'

// ── Palettes couleurs (identiques à la liste) ─────────────────
type CatPalette = { iconBg: string; iconText: string; headerBg: string; accent: string; badge: string }

const CAT_PALETTE: Record<string, CatPalette> = {
  vet:       { iconBg: 'bg-blue-100',   iconText: 'text-blue-600',   headerBg: 'from-blue-600 to-blue-700',    accent: 'text-blue-600',   badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  rescue:    { iconBg: 'bg-rose-100',   iconText: 'text-rose-600',   headerBg: 'from-rose-500 to-rose-700',    accent: 'text-rose-600',   badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  sitter:    { iconBg: 'bg-violet-100', iconText: 'text-violet-600', headerBg: 'from-violet-600 to-violet-700',accent: 'text-violet-600', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  education: { iconBg: 'bg-amber-100',  iconText: 'text-amber-600',  headerBg: 'from-amber-500 to-amber-600',  accent: 'text-amber-600',  badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  groomer:   { iconBg: 'bg-teal-100',   iconText: 'text-teal-600',   headerBg: 'from-teal-600 to-teal-700',    accent: 'text-teal-600',   badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  shop:      { iconBg: 'bg-orange-100', iconText: 'text-orange-600', headerBg: 'from-orange-500 to-orange-600',accent: 'text-orange-600', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
  leisure:   { iconBg: 'bg-green-100',  iconText: 'text-green-600',  headerBg: 'from-green-600 to-green-700',  accent: 'text-green-600',  badge: 'bg-green-50 text-green-700 border-green-200' },
}
const DEFAULT_PALETTE: CatPalette = {
  iconBg: 'bg-slate-100', iconText: 'text-slate-500',
  headerBg: 'from-slate-700 to-slate-800', accent: 'text-slate-600',
  badge: 'bg-slate-50 text-slate-600 border-slate-200',
}

const CATEGORIES: Record<string, { label: string; emoji: string; icon: React.ReactNode }> = {
  vet:       { label: 'Vétérinaires & santé',          emoji: '🩺', icon: <Stethoscope className="h-5 w-5" /> },
  rescue:    { label: 'Associations & refuges',        emoji: '❤️', icon: <Heart className="h-5 w-5" /> },
  sitter:    { label: 'Garde & pensions',              emoji: '🏠', icon: <Home className="h-5 w-5" /> },
  education: { label: 'Éducation & comportement',     emoji: '🎓', icon: <GraduationCap className="h-5 w-5" /> },
  groomer:   { label: 'Toilettage',                    emoji: '✂️', icon: <Scissors className="h-5 w-5" /> },
  shop:      { label: 'Animaleries & alimentation',    emoji: '🛒', icon: <ShoppingBag className="h-5 w-5" /> },
  leisure:   { label: 'Loisirs & services',            emoji: '🎉', icon: <Smile className="h-5 w-5" /> },
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
    </svg>
  )
}

// ── Skeleton ──────────────────────────────────────────────────
function Skeleton() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-4 animate-pulse">
      <div className="h-4 w-32 bg-slate-200 rounded-full" />
      <div className="h-44 bg-slate-200 rounded-2xl" />
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <div className="h-6 w-48 bg-slate-200 rounded-full" />
        <div className="h-4 w-32 bg-slate-100 rounded-full" />
        <div className="h-4 w-full bg-slate-100 rounded-full" />
        <div className="h-4 w-3/4 bg-slate-100 rounded-full" />
      </div>
    </main>
  )
}

// ── Page ─────────────────────────────────────────────────────
export default function ProDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [pro, setPro] = useState<StoredPro | null | undefined>(undefined)

  useEffect(() => {
    fetch(`/api/pros/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setPro(data ?? null))
      .catch(() => setPro(null))
  }, [id])

  if (pro === undefined) return <Skeleton />

  if (!pro) return (
    <main className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-4xl mb-3">🏢</p>
      <p className="font-semibold text-slate-700 text-lg">Fiche introuvable</p>
      <p className="text-slate-400 text-sm mt-1">Ce professionnel n'existe pas ou plus.</p>
      <Link href="/annuaire"
        className="inline-block mt-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
        ← Retour à l'annuaire
      </Link>
    </main>
  )

  const pal  = CAT_PALETTE[pro.category] ?? DEFAULT_PALETTE
  const cat  = CATEGORIES[pro.category]
  const emoji = cat?.emoji ?? '🐾'
  const photos = (pro.photos ?? []).filter(Boolean)

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-5">

      {/* Retour */}
      <Link href="/annuaire"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-600 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour à l'annuaire
      </Link>

      {/* Header coloré */}
      <div className={`bg-gradient-to-br ${pal.headerBg} rounded-2xl p-6 text-white relative overflow-hidden`}>
        {/* Cercle décoratif */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative flex items-start gap-4">
          {/* Logo / Avatar */}
          <div className="shrink-0">
            {pro.logo
              ? <img src={pro.logo} alt={pro.business_name}
                  className="h-20 w-20 rounded-2xl object-cover border-2 border-white/30 shadow-lg" />
              : <div className="h-20 w-20 rounded-2xl bg-white/20 flex items-center justify-center text-4xl shadow-lg">
                  {emoji}
                </div>
            }
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-xl sm:text-2xl leading-tight">{pro.business_name}</h1>
            <p className="text-white/80 text-sm mt-1 flex items-center gap-1.5">
              {cat?.emoji}
              {cat?.label ?? pro.category}
            </p>
            {pro.city && (
              <p className="text-white/70 text-sm flex items-center gap-1 mt-1">
                <MapPin className="h-3.5 w-3.5" /> {pro.city}
              </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {pro.is_featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white">
                  <Star className="h-3 w-3 fill-white" /> En avant
                </span>
              )}
              {pro.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white">
                  <BadgeCheck className="h-3.5 w-3.5" /> Vérifié
                </span>
              )}
              {pro.is_association && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white">
                  🤝 Association
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Galerie photos */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <img key={i} src={p} alt="" className={[
              'w-full object-cover rounded-xl border border-slate-200',
              i === 0 && photos.length > 1 ? 'col-span-2 row-span-2 aspect-video' : 'aspect-square',
            ].join(' ')} />
          ))}
        </div>
      )}

      {/* Description */}
      {pro.description && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">À propos</p>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{pro.description}</p>
        </div>
      )}

      {/* Contact & Liens */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Contact & Liens</p>

        {pro.phone && (
          <a href={`tel:${pro.phone}`}
            className="flex items-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Phone className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400">Téléphone</p>
              <p className="font-semibold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">{pro.phone}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 shrink-0" />
          </a>
        )}

        {pro.email && (
          <a href={`mailto:${pro.email}`}
            className="flex items-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400">Email</p>
              <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-blue-700 transition-colors">{pro.email}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-blue-500 shrink-0" />
          </a>
        )}

        {pro.website && (
          <a href={pro.website.startsWith('http') ? pro.website : `https://${pro.website}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-violet-400 hover:bg-violet-50 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <Globe className="h-4 w-4 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400">Site internet</p>
              <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-violet-700 transition-colors">
                {pro.website.replace(/^https?:\/\//, '')}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-violet-500 shrink-0" />
          </a>
        )}

        {pro.facebook && (
          <a href={pro.facebook.startsWith('http') ? pro.facebook : `https://facebook.com/${pro.facebook}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-[#1877F2] hover:bg-blue-50 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-[#e7f0fd] flex items-center justify-center shrink-0">
              <IconFacebook className="h-4 w-4 text-[#1877F2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400">Page Facebook</p>
              <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-[#1877F2] transition-colors">
                {pro.facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//, '')}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-[#1877F2] shrink-0" />
          </a>
        )}

        {!pro.phone && !pro.email && !pro.website && !pro.facebook && (
          <p className="text-sm text-slate-400 text-center py-2">Aucun contact renseigné.</p>
        )}
      </div>

      {/* Infos complémentaires */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Informations</p>
        <dl className="space-y-2 text-sm">
          {pro.contact_name && (
            <div className="flex gap-2">
              <dt className="text-slate-400 w-28 shrink-0">Responsable</dt>
              <dd className="font-medium text-slate-700">{pro.contact_name}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="text-slate-400 w-28 shrink-0">Catégorie</dt>
            <dd>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${pal.badge}`}>
                {emoji} {cat?.label ?? pro.category}
              </span>
            </dd>
          </div>
          {pro.city && (
            <div className="flex gap-2">
              <dt className="text-slate-400 w-28 shrink-0">Commune</dt>
              <dd className="font-medium text-slate-700 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> {pro.city}
              </dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="text-slate-400 w-28 shrink-0">Type</dt>
            <dd className="font-medium text-slate-700">
              {pro.is_association ? '🤝 Association' : '🏢 Professionnel'}
            </dd>
          </div>
        </dl>
      </div>

      {/* CTA retour + partage */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/annuaire"
          className="flex-1 flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-3 rounded-xl text-sm font-semibold transition-colors">
          <ArrowLeft className="h-4 w-4" /> Retour à l'annuaire
        </Link>
        {pro.phone && (
          <a href={`tel:${pro.phone}`}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors">
            <Phone className="h-4 w-4" /> Appeler
          </a>
        )}
      </div>

    </main>
  )
}
