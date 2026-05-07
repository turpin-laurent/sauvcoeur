'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogIn, User, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'

export default function NavAuth() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()

  if (loading) return <div className="w-20 h-8 rounded-xl bg-slate-100 animate-pulse" />

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/mon-espace"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors px-3 py-2 rounded-xl hover:bg-emerald-50">
          <User className="h-4 w-4" />
          <span className="hidden lg:inline">{user.name.split(' ')[0]}</span>
          <span className="hidden md:inline lg:hidden">Mon espace</span>
        </Link>
        <button
          onClick={() => { logout(); router.push('/') }}
          className="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-red-500 transition-colors px-2 py-2 rounded-xl"
          title="Se déconnecter">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <Link href="/connexion"
      className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors px-3 py-2 rounded-xl hover:bg-emerald-50">
      <LogIn className="h-4 w-4" />
      Connexion
    </Link>
  )
}
