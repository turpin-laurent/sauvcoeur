'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, MapPin, Dog, Cat, Filter, X } from 'lucide-react'
import { COMMUNES_974 } from '@/lib/geo/communes974'
import type { AnimalStatus, AnimalSpecies } from '@/types'

const STATUS_LABELS: Record<AnimalStatus, string> = {
  lost:      'Perdu',
  found:     'Trouvé',
  to_adopt:  'À adopter',
  adopted:   'Adopté',
  deceased:  'Décédé',
}

const SPECIES_ICONS: Partial<Record<AnimalSpecies, React.ReactNode>> = {
  dog: <Dog className="h-4 w-4" />,
  cat: <Cat className="h-4 w-4" />,
}

interface SmartFilter974Props {
  /** Callback déclenché à chaque changement de filtre */
  onChange?: (filters: FilterState) => void
}

export interface FilterState {
  city: string
  status: AnimalStatus | ''
  species: AnimalSpecies | ''
  query: string
}

export function SmartFilter974({ onChange }: SmartFilter974Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [filters, setFilters] = useState<FilterState>({
    city:    searchParams.get('city')    ?? '',
    status:  (searchParams.get('status') ?? '') as AnimalStatus | '',
    species: (searchParams.get('species') ?? '') as AnimalSpecies | '',
    query:   searchParams.get('q')      ?? '',
  })

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const next = { ...filters, [key]: value }
    setFilters(next)
    onChange?.(next)

    // Synchronise l'URL (navigation côté serveur)
    startTransition(() => {
      const params = new URLSearchParams()
      if (next.city)    params.set('city',    next.city)
      if (next.status)  params.set('status',  next.status)
      if (next.species) params.set('species', next.species)
      if (next.query)   params.set('q',       next.query)
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  const reset = () => {
    const empty: FilterState = { city: '', status: '', species: '', query: '' }
    setFilters(empty)
    onChange?.(empty)
    startTransition(() => router.replace(pathname))
  }

  const hasActiveFilter = filters.city || filters.status || filters.species || filters.query

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      {/* Barre de recherche libre */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="search"
          placeholder="Race, couleur, signe distinctif…"
          value={filters.query}
          onChange={(e) => updateFilter('query', e.target.value)}
          className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Filtre commune 974 */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select
            value={filters.city}
            onChange={(e) => updateFilter('city', e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Toutes les communes</option>
            {COMMUNES_974.map((c) => (
              <option key={c.slug} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre statut */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value as AnimalStatus | '')}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Tous les statuts</option>
            {(Object.keys(STATUS_LABELS) as AnimalStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        {/* Filtre espèce */}
        <div className="flex gap-2">
          {(['dog', 'cat', 'other'] as AnimalSpecies[]).map((sp) => (
            <button
              key={sp}
              onClick={() => updateFilter('species', filters.species === sp ? '' : sp)}
              className={[
                'flex-1 flex items-center justify-center gap-1 rounded-xl border py-2.5 text-sm font-medium transition-colors',
                filters.species === sp
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              ].join(' ')}
            >
              {SPECIES_ICONS[sp] ?? null}
              {sp === 'dog' ? 'Chien' : sp === 'cat' ? 'Chat' : 'Autre'}
            </button>
          ))}
        </div>
      </div>

      {/* Reset + indicateur de chargement */}
      {hasActiveFilter && (
        <button
          onClick={reset}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-3 w-3" />
          Effacer les filtres
        </button>
      )}
      {isPending && (
        <p className="text-xs text-emerald-600 animate-pulse">Actualisation…</p>
      )}
    </div>
  )
}
