'use client'

import { useState } from 'react'

export function NewsletterForm() {
  const [email,   setEmail]   = useState('')
  const [success, setSuccess] = useState(false)
  const [already, setAlready] = useState(false)
  const [loading, setLoading] = useState(false)

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
    } catch {
      // fallback silencieux
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <p className="text-emerald-700 font-medium text-sm bg-emerald-50 rounded-xl px-4 py-3">
        ✅ Inscription confirmée ! Vous recevrez la newsletter chaque semaine.
      </p>
    )
  }

  return (
    <form className="flex flex-col gap-2 w-full sm:w-auto" onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="votre@email.re"
          className="flex-1 sm:w-56 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors whitespace-nowrap"
        >
          {loading ? '…' : "S'abonner"}
        </button>
      </div>
      {already && (
        <p className="text-amber-600 text-xs">Vous êtes déjà inscrit(e) à la newsletter.</p>
      )}
    </form>
  )
}
