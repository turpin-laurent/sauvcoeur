'use client'

import { useState } from 'react'

export function NewsletterForm() {
  const [email, setEmail]     = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Branchement API newsletter à faire
    setSuccess(true)
  }

  if (success) {
    return (
      <p className="text-emerald-700 font-medium text-sm bg-emerald-50 rounded-xl px-4 py-3">
        ✅ Inscription confirmée ! Vous recevrez la newsletter chaque semaine.
      </p>
    )
  }

  return (
    <form className="flex gap-2 w-full sm:w-auto" onSubmit={handleSubmit}>
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
        className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors whitespace-nowrap"
      >
        S'abonner
      </button>
    </form>
  )
}
