'use client'

import React, { useState, useMemo, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Heart, Search, MapPin, Clock, PawPrint, Star, LayoutList, Map, ChevronLeft, ChevronRight } from 'lucide-react'
import { COMMUNES_974 } from '@/lib/geo/communes974'
import { getAnimals, getBanners } from '@/lib/animals/store'
import type { PublicAnimal, AnimalStatus, AnimalSpecies } from '@/types'

const ReunionMap = dynamic(() => import('@/components/map/ReunionMap'), { ssr: false })

const PAGE_SIZE = 16

// ── Données mock ──────────────────────────────────────────────
const MOCK_ANIMALS: PublicAnimal[] = [
  { id: '1', status: 'to_adopt', species: 'dog', gender: 'male',    name: 'Rex',  age_years: 3, specific_signs: 'Berger croisé, très affectueux.',   color: 'Fauve et noir', photos: [], location_city: 'Saint-Denis',  moderation_status: 'approved', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: '2', status: 'lost',     species: 'cat', gender: 'female',  name: 'Mimi', age_years: 2, specific_signs: 'Chatte tigrée, collier rouge.',       color: 'Tigrée grise',  photos: [], location_city: 'Le Tampon',    moderation_status: 'approved', created_at: new Date(Date.now() - 86400000).toISOString()     },
  { id: '3', status: 'found',    species: 'dog', gender: 'unknown',              specific_signs: 'Petit chien blanc, marché forain.',        color: 'Blanc',         photos: [], location_city: 'Saint-Paul',   moderation_status: 'approved', created_at: new Date().toISOString()                         },
  { id: '4', status: 'to_adopt', species: 'cat', gender: 'female',  name: 'Luna', age_years: 1, specific_signs: 'Chatte noire, stérilisée.',           color: 'Noire',         photos: [], location_city: 'Saint-Pierre', moderation_status: 'approved', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  lost:     { label: 'Perdu',     color: 'text-red-700',     bg: 'bg-red-100',     emoji: '😢' },
  found:    { label: 'Trouvé',    color: 'text-amber-700',   bg: 'bg-amber-100',   emoji: '🔍' },
  to_adopt: { label: 'À adopter', color: 'text-emerald-700', bg: 'bg-emerald-100', emoji: '🏠' },
}
const SPECIES_VISUAL: Record<string, { bg: string; label: string; icon: string }> = {
  dog:    { bg: 'bg-amber-50',  label: 'Chien',  icon: '🐕' },
  cat:    { bg: 'bg-purple-50', label: 'Chat',   icon: '🐱' },
  bird:   { bg: 'bg-sky-50',    label: 'Oiseau', icon: '🐦' },
  rabbit: { bg: 'bg-pink-50',   label: 'Lapin',  icon: '🐰' },
  other:  { bg: 'bg-slate-100', label: 'Animal', icon: '🐾' },
}

function timeAgo(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000)
  const d = Math.floor(h / 24)
  return d > 0 ? `il y a ${d}j` : h > 0 ? `il y a ${h}h` : "à l'instant"
}

function AdBanner() {
  const [banner, setBanner] = useState<{ url: string; text: string; image?: string } | null>(null)
  useEffect(() => {
    const b = getBanners().find(x => x.slot.includes('Liste') && x.active)
    if (b) setBanner(b)
  }, [])
  const url  = banner?.url  ?? 'https://www.facebook.com/SauvCoeurReunion'
  const text = banner?.text ?? 'Votre publicité ici — Soutenez SauvCœur.re'
  if (banner?.image) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center rounded-xl border border-slate-200 overflow-hidden hover:opacity-90 transition-opacity">
        <img src={banner.image} alt={text} style={{ width: 468, height: 60, objectFit: 'cover', maxWidth: '100%' }} />
      </a>
    )
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border-2 border-dashed border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 hover:border-emerald-500 transition-colors group">
      <div className="text-xl shrink-0">🐾</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-emerald-800 leading-tight">{text}</p>
        <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">Espace partenaire · Contactez-nous</p>
      </div>
      <span className="shrink-0 bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
        Nous contacter
      </span>
    </a>
  )
}

function AnimalVisual({ animal, cfg, liked, onLike }: {
  animal: PublicAnimal
  cfg: { bg: string; color: string; label: string; emoji: string }
  liked: boolean
  onLike: () => void
}) {
  const v = SPECIES_VISUAL[animal.species] ?? SPECIES_VISUAL.other
  const hasPhoto = (animal.photos as string[])?.filter(Boolean).length > 0
  return (
    <div className={`relative h-40 sm:h-44 ${hasPhoto ? '' : v.bg} flex flex-col items-center justify-center gap-1 overflow-hidden`}>
      {hasPhoto
        ? <img src={(animal.photos as string[])[0]} alt="" className="w-full h-full object-cover" />
        : <><span className="text-5xl select-none">{v.icon}</span><span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{v.label}</span></>
      }
      <button onClick={e => { e.preventDefault(); onLike() }}
        className={['absolute top-2 right-2 rounded-full p-1.5 transition-all shadow-sm', liked ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-400 hover:text-red-400'].join(' ')}>
        <Heart className={`h-4 w-4 ${liked ? 'fill-white' : ''}`} />
      </button>
      <span className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
        {cfg.emoji} {cfg.label}
      </span>
    </div>
  )
}

function AnimalCard({ animal }: { animal: PublicAnimal }) {
  const [liked, setLiked] = useState(false)
  const cfg      = STATUS_CONFIG[animal.status] ?? STATUS_CONFIG.found
  const approved = (animal as any).moderation_status === 'approved'
  return (
    <Link href={`/animaux/${animal.id}`} className="group block">
      <article className={['relative bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-all duration-200', approved ? 'border-emerald-200' : 'border-slate-200'].join(' ')}>
        {approved && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 z-10" />}
        <AnimalVisual animal={animal} cfg={cfg} liked={liked} onLike={() => setLiked(l => !l)} />
        <div className="p-3 space-y-1">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-slate-900 flex-1 truncate text-sm">
              {animal.name ?? 'Animal inconnu'}
              {animal.age_years !== undefined && <span className="text-slate-400 font-normal ml-1">· {animal.age_years}a</span>}
            </p>
            {approved    && <Star className="h-3 w-3 fill-emerald-500 text-emerald-500 shrink-0" />}
            {(animal as any).pinned  && <span className="text-xs shrink-0" title="Épinglé">📌</span>}
            {(animal as any).boosted && <span className="text-xs font-bold text-orange-500 shrink-0" title="Boosté">⚡</span>}
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" />{animal.location_city}</p>
          {animal.specific_signs && <p className="text-xs text-slate-400 line-clamp-2">{animal.specific_signs}</p>}
          <p className="text-xs text-slate-400 flex items-center gap-1 pt-0.5"><Clock className="h-3 w-3" />{timeAgo(animal.created_at)}</p>
        </div>
      </article>
    </Link>
  )
}

// ── Page intérieure ───────────────────────────────────────────
function AnimauxPageInner() {
  const sp = useSearchParams()
  const defaultStatus = (sp.get('status') ?? '') as AnimalStatus | ''
  const [status,  setStatus]  = useState<AnimalStatus | ''>(defaultStatus)
  const [city,    setCity]    = useState(sp.get('city') ?? '')
  const [species, setSpecies] = useState<AnimalSpecies | ''>((sp.get('species') ?? '') as AnimalSpecies | '')
  const [query,   setQuery]   = useState(sp.get('q') ?? '')
  const [view,    setView]    = useState<'list' | 'map'>('list')
  const [page,    setPage]    = useState(1)
  const [allAnimals, setAllAnimals] = useState<PublicAnimal[]>(MOCK_ANIMALS)

  useEffect(() => {
    const stored = getAnimals()
    if (stored.length > 0) {
      const storedIds = new Set(stored.map(a => a.id))
      setAllAnimals([
        ...stored.map(a => ({
          id: a.id, status: a.status as AnimalStatus,
          species: a.species as AnimalSpecies, gender: a.gender as any,
          name: a.name, age_years: a.age_years, color: a.color,
          specific_signs: a.specific_signs, photos: a.photos,
          location_city: a.location_city,
          moderation_status: a.moderation_status as any,
          created_at: a.created_at, boosted: a.boosted, pinned: a.pinned,
        } as PublicAnimal & { boosted?: boolean; pinned?: boolean })),
        ...MOCK_ANIMALS.filter(a => !storedIds.has(a.id)),
      ])
    }
  }, [])

  const filtered = useMemo(() => allAnimals.filter(a => {
    if (a.moderation_status !== 'approved') return false
    if (status && a.status !== status) return false
    if (city    && a.location_city !== city)   return false
    if (species && a.species       !== species) return false
    if (query) {
      const q = query.toLowerCase()
      return a.name?.toLowerCase().includes(q) || a.specific_signs?.toLowerCase().includes(q) ||
             a.color?.toLowerCase().includes(q) || a.location_city.toLowerCase().includes(q)
    }
    return true
  }), [status, city, species, query, allAnimals])

  // Tri : épinglés > boostés > autres, puis par date décroissante dans chaque groupe
  const byDate = (a: PublicAnimal, b: PublicAnimal) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()

  const sorted = useMemo(() => [
    ...filtered.filter(a => (a as any).pinned).sort(byDate),
    ...filtered.filter(a => (a as any).boosted && !(a as any).pinned).sort(byDate),
    ...filtered.filter(a => !(a as any).boosted && !(a as any).pinned).sort(byDate),
  ], [filtered])

  useEffect(() => { setPage(1) }, [status, city, species, query])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const pageTitle = status === 'lost' ? '🔍 Animaux perdus'
    : status === 'found'    ? '🐾 Animaux trouvés'
    : status === 'to_adopt' ? "🏠 Animaux à adopter"
    : '🐾 Toutes les annonces'

  const urgencyBanner = status === 'lost'
    ? { bg: 'bg-red-50 border-red-200', text: 'text-red-800', emoji: '🚨', title: 'Nos dernières alertes urgentes', desc: 'Ces animaux ont besoin de vous MAINTENANT. Chaque partage peut les ramener à la maison.' }
    : status === 'found'
    ? { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', emoji: '🔍', title: 'Animaux récemment trouvés à La Réunion', desc: 'Un animal trouvé attend peut-être un propriétaire qui le cherche. Reconnaissez-vous l\'un d\'eux ?' }
    : status === 'to_adopt'
    ? { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', emoji: '❤️', title: 'Ils cherchent une famille aimante', desc: 'Chaque adoption sauve une vie. Ces animaux méritent un foyer — peut-être le vôtre ?' }
    : null

  const mapFilter  = (status || 'all') as 'all' | 'lost' | 'found' | 'to_adopt'
  const mapAnimals = allAnimals.map(a => ({
    id: a.id, name: a.name,
    status: a.status as 'lost' | 'found' | 'to_adopt',
    species: a.species, location_city: a.location_city,
  }))

  const MapLegend = () => (
    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 px-1">
      {[
        { color: 'bg-red-500',     label: 'Perdu' },
        { color: 'bg-amber-500',   label: 'Trouvé' },
        { color: 'bg-emerald-500', label: 'À adopter' },
      ].map(({ color, label }) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${color} inline-block`} /> {label}
        </span>
      ))}
      <span className="text-slate-400 ml-auto">{filtered.length} annonce{filtered.length > 1 ? 's' : ''}</span>
    </div>
  )

  return (
    <main className="max-w-5xl mx-auto px-3 sm:px-4 py-5 sm:py-8 space-y-4 sm:space-y-6">

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">{pageTitle}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {filtered.length} annonce{filtered.length > 1 ? 's' : ''} à La Réunion
          </p>
        </div>
        <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
          <button onClick={() => setView('list')}
            className={['flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all', view === 'list' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
            <LayoutList className="h-4 w-4" />
            <span className="hidden xs:inline sm:inline">Liste</span>
          </button>
          <button onClick={() => setView('map')}
            className={['flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all', view === 'map' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
            <Map className="h-4 w-4" />
            <span className="hidden xs:inline sm:inline">Carte</span>
          </button>
        </div>
      </div>

      {/* Bannière d'urgence contextuelle */}
      {urgencyBanner && (
        <div className={`border rounded-2xl px-5 py-4 ${urgencyBanner.bg}`}>
          <p className={`font-bold text-base flex items-center gap-2 ${urgencyBanner.text}`}>
            <span className="text-xl">{urgencyBanner.emoji}</span>
            {urgencyBanner.title}
          </p>
          <p className={`text-sm mt-1 ${urgencyBanner.text} opacity-80`}>{urgencyBanner.desc}</p>
          <p className="text-xs mt-2 font-medium text-slate-500">
            ↓ Classées de la plus récente à la plus ancienne
          </p>
        </div>
      )}

      <AdBanner />

      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 space-y-3 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="search" placeholder="Nom, couleur, race, commune…"
            value={query} onChange={e => setQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="flex gap-1">
            {[
              { v: '' as const,         l: 'Tous' },
              { v: 'lost' as const,     l: 'Perdu' },
              { v: 'found' as const,    l: 'Trouvé' },
              { v: 'to_adopt' as const, l: 'Adopter' },
            ].map(({ v, l }) => (
              <button key={v} onClick={() => setStatus(v)}
                className={['flex-1 rounded-xl border py-2 text-xs font-medium transition-colors', status === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'].join(' ')}>
                {l}
              </button>
            ))}
          </div>

          <div className="flex gap-1">
            {[
              { v: '' as const,      l: 'Tous' },
              { v: 'dog' as const,   l: 'Chien' },
              { v: 'cat' as const,   l: 'Chat' },
              { v: 'other' as const, l: 'Autre' },
            ].map(({ v, l }) => (
              <button key={v} onClick={() => setSpecies(v)}
                className={['flex-1 rounded-xl border py-2 text-xs font-medium transition-colors', species === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'].join(' ')}>
                {l}
              </button>
            ))}
          </div>

          <select value={city} onChange={e => setCity(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">Toutes les communes</option>
            {COMMUNES_974.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        {(status || city || species || query) && (
          <button onClick={() => { setStatus(''); setCity(''); setSpecies(''); setQuery('') }}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1">
            ✕ Effacer les filtres
          </button>
        )}
      </div>

      {view === 'map' && (
        <div className="space-y-3">
          <MapLegend />
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <ReunionMap filter={mapFilter} animals={mapAnimals} height="calc(100vh - 220px)" />
          </div>
          <button onClick={() => setView('list')}
            className="w-full flex items-center justify-center gap-2 border border-slate-200 bg-white rounded-xl py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <LayoutList className="h-4 w-4" />
            Voir la liste des annonces
          </button>
        </div>
      )}

      {view === 'list' && (
        <>
          {sorted.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <PawPrint className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucune annonce ne correspond</p>
              <p className="text-sm mt-1">Modifiez les filtres ou publiez une annonce</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {paginated.map((animal, i) => (
                  <React.Fragment key={animal.id}>
                    <AnimalCard animal={animal} />
                    {(i + 1) % 8 === 0 && (
                      <div className="col-span-2 sm:col-span-2 lg:col-span-4">
                        <AdBanner />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    disabled={page === 1}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Précédent
                  </button>
                  <span className="text-sm text-slate-500">
                    Page <strong className="text-slate-900">{page}</strong> / {totalPages}
                  </span>
                  <button
                    onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    disabled={page === totalPages}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    Suivant <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold text-slate-800 text-base flex items-center gap-2">
                    <Map className="h-4 w-4 text-emerald-600" />
                    Carte des annonces
                  </h2>
                  <button onClick={() => setView('map')}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                    Plein écran →
                  </button>
                </div>
                <MapLegend />
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                  <ReunionMap filter={mapFilter} animals={mapAnimals} height="420px" />
                </div>
              </div>
            </>
          )}

          <AdBanner />
        </>
      )}

    </main>
  )
}

// ── Export avec Suspense ──────────────────────────────────────
export default function AnimauxPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Chargement…</div>}>
      <AnimauxPageInner />
    </Suspense>
  )
}
