'use client'

import { useState } from 'react'
import { Mail, CheckCircle2 } from 'lucide-react'

interface Props {
  /** Contexte de la page pour personnaliser le texte */
  context?: 'animaux' | 'annuaire' | 'default'
}

const TEXTS = {
  animaux: {
    title: '🐾 Soyez alerté en temps réel',
    desc: 'Recevez chaque semaine les nouveaux animaux perdus, trouvés et à adopter près de chez vous à La Réunion.',
  },
  annuaire: {
    title: '📬 Restez informé',
    desc: 'Recevez notre newsletter hebdomadaire avec les animaux perdus/trouvés et les nouveaux professionnels de la cause animale.',
  },
  default: {
    title: '🐾 Newsletter hebdomadaire',
    desc: 'Recevez chaque semaine la liste des animaux perdus et trouvés à La Réunion directement dans votre boîte mail.',
  },
}

export function NewsletterBanner({ context = 'default' }: Props) {
  const [email,   setEmail]   = useState('')
  const [success, setSuccess] = useState(false)
  const [already, setAlready] = useState(false)
  const [loading, setLoading] = useState(false)

  const { title, desc } = TEXTS[context] ?? TEXTS.default

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res  = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.already) {
        setAlready(true)
        setTimeout(() => setAlready(false), 3000)
      } else {
        setSuccess(true)
      }
    } catch { /* silencieux */ }
    finally   { setLoading(false) }
  }

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Icône */}
        <div className="shrink-0 h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-sm">
          <Mail className="h-6 w-6 text-white" />
        </div>

        {/* Texte */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm sm:text-base">{title}</p>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 leading-relaxed">{desc}</p>
        </div>

        {/* Formulaire */}
        {success ? (
          <div className="flex items-center gap-2 text-emerald-700 font-medium text-sm bg-emerald-100 rounded-xl px-4 py-2.5 shrink-0">
            <CheckCircle2 className="h-4 w-4" /> Inscription confirmée !
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-1.5 shrink-0 w-full sm:w-auto">
            <div className="flex gap-2">
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.re"
                className="flex-1 sm:w-48 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button type="submit" disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap">
                {loading ? '…' : "S'abonner"}
              </button>
            </div>
            {already && (
              <p className="text-amber-600 text-xs">Vous êtes déjà inscrit(e) à la newsletter.</p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
