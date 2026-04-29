'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Zap, ArrowLeft, CreditCard, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getAnimalById, updateAnimal } from '@/lib/animals/store'
import type { StoredAnimal } from '@/lib/animals/store'

export default function BoostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }        = React.use(params)
  const router        = useRouter()
  const searchParams  = useSearchParams()

  const [animal,   setAnimal]   = useState<StoredAnimal | null>(null)
  const [paid,     setPaid]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [checking, setChecking] = useState(false)
  const [error,    setError]    = useState('')

  // Charger l'animal
  useEffect(() => {
    const a = getAnimalById(id)
    if (a) setAnimal(a)
    else router.replace('/animaux')
  }, [id, router])

  // Retour de Mollie — vérifier le paiement
  useEffect(() => {
    const boostParam  = searchParams.get('boost')
    const paymentId   = searchParams.get('payment_id')

    if (boostParam === 'success' && paymentId) {
      setChecking(true)
      fetch(`/api/mollie/verify?id=${paymentId}`)
        .then(r => r.json())
        .then(data => {
          if (data.paid) {
            updateAnimal(id, { boosted: true })
            setPaid(true)
          } else {
            setError('Le paiement n\'a pas été confirmé. Contactez-nous si vous avez été débité.')
          }
        })
        .catch(() => setError('Impossible de vérifier le paiement. Contactez-nous.'))
        .finally(() => setChecking(false))
    }
  }, [id, searchParams])

  const handleBoost = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/mollie/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animalId:    id,
          amount:      '4.99',
          description: `Boost annonce SauvCoeur.re — ${animal?.name ?? id}`,
        }),
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setError(data.error ?? 'Impossible de démarrer le paiement. Réessayez.')
        setLoading(false)
      }
    } catch {
      setError('Erreur réseau. Réessayez.')
      setLoading(false)
    }
  }

  // ── Vérification en cours ──────────────────────────────────────
  if (checking) return (
    <main className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
      <Loader2 className="h-12 w-12 text-emerald-500 mx-auto animate-spin" />
      <p className="font-semibold text-slate-700">Vérification du paiement…</p>
    </main>
  )

  // ── Boost confirmé ─────────────────────────────────────────────
  if (paid) return (
    <main className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
      <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
      <h1 className="text-2xl font-bold text-slate-900">Boost activé ! ⚡</h1>
      <p className="text-slate-500">
        Votre annonce <strong>{animal?.name ?? 'votre animal'}</strong> est maintenant boostée.<br />
        Elle sera mise en avant dès validation par notre équipe.
      </p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-sm text-orange-700 space-y-1">
        <p>✅ Story Facebook sous 24h</p>
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

  // ── Page de boost ──────────────────────────────────────────────
  return (
    <main className="max-w-md mx-auto px-4 py-10 space-y-6">
      <Link href={`/animaux/${id}`} className="flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-600">
        <ArrowLeft className="h-4 w-4" /> Retour à l'annonce
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

      {/* Bouton paiement Mollie */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <CreditCard className="h-4 w-4" />
          Paiement sécurisé via <strong className="text-slate-700">Mollie</strong>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Vous allez être redirigé vers la page de paiement sécurisée Mollie.
          Cartes acceptées : Visa, Mastercard, iDEAL, Bancontact.
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
        )}

        <button onClick={handleBoost} disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-base">
          {loading
            ? <><Loader2 className="h-5 w-5 animate-spin" /> Redirection…</>
            : <><Zap className="h-5 w-5" /> Payer 4,99 € et booster</>
          }
        </button>

        <p className="text-center text-xs text-slate-400">
          🔒 Paiement 100% sécurisé · Aucune donnée bancaire stockée chez nous
        </p>
      </div>
    </main>
  )
}
