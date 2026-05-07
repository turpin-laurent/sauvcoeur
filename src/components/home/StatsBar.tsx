'use client'

import { useEffect, useState } from 'react'

interface Stats {
  annonces_actives:  number
  animaux_retrouves: number
  membres:           number
  communes:          number
  pros:              number
}

export function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  const items = stats
    ? [
        { n: stats.animaux_retrouves.toString(), l: 'Animaux retrouvés' },
        { n: stats.annonces_actives.toString(),  l: 'Annonces actives'  },
        { n: stats.membres.toString(),           l: 'Membres inscrits'  },
        { n: stats.communes.toString(),          l: 'Communes couvertes'},
      ]
    : [
        { n: '—', l: 'Animaux retrouvés' },
        { n: '—', l: 'Annonces actives'  },
        { n: '—', l: 'Membres inscrits'  },
        { n: '—', l: 'Communes couvertes'},
      ]

  return (
    <section className="bg-white border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
        {items.map(({ n, l }) => (
          <div key={l}>
            <p className={`text-3xl font-bold text-emerald-600 transition-all ${stats ? '' : 'animate-pulse'}`}>
              {n}
            </p>
            <p className="text-sm text-slate-500 mt-1">{l}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
