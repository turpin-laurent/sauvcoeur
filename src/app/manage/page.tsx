'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2, XCircle, Edit, Trash2, Users, Megaphone, BookOpen, Image,
  Zap, LogOut, Upload, Eye, BarChart2, Mail, Shield, Plus, PawPrint, X, Save, Bell,
} from 'lucide-react'
import {
  isAdminValid, clearAdminSession,
  type StoredAnimal, type StoredBanner, type StoredPro, type AdminAccount,
} from '@/lib/animals/store'
import { COMMUNES_974 } from '@/lib/geo/communes974'

// ── Constantes ────────────────────────────────────────────────
const CAT_LABEL: Record<string, string> = {
  vet: 'Vétérinaires & santé', rescue: 'Associations & refuges',
  sitter: 'Garde & pensions', education: 'Éducation & comportement',
  groomer: 'Toilettage', shop: 'Animaleries & alimentation', leisure: 'Loisirs & services animaliers',
}
const CAT_EMOJI: Record<string, string> = {
  vet: '🩺', rescue: '❤️', sitter: '🏠', education: '🎓', groomer: '✂️', shop: '🛒', leisure: '🎉',
}

const STATUS_BADGE:  Record<string, string> = {
  lost: 'bg-red-100 text-red-700', found: 'bg-amber-100 text-amber-700', to_adopt: 'bg-emerald-100 text-emerald-700',
}
const STATUS_LABEL:  Record<string, string> = { lost: 'Perdu', found: 'Trouvé', to_adopt: 'À adopter' }
const MOD_BADGE:     Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700',
}
const MOD_LABEL:     Record<string, string> = { pending: 'En attente', approved: 'Approuvée', rejected: 'Refusée' }
const SPECIES_LABEL: Record<string, string> = { dog: 'Chien', cat: 'Chat', bird: 'Oiseau', rabbit: 'Lapin', other: 'NAC' }

const TABS = [
  { id: 'dashboard',  label: 'Tableau de bord',  icon: <BarChart2 className="h-4 w-4" /> },
  { id: 'annonces',   label: 'Annonces',          icon: <Megaphone className="h-4 w-4" /> },
  { id: 'publier',    label: 'Publier',            icon: <Plus className="h-4 w-4" /> },
  { id: 'membres',    label: 'Membres',            icon: <Users className="h-4 w-4" /> },
  { id: 'newsletter', label: 'Newsletter',         icon: <Mail className="h-4 w-4" /> },
  { id: 'boosts',     label: 'Boosts payés',       icon: <Zap className="h-4 w-4" /> },
  { id: 'bannieres',  label: 'Bannières',          icon: <Image className="h-4 w-4" /> },
  { id: 'pros',       label: 'Annuaire pros',      icon: <BookOpen className="h-4 w-4" /> },
  { id: 'admins',     label: 'Administrateurs',    icon: <Shield className="h-4 w-4" /> },
]

const INIT_PROS_ADMIN: StoredPro[] = []

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

function getBannerImpressions(id: string): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(`sc_banner_imp_${id}`) ?? '0', 10)
}

// ── Types ─────────────────────────────────────────────────────
type RealMembre = { id: string; name: string; email: string; newsletter: boolean; created: string }
type Notif = { id: number; type: string; title: string; message: string; read: boolean; created_at: string; data: Record<string, any> }

// ── QuickPost ─────────────────────────────────────────────────
function QuickPostForm({ onDone }: { onDone: () => void }) {
  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500'
  const [form, setForm] = useState({
    status: 'lost' as 'lost' | 'found' | 'to_adopt',
    species: 'dog' as string,
    gender: 'unknown' as string,
    name: '',
    age_years: '',
    color: '',
    specific_signs: '',
    location_city: '',
    contact_email: 'sauvcoeur974@gmail.com',
    moderation_status: 'approved' as 'approved' | 'pending',
  })
  const [saving, setSaving] = useState(false)

  const f = (key: string, val: unknown) => setForm(p => ({ ...p, [key]: val }))

  const handleSave = async () => {
    if (!form.species || !form.location_city) return
    setSaving(true)
    const animal = {
      id: `admin_${Date.now()}`,
      status: form.status,
      species: form.species,
      gender: form.gender,
      name: form.name.trim() || undefined,
      age_years: form.age_years ? Number(form.age_years) : undefined,
      color: form.color.trim() || undefined,
      specific_signs: form.specific_signs.trim() || undefined,
      location_city: form.location_city,
      contact_type: 'email',
      contact_email: form.contact_email,
      photos: [],
      created_at: new Date().toISOString(),
      moderation_status: form.moderation_status,
      boosted: false,
      pinned: false,
      author_id: 'admin',
      author_name: 'Équipe SauvCœur',
    }
    await fetch('/api/animals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(animal),
    }).catch(() => {})
    setSaving(false)
    onDone()
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-xl">
      <h2 className="font-bold text-slate-900 flex items-center gap-2"><PawPrint className="h-5 w-5 text-emerald-600" /> Publication rapide d'annonce</h2>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Statut *</label>
          <select value={form.status} onChange={e => f('status', e.target.value)} className={inputCls}>
            <option value="lost">Perdu</option>
            <option value="found">Trouvé</option>
            <option value="to_adopt">À adopter</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Espèce *</label>
          <select value={form.species} onChange={e => f('species', e.target.value)} className={inputCls}>
            <option value="dog">Chien</option><option value="cat">Chat</option>
            <option value="bird">Oiseau</option><option value="rabbit">Lapin</option>
            <option value="other">NAC / Autre</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Nom</label>
          <input value={form.name} onChange={e => f('name', e.target.value)} placeholder="Rex, Mimi…" className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Âge (années)</label>
          <input type="number" min={0} max={30} value={form.age_years} onChange={e => f('age_years', e.target.value)} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Sexe</label>
          <select value={form.gender} onChange={e => f('gender', e.target.value)} className={inputCls}>
            <option value="male">Mâle</option><option value="female">Femelle</option><option value="unknown">Inconnu</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Couleur</label>
          <input value={form.color} onChange={e => f('color', e.target.value)} placeholder="Noir et blanc…" className={inputCls} />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">Signes distinctifs</label>
        <textarea rows={2} value={form.specific_signs} onChange={e => f('specific_signs', e.target.value)}
          placeholder="Description, signes particuliers…" className={`${inputCls} resize-none`} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Commune *</label>
          <select value={form.location_city} onChange={e => f('location_city', e.target.value)} className={inputCls}>
            <option value="">— Sélectionner —</option>
            {COMMUNES_974.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Modération</label>
          <select value={form.moderation_status} onChange={e => f('moderation_status', e.target.value)} className={inputCls}>
            <option value="approved">Approuvée directement ✓</option>
            <option value="pending">En attente</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">Email de contact</label>
        <input type="email" value={form.contact_email} onChange={e => f('contact_email', e.target.value)} className={inputCls} />
      </div>
      <button onClick={handleSave} disabled={saving || !form.location_city}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
        <Save className="h-4 w-4" />
        {saving ? 'Enregistrement…' : 'Publier l\'annonce'}
      </button>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────
export default function ManagePage() {
  const router = useRouter()

  useEffect(() => {
    if (!isAdminValid()) router.replace('/manage/login')
  }, [router])

  const [tab,           setTab]           = useState('dashboard')
  const [annonces,      setAnnonces]      = useState<StoredAnimal[]>([])
  const [membres,       setMembres]       = useState<RealMembre[]>([])
  const [banners,       setBannersState]  = useState<StoredBanner[]>([])
  const [prosAdmin,     setProsAdmin]     = useState<StoredPro[]>([])
  const [prosCatFilter, setProsCatFilter] = useState('all')
  const [impressions,   setImpressions]   = useState<Record<string, number>>({})
  const [newsletter,    setNewsletter]    = useState<{email:string;subscribed_at:string}[]>([])
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([])
  const [notifs,        setNotifs]        = useState<Notif[]>([])
  const [showNotifs,    setShowNotifs]    = useState(false)
  const [editAnnonce,   setEditAnnonce]   = useState<StoredAnimal | null>(null)
  const [editBanner,    setEditBanner]    = useState<StoredBanner | null>(null)
  const [editPro,       setEditPro]       = useState<StoredPro | null>(null)
  const [editAdmin,     setEditAdmin]     = useState<AdminAccount | null>(null)
  const [newAdmin,      setNewAdmin]      = useState({ name:'', email:'', password:'' })
  const [showNewAdmin,  setShowNewAdmin]  = useState(false)
  const [quickDone,     setQuickDone]     = useState(false)

  const loadData = async () => {
    // Annonces depuis Supabase
    fetch('/api/animals', { headers: { 'x-admin': '1' } })
      .then(r => r.json()).then(setAnnonces).catch(() => {})
    // Newsletter depuis Supabase
    fetch('/api/newsletter')
      .then(r => r.json()).then(setNewsletter).catch(() => {})
    // Pros depuis Supabase (tous, y compris pending)
    fetch('/api/pros', { headers: { 'x-admin': '1' } })
      .then(r => r.json())
      .then((data: StoredPro[]) => setProsAdmin(data))
      .catch(() => {})
    // Notifications
    fetch('/api/notifications')
      .then(r => r.json())
      .then((data: Notif[]) => setNotifs(data))
      .catch(() => {})
    // Membres depuis Supabase
    fetch('/api/users')
      .then(r => r.json())
      .then((data: any[]) => setMembres(data.map(u => ({
        id: u.id, name: u.name, email: u.email,
        newsletter: u.newsletter ?? false, created: u.created_at?.slice(0, 10) ?? '—',
      }))))
      .catch(() => {})
    // Bannières depuis Supabase
    fetch('/api/banners')
      .then(r => r.json())
      .then((data: StoredBanner[]) => {
        setBannersState(data)
        const imp: Record<string, number> = {}
        data.forEach(x => { imp[x.id] = getBannerImpressions(x.id) })
        setImpressions(imp)
      })
      .catch(() => {})
    // Comptes admin depuis Supabase
    fetch('/api/admins')
      .then(r => r.json())
      .then((data: AdminAccount[]) => setAdminAccounts(data))
      .catch(() => {})
  }

  useEffect(() => { loadData() }, [])

  const boosts = annonces.filter(a => a.boosted).map(a => ({
    id: a.id,
    annonce: `${a.name ?? 'Inconnu'} (${STATUS_LABEL[a.status] ?? a.status})`,
    user:    a.author_name,
    date:    a.created_at.slice(0, 10),
    amount:  '4,99 €',
    status:  'active',
  }))

  const pending  = annonces.filter(a => a.moderation_status === 'pending').length
  const approved = annonces.filter(a => a.moderation_status === 'approved').length

  const saveAnnonce = async (a: StoredAnimal) => {
    await fetch(`/api/animals/${a.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(a),
    }).catch(() => {})
    setEditAnnonce(null)
    fetch('/api/animals', { headers: { 'x-admin': '1' } })
      .then(r => r.json()).then(setAnnonces).catch(() => {})
  }
  const removeAnnonce = async (id: string) => {
    if (!confirm('Supprimer cette annonce ?')) return
    await fetch(`/api/animals/${id}`, { method: 'DELETE' }).catch(() => {})
    setAnnonces(prev => prev.filter(a => a.id !== id))
  }
  const saveBannersLocal = async (b: StoredBanner[]) => {
    setBannersState([...b])
    fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(b),
    }).catch(() => {})
  }
  const handleLogout = () => { clearAdminSession(); router.push('/manage/login') }

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
        <div className="flex items-center gap-2">
          {/* Cloche notifications */}
          <div className="relative">
            <button onClick={() => {
              setShowNotifs(v => !v)
              if (!showNotifs && notifs.some(n => !n.read)) {
                fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) }).catch(() => {})
                setNotifs(prev => prev.map(n => ({ ...n, read: true })))
              }
            }}
              className="relative flex items-center gap-1.5 border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
              <Bell className="h-4 w-4" />
              {notifs.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                  {notifs.filter(n => !n.read).length}
                </span>
              )}
            </button>
            {/* Panneau notifications */}
            {showNotifs && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between rounded-t-2xl">
                  <p className="font-semibold text-slate-900 text-sm">Notifications</p>
                  <button onClick={() => setShowNotifs(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
                </div>
                {notifs.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-8">Aucune notification</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifs.map(n => (
                      <div key={n.id} className={`px-4 py-3 ${n.read ? 'bg-white' : 'bg-blue-50'}`}>
                        <div className="flex items-start gap-2">
                          <span className="text-lg shrink-0">
                            {n.type === 'new_pro' ? '🏢' : n.type === 'new_member' ? '👤' : '🐾'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 leading-tight">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                            <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
                          </div>
                          {n.type === 'new_pro' && (
                            <button onClick={() => { setShowNotifs(false); setTab('pros') }}
                              className="shrink-0 text-xs text-emerald-600 hover:underline font-medium">Voir</button>
                          )}
                          {n.type === 'new_member' && (
                            <button onClick={() => { setShowNotifs(false); setTab('membres') }}
                              className="shrink-0 text-xs text-blue-600 hover:underline font-medium">Voir</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Annonces',   value: annonces.length, color: 'text-emerald-600' },
          { label: 'Membres',    value: membres.length,  color: 'text-blue-600' },
          { label: 'Newsletter', value: newsletter.length, color: 'text-purple-600' },
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
            {t.id === 'pros' && prosAdmin.filter(p => (p as any).moderation_status === 'pending').length > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {prosAdmin.filter(p => (p as any).moderation_status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TABLEAU DE BORD ── */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Users className="h-4 w-4 text-blue-600" /> Membres</h3>
              <p className="text-4xl font-bold text-blue-600">{membres.length}</p>
              <p className="text-sm text-slate-500">inscrits via le site</p>
              <div className="space-y-1 text-sm text-slate-500">
                <div className="flex justify-between">
                  <span>Abonnés newsletter</span>
                  <span className="font-semibold text-slate-700">{newsletter.length}</span>
                </div>
              </div>
            </div>

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
          </div>

          {/* Notifications récentes */}
          {notifs.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-slate-500" /> Activité récente
                  {notifs.filter(n => !n.read).length > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {notifs.filter(n => !n.read).length} nouveau{notifs.filter(n => !n.read).length > 1 ? 'x' : ''}
                    </span>
                  )}
                </h3>
                <button onClick={() => {
                  fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) }).catch(() => {})
                  setNotifs(prev => prev.map(n => ({ ...n, read: true })))
                }} className="text-xs text-slate-400 hover:text-slate-600">Tout marquer lu</button>
              </div>
              <div className="space-y-2">
                {notifs.slice(0, 8).map(n => (
                  <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer ${n.read ? 'bg-slate-50' : 'bg-blue-50 border border-blue-100'}`}
                    onClick={() => {
                      if (n.type === 'new_pro') setTab('pros')
                      if (n.type === 'new_member') setTab('membres')
                      if (n.type === 'new_annonce') setTab('annonces')
                    }}>
                    <span className="text-xl shrink-0">{n.type === 'new_pro' ? '🏢' : n.type === 'new_member' ? '👤' : '🐾'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 leading-tight">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                    </div>
                    <p className="text-xs text-slate-400 shrink-0">
                      {new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
            <h3 className="font-semibold text-emerald-800 mb-3">Actions rapides</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setTab('annonces')}
                className="flex items-center gap-1.5 bg-white border border-emerald-300 text-emerald-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors">
                <Megaphone className="h-4 w-4" /> Modérer les annonces
                {pending > 0 && <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{pending}</span>}
              </button>
              <button onClick={() => setTab('publier')}
                className="flex items-center gap-1.5 bg-white border border-emerald-300 text-emerald-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors">
                <Plus className="h-4 w-4" /> Publier une annonce
              </button>
              <button onClick={() => setTab('pros')}
                className="flex items-center gap-1.5 bg-white border border-emerald-300 text-emerald-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors">
                <BookOpen className="h-4 w-4" /> Valider les pros
                {prosAdmin.filter(p => (p as any).moderation_status === 'pending').length > 0 && <span className="bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{prosAdmin.filter(p => (p as any).moderation_status === 'pending').length}</span>}
              </button>
              <button onClick={() => setTab('newsletter')}
                className="flex items-center gap-1.5 bg-white border border-emerald-300 text-emerald-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors">
                <Mail className="h-4 w-4" /> Newsletter ({newsletter.length})
              </button>
              <button onClick={() => setTab('bannieres')}
                className="flex items-center gap-1.5 bg-white border border-emerald-300 text-emerald-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors">
                <Image className="h-4 w-4" /> Gérer les bannières
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
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Email de contact</label>
                  <input type="email" value={editAnnonce.contact_email ?? ''} onChange={e => setEditAnnonce({ ...editAnnonce, contact_email: e.target.value })}
                    className={inputCls} />
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
                              <button onClick={async () => {
                                await fetch(`/api/animals/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moderation_status: 'approved' }) })
                                setAnnonces(prev => prev.map(x => x.id === a.id ? { ...x, moderation_status: 'approved' } : x))
                              }} title="Approuver" className="p-1.5 rounded-lg border border-green-200 hover:bg-green-50 text-green-500 transition-colors">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={async () => {
                                await fetch(`/api/animals/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moderation_status: 'rejected' }) })
                                setAnnonces(prev => prev.map(x => x.id === a.id ? { ...x, moderation_status: 'rejected' } : x))
                              }} title="Refuser" className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-400 transition-colors">
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

      {/* ── PUBLIER RAPIDEMENT ── */}
      {tab === 'publier' && (
        <div>
          {quickDone ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
              <p className="font-bold text-slate-900">Annonce publiée !</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setQuickDone(false); fetch('/api/animals', { headers: { 'x-admin': '1' } }).then(r => r.json()).then(setAnnonces).catch(() => {}) }}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                  Publier une autre annonce
                </button>
                <button onClick={() => { setTab('annonces'); fetch('/api/animals', { headers: { 'x-admin': '1' } }).then(r => r.json()).then(setAnnonces).catch(() => {}) }}
                  className="border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold">
                  Voir les annonces
                </button>
              </div>
            </div>
          ) : (
            <QuickPostForm onDone={() => { setQuickDone(true); fetch('/api/animals', { headers: { 'x-admin': '1' } }).then(r => r.json()).then(setAnnonces).catch(() => {}) }} />
          )}
        </div>
      )}

      {/* ── MEMBRES ── */}
      {tab === 'membres' && (
        <div className="space-y-3">
          {membres.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="font-medium">Aucun membre inscrit pour l'instant</p>
              <p className="text-sm mt-1">Les comptes créés via le site apparaîtront ici</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>{['Nom','Email','Newsletter','Actions'].map(h =>
                    <th key={h} className="text-left px-4 py-3 font-semibold text-slate-700 text-xs whitespace-nowrap">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {membres.map(m => (
                    <tr key={m.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{m.name}</td>
                      <td className="px-4 py-3 text-slate-500">{m.email}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${m.newsletter ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {m.newsletter ? '✓ Abonné' : 'Non abonné'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        <a href={`mailto:${m.email}`} className="text-emerald-600 hover:underline text-xs">Contacter</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── NEWSLETTER ── */}
      {tab === 'newsletter' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">{newsletter.length} abonné(s) newsletter</h2>
              <p className="text-sm text-slate-500 mt-0.5">Liste complète des inscrits à la newsletter hebdomadaire</p>
            </div>
            {newsletter.length > 0 && (
              <button
                onClick={() => {
                  const csv = 'Email,Date\n' + newsletter.map(s => `${s.email},${s.subscribed_at.slice(0,10)}`).join('\n')
                  const a = document.createElement('a')
                  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
                  a.download = 'newsletter_sauvcoeur.csv'
                  a.click()
                }}
                className="flex items-center gap-1.5 bg-emerald-600 text-white text-sm font-semibold px-3 py-2 rounded-xl hover:bg-emerald-700 transition-colors">
                ⬇ Exporter CSV
              </button>
            )}
          </div>
          {newsletter.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="font-medium">Aucun abonné pour l'instant</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>{['Email','Date d\'inscription','Actions'].map(h =>
                    <th key={h} className="text-left px-4 py-3 font-semibold text-slate-700 text-xs">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {newsletter.map(s => (
                    <tr key={s.email}>
                      <td className="px-4 py-3 font-medium text-slate-900">{s.email}</td>
                      <td className="px-4 py-3 text-slate-500">{s.subscribed_at.slice(0,10)}</td>
                      <td className="px-4 py-3">
                        <button onClick={async () => {
                          if (!confirm(`Désabonner ${s.email} ?`)) return
                          await fetch(`/api/newsletter?email=${encodeURIComponent(s.email)}`, { method: 'DELETE' })
                          fetch('/api/newsletter').then(r => r.json()).then(setNewsletter).catch(() => {})
                        }} className="text-xs text-red-500 hover:text-red-700 transition-colors">
                          Désabonner
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                  <input value={editPro.business_name} onChange={e => setEditPro({ ...editPro, business_name: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Nom du responsable</label>
                  <input value={editPro.contact_name} onChange={e => setEditPro({ ...editPro, contact_name: e.target.value })} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Catégorie</label>
                    <select value={editPro.category} onChange={e => setEditPro({ ...editPro, category: e.target.value })} className={inputCls}>
                      {Object.entries(CAT_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Commune</label>
                    <select value={editPro.city} onChange={e => setEditPro({ ...editPro, city: e.target.value })} className={inputCls}>
                      {COMMUNES_974.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Téléphone</label>
                    <input type="tel" value={editPro.phone ?? ''} onChange={e => setEditPro({ ...editPro, phone: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Email</label>
                    <input type="email" value={editPro.email ?? ''} onChange={e => setEditPro({ ...editPro, email: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Site web</label>
                  <input type="url" value={editPro.website ?? ''} onChange={e => setEditPro({ ...editPro, website: e.target.value })} className={inputCls} placeholder="https://…" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Description</label>
                  <textarea value={editPro.description ?? ''} onChange={e => setEditPro({ ...editPro, description: e.target.value })}
                    rows={2} className={`${inputCls} resize-none`} />
                </div>
                <div className="flex gap-4 flex-wrap pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editPro.is_verified} onChange={e => setEditPro({ ...editPro, is_verified: e.target.checked })} className="accent-emerald-600" />
                    <span className="text-sm text-slate-700">✓ Vérifié</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editPro.is_featured} onChange={e => setEditPro({ ...editPro, is_featured: e.target.checked })} className="accent-orange-500" />
                    <span className="text-sm text-slate-700">⭐ En avant (19 €/mois)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editPro.is_association} onChange={e => setEditPro({ ...editPro, is_association: e.target.checked })} className="accent-blue-500" />
                    <span className="text-sm text-slate-700">🤝 Association</span>
                  </label>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setEditPro(null)} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm">Annuler</button>
                  <button onClick={async () => {
                    await fetch(`/api/pros/${editPro.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editPro) }).catch(() => {})
                    setProsAdmin(prev => prev.map(x => x.id === editPro.id ? editPro : x))
                    setEditPro(null)
                  }} className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-semibold">Enregistrer</button>
                </div>
              </div>
            </Modal>
          )}

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

          {/* Filtre modération */}
          {prosAdmin.filter(p => (p as any).moderation_status === 'pending').length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-amber-600 font-semibold text-sm">⏳ {prosAdmin.filter(p => (p as any).moderation_status === 'pending').length} pro(s) en attente de validation</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{['Établissement','Catégorie','Ville','Contact','Modération','Statuts','Actions'].map(h =>
                  <th key={h} className="text-left px-4 py-3 font-semibold text-slate-700 text-xs whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prosAdmin
                  .filter(p => prosCatFilter === 'all' || p.category === prosCatFilter)
                  .sort((a, b) => {
                    const modOrder = { pending: 0, rejected: 2, approved: 1 }
                    const ma = modOrder[(a as any).moderation_status as keyof typeof modOrder] ?? 1
                    const mb = modOrder[(b as any).moderation_status as keyof typeof modOrder] ?? 1
                    if (ma !== mb) return ma - mb
                    return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
                  })
                  .map(p => {
                    const mod = (p as any).moderation_status ?? 'approved'
                    return (
                    <tr key={p.id} className={[
                      p.is_featured ? 'bg-orange-50' : '',
                      mod === 'pending' ? 'border-l-4 border-l-amber-400' : '',
                    ].join(' ')}>
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
                      {/* Colonne modération */}
                      <td className="px-4 py-3">
                        {mod === 'pending' ? (
                          <div className="flex flex-col gap-1">
                            <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 mb-1">⏳ En attente</span>
                            <div className="flex gap-1">
                              <button onClick={async () => {
                                await fetch(`/api/pros/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moderation_status: 'approved', is_verified: true }) }).catch(() => {})
                                setProsAdmin(prev => prev.map(x => x.id === p.id ? { ...x, moderation_status: 'approved' as any, is_verified: true } : x))
                              }} className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-2 py-1 text-xs font-semibold transition-colors">
                                <CheckCircle2 className="h-3 w-3" /> Approuver
                              </button>
                              <button onClick={async () => {
                                await fetch(`/api/pros/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moderation_status: 'rejected' }) }).catch(() => {})
                                setProsAdmin(prev => prev.map(x => x.id === p.id ? { ...x, moderation_status: 'rejected' as any } : x))
                              }} className="flex items-center gap-1 border border-red-200 hover:bg-red-50 text-red-500 rounded-lg px-2 py-1 text-xs font-semibold transition-colors">
                                <XCircle className="h-3 w-3" /> Refuser
                              </button>
                            </div>
                          </div>
                        ) : mod === 'rejected' ? (
                          <div className="flex flex-col gap-1">
                            <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700">✗ Refusé</span>
                            <button onClick={async () => {
                              await fetch(`/api/pros/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moderation_status: 'approved', is_verified: true }) }).catch(() => {})
                              setProsAdmin(prev => prev.map(x => x.id === p.id ? { ...x, moderation_status: 'approved' as any, is_verified: true } : x))
                            }} className="text-xs text-emerald-600 hover:underline">Réapprouver</button>
                          </div>
                        ) : (
                          <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700">✓ Approuvé</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <button onClick={async () => { await fetch(`/api/pros/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_featured: !p.is_featured }) }).catch(() => {}); setProsAdmin(prev => prev.map(x => x.id === p.id ? { ...x, is_featured: !x.is_featured } : x)) }}
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
                          <button onClick={async () => { if (!confirm('Supprimer ?')) return; await fetch(`/api/pros/${p.id}`, { method: 'DELETE' }).catch(() => {}); setProsAdmin(prev => prev.filter(x => x.id !== p.id)) }}
                            className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-400 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADMINISTRATEURS ── */}
      {tab === 'admins' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Comptes administrateurs</h2>
            <button onClick={() => setShowNewAdmin(true)}
              className="flex items-center gap-1.5 bg-slate-800 text-white text-sm font-semibold px-3 py-2 rounded-xl hover:bg-slate-900 transition-colors">
              <Plus className="h-4 w-4" /> Ajouter un admin
            </button>
          </div>

          {showNewAdmin && (
            <Modal title="Ajouter un administrateur" onClose={() => setShowNewAdmin(false)}>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Nom</label>
                  <input value={newAdmin.name} onChange={e => setNewAdmin(n => ({ ...n, name: e.target.value }))} className={inputCls} placeholder="Nom de l'admin" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Email</label>
                  <input type="email" value={newAdmin.email} onChange={e => setNewAdmin(n => ({ ...n, email: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Mot de passe</label>
                  <input type="password" value={newAdmin.password} onChange={e => setNewAdmin(n => ({ ...n, password: e.target.value }))} className={inputCls} />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowNewAdmin(false)} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm">Annuler</button>
                  <button onClick={async () => {
                    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) return
                    const account: AdminAccount = {
                      id: `admin_${Date.now()}`,
                      name: newAdmin.name,
                      email: newAdmin.email,
                      password: newAdmin.password,
                      created_at: new Date().toISOString(),
                    }
                    await fetch('/api/admins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(account) }).catch(() => {})
                    setAdminAccounts(prev => [account, ...prev])
                    setNewAdmin({ name: '', email: '', password: '' })
                    setShowNewAdmin(false)
                  }} className="flex-1 bg-slate-800 text-white rounded-xl py-2.5 text-sm font-semibold">Créer</button>
                </div>
              </div>
            </Modal>
          )}

          {editAdmin && (
            <Modal title="Modifier l'administrateur" onClose={() => setEditAdmin(null)}>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Nom</label>
                  <input value={editAdmin.name} onChange={e => setEditAdmin({ ...editAdmin, name: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Email</label>
                  <input type="email" value={editAdmin.email} onChange={e => setEditAdmin({ ...editAdmin, email: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Nouveau mot de passe</label>
                  <input type="password" value={editAdmin.password} onChange={e => setEditAdmin({ ...editAdmin, password: e.target.value })} className={inputCls} placeholder="Laisser vide pour ne pas changer" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setEditAdmin(null)} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm">Annuler</button>
                  <button onClick={async () => {
                    await fetch(`/api/admins/${editAdmin.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editAdmin) }).catch(() => {})
                    setAdminAccounts(prev => prev.map(a => a.id === editAdmin.id ? editAdmin : a))
                    setEditAdmin(null)
                  }} className="flex-1 bg-slate-800 text-white rounded-xl py-2.5 text-sm font-semibold">Enregistrer</button>
                </div>
              </div>
            </Modal>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{['Nom','Email','Créé le','Actions'].map(h =>
                  <th key={h} className="text-left px-4 py-3 font-semibold text-slate-700 text-xs">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminAccounts.map(a => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{a.name}</td>
                    <td className="px-4 py-3 text-slate-500">{a.email}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{a.created_at.slice(0,10)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditAdmin({ ...a })}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-emerald-600 transition-colors">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        {adminAccounts.length > 1 && (
                          <button onClick={async () => {
                            if (!confirm(`Supprimer l'admin ${a.name} ?`)) return
                            const res = await fetch(`/api/admins/${a.id}`, { method: 'DELETE' }).catch(() => null)
                            if (res?.ok) setAdminAccounts(prev => prev.filter(x => x.id !== a.id))
                          }} className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-400 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400">⚠️ Minimum 1 compte administrateur requis. Le dernier compte ne peut pas être supprimé.</p>
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
                ✕ Supprimer
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          {form.image && (
            <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <img src={form.image} alt="Aperçu" style={{ width: 468, height: 60, objectFit: 'cover', maxWidth: '100%' }} />
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            Texte affiché <span className="text-slate-400 font-normal">(si pas d'image)</span>
          </label>
          <input value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} className={inputCls} placeholder="Votre publicité ici…" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">URL du lien</label>
          <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className={inputCls} placeholder="https://…" />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="accent-emerald-600" />
          <span className="text-sm text-slate-700">Bannière active</span>
        </label>

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
