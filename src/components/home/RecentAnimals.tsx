'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, Clock, ChevronRight } from 'lucide-react'

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
  lost:     { label: 'Perdu',  bg: 'bg-red-100',   color: 'text-red-700',   emoji: '😢' },
  found:    { label: 'Trouvé', bg: 'bg-amber-100',  color: 'text-amber-700', emoji: '🔍' },
  to_adopt: { label: 'Adopter',bg: 'bg-emerald-100',color: 'text-emerald-700',emoji: '🏠' },
}
const SPECIES_EMOJI: Record<string, string> = {
  dog: '🐕', cat: '🐱', bird: '🐦', rabbit: '🐰', other: '🐾',
}

function timeAgo(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000)
  const d = Math.floor(h / 24)
  return d > 0 ? `il y a ${d}j` : h > 0 ? `il y a ${h}h` : "à l'instant"
}

function AnimalCard({ a }: { a: Animal }) {
  const st = STATUS[a.status] ?? STATUS.lost
  const photo = a.photos?.[0]

  return (
    <Link href={`/animaux/${a.id}`}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">
      {/* Photo */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {photo
          ? <img src={photo} alt={a.name ?? 'Animal'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-5xl">{SPECIES_EMOJI[a.species] ?? '🐾'}</div>
        }
        {/* Badge statut */}
        <span className={`absolute top-2 left-2 rounded-full px-2.5 py-1 text-xs font-semibold ${st.bg} ${st.color}`}>
          {st.emoji} {st.label}
        </span>
      </div>

      {/* Infos */}
      <div className="p-3 flex-1 flex flex-col gap-1">
        <p className="font-semibold text-slate-900 text-sm truncate group-hover:text-emerald-700 transition-colors">
          {a.name ?? `${st.label} — ${a.species === 'dog' ? 'Chien' : a.species === 'cat' ? 'Chat' : 'Animal'}`}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-400 mt-auto">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.location_city}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(a.created_at)}</span>
        </div>
      </div>
    </Link>
  )
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-slate-100" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-slate-200 rounded-full w-3/4" />
        <div className="h-3 bg-slate-100 rounded-full w-1/2" />
      </div>
    </div>
  )
}

export function RecentAnimals() {
  const [animals, setAnimals] = useState<Animal[] | null>(null)

  useEffect(() => {
    fetch('/api/animals')
      .then(r => r.json())
      .then((list: Animal[]) => {
        // 4 dernières annonces perdu/trouvé approuvées
        const filtered = list
          .filter(a => a.status === 'lost' || a.status === 'found' || a.status === 'to_adopt')
          .slice(0, 4)
        setAnimals(filtered)
      })
      .catch(() => setAnimals([]))
  }, [])

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Dernières annonces</h2>
          <p className="text-slate-500 text-sm mt-0.5">Animaux perdus, trouvés et à adopter à La Réunion</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {animals === null
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : animals.length === 0
          ? <p className="col-span-4 text-center text-slate-400 py-8">Aucune annonce pour l'instant.</p>
          : animals.map(a => <AnimalCard key={a.id} a={a} />)
        }
      </div>

      <div className="mt-6 text-center">
        <Link href="/animaux"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
          Découvrir toutes nos annonces <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
