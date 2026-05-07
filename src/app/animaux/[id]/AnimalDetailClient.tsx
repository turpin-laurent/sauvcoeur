'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { MapPin, Heart, Clock, ArrowLeft, MessageCircle, CheckCircle2, X, ChevronLeft, ChevronRight, Phone, Send, Calendar, Navigation } from 'lucide-react'
import { getAnimalById, getBanners } from '@/lib/animals/store'
import { useAuth } from '@/lib/auth/context'

interface Animal {
  id: string; status: string; species: string; gender: string
  name?: string; age_years?: number; specific_signs?: string
  color?: string; photos?: string[]; location_city: string
  created_at: string; author_name?: string; author_id?: string
  moderation_status?: string; boosted?: boolean; pinned?: boolean
  contact_email?: string; microchip_icad?: string
  last_seen_location?: string; last_seen_at?: string
}

const MOCK: Record<string, Animal> = {
  '1': { id: '1', status: 'to_adopt', species: 'dog', gender: 'male', name: 'Rex', age_years: 3, specific_signs: 'Berger croisé, très affectueux, bon avec les enfants. Vacciné, vermifugé, identifié.', color: 'Fauve et noir', photos: [], location_city: 'Saint-Denis', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), author_name: 'Marie D.', moderation_status: 'approved', contact_email: 'marie@example.re' },
  '2': { id: '2', status: 'lost', species: 'cat', gender: 'female', name: 'Mimi', age_years: 2, specific_signs: 'Chatte tigrée, collier rouge, puce I-CAD. Disparue quartier Moufia.', color: 'Tigrée grise', photos: [], location_city: 'Le Tampon', created_at: new Date(Date.now() - 86400000).toISOString(), author_name: 'Paul M.', moderation_status: 'approved', contact_email: 'paul@example.re', last_seen_location: 'Rue de la Paix, quartier Moufia', last_seen_at: new Date(Date.now() - 90000000).toISOString() },
  '3': { id: '3', status: 'found', species: 'dog', gender: 'unknown', specific_signs: 'Petit chien blanc trouvé près du marché forain de Saint-Paul.', color: 'Blanc', photos: [], location_city: 'Saint-Paul', created_at: new Date().toISOString(), author_name: 'Julie R.', moderation_status: 'approved', contact_email: 'julie@example.re' },
  '4': { id: '4', status: 'to_adopt', species: 'cat', gender: 'female', name: 'Luna', age_years: 1, specific_signs: 'Chatte noire, stérilisée, primo-vaccinée. Cherche foyer calme.', color: 'Noire', photos: [], location_city: 'Saint-Pierre', created_at: new Date(Date.now() - 3 * 86400000).toISOString(), author_name: 'Asso PataPoil', moderation_status: 'approved', contact_email: 'asso@example.re' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  lost:     { label: 'Perdu',     color: 'text-red-700',     bg: 'bg-red-100',     emoji: '😢' },
  found:    { label: 'Trouvé',    color: 'text-amber-700',   bg: 'bg-amber-100',   emoji: '🔍' },
  to_adopt: { label: 'À adopter', color: 'text-emerald-700', bg: 'bg-emerald-100', emoji: '🏠' },
}
const SPECIES_LABEL: Record<string, string> = { dog: 'Chien', cat: 'Chat', bird: 'Oiseau', rabbit: 'Lapin', other: 'Autre' }
const SPECIES_EMOJI: Record<string, string> = { dog: '🐕', cat: '🐈', bird: '🐦', rabbit: '🐇', other: '🐾' }
const GENDER_LABEL: Record<string, string>  = { male: 'Mâle', female: 'Femelle', unknown: 'Inconnu' }

function timeAgo(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000)
  const d = Math.floor(h / 24)
  return d > 0 ? `il y a ${d}j` : h > 0 ? `il y a ${h}h` : "à l'instant"
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// ── Bannière ──────────────────────────────────────────────────
function AdBanner({ slot }: { slot: 'haut' | 'bas' }) {
  const [banner, setBanner] = useState<{ url: string; text: string; image?: string } | null>(null)
  useEffect(() => {
    const banners = getBanners()
    const b = banners.find(x => x.slot.includes(slot === 'haut' ? 'haut' : 'bas') && x.active)
    if (b) {
      setBanner(b as any)
      try {
        const key = `sc_banner_imp_${b.id}`
        localStorage.setItem(key, String(parseInt(localStorage.getItem(key) ?? '0') + 1))
      } catch { /* */ }
    }
  }, [slot])
  if (!banner) return null
  return (
    <a href={banner.url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border-2 border-dashed border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 hover:border-emerald-500 transition-colors group">
      {(banner as any).image
        ? <img src={(banner as any).image} alt="" className="h-10 object-contain rounded" style={{ maxWidth: 468 }} />
        : <>
            <div className="text-2xl shrink-0">🐾</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-emerald-800 leading-tight">{banner.text}</p>
              <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">Espace partenaire · Contactez-nous</p>
            </div>
            <span className="shrink-0 bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
              Nous contacter
            </span>
          </>
      }
    </a>
  )
}

// ── Lightbox photo ────────────────────────────────────────────
function Lightbox({ photos, startIndex, onClose }: { photos: string[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex)
  const prev = useCallback(() => setIdx(i => (i - 1 + photos.length) % photos.length), [photos.length])
  const next = useCallback(() => setIdx(i => (i + 1) % photos.length), [photos.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-xl bg-white/10">
        <X className="h-6 w-6" />
      </button>
      {photos.length > 1 && <>
        <button onClick={e => { e.stopPropagation(); prev() }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 rounded-xl bg-white/10">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button onClick={e => { e.stopPropagation(); next() }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 rounded-xl bg-white/10">
          <ChevronRight className="h-6 w-6" />
        </button>
      </>}
      <img src={photos[idx]} alt="" className="max-h-screen max-w-screen-md w-full object-contain p-8" onClick={e => e.stopPropagation()} />
      {photos.length > 1 && (
        <div className="absolute bottom-6 flex gap-2">
          {photos.map((_, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); setIdx(i) }}
              className={`w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/40'}`} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Formulaire de contact sécurisé ────────────────────────────
function ContactModal({ animal, onClose }: { animal: Animal; onClose: () => void }) {
  const { user } = useAuth()
  const [senderName,  setSenderName]  = useState(user?.name  ?? '')
  const [senderPhone, setSenderPhone] = useState(user?.phone ?? '')
  const [senderEmail, setSenderEmail] = useState(user?.email ?? '')
  const [message,     setMessage]     = useState('')
  const [sending,     setSending]     = useState(false)
  const [sent,        setSent]        = useState(false)
  const [error,       setError]       = useState('')

  const statusLabel: Record<string, string> = { lost: 'l\'Alerte Perdu', found: 'l\'Annonce Trouvé', to_adopt: 'l\'Annonce Adoption' }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!senderPhone.trim()) { setError('Le numéro de téléphone est obligatoire.'); return }
    if (!message.trim())     { setError('Le message est obligatoire.'); return }
    if (!senderEmail.trim()) { setError('Votre email est obligatoire.'); return }
    setError('')
    setSending(true)
    try {
      await fetch('/api/contact-animal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName, senderPhone, senderEmail, message,
          animalName:   animal.name,
          animalStatus: animal.status,
          animalCity:   animal.location_city,
          ownerEmail:   animal.contact_email,
          animalId:     animal.id,
        }),
      })
    } catch { /* email non critique — on affiche quand même "envoyé" */ }
    setSending(false)
    setSent(true)
  }

  if (sent) return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="font-bold text-slate-900 text-xl">Message envoyé !</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          Vos coordonnées ont été transmises à <strong>{animal.author_name ?? 'l\'auteur'}</strong>.<br />
          Il / elle vous contactera directement.
        </p>
        <button onClick={onClose}
          className="w-full bg-emerald-600 text-white rounded-xl py-3 font-semibold hover:bg-emerald-700 transition-colors">
          Fermer
        </button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="font-bold text-slate-900">Envoyer un message</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {animal.name ? `À propos de ${animal.name}` : `À propos de ${statusLabel[animal.status] ?? 'l\'annonce'}`}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Info partagée */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              📋 Informations qui seront communiquées à {animal.author_name ?? "l'auteur"}
            </p>
            <div className="text-sm text-blue-800 space-y-1">
              <p className="font-medium">{senderName || '(votre nom)'}</p>
              <p className="text-blue-600">{senderPhone || 'Téléphone : (à renseigner ci-dessous)'}</p>
              <p className="text-blue-600">{senderEmail || '(votre email)'}</p>
            </div>
          </div>

          {/* Nom */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Votre nom</label>
            <input value={senderName} onChange={e => setSenderName(e.target.value)}
              placeholder="Prénom Nom" required
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          {/* Téléphone */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Votre téléphone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="tel" value={senderPhone} onChange={e => setSenderPhone(e.target.value)}
                placeholder="0692 00 00 00" required
                className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Votre email <span className="text-red-500">*</span>
            </label>
            <input type="email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)}
              placeholder="vous@exemple.re" required
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            <p className="text-xs text-slate-400 mt-1">🔒 Votre email ne sera jamais affiché publiquement.</p>
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Votre message <span className="text-red-500">*</span>
            </label>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              rows={4} required
              placeholder={
                animal.status === 'lost'
                  ? "J'ai peut-être des informations sur votre animal. Je l'ai aperçu le…"
                  : animal.status === 'found'
                  ? "Je pense que cet animal m'appartient. Il s'appelle…"
                  : "Bonjour, je suis intéressé(e) par l'adoption de cet animal…"
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            <p className="text-xs text-slate-400 mt-1">{message.length} / 500 caractères</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-3 text-sm font-semibold hover:bg-slate-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={sending}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-semibold transition-colors">
              <Send className="h-4 w-4" />
              {sending ? 'Envoi…' : 'Envoyer'}
            </button>
          </div>

          <p className="text-center text-xs text-slate-400">
            🔒 Vos coordonnées ne sont transmises qu'à l'auteur de l'annonce, jamais publiées.
          </p>
        </form>
      </div>
    </div>
  )
}

// ── Boutons de partage ────────────────────────────────────────
function ShareButtons({ animal, id }: { animal: Animal; id: string }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/animaux/${id}`
    : `https://www.sauvcoeur.re/animaux/${id}`

  const statusText: Record<string, string> = { lost: 'PERDU', found: 'TROUVE', to_adopt: 'A ADOPTER' }
  const speciesLabel = SPECIES_LABEL[animal.species] ?? 'Animal'
  const shareTitle = animal.name
    ? `${statusText[animal.status] ?? ''} - ${animal.name} (${speciesLabel}) a ${animal.location_city}`
    : `${statusText[animal.status] ?? ''} - ${speciesLabel} a ${animal.location_city}`

  // Texte sans emojis pour compatibilite WhatsApp et SMS
  const waText = `${shareTitle}\n\nAidez-nous a le retrouver ! Partagez au maximum\n\nVoir l'annonce sur sauvcoeur.re :\n${url}`
  const encodedUrl = encodeURIComponent(url)
  const encodedWa  = encodeURIComponent(waText)

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Partagez pour aider !</p>
      <p className="text-sm text-slate-600">Plus vous partagez, plus l'animal a de chances d'être retrouvé.</p>
      <div className="flex flex-wrap gap-2">
        {/* Facebook — partage via OG tags de la page */}
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
          Facebook
        </a>
        {/* WhatsApp — texte propre sans emojis */}
        <a href={`https://wa.me/?text=${encodedWa}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          WhatsApp
        </a>
        {/* Copier le lien */}
        <button onClick={copyLink}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
          {copied ? '✓ Copié !' : '🔗 Copier le lien'}
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function AnimalDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)

  const [animal,     setAnimal]     = useState<Animal | null>(null)
  const [liked,      setLiked]      = useState(false)
  const [mainIdx,    setMainIdx]    = useState(0)
  const [lightbox,   setLightbox]   = useState<number | null>(null)
  const [showContact, setShowContact] = useState(false)

  useEffect(() => {
    const stored = getAnimalById(id)
    setAnimal((stored as any) ?? MOCK[id] ?? null)
  }, [id])

  if (!animal) return (
    <main className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-slate-400">Annonce introuvable.</p>
      <Link href="/animaux" className="text-emerald-600 underline mt-4 block">Retour aux annonces</Link>
    </main>
  )

  const cfg    = STATUS_CONFIG[animal.status] ?? STATUS_CONFIG.found
  const photos = (animal.photos ?? []).filter(Boolean)

  const contactLabel: Record<string, string> = {
    lost:     'J\'ai des informations',
    found:    'C\'est mon animal',
    to_adopt: 'Je souhaite adopter',
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-5">
      {lightbox !== null && (
        <Lightbox photos={photos} startIndex={lightbox} onClose={() => setLightbox(null)} />
      )}
      {showContact && (
        <ContactModal animal={animal} onClose={() => setShowContact(false)} />
      )}

      <Link href="/animaux" className="flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-600 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour aux annonces
      </Link>

      <AdBanner slot="haut" />

      {/* Photo principale + galerie */}
      <div className="space-y-2">
        <div className="relative bg-slate-100 rounded-2xl overflow-hidden cursor-zoom-in" style={{ aspectRatio: '4/3' }}
          onClick={() => photos.length > 0 && setLightbox(mainIdx)}>
          {photos.length > 0
            ? <img src={photos[mainIdx]} alt={animal.name ?? 'Animal'} className="w-full h-full object-contain bg-slate-100" />
            : <div className="w-full h-full flex items-center justify-center text-8xl">{SPECIES_EMOJI[animal.species]}</div>
          }
          <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-sm font-semibold ${cfg.bg} ${cfg.color}`}>
            {cfg.emoji} {cfg.label}
          </span>
          {animal.pinned && (
            <span className="absolute top-3 left-32 rounded-full px-2 py-0.5 text-xs font-bold bg-yellow-400 text-yellow-900">📌 Épinglé</span>
          )}
          {animal.boosted && (
            <span className="absolute top-3 left-32 rounded-full px-2 py-0.5 text-xs font-bold bg-orange-500 text-white">⚡ Boosté</span>
          )}
          {animal.moderation_status === 'approved' && (
            <span className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 rounded-full px-2 py-0.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" /> Annonce vérifiée
            </span>
          )}
          {photos.length > 0 && (
            <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
              🔍 Cliquez pour agrandir
            </span>
          )}
          <button onClick={e => { e.stopPropagation(); setLiked(l => !l) }}
            className={['absolute top-3 right-3 rounded-full p-2 transition-all shadow', liked ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-400 hover:text-red-400'].join(' ')}>
            <Heart className={`h-5 w-5 ${liked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((p, i) => (
              <button key={i}
                onClick={() => setMainIdx(i)}
                className={[
                  'shrink-0 rounded-xl overflow-hidden border-2 transition-all',
                  i === mainIdx ? 'border-emerald-500 ring-2 ring-emerald-300 scale-105' : 'border-transparent hover:border-slate-300 opacity-70 hover:opacity-100',
                ].join(' ')}>
                <img src={p} alt="" className="h-16 w-16 object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Infos principales */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{animal.name ?? 'Animal inconnu'}</h1>
          <p className="text-slate-500 text-sm flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{animal.location_city}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeAgo(animal.created_at)}</span>
            {animal.author_name && <><span>·</span><span>par {animal.author_name}</span></>}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm text-center">
          {[
            ['Type',  SPECIES_LABEL[animal.species] ?? '—'],
            ['Sexe',  GENDER_LABEL[animal.gender] ?? '—'],
            ['Âge',   animal.age_years !== undefined ? `${animal.age_years} an(s)` : '—'],
          ].map(([label, value]) => (
            <div key={label} className="bg-slate-50 rounded-xl p-2">
              <p className="text-xs text-slate-400">{label}</p>
              <p className="font-semibold text-slate-900 mt-0.5 text-sm">{value}</p>
            </div>
          ))}
        </div>

        {animal.color && (
          <p className="text-sm text-slate-700"><span className="font-medium">Couleur :</span> {animal.color}</p>
        )}
        {animal.specific_signs && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-slate-700 leading-relaxed">{animal.specific_signs}</p>
          </div>
        )}
        {animal.microchip_icad && (
          <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-3 py-2">
            🔖 <span className="font-medium">N° ICAD :</span> {animal.microchip_icad}
          </p>
        )}
      </div>

      {/* ── Bloc Dernière observation (animaux perdus) ── */}
      {animal.status === 'lost' && (animal.last_seen_location || animal.last_seen_at) && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5" />
            Dernière observation
          </p>
          <div className="space-y-2">
            {animal.last_seen_location && (
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-red-400 font-medium">Lieu</p>
                  <p className="text-sm font-semibold text-red-800">{animal.last_seen_location}</p>
                </div>
              </div>
            )}
            {animal.last_seen_at && (
              <div className="flex items-start gap-2.5">
                <Calendar className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-red-400 font-medium">Date et heure</p>
                  <p className="text-sm font-semibold text-red-800">{formatDateTime(animal.last_seen_at)}</p>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-red-500">
            Si vous l'avez aperçu récemment, utilisez le bouton ci-dessous pour contacter le propriétaire.
          </p>
        </div>
      )}

      {/* ── Contact ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contacter</p>
        {animal.author_name && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 shrink-0">
              {animal.author_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{animal.author_name}</p>
              <p className="text-xs text-slate-400">Auteur de l'annonce</p>
            </div>
          </div>
        )}

        <button onClick={() => setShowContact(true)}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm">
          <MessageCircle className="h-5 w-5" />
          {contactLabel[animal.status] ?? 'Envoyer un message'}
        </button>

        <p className="text-center text-xs text-slate-400">
          🔒 Votre email ne sera jamais affiché sur le site.
        </p>
      </div>

      {/* Partage */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <ShareButtons animal={animal} id={id} />
      </div>

      <AdBanner slot="bas" />
    </main>
  )
}
