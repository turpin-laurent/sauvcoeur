'use client'

import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default function ConfirmationPage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-20 text-center space-y-5">
      <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
      <h1 className="text-2xl font-bold text-slate-900">Annonce soumise avec succès !</h1>
      <p className="text-slate-500">
        Votre annonce est en attente de validation par notre équipe de modération.<br />
        Elle sera publiée sous 24h.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link href="/animaux"
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
          Voir les annonces
        </Link>
        <Link href="/mon-espace"
          className="border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
          Mon espace
        </Link>
      </div>
    </main>
  )
}
