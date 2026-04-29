'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PawPrint, Eye, EyeOff, LogIn, UserPlus, KeyRound, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'

type Mode = 'login' | 'register' | 'forgot'

export default function ConnexionPage() {
  const router         = useRouter()
  const { login, register, forgotPassword } = useAuth()
  const [mode, setMode]         = useState<Mode>('login')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [newsletter, setNewsletter] = useState(true)
  const [show, setShow]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const reset = (m: Mode) => { setMode(m); setError(''); setSuccess('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'login') {
      const res = await login(email, password)
      if (res.error) { setError(res.error) }
      else { router.push('/mon-espace') }

    } else if (mode === 'register') {
      if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); setLoading(false); return }
      const res = await register(name, email, password, newsletter)
      if (res.error) { setError(res.error) }
      else { router.push('/mon-espace') }

    } else {
      const res = await forgotPassword(email)
      if (res.error) { setError(res.error) }
      else { setSuccess(`Un lien de réinitialisation a été envoyé à ${email}.`) }
    }
    setLoading(false)
  }

  const TABS = [
    { id: 'login' as Mode,    icon: <LogIn className="h-4 w-4" />,    label: 'Connexion' },
    { id: 'register' as Mode, icon: <UserPlus className="h-4 w-4" />, label: 'Inscription' },
    { id: 'forgot' as Mode,   icon: <KeyRound className="h-4 w-4" />, label: 'Mot de passe oublié' },
  ]

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16 min-h-[70vh]">
      <div className="w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-emerald-600 text-white rounded-xl p-2">
              <PawPrint className="h-6 w-6" />
            </div>
            <span className="font-bold text-slate-900 text-lg">
              Sauv<span className="text-emerald-600">Cœur</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900">
            {mode === 'login'    ? 'Bon retour !'
             : mode === 'register' ? 'Créer un compte'
             : 'Réinitialiser le mot de passe'}
          </h1>
        </div>

        {/* Onglets */}
        <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => reset(t.id)}
              className={[
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all',
                mode === t.id ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}>
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">

          {/* Nom — inscription seulement */}
          {mode === 'register' && (
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Prénom et nom *</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="Marie Dupont"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Email *</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.re"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          {/* Mot de passe — connexion + inscription */}
          {mode !== 'forgot' && (
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Mot de passe *</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Minimum 8 caractères' : '••••••••'}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === 'login' && (
                <button type="button" onClick={() => reset('forgot')}
                  className="text-xs text-emerald-600 hover:underline mt-1 block">
                  Mot de passe oublié ?
                </button>
              )}
            </div>
          )}

          {/* Newsletter — inscription seulement */}
          {mode === 'register' && (
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={newsletter} onChange={e => setNewsletter(e.target.checked)}
                className="mt-0.5 accent-emerald-600" />
              <span className="text-xs text-slate-500 leading-relaxed">
                Je souhaite recevoir la newsletter hebdomadaire avec les animaux perdus/trouvés à La Réunion.
              </span>
            </label>
          )}

          {/* Erreur / succès */}
          {error   && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
          {success && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
            {loading ? 'Chargement…'
              : mode === 'login'    ? 'Se connecter'
              : mode === 'register' ? 'Créer mon compte'
              : 'Envoyer le lien'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          En continuant, vous acceptez nos{' '}
          <Link href="/mentions-legales" className="underline hover:text-slate-600">mentions légales</Link>.
        </p>
      </div>
    </main>
  )
}
