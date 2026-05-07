'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Animal {
  id: string
  status: string
  species: string
  name?: string
  photos: string[]
  location_city: string
  created_at: string
}

const STATUS: Record<string, { label: string; bg: string; color: string; emoji: string }> = {
  lost:     { label: 'Perdu',   bg: 'bg-red-500/80',     color: 'text-white', emoji: '😢' },
  found:    { label: 'Trouvé',  bg: 'bg-amber-500/80',   color: 'text-white', emoji: '🔍' },
  to_adopt: { label: 'Adopter', bg: 'bg-emerald-500/80', color: 'text-white', emoji: '🏠' },
}
const SPECIES_EMOJI: Record<string, string> = {
  dog: '🐕', cat: '🐱', bird: '🐦', rabbit: '🐰', other: '🐾',
}

function timeAgo(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000)
  const d = Math.floor(h / 24)
  return d > 0 ? `${d}j` : h > 0 ? `${h}h` : 'maintenant'
}

function AnimalCard({ a }: { a: Animal }) {
  const st = STATUS[a.status] ?? STATUS.lost
  const photo = a.photos?.[0]

  return (
    <Link href={`/animaux/${a.id}`}
      className="group relative flex-none w-40 sm:w-48 rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all bg-slate-100">
      {/* Photo */}
      <div className="aspect-square overflow-hidden">
        {photo
          ? <img src={photo} alt={a.name ?? 'Animal'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-5xl">{SPECIES_EMOJI[a.species] ?? '🐾'}</div>
        }
      </div>

      {/* Badge statut — en haut à gauche */}
      <span className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-semibold backdrop-blur-sm ${st.bg} ${st.color}`}>
        {st.emoji} {st.label}
      </span>

      {/* Ville + temps — en bas */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2.5 pt-4 pb-2">
        <p className="text-white text-xs font-medium truncate">{a.location_city}</p>
        <p className="text-white/70 text-xs">{timeAgo(a.created_at)}</p>
      </div>
    </Link>
  )
}

function CardSkeleton() {
  return (
    <div className="flex-none w-40 sm:w-48 rounded-2xl border border-slate-200 overflow-hidden animate-pulse bg-slate-100">
      <div className="aspect-square bg-slate-200" />
    </div>
  )
}

export function RecentAnimals() {
  const [animals, setAnimals] = useState<Animal[] | null>(null)

  useEffect(() => {
    fetch('/api/animals')
      .then(r => r.json())
      .then((list: Animal[]) => {
        const filtered = list
          .filter(a => a.status === 'lost' || a.status === 'found' || a.status === 'to_adopt')
          .slice(0, 8)
        setAnimals(filtered)
      })
      .catch(() => setAnimals([]))
  }, [])

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Dernières annonces</h2>
          <p className="text-slate-500 text-sm">Perdus, trouvés et à adopter à La Réunion</p>
        </div>
        <Link href="/animaux"
          className="flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors shrink-0">
          Voir tout <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Scroll horizontal */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none snap-x snap-mandatory">
        {animals === null
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : animals.length === 0
          ? <p className="text-slate-400 py-8">Aucune annonce pour l'instant.</p>
          : animals.map(a => <AnimalCard key={a.id} a={a} />)
        }
      </div>
    </section>
  )
}
