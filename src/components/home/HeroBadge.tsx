'use client'

import { useEffect, useState } from 'react'

export function HeroBadge() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setCount(d.animaux_retrouves ?? null))
      .catch(() => {})
  }, [])

  return (
    <span className="inline-block bg-white/20 rounded-full px-4 py-1 text-sm font-medium">
      🐾 {count !== null && count > 0
        ? `${count} animal${count > 1 ? 'aux' : ''} déjà retrouvé${count > 1 ? 's' : ''} grâce à SauvCœur.re`
        : 'La 1ère plateforme animale de La Réunion'}
    </span>
  )
}
