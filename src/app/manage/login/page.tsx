'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { setAdminSession } from '@/lib/animals/store'

export default function ManageLoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [show,     setShow]     = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res  = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.ok) {
        setAdminSession()
        router.push('/manage')
      } else {
        setError(data.error ?? 'Identifiants incorrects.')
      }
    } catch {
      setError('Erreur réseau. Réessayez.')
    }

    setLoading(false)
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16 min-h-[70vh]">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center bg-slate-800 text-white rounded-2xl p-3 mb-3">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Espace Administration</h1>
          <p className="text-slate-500 text-sm mt-1">Accès réservé à l'équipe SauvCœur.re</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Mot de passe</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} required value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-slate-500" />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Vérification…' : "Accéder à l'administration"}
          </button>
        </form>
      </div>
    </main>
  )
}
