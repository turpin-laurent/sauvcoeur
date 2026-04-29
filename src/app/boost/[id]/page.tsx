'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Lock, Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getAnimalById, updateAnimal } from '@/lib/animals/store'
import type { StoredAnimal } from '@/lib/animals/store'

export default function BoostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router  = useRouter()

  const [animal,  setAnimal]  = useState<StoredAnimal | null>(null)
  const [paid,    setPaid]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [card,    setCard]    = useState({ number: '', expiry: '', cvv: '', name: '' })
  const [error,   setError]   = useState('')

  useEffect(() => {
    const a = getAnimalById(id)
    if (a) setAnimal(a)
    else {
      // Animal introuvable → retour à la liste sans erreur
      router.replace('/animaux')
    }
  }, [id, router])

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    // Validation basique
    const clean = card.number.replace(/\s/g, '')
    if (clean.length < 16) { setError('Numéro de carte invalide.'); return }
    if (!card.expiry.match(/^\d{2}\/\d{2}$/)) { setError('Date d\'expiration invalide (MM/AA).'); return }
    if (card.cvv.length < 3) { setError('CVV invalide.'); return }
    if (!card.name.trim()) { setError('Nom sur la carte requis.'); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 1500)) // simulation paiement
    updateAnimal(id, { boosted: true })
    if (typeof window !== 'undefined') sessionStorage.removeItem('sc_draft_id')
    setPaid(true)
    setLoading(false)
  }

  const formatCard = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  const formatExpiry = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4)
    return clean.length > 2 ? `${clean.slice(0,2)}/${clean.slice(2)}` : clean
  }

  if (paid) return (
    <main className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
      <Zap className="h-16 w-16 text-orange-500 mx-auto" />
      <h1 className="text-2xl font-bold text-slate-900">Boost activé ! ⚡</h1>
      <p className="text-slate-500">
        Votre annonce <strong>{animal?.name ?? 'Votre animal'}</strong> est maintenant boostée.<br />
        Elle sera mise en avant dès validation par notre équipe.
      </p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-sm text-orange-700 space-y-1">
        <p>✅ Partage en story Facebook sous 24h</p>
        <p>✅ Badge ⚡ visible sur votre annonce</p>
        <p>✅ Priorité en tête des résultats</p>
      </div>
      <div className="flex flex-col gap-3 pt-2">
        <Link href="/mon-espace"
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
          Voir mon espace
        </Link>
        <Link href="/animaux"
          className="border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
          Voir toutes les annonces
        </Link>
      </div>
    </main>
  )

  return (
    <main className="max-w-md mx-auto px-4 py-10 space-y-6">
      <Link href="/animaux" className="flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-600">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      {/* Résumé */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 text-white rounded-xl p-2">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Boost Annonce ⚡</p>
            <p className="text-sm text-slate-500">{animal?.name ?? 'Votre animal'} · {animal?.location_city}</p>
          </div>
          <p className="ml-auto text-2xl font-bold text-orange-600">4,99 €</p>
        </div>
        <ul className="text-sm text-slate-600 space-y-1 pt-1 border-t border-orange-200">
          <li>✅ Story Facebook sous 24h</li>
          <li>✅ Badge ⚡ sur votre annonce</li>
          <li>✅ Tête des résultats</li>
          <li>✅ Paiement unique, pas d'abonnement</li>
        </ul>
      </div>

      {/* Formulaire de paiement */}
      <form onSubmit={handlePay} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-4 w-4 text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">Paiement sécurisé</p>
          <div className="ml-auto flex gap-1.5 items-center">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">VISA</span>
            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">MC</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Numéro de carte</label>
          <input value={card.number}
            onChange={e => setCard(c => ({ ...c, number: formatCard(e.target.value) }))}
            placeholder="1234 5678 9012 3456" maxLength={19}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Date d'expiration</label>
            <input value={card.expiry}
              onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))}
              placeholder="MM/AA" maxLength={5}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">CVV</label>
            <input value={card.cvv}
              onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g,'').slice(0,4) }))}
              placeholder="123" maxLength={4}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Nom sur la carte</label>
          <input value={card.name}
            onChange={e => setCard(c => ({ ...c, name: e.target.value }))}
            placeholder="PRÉNOM NOM"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm uppercase outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-base">
          <Zap className="h-5 w-5" />
          {loading ? 'Traitement en cours…' : 'Payer 4,99 € et booster'}
        </button>

        <p className="text-center text-xs text-slate-400">
          🔒 Paiement 100% sécurisé · Aucune donnée bancaire stockée
        </p>
      </form>
    </main>
  )
}
