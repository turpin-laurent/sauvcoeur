'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, Heart, BookOpen, User, LogIn, Plus, PawPrint, Info } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'

const NAV = [
  { href: '/animaux?status=lost',     icon: Search,   label: 'Perdu / Trouvé ?', sub: 'Signaler un animal disparu',      color: 'text-orange-500',  hoverBg: 'hover:bg-orange-50', hoverText: 'hover:text-orange-600' },
  { href: '/animaux?status=to_adopt', icon: Heart,    label: 'À adopter',         sub: 'Trouver un compagnon à La Réunion', color: 'text-emerald-500', hoverBg: 'hover:bg-emerald-50', hoverText: 'hover:text-emerald-600' },
  { href: '/annuaire',                icon: BookOpen, label: 'Annuaire 974',      sub: 'Vétérinaires, pros vérifiés',      color: 'text-blue-500',    hoverBg: 'hover:bg-blue-50', hoverText: 'hover:text-blue-600' },
  { href: '/presentation',            icon: Info,     label: 'À propos',           sub: 'Découvrir le projet SauvCœur',     color: 'text-slate-400',   hoverBg: 'hover:bg-slate-50', hoverText: 'hover:text-slate-700' },
]

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  // Fermer au changement de route
  useEffect(() => { setOpen(false) }, [pathname])

  // Bloquer le scroll body quand ouvert
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Bouton hamburger — visible uniquement sur mobile */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="md:hidden flex items-center justify-center p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel — slide depuis le haut */}
          <div className="absolute top-0 left-0 right-0 bg-white rounded-b-3xl shadow-2xl overflow-hidden">
            {/* Header du drawer */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-600 text-white rounded-xl p-1.5">
                  <PawPrint className="h-4 w-4" />
                </div>
                <span className="font-bold text-slate-900">Sauv<span className="text-emerald-600">Cœur</span></span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Liens nav */}
            <div className="px-3 py-3 space-y-1">
              {NAV.map(({ href, icon: Icon, label, sub, color, hoverBg, hoverText }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-700 transition-colors ${hoverBg} ${hoverText}`}
                >
                  <div className={`${color} shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Séparateur */}
            <div className="mx-4 border-t border-slate-100" />

            {/* Auth + CTA */}
            <div className="px-3 py-3 space-y-2">
              {user ? (
                <Link
                  href="/mon-espace"
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <div className="bg-emerald-100 rounded-full w-9 h-9 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-slate-400">Mon espace</p>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/connexion"
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <div className="bg-slate-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                    <LogIn className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Connexion</p>
                    <p className="text-xs text-slate-400">Ou créer un compte</p>
                  </div>
                </Link>
              )}

              <Link
                href="/animaux/nouveau"
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-colors text-sm"
              >
                <Plus className="h-5 w-5" />
                Publier une annonce gratuitement
              </Link>
            </div>

            {/* Safe area pour iPhone */}
            <div className="h-4" />
          </div>
        </div>
      )}
    </>
  )
}
