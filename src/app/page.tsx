import Link from 'next/link'
import { Search, Heart, BookOpen, ChevronRight } from 'lucide-react'
import { NewsletterForm } from '@/components/home/NewsletterForm'
import { StatsBar } from '@/components/home/StatsBar'
import ReunionMapClient from '@/components/map/ReunionMapClient'

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
  )
}
function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"/></svg>
  )
}

export default function HomePage() {
  return (
    <main>

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-20 text-center space-y-5 sm:space-y-6">
          <span className="inline-block bg-white/20 rounded-full px-4 py-1 text-sm font-medium">
            🐾 24 animaux déjà retrouvés grâce à SauvCœur.re
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Mobilisez des milliers de personnes<br className="hidden sm:block" />
            {' '}<span className="text-emerald-200">à la recherche de votre animal</span><br className="hidden sm:block" />
            {' '}en 5 minutes !
          </h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            La 1ère plateforme réunionnaise pour retrouver, signaler, adopter et accompagner les animaux de La Réunion (974).
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/animaux/nouveau"
              className="flex items-center gap-2 bg-white text-emerald-700 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg">
              📢 Publier une alerte
            </Link>
            <Link href="/animaux?status=lost"
              className="flex items-center gap-2 border-2 border-white/60 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
              <Search className="h-4 w-4" /> Voir les annonces
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS (temps réel) ── */}
      <StatsBar />

      {/* ── RUBRIQUES ── */}
      <section className="max-w-5xl mx-auto px-4 py-8 sm:py-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { icon: '😢', title: 'Perdu / Trouvé ?', desc: 'Signalez un animal perdu ou trouvé en 2 minutes avec photo et commune.', href: '/animaux?status=lost', color: 'orange' },
          { icon: '🏠', title: 'À adopter',        desc: 'Des animaux qui cherchent une famille aimante à La Réunion.',             href: '/animaux?status=to_adopt', color: 'emerald' },
          { icon: '📋', title: 'Annuaire 974',     desc: 'Vétérinaires, éducateurs, pet-sitters vérifiés à La Réunion.',            href: '/annuaire', color: 'blue' },
        ].map(({ icon, title, desc, href, color }) => (
          <Link key={title} href={href}
            className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow flex flex-col gap-3">
            <span className="text-4xl">{icon}</span>
            <div>
              <p className={`font-bold text-slate-900 group-hover:text-${color}-600 transition-colors`}>{title}</p>
              <p className="text-sm text-slate-500 mt-1">{desc}</p>
            </div>
            <span className={`text-sm font-medium text-${color}-600 flex items-center gap-1`}>
              Voir <ChevronRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Comment ça marche ?</h2>
            <p className="text-slate-500 mt-2">Lancez votre recherche en 2 minutes</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                n: '1', icon: '📝', title: 'Publication',
                desc: "Insérez les informations relatives à l'animal, la position et une petite description. Chaque minute compte : augmentez vos chances de retrouver rapidement votre compagnon.",
              },
              {
                n: '2', icon: '✅', title: 'Vérification',
                desc: 'Vos données sont vérifiées par nos équipes dans les meilleurs délais.',
              },
              {
                n: '3', icon: '📡', title: 'Diffusion',
                desc: "Votre alerte est diffusée sur nos réseaux sociaux et auprès de nos partenaires réunionnais.",
              },
            ].map(({ n, icon, title, desc }) => (
              <div key={n} className="text-center space-y-3">
                <div className="inline-flex items-center justify-center bg-emerald-600 text-white rounded-2xl w-14 h-14 text-2xl mx-auto">
                  {icon}
                </div>
                <div className="inline-flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-full w-6 h-6 text-xs font-bold">
                  {n}
                </div>
                <p className="font-bold text-slate-900">{title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/animaux/nouveau"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-emerald-700 transition-colors">
              📢 Publier maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* ── TEASER CARTE ── */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/animaux"
          className="group relative block rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-400 transition-all hover:shadow-lg bg-gradient-to-br from-slate-800 to-slate-900">
          {/* Fond carte stylisé */}
          <div className="h-48 sm:h-56 relative overflow-hidden">
            <ReunionMapClient height="100%" filter="all" />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent pointer-events-none" />
          </div>
          {/* Contenu superposé */}
          <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
            <div>
              <p className="text-white font-bold text-lg">🗺️ Voir sur la carte</p>
              <p className="text-slate-300 text-sm mt-0.5">Tous les animaux perdus, trouvés et à adopter à La Réunion</p>
              <div className="flex gap-3 mt-2 text-xs">
                {[['bg-red-500','Perdu'],['bg-amber-500','Trouvé'],['bg-emerald-500','À adopter']].map(([c,l]) => (
                  <span key={l} className="flex items-center gap-1 text-slate-300">
                    <span className={`w-2 h-2 rounded-full ${c} inline-block`} />{l}
                  </span>
                ))}
              </div>
            </div>
            <span className="shrink-0 bg-emerald-500 group-hover:bg-emerald-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5">
              Explorer <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 space-y-2">
            <p className="font-bold text-slate-900 text-lg">🐾 Newsletter hebdomadaire</p>
            <p className="text-slate-500 text-sm">Recevez chaque semaine la liste des animaux perdus et trouvés à La Réunion directement dans votre boîte mail.</p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      {/* ── REJOINDRE COMMUNAUTÉ ── */}
      <section className="bg-slate-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <p className="font-bold text-xl">Rejoignez notre communauté</p>
          <p className="text-slate-400 text-sm">Plus de 1 200 réunionnais mobilisés pour la cause animale</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="https://www.facebook.com/SauvCoeurReunion" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
              <IconFacebook className="h-4 w-4" /> Notre page Facebook
            </a>
            <a href="https://www.instagram.com/sauvcoeurreunion/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
              <IconInstagram className="h-4 w-4" /> Instagram
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
