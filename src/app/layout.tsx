import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import { PawPrint, Search, Heart, BookOpen, Plus } from 'lucide-react'
import { AuthProvider } from '@/lib/auth/context'
import MobileNav from '@/components/layout/MobileNav'
import NavAuth from '@/components/layout/NavAuth'

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
    </svg>
  )
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"/>
    </svg>
  )
}
import './globals.css'

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] })

const BASE_URL = 'https://www.sauvcoeur.re'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'SauvCœur.re — La cause animale à La Réunion',
    template: '%s | SauvCœur.re',
  },
  description: 'La 1ère plateforme réunionnaise pour retrouver, signaler, adopter et accompagner les animaux.',
  openGraph: {
    title: '🐾 SauvCœur.re — La cause animale à La Réunion',
    description: 'Retrouvez, signalez, adoptez des animaux à La Réunion. Plateforme gratuite, locale et engagée.',
    url: BASE_URL,
    siteName: 'SauvCœur.re',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🐾 SauvCœur.re — Cause animale Réunion',
    description: 'Retrouvez, signalez, adoptez des animaux à La Réunion.',
  },
  alternates: { canonical: BASE_URL },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>

        {/* ── HEADER ── */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center gap-3">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="bg-emerald-600 text-white rounded-xl p-1.5">
                <PawPrint className="h-5 w-5" />
              </div>
              <span className="font-bold text-slate-900 text-base">
                Sauv<span className="text-emerald-600">Cœur</span>
              </span>
            </Link>

            <div className="h-6 w-px bg-slate-200 hidden md:block mx-1" />

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-0.5 flex-1">
              <Link href="/animaux?status=lost"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors group">
                <Search className="h-4 w-4 text-orange-400 group-hover:text-orange-500" />
                Perdu / Trouvé ?
              </Link>
              <Link href="/animaux?status=to_adopt"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors group">
                <Heart className="h-4 w-4 text-emerald-400 group-hover:text-emerald-600" />
                À adopter
              </Link>
              <Link href="/annuaire"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors group">
                <BookOpen className="h-4 w-4 text-blue-400 group-hover:text-blue-600" />
                Annuaire 974
              </Link>
            </nav>

            {/* Actions desktop */}
            <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto">
              <NavAuth />
              <Link href="/animaux/nouveau"
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <Plus className="h-4 w-4" />
                Publier
              </Link>
            </div>

            {/* Mobile : Publier + Hamburger */}
            <div className="md:hidden flex items-center gap-2 ml-auto">
              <Link href="/animaux/nouveau"
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
                <Plus className="h-3.5 w-3.5" />
                Publier
              </Link>
              <MobileNav />
            </div>

          </div>
        </header>

        <div className="flex-1">{children}</div>

        {/* ── FOOTER ── */}
        <footer className="bg-slate-900 text-slate-300 mt-12">
          <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-4 gap-8">

            {/* Brand */}
            <div className="sm:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-600 text-white rounded-xl p-1.5">
                  <PawPrint className="h-5 w-5" />
                </div>
                <span className="font-bold text-white text-base">Sauv<span className="text-emerald-400">Cœur</span></span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                La 1ère plateforme réunionnaise pour retrouver, signaler, adopter et accompagner les animaux.
              </p>
              <div className="flex gap-3 pt-1">
                <a href="https://www.facebook.com/SauvCoeurReunion" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                  <IconFacebook className="h-3.5 w-3.5" /> Facebook
                </a>
                <a href="https://www.instagram.com/sauvcoeurreunion/" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                  <IconInstagram className="h-3.5 w-3.5" /> Instagram
                </a>
              </div>
            </div>

            {/* À notre propos */}
            <div className="space-y-3">
              <p className="font-semibold text-white text-sm">À notre propos</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/presentation" className="hover:text-emerald-400 transition-colors">Présentation</Link></li>
                <li><Link href="/animaux?status=lost" className="hover:text-emerald-400 transition-colors">Perdu / Retrouvé</Link></li>
                <li><Link href="/animaux?status=to_adopt" className="hover:text-emerald-400 transition-colors">À adopter</Link></li>
                <li><Link href="/annuaire" className="hover:text-emerald-400 transition-colors">Annuaire 974</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-3">
              <p className="font-semibold text-white text-sm">Support</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq" className="hover:text-emerald-400 transition-colors">Foire aux questions</Link></li>
                <li><Link href="/mentions-legales" className="hover:text-emerald-400 transition-colors">Mentions légales</Link></li>
                <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Nos réseaux */}
            <div className="space-y-3">
              <p className="font-semibold text-white text-sm">Nos réseaux</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://www.facebook.com/SauvCoeurReunion" target="_blank" rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                    <IconFacebook className="h-3.5 w-3.5" /> Notre page Facebook
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/sauvcoeurreunion/" target="_blank" rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                    <IconInstagram className="h-3.5 w-3.5" /> Notre Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800">
            <div className="max-w-5xl mx-auto px-4 py-4 text-center text-xs text-slate-500">
              © 2026 SauvCœur.re — La 1ère plateforme réunionnaise pour retrouver, signaler, adopter et accompagner les animaux
            </div>
          </div>
        </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
