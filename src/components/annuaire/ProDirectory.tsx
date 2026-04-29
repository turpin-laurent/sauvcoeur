'use client'

import { useState } from 'react'
import { BadgeCheck, Phone, Globe, MapPin } from 'lucide-react'
import type { DirectoryPro } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
  vet:      'Vétérinaire',
  sitter:   'Pet-sitter',
  educator: 'Éducateur canin',
  groomer:  'Toiletteur',
  rescue:   'Refuge / Association',
}

/**
 * Règle de tri :
 * 1. Vétérinaires en tête (sort_boost = 100) — aucun label publicitaire.
 * 2. Pros vérifiés (sort_boost = 10) — badge "Pro Vérifié".
 * 3. Autres.
 *
 * Les vétérinaires ne paient pas ; leur priorité est légitimée par leur
 * utilité objective pour la santé animale, pas par un achat.
 */
function sortPros(pros: DirectoryPro[]): DirectoryPro[] {
  return [...pros].sort((a, b) => b.sort_boost - a.sort_boost)
}

interface ProCardProps {
  pro: DirectoryPro
}

function ProCard({ pro }: ProCardProps) {
  const isVet = pro.category === 'vet'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 flex gap-4 hover:shadow-sm transition-shadow">
      {/* Avatar placeholder */}
      <div className="h-14 w-14 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl">
        {isVet ? '🩺' : pro.category === 'sitter' ? '🏠' : pro.category === 'educator' ? '🎓' : '✂️'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
              {pro.business_name}
              {/* Badge "Pro Vérifié" uniquement pour les pros payants non-vets */}
              {pro.is_verified && !isVet && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Pro Vérifié
                </span>
              )}
            </p>
            <p className="text-sm text-slate-500">{CATEGORY_LABELS[pro.category]}</p>
          </div>
        </div>

        {pro.description && (
          <p className="mt-1 text-sm text-slate-600 line-clamp-2">{pro.description}</p>
        )}

        <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
          {pro.city && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {pro.city}
            </span>
          )}
          {pro.phone && (
            <a href={`tel:${pro.phone}`} className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
              <Phone className="h-3.5 w-3.5" /> {pro.phone}
            </a>
          )}
          {pro.website && (
            <a
              href={pro.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
            >
              <Globe className="h-3.5 w-3.5" /> Site web
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export function ProDirectory({ pros }: { pros: DirectoryPro[] }) {
  const [category, setCategory] = useState<string>('all')

  const categories = ['all', ...Array.from(new Set(pros.map((p) => p.category)))]
  const filtered = sortPros(
    category === 'all' ? pros : pros.filter((p) => p.category === category)
  )

  return (
    <div className="space-y-4">
      {/* Filtre catégorie */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={[
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              category === cat
                ? 'bg-emerald-600 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
            ].join(' ')}
          >
            {cat === 'all' ? 'Tous' : CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((pro) => (
          <ProCard key={pro.id} pro={pro} />
        ))}
      </div>
    </div>
  )
}
