'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Edit, Trash2, Users, Megaphone, BookOpen, Image, Zap, LogOut, Upload, Eye, BarChart2 } from 'lucide-react'
import {
  getAnimals, updateAnimal, deleteAnimal,
  getBanners, saveBanners,
  getPros, updatePro, deletePro,
  isAdminValid, clearAdminSession,
  type StoredAnimal, type StoredBanner, type StoredPro,
} from '@/lib/animals/store'
import { COMMUNES_974 } from '@/lib/geo/communes974'

const CAT_LABEL: Record<string, string> = {
  vet: 'Vétérinaires & santé', rescue: 'Associations & refuges',
  sitter: 'Garde & pensions', education: 'Éducation & comportement',
  groomer: 'Toilettage', shop: 'Animaleries & alimentation', leisure: 'Loisirs & services animaliers',
}
const CAT_EMOJI: Record<string, string> = {
  vet: '🩺', rescue: '❤️', sitter: '🏠', education: '🎓', groomer: '✂️', shop: '🛒', leisure: '🎉',
}

// ── Types ─────────────────────────────────────────────────────
type Membre = { id: string; name: string; email: string; city: string; phone: string; role: string; created: string }
type Boost  = { id: string; annonce: string; user: string; date: string; amount: string; status: string }
type Pro    = { id: string; name: string; category: string; city: string; verified: boolean; boosted: boolean }

// ── Données mock (membres, boosts, pros) ──────────────────────
const INIT_MEMBRES: Membre[] = [
  { id: 'u1', name: 'Marie Dupont',  email: 'marie@ex.re',  city: 'Saint-Denis',  phone: '0692000001', role: 'user',  created: '2026-04-20' },
  { id: 'u2', name: 'Paul Martin',   email: 'paul@ex.re',   city: 'Le Tampon',    phone: '',           role: 'asso',  created: '2026-04-22' },
  { id: 'u3', name: 'Julie Rivière', email: 'julie@ex.re',  city: 'Saint-Paul',   phone: '0692000003', role: 'user',  created: '2026-04-25' },
]
const INIT_PROS: Pro[] = [
  { id: 'p1', name: 'Clinique du Volcan', category: 'Vétérinaire', city: 'Saint-Pierre', verified: true,  boosted: false },
  { id: 'p2', name: 'Patte Douce',        category: 'Pet-sitter',  city: 'Saint-Paul',   verified: true,  boosted: true  },
  { id: 'p3', name: 'Éducation Canine',   category: 'Éducateur',   city: 'Le Tampon',    verified: false, boosted: false },
]

const STATUS_BADGE: Record<string, string> = {
  lost: 'bg-red-100 text-red-700', found: 'bg-amber-100 text-amber-700', to_adopt: 'bg-emerald-100 text-emerald-700',
}
const STATUS_LABEL: Record<string, string> = { lost: 'Perdu', found: 'Trouvé', to_adopt: 'À adopter' }
const MOD_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700',
}
const MOD_LABEL: Record<string, string> = { pending: 'En attente', approved: 'Approuvée', rejected: 'Refusée' }
const SPECIES_LABEL: Record<string, string> = { dog: 'Chien', cat: 'Chat', bird: 'Oiseau', rabbit: 'Lapin', other: 'Autre' }

const TABS = [
  { id: 'dashboard', label: 'Tableau de bord', icon: <BarChart2 className="h-4 w-4" /> },
  { id: 'annonces',  label: 'Annonces',        icon: <Megaphone className="h-4 w-4" /> },
  { id: 'membres',   label: 'Membres',         icon: <Users className="h-4 w-4" /> },
  { id: 'boosts',    label: 'Boosts payés',    icon: <Zap className="h-4 w-4" /> },
  { id: 'bannieres', label: 'Bannières',       icon: <Image className="h-4 w-4" /> },
  { id: 'pros',      label: 'Annuaire pros',   icon: <BookOpen className="h-4 w-4" /> },
]

// ── Mock pros initiaux ────────────────────────────────────────
const INIT_PROS_ADMIN: StoredPro[] = [
  { id: 'p1', business_name: 'Clinique Vétérinaire du Volcan', contact_name: 'Dr. Martin', category: 'vet',      description: 'Soins généraux, urgences 24h/24.', city: 'Saint-Pierre', phone: '0262 00 00 01', email: 'vet@example.re', is_verified: true,  is_featured: true,  is_association: false, created_at: '2026-04-01T00:00:00Z' },
  { id: 'p2', business_name: 'Patte Douce Pet-sitting',        contact_name: 'Lola T.',    category: 'sitter',   description: 'Garde à domicile.',               city: 'Saint-Paul',   phone: '0692 00 00 03', email: 'patte@example.re', is_verified: true,  is_featured: true,  is_association: false, created_at: '2026-04-03T00:00:00Z' },
  { id: 'p3', business_name: 'Éducation Canine Réunion',       contact_name: 'Paul M.',    category: 'education', description: 'Cours collectifs.',              city: 'Le Tampon',    phone: '0692 00 00 04', email: 'edu@example.re',  is_verified: false, is_featured: false, is_association: false, created_at: '2026-04-04T00:00:00Z' },
  { id: 'p5', business_name: 'SPA Réunion',                    contact_name: 'Julie R.',   category: 'rescue',   description: 'Refuge et adoptions.',            city: 'Saint-Denis',  phone: '0262 00 00 05', email: 'spa@example.re',  is_verified: true,  is_featured: false, is_association: true,  created_at: '2026-04-05T00:00:00Z' },
]

// ── Modal générique ───────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Lecteur impression localStorage ──────────────────────────
function getBannerImpressions(id: string): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(`sc_banner_imp_${id}`) ?? '0', 10)
}

export default function ManagePage() {
  const router = useRouter()

  useEffect(() => {
    if (!isAdminValid()) router.replace('/manage/login')
  }, [router])

  const [tab,          setTab]          = useState('dashboard')
  const [annonces,     setAnnonces]     = useState<StoredAnimal[]>([])
  const [membres,      setMembres]      = useState<Membre[]>(INIT_MEMBRES)
  const [banners,      setBannersState] = useState<StoredBanner[]>([])
  const [prosAdmin,    setProsAdmin]    = useState<StoredPro[]>(INIT_PROS_ADMIN)
  const [prosCatFilter, setProsCatFilter] = useState('all')
  const [impressions,  setImpressions]  = useState<Record<string, number>>({})
  const [editAnnonce,  setEditAnnonce]  = useState<StoredAnimal | null>(null)
  const [editMembre,   setEditMembre]   = useState<Membre | null>(null)
  const [editBanner,   setEditBanner]   = useState<StoredBanner | null>(null)
  const [editPro,      setEditPro]      = useState<StoredPro | null>(null)

  useEffect(() => {
    const a = getAnimals()
    const b = getBanners()
    setAnnonces(a)
    setBannersState(b)
    const imp: Record<string, number> = {}
    b.forEach(x => { imp[x.id] = getBannerImpressions(x.id) })
    setImpressions(imp)
    // Charger les pros depuis localStorage et merger avec les mocks
    const storedPros = getPros()
    if (storedPros.length > 0) {
      const storedIds = new Set(storedPros.map(p => p.id))
      setProsAdmin([...storedPros, ...INIT_PROS_ADMIN.filter(p => !storedIds.has(p.id))])
    }
  }, [])

  const boosts: Boost[] = annonces
    .filter(a => a.boosted)
    .map(a => ({
      id:      a.id,
      annonce: `${a.name ?? 'Inconnu'} (${STATUS_LABEL[a.status] ?? a.status})`,
      user:    a.author_name,
      date:    a.created_at.slice(0, 10),
      amount:  '4,99 €',
      status:  'active',
    }))

  const pending  = annonces.filter(a => a.moderation_status === 'pending').length
  const approved = annonces.filter(a => a.moderation_status === 'approved').length

  const saveAnnonce = (a: StoredAnimal) => {
    updateAnimal(a.id, a)
    setAnnonces(getAnimals())
    setEditAnnonce(null)
  }
  const removeAnnonce = (id: string) => {
    if (!confirm('Supprimer cette annonce ?')) return
    deleteAnimal(id)
    setAnnonces(getAnimals())
  }
  const saveBannersLocal = (b: StoredBanner[]) => {
    saveBanners(b)
    setBannersState([...b])
  }

  const handleLogout = () => {
    clearAdminSession()
    router.push('/manage/login')
  }

  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500'

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administration SauvCœur</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {pending > 0 ? `${pending} annonce(s) en attente de modération` : 'Tout est à jour ✓'}
          </p>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
          <LogOut className="h-4 w-4" /> Déconnexion
        </button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Annonces',   value: annonces.length, color: 'text-emerald-600' },
          { label: 'Membres',    value: membres.length,  color: 'text-blue-600' },
          { label: 'Boosts',     value: boosts.length,   color: 'text-orange-600' },
          { label: 'En attente', value: pending,          color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={[
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              tab === t.id ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}>
            {t.icon} {t.label}
            {t.id === 'annonces' && pending > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TABLEAU DE BORD ── */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Annonces par statut */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Megaphone className="h-4 w-4 text-emerald-600" /> Annonces</h3>
              <div className="space-y-2">
                {[
                  { label: 'Approuvées', value: approved, color: 'bg-green-500' },
                  { label: 'En attente', value: pending,  color: 'bg-amber-500' },
                  { label: 'Refusées',   value: annonces.filter(a => a.moderation_status === 'rejected').length, color: 'bg-red-400' },
                  { label: 'Perdus',     value: annonces.filter(a => a.status === 'lost').length,     color: 'bg-red-300' },
                  { label: 'Trouvés',    value: annonces.filter(a => a.status === 'found').length,    color: 'bg-amber-300' },
                  { label: 'À adopter',  value: annonces.filter(a => a.status === 'to_adopt').length, color: 'bg-emerald-300' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-24 shrink-0">{label}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className={`${color} h-2 rounded-full transition-all`}
                        style={{ width: annonces.length ? `${(value / annonces.length) * 100}%` : '0%' }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-6 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Membres */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Users className="h-4 w-4 text-blue-600" /> Membres</h3>
              <p className="text-4xl font-bold text-blue-600">{membres.length}</p>
              <div className="space-y-1 text-sm text-slate-500">
                {[
                  { label: 'Utilisateurs',    value: membres.filter(m => m.role === 'user').length },
                  { label: 'Associations',    value: membres.filter(m => m.role === 'asso').length },
                  { label: 'Professionnels',  value: membres.filter(m => m.role === 'pro').length },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span>{label}</span><span className="font-semibold text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Boosts & Revenus */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Zap className="h-4 w-4 text-orange-500" /> Boosts & Revenus</h3>
              <p className="text-4xl font-bold text-orange-500">{boosts.length}</p>
              <div className="space-y-1 text-sm text-slate-500">
                <div className="flex justify-between">
                  <span>Boosts actifs</span>
                  <span className="font-semibold text-slate-700">{boosts.filter(b => b.status === 'active').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenu estimé</span>
                  <span className="font-semibold text-orange-600">{(boosts.length * 4.99).toFixed(2)} €</span>
                </div>
              </div>
            </div>

            {/* Bannières & Impressions */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 sm:col-span-2 lg:col-span-3">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Eye className="h-4 w-4 text-purple-600" /> Bannières — Impressions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {banners.map(b => (
                  <div key={b.id} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-slate-600 truncate">{b.slot}</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{impressions[b.id] ?? 0}</p>
                    <p className="text-xs text-slate-400">impressions</p>
                    <span className={`text-xs font-semibold rounded-full px-2 py-0.5 mt-1 inline-block ${b.active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                      {b.active ? '● Active' : '○ Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
            <h3 className="font-semibold text-emerald-800 mb-3">Actions rapides</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setTab('annonces')}
                className="flex items-center gap-1.5 bg-white border border-emerald-300 text-emerald-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors">
                <Megaphone className="h-4 w-4" /> Modérer les annonces
                {pending > 0 && <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{pending}</span>}
              </button>
              <button onClick={() => setTab('bannieres')}
                className="flex items-center gap-1.5 bg-white border border-emerald-300 text-emerald-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors">
                <Image className="h-4 w-4" /> Gérer les bannières
              </button>
              <button onClick={() => setTab('membres')}
                className="flex items-center gap-1.5 bg-white border border-emerald-300 text-emerald-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors">
                <Users className="h-4 w-4" /> Voir les membres
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ANNONCES ── */}
      {tab === 'annonces' && (
        <div className="space-y-3">
          {editAnnonce && (
            <Modal title="Modifier l'annonce" onClose={() => setEditAnnonce(null)}>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Nom</label>
                    <input value={editAnnonce.name ?? ''} onChange={e => setEditAnnonce({ ...editAnnonce, name: e.target.value })}
                      className={inputCls} placeholder="Nom de l'animal" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Espèce</label>
                    <select value={editAnnonce.species} onChange={e => setEditAnnonce({ ...editAnnonce, species: e.target.value as any })}
                      className={inputCls}>
                      {Object.entries(SPECIES_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Statut annonce</label>
                    <select value={editAnnonce.status} onChange={e => setEditAnnonce({ ...editAnnonce, status: e.target.value as any })}
                      className={inputCls}>
                      <option value="lost">Perdu</option>
                      <option value="found">Trouvé</option>
                      <option value="to_adopt">À adopter</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Modération</label>
                    <select value={editAnnonce.moderation_status} onChange={e => setEditAnnonce({ ...editAnnonce, moderation_status: e.target.value as any })}
                      className={inputCls}>
                      <option value="pending">En attente</option>
                      <option value="approved">Approuvée ✓</option>
                      <option value="rejected">Refusée ✗</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Âge (années)</label>
                    <input type="number" min={0} max={30} value={editAnnonce.age_years ?? ''}
                      onChange={e => setEditAnnonce({ ...editAnnonce, age_years: e.target.value ? parseInt(e.target.value) : undefined })}
                      className={inputCls} placeholder="0" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Sexe</label>
                    <select value={editAnnonce.gender} onChange={e => setEditAnnonce({ ...editAnnonce, gender: e.target.value })}
                      className={inputCls}>
                      <option value="male">Mâle</option>
                      <option value="female">Femelle</option>
                      <option value="unknown">Inconnu</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Couleur</label>
                  <input value={editAnnonce.color ?? ''} onChange={e => setEditAnnonce({ ...editAnnonce, color: e.target.value })}
                    className={inputCls} placeholder="Noir et blanc…" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Signes particuliers</label>
                  <textarea value={editAnnonce.specific_signs ?? ''} onChange={e => setEditAnnonce({ ...editAnnonce, specific_signs: e.target.value })}
                    rows={2} className={`${inputCls} resize-none`} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Commune</label>
                  <select value={editAnnonce.location_city} onChange={e => setEditAnnonce({ ...editAnnonce, location_city: e.target.value })}
                    className={inputCls}>
                    {COMMUNES_974.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editAnnonce.pinned}
                      onChange={e => setEditAnnonce({ ...editAnnonce, pinned: e.target.checked })} className="accent-emerald-600" />
                    <span className="text-sm text-slate-700">📌 Épingler</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editAnnonce.boosted}
                      onChange={e => setEditAnnonce({ ...editAnnonce, boosted: e.target.checked })} className="accent-orange-500" />
                    <span className="text-sm text-slate-700">⚡ Boosté</span>
                  </label>
                </div>
                {editAnnonce.photos.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Photos soumises</p>
                    <div className="flex flex-wrap gap-2">
                      {editAnnonce.photos.map((p, i) => (
                        <img key={i} src={p} alt="" className="h-16 w-16 rounded-xl object-cover border border-slate-200" />
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setEditAnnonce(null)}
                    className="flex-1 border border-slate-200 rounded-xl py-2 text-sm">Annuler</button>
                  <button onClick={() => saveAnnonce(editAnnonce)}
                    className="flex-1 bg-emerald-600 text-white rounded-xl py-2 text-sm font-semibold">Enregistrer</button>
                </div>
              </div>
            </Modal>
          )}

          {annonces.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400">
              <p className="font-medium">Aucune annonce soumise pour l'instant</p>
              <p className="text-sm mt-1">Les annonces publiées par les utilisateurs apparaîtront ici</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Animal','Statut','Commune','Auteur','Modération','Photos','Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-slate-700 text-xs whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {annonces.map(a => (
                    <tr key={a.id} className={[
                      a.pinned ? 'bg-yellow-50' : '',
                      a.moderation_status === 'pending' ? 'border-l-4 border-l-amber-400' : '',
                    ].join(' ')}>
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {a.pinned   && <span className="mr-1">📌</span>}
                        {a.boosted  && <span className="mr-1" title="Boosté">⚡</span>}
                        {a.name ?? <span className="text-slate-400 italic">Sans nom</span>}
                        <span className="text-xs text-slate-400 ml-1">{SPECIES_LABEL[a.species] ?? a.species}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[a.status] ?? ''}`}>
                          {STATUS_LABEL[a.status] ?? a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{a.location_city}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{a.author_name}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${MOD_BADGE[a.moderation_status]}`}>
                          {MOD_LABEL[a.moderation_status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {a.photos.length > 0
                          ? <img src={a.photos[0]} alt="" className="h-8 w-8 rounded-lg object-cover border" />
                          : <span className="text-xs text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {a.moderation_status === 'pending' && (
                            <>
                              <button onClick={() => { updateAnimal(a.id, { moderation_status: 'approved' }); setAnnonces(getAnimals()) }}
                                title="Approuver" className="p-1.5 rounded-lg border border-green-200 hover:bg-green-50 text-green-500 transition-colors">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => { updateAnimal(a.id, { moderation_status: 'rejected' }); setAnnonces(getAnimals()) }}
                                title="Refuser" className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-400 transition-colors">
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          <button onClick={() => setEditAnnonce(a)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-emerald-600 transition-colors">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => removeAnnonce(a.id)}
                            className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-400 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MEMBRES ── */}
      {tab === 'membres' && (
        <div className="space-y-3">
          {editMembre && (
            <Modal title="Modifier le membre" onClose={() => setEditMembre(null)}>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Nom</label>
                  <input value={editMembre.name}  onChange={e => setEditMembre({ ...editMembre, name:  e.target.value })}
                    className={inputCls} placeholder="Nom" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Email</label>
                  <input value={editMembre.email} onChange={e => setEditMembre({ ...editMembre, email: e.target.value })}
                    className={inputCls} placeholder="Email" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Ville</label>
                  <select value={editMembre.city} onChange={e => setEditMembre({ ...editMembre, city: e.target.value })}
                    className={inputCls}>
                    <option value="">—</option>
                    {COMMUNES_974.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Rôle</label>
                  <select value={editMembre.role} onChange={e => setEditMembre({ ...editMembre, role: e.target.value })}
                    className={inputCls}>
                    <option value="user">Utilisateur</option>
                    <option value="asso">Association</option>
                    <option value="pro">Professionnel</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setEditMembre(null)} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm">Annuler</button>
                  <button onClick={() => { setMembres(m => m.map(x => x.id === editMembre.id ? editMembre : x)); setEditMembre(null) }}
                    className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-semibold">Enregistrer</button>
                </div>
              </div>
            </Modal>
          )}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{['Nom','Email','Ville','Rôle','Inscrit le','Actions'].map(h =>
                  <th key={h} className="text-left px-4 py-3 font-semibold text-slate-700 text-xs whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {membres.map(m => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{m.name}</td>
                    <td className="px-4 py-3 text-slate-500">{m.email}</td>
                    <td className="px-4 py-3 text-slate-500">{m.city || '—'}</td>
                    <td className="px-4 py-3"><span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700">{m.role}</span></td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{m.created}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditMembre(m)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-emerald-600 transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setMembres(p => p.filter(x => x.id !== m.id))} className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── BOOSTS ── */}
      {tab === 'boosts' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>{['Annonce','Membre','Date','Montant','Statut'].map(h =>
                <th key={h} className="text-left px-4 py-3 font-semibold text-slate-700 text-xs">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {boosts.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Aucun boost payé pour l'instant</td></tr>
              ) : boosts.map(b => (
                <tr key={b.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{b.annonce}</td>
                  <td className="px-4 py-3 text-slate-500">{b.user}</td>
                  <td className="px-4 py-3 text-slate-500">{b.date}</td>
                  <td className="px-4 py-3 font-semibold text-orange-600">{b.amount}</td>
                  <td className="px-4 py-3"><span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700">⚡ {b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── BANNIÈRES ── */}
      {tab === 'bannieres' && (
        <div className="space-y-3">
          {editBanner && (
            <BannerModal
              banner={editBanner}
              onClose={() => setEditBanner(null)}
              onSave={(updated) => {
                const list = banners.map(x => x.id === updated.id ? updated : x)
                saveBannersLocal(list)
                setEditBanner(null)
              }}
            />
          )}
          <div className="grid gap-4">
            {banners.map(b => (
              <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{b.slot}</p>
                    <p className="text-xs text-slate-500 mt-1 truncate">{b.text}</p>
                    {b.url && <p className="text-xs text-blue-500 mt-0.5 truncate">{b.url}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${b.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {b.active ? '● Active' : '○ Inactive'}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {impressions[b.id] ?? 0} impressions
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const updated = banners.map(x => x.id === b.id ? { ...x, active: !x.active } : x)
                        saveBannersLocal(updated)
                      }}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${b.active ? 'border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-600' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
                      {b.active ? 'Désactiver' : 'Activer'}
                    </button>
                    <button onClick={() => setEditBanner(b)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-emerald-600 transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Aperçu */}
                {b.active && (
                  b.image
                    ? <div className="rounded-xl overflow-hidden border border-slate-200">
                        <img src={b.image} alt={b.text} style={{ width: 468, height: 60, objectFit: 'cover', maxWidth: '100%' }} />
                      </div>
                    : <a href={b.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-100 transition-colors">
                        🐾 {b.text}
                      </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ANNUAIRE PROS ── */}
      {tab === 'pros' && (
        <div className="space-y-4">
          {editPro && (
            <Modal title="Modifier le professionnel" onClose={() => setEditPro(null)}>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Nom de l'établissement</label>
                  <input value={editPro.business_name} onChange={e => setEditPro({ ...editPro, business_name: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Nom du responsable</label>
                  <input value={editPro.contact_name} onChange={e => setEditPro({ ...editPro, contact_name: e.target.value })}
                    className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Catégorie</label>
                    <select value={editPro.category} onChange={e => setEditPro({ ...editPro, category: e.target.value })}
                      className={inputCls}>
                      {Object.entries(CAT_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Commune</label>
                    <select value={editPro.city} onChange={e => setEditPro({ ...editPro, city: e.target.value })}
                      className={inputCls}>
                      {COMMUNES_974.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Téléphone</label>
                    <input type="tel" value={editPro.phone ?? ''} onChange={e => setEditPro({ ...editPro, phone: e.target.value })}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Email</label>
                    <input type="email" value={editPro.email ?? ''} onChange={e => setEditPro({ ...editPro, email: e.target.value })}
                      className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Site web</label>
                  <input type="url" value={editPro.website ?? ''} onChange={e => setEditPro({ ...editPro, website: e.target.value })}
                    className={inputCls} placeholder="https://…" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Description</label>
                  <textarea value={editPro.description ?? ''} onChange={e => setEditPro({ ...editPro, description: e.target.value })}
                    rows={2} className={`${inputCls} resize-none`} />
                </div>
                <div className="flex gap-4 flex-wrap pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editPro.is_verified}
                      onChange={e => setEditPro({ ...editPro, is_verified: e.target.checked })} className="accent-emerald-600" />
                    <span className="text-sm text-slate-700">✓ Vérifié</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editPro.is_featured}
                      onChange={e => setEditPro({ ...editPro, is_featured: e.target.checked })} className="accent-orange-500" />
                    <span className="text-sm text-slate-700">⭐ En avant (19 €/mois)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editPro.is_association}
                      onChange={e => setEditPro({ ...editPro, is_association: e.target.checked })} className="accent-blue-500" />
                    <span className="text-sm text-slate-700">🤝 Association</span>
                  </label>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setEditPro(null)} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm">Annuler</button>
                  <button onClick={() => {
                    updatePro(editPro.id, editPro)
                    setProsAdmin(prev => prev.map(x => x.id === editPro.id ? editPro : x))
                    setEditPro(null)
                  }} className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-semibold">Enregistrer</button>
                </div>
              </div>
            </Modal>
          )}

          {/* Filtre catégorie */}
          <div className="flex gap-2 flex-wrap">
            {['all', ...Object.keys(CAT_LABEL)].map(cat => (
              <button key={cat} onClick={() => setProsCatFilter(cat)}
                className={[
                  'flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  prosCatFilter === cat ? 'bg-emerald-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                ].join(' ')}>
                {cat === 'all' ? '🐾 Tous' : `${CAT_EMOJI[cat]} ${CAT_LABEL[cat]}`}
                <span className={`rounded-full px-1.5 ${prosCatFilter === cat ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                  {cat === 'all' ? prosAdmin.length : prosAdmin.filter(p => p.category === cat).length}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{['Établissement','Catégorie','Ville','Contact','Statuts','Actions'].map(h =>
                  <th key={h} className="text-left px-4 py-3 font-semibold text-slate-700 text-xs whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prosAdmin
                  .filter(p => prosCatFilter === 'all' || p.category === prosCatFilter)
                  .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
                  .map(p => (
                  <tr key={p.id} className={p.is_featured ? 'bg-orange-50' : ''}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{p.business_name}</p>
                      <p className="text-xs text-slate-400">{p.contact_name}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {CAT_EMOJI[p.category]} {CAT_LABEL[p.category] ?? p.category}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{p.city}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {p.phone && <p>{p.phone}</p>}
                      {p.email && <p className="text-blue-500">{p.email}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => { updatePro(p.id, { is_verified: !p.is_verified }); setProsAdmin(prev => prev.map(x => x.id === p.id ? { ...x, is_verified: !x.is_verified } : x)) }}
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold cursor-pointer transition-colors ${p.is_verified ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {p.is_verified ? '✓ Vérifié' : 'Non vérifié'}
                        </button>
                        <button onClick={() => { updatePro(p.id, { is_featured: !p.is_featured }); setProsAdmin(prev => prev.map(x => x.id === p.id ? { ...x, is_featured: !x.is_featured } : x)) }}
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold cursor-pointer transition-colors ${p.is_featured ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                          {p.is_featured ? '⭐ En avant' : 'Standard'}
                        </button>
                        {p.is_association && <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700">🤝 Asso</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditPro(p)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-emerald-600 transition-colors">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => { if (!confirm('Supprimer ce professionnel ?')) return; deletePro(p.id); setProsAdmin(prev => prev.filter(x => x.id !== p.id)) }}
                          className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-400 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  )
}

// ── Modal bannière avec upload image ─────────────────────────
function BannerModal({ banner, onClose, onSave }: {
  banner: StoredBanner
  onClose: () => void
  onSave: (b: StoredBanner) => void
}) {
  const [form, setForm] = useState<StoredBanner>({ ...banner })
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const reader = new FileReader()
    reader.onload = ev => {
      setForm(f => ({ ...f, image: ev.target?.result as string }))
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500'

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Modifier la bannière</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2">
          Emplacement : <strong>{form.slot}</strong>
        </p>

        {/* Upload image 468×60 */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            Image bannière <span className="text-slate-400 font-normal">(468×60 recommandé)</span>
          </label>
          <div className="flex gap-3 items-start">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 border-2 border-dashed border-emerald-300 bg-emerald-50 text-emerald-700 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-emerald-100 transition-colors whitespace-nowrap">
              <Upload className="h-4 w-4" />
              {uploading ? 'Upload…' : 'Choisir une image'}
            </button>
            {form.image && (
              <button type="button" onClick={() => setForm(f => ({ ...f, image: undefined }))}
                className="text-xs text-red-500 hover:text-red-700 transition-colors mt-2">
                ✕ Supprimer l'image
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

          {/* Aperçu image */}
          {form.image && (
            <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <img src={form.image} alt="Aperçu bannière"
                style={{ width: 468, height: 60, objectFit: 'cover', maxWidth: '100%' }} />
            </div>
          )}
        </div>

        {/* Texte (fallback si pas d'image) */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            Texte affiché <span className="text-slate-400 font-normal">(si pas d'image)</span>
          </label>
          <input value={form.text} onChange={e => setForm({ ...form, text: e.target.value })}
            className={inputCls} placeholder="Votre publicité ici…" />
        </div>

        {/* URL */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">URL du lien</label>
          <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
            className={inputCls} placeholder="https://…" />
        </div>

        {/* Active */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.active}
            onChange={e => setForm({ ...form, active: e.target.checked })} className="accent-emerald-600" />
          <span className="text-sm text-slate-700">Bannière active (visible sur le site)</span>
        </label>

        {/* Aperçu texte (si pas d'image) */}
        {!form.image && (
          <div>
            <p className="text-xs text-slate-500 mb-1">Aperçu texte</p>
            <a href={form.url} target="_blank" rel="noopener noreferrer"
              style={{ maxWidth: 468 }} className="flex items-center gap-3 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 hover:border-emerald-500 transition-colors">
              🐾 {form.text || '(texte vide)'}
            </a>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm">Annuler</button>
          <button onClick={() => onSave(form)}
            className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-emerald-700 transition-colors">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}
