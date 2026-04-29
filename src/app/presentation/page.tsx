import Link from 'next/link'
import { PawPrint, Search, Heart, MapPin, ArrowRight, Home, AlertTriangle, HandHeart } from 'lucide-react'

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
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'À propos — SauvCœur.re',
  description: 'Découvrez SauvCœur.re, la 1ère plateforme réunionnaise pour retrouver les animaux perdus, signaler un animal trouvé et adopter à La Réunion.',
}

// ── Statistiques locales ───────────────────────────────────────
const STATS = [
  { value: '22',    label: 'Communes couvertes',         sub: 'dans tout le 974' },
  { value: '100%',  label: 'Gratuit',                    sub: 'pour les particuliers' },
  { value: '24h',   label: 'Délai de modération',        sub: 'max après publication' },
  { value: '3',     label: 'Types d\'annonces',          sub: 'Perdu · Trouvé · Adoption' },
]

// ── Étapes "comment ça marche" ─────────────────────────────────
const STEPS_LOST = [
  { n: '1', title: 'Publiez votre alerte',        desc: 'Quelques clics suffisent : photo, description, commune et coordonnées de contact. Votre annonce est créée immédiatement.' },
  { n: '2', title: 'Modération en 24h',           desc: 'Notre équipe vérifie l\'annonce et la met en ligne rapidement pour maximiser vos chances dès les premières heures.' },
  { n: '3', title: 'La communauté se mobilise',   desc: 'Les habitants de votre commune voient l\'alerte et peuvent vous contacter directement via notre formulaire sécurisé.' },
  { n: '4', title: 'Votre animal est retrouvé !', desc: 'Marquez l\'annonce comme résolue pour informer la communauté et libérer la place pour d\'autres alertes.' },
]

const STEPS_ADOPT = [
  { n: '1', title: 'Consultez les annonces',      desc: 'Filtrez par commune, espèce, âge. Chaque fiche présente l\'animal avec photos, description et histoire.' },
  { n: '2', title: 'Prenez contact',              desc: 'Un formulaire sécurisé vous met en relation avec le particulier ou l\'association qui propose l\'adoption.' },
  { n: '3', title: 'Rencontre et visite',         desc: 'Organisez une rencontre pour vous assurer que l\'animal correspond à votre mode de vie et à votre famille.' },
  { n: '4', title: 'Nouvelle famille !',          desc: 'L\'adoption est finalisée entre les parties. SauvCœur accompagne chaque étape sans frais de mise en relation.' },
]

export default function PresentationPage() {
  return (
    <main className="bg-white">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ctext x=\'50%25\' y=\'55%25\' font-size=\'28\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3E🐾%3C/text%3E%3C/svg%3E")' }} />

        <div className="relative max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <MapPin className="h-4 w-4" />
            La Réunion · 974 · Depuis 2026
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            La plateforme animale<br />
            <span className="text-emerald-200">100 % réunionnaise</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-10">
            SauvCœur.re est la première plateforme créée par et pour les Réunionnais.
            Signalez un animal perdu, aidez un animal trouvé, ou offrez-lui une famille — gratuit et sans inscription obligatoire.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/animaux/nouveau"
              className="flex items-center justify-center gap-2 bg-white text-emerald-700 font-bold px-6 py-3.5 rounded-2xl hover:bg-emerald-50 transition-colors shadow-lg">
              <PawPrint className="h-5 w-5" />
              Publier une alerte gratuite
            </Link>
            <Link href="/animaux?status=to_adopt"
              className="flex items-center justify-center gap-2 bg-white/15 border border-white/30 font-semibold px-6 py-3.5 rounded-2xl hover:bg-white/25 transition-colors">
              <Heart className="h-5 w-5" />
              Voir les animaux à adopter
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400">{s.value}</p>
              <p className="font-semibold text-white mt-1 text-sm">{s.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3 USAGES ─────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-3">
          Une plateforme, trois usages essentiels
        </h2>
        <p className="text-center text-slate-500 mb-10 max-w-xl mx-auto">
          Que vous ayez perdu votre animal, que vous en ayez trouvé un, ou que vous souhaitiez adopter — SauvCœur est fait pour vous.
        </p>

        <div className="grid sm:grid-cols-3 gap-6">
          {/* Perdu */}
          <div className="rounded-2xl border-2 border-red-100 bg-red-50 p-6 space-y-3">
            <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center text-xl shadow">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Animal perdu ?</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Publiez une alerte en 2 minutes avec photo, commune et dernière observation. La communauté réunionnaise est alertée immédiatement.
            </p>
            <Link href="/animaux/nouveau"
              className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700">
              Publier une alerte <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Trouvé */}
          <div className="rounded-2xl border-2 border-amber-100 bg-amber-50 p-6 space-y-3">
            <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-xl shadow">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Vous avez trouvé un animal ?</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Signalez-le pour aider son propriétaire à le retrouver. Vérifiez aussi les alertes publiées : son signalement est peut-être déjà en ligne.
            </p>
            <Link href="/animaux/nouveau"
              className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:text-amber-800">
              Signaler un animal trouvé <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Adoption */}
          <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-6 space-y-3">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl shadow">
              <Home className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Adopter à La Réunion</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Des animaux cherchent une famille aimante à La Réunion. Particuliers, associations et refuges publient leurs annonces d'adoption gratuitement.
            </p>
            <Link href="/animaux?status=to_adopt"
              className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              Voir les adoptions <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE — PERDU ────────────────────────── */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h2 className="text-2xl font-extrabold text-slate-900">Animal perdu : comment ça marche ?</h2>
          </div>
          <p className="text-slate-500 mb-8">Chaque minute compte. Voici comment SauvCœur maximise vos chances.</p>

          <div className="grid sm:grid-cols-4 gap-6">
            {STEPS_LOST.map(s => (
              <div key={s.n} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
                <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm">{s.n}</div>
                <h3 className="font-bold text-slate-900 text-sm">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/animaux/nouveau"
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-2xl transition-colors">
              <AlertTriangle className="h-5 w-5" />
              Publier une alerte maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE — ADOPTION ─────────────────────── */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <HandHeart className="h-6 w-6 text-emerald-600" />
            <h2 className="text-2xl font-extrabold text-slate-900">Adopter : comment ça marche ?</h2>
          </div>
          <p className="text-slate-500 mb-8">Adopter à La Réunion, simplement et gratuitement, entre particuliers ou via une association.</p>

          <div className="grid sm:grid-cols-4 gap-6">
            {STEPS_ADOPT.map(s => (
              <div key={s.n} className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">{s.n}</div>
                <h3 className="font-bold text-slate-900 text-sm">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/animaux?status=to_adopt"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl transition-colors">
              <Heart className="h-5 w-5" />
              Trouver un animal à adopter
            </Link>
          </div>
        </div>
      </section>

      {/* ── AVANTAGES ────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">Pourquoi SauvCœur ?</h2>
          <p className="text-center text-slate-400 mb-10 max-w-xl mx-auto">
            Une plateforme pensée pour les spécificités de La Réunion, par une équipe locale.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '🌴', title: '100 % local', desc: 'Conçue pour La Réunion, avec les 22 communes, les associations locales et la communauté réunionnaise.' },
              { icon: '💶', title: 'Totalement gratuit', desc: 'Publication, recherche, contact — tout est gratuit pour les particuliers. Pas de compte requis pour consulter.' },
              { icon: '🔒', title: 'Contact sécurisé', desc: 'Pas d\'email affiché en clair. Les échanges passent par notre formulaire sécurisé, sans spam ni démarchage.' },
              { icon: '🛡️', title: 'Annonces modérées', desc: 'Chaque annonce est vérifiée par notre équipe avant publication. Fini les fausses alertes et les arnaques.' },
              { icon: '📍', title: 'Géolocalisation précise', desc: 'Carte interactive par commune, localisation de la dernière observation, signalements autour du lieu de perte.' },
              { icon: '🤝', title: 'Annuaire des pros', desc: 'Vétérinaires, associations, toiletteurs, éducateurs — retrouvez tous les acteurs animaliers du 974 en un endroit.' },
            ].map(f => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex gap-4">
                <span className="text-3xl shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-bold text-white mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANNUAIRE TEASER ───────────────────────────────────── */}
      <section className="py-16 bg-blue-50 border-y border-blue-100">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
              📖 Annuaire 974
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Tous les acteurs animaliers de La Réunion</h2>
            <p className="text-slate-600 leading-relaxed">
              Vétérinaires & santé, associations & refuges, garde & pensions, éducation, toilettage, animaleries — retrouvez en un clic les professionnels et associations près de chez vous.
            </p>
            <Link href="/annuaire"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Consulter l'annuaire <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="hidden sm:grid grid-cols-2 gap-3 shrink-0 w-64">
            {['🩺 Vétérinaires', '❤️ Refuges', '🏠 Pensions', '✂️ Toilettage', '🎓 Éducation', '🛒 Animaleries'].map(l => (
              <div key={l} className="bg-white border border-blue-100 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 text-center shadow-sm">{l}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-4">
          <div className="text-5xl">🐾</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Chaque signalement compte</h2>
          <p className="text-slate-500 leading-relaxed">
            Rejoignez la communauté SauvCœur et aidez les animaux de La Réunion à retrouver leur famille — ou à en trouver une nouvelle.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/animaux/nouveau"
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-2xl transition-colors">
              <PawPrint className="h-5 w-5" />
              Publier une annonce
            </Link>
            <Link href="/animaux"
              className="flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-emerald-400 text-slate-700 font-semibold px-6 py-3.5 rounded-2xl transition-colors">
              <Search className="h-5 w-5" />
              Consulter les annonces
            </Link>
          </div>

          {/* Réseaux sociaux */}
          <div className="pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-400 mb-3">Suivez-nous sur les réseaux sociaux</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="https://www.facebook.com/SauvCoeurReunion" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                <IconFacebook className="h-4 w-4" /> Notre page Facebook
              </a>
              <a href="https://www.instagram.com/sauvcoeurreunion/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                <IconInstagram className="h-4 w-4" /> Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
