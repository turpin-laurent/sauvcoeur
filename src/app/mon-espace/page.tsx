'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, LogOut, Heart, MapPin, Clock, Edit, Trash2, PawPrint, Camera, Check, X, Save } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
import { COMMUNES_974 } from '@/lib/geo/communes974'
import type { StoredAnimal } from '@/lib/animals/store'

const STATUS_BADGE: Record<string, string> = {
  lost: 'bg-red-100 text-red-700', found: 'bg-amber-100 text-amber-700', to_adopt: 'bg-emerald-100 text-emerald-700',
}
const STATUS_LABEL: Record<string, string> = { lost: 'Perdu', found: 'Trouvé', to_adopt: 'À adopter' }
const SPECIES_ICON: Record<string, string>  = { dog: '🐕', cat: '🐱', bird: '🐦', rabbit: '🐰', other: '🐾' }

function timeAgo(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000)
  const d = Math.floor(h / 24)
  return d > 0 ? `il y a ${d}j` : h > 0 ? `il y a ${h}h` : "à l'instant"
}

// ── Édition du profil ─────────────────────────────────────────
function ProfileEditor({ onClose }: { onClose: () => void }) {
  const { user, updateProfile } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [name,   setName]   = useState(user?.name   ?? '')
  const [city,   setCity]   = useState(user?.city   ?? '')
  const [phone,  setPhone]  = useState(user?.phone  ?? '')
  const [avatar, setAvatar] = useState(user?.avatar ?? '')
  const [saved,  setSaved]  = useState(false)

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setAvatar(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const save = () => {
    updateProfile({ name, city, phone, avatar })
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-lg">Modifier mon profil</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {avatar
              ? <img src={avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-emerald-200" />
              : <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700">
                  {name.slice(0, 2).toUpperCase()}
                </div>
            }
            <button onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 bg-emerald-600 text-white rounded-full p-1.5 hover:bg-emerald-700 transition-colors">
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>
          <p className="text-xs text-slate-400">Cliquez sur l'appareil photo pour changer</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Nom complet</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Commune</label>
            <select value={city} onChange={e => setCity(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Sélectionner une commune</option>
              {COMMUNES_974.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Téléphone (privé)</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0692 00 00 00"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            <p className="text-xs text-slate-400 mt-1">
              🔒 Jamais affiché publiquement. Contact uniquement par email.
            </p>
          </div>
        </div>

        <button onClick={save}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors ${saved ? 'bg-green-500 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
          {saved ? <><Check className="h-4 w-4" /> Enregistré !</> : 'Sauvegarder'}
        </button>
      </div>
    </div>
  )
}

// ── Éditeur d'annonce complet ──────────────────────────────────
function AnimalEditor({ animal, onClose, onSaved }: {
  animal: StoredAnimal
  onClose: () => void
  onSaved: (updated: StoredAnimal) => void
}) {
  const [form, setForm] = useState<StoredAnimal>({ ...animal })
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [error,  setError]  = useState('')

  const f = (key: keyof StoredAnimal, val: unknown) => setForm(p => ({ ...p, [key]: val }))

  const handleSave = async () => {
    if (!form.species)       { setError('Le type d\'animal est requis.'); return }
    if (!form.name?.trim())  { setError('Le nom est requis.'); return }
    if (!form.color?.trim()) { setError('La couleur est requise.'); return }
    if (!form.specific_signs?.trim()) { setError('Les signes particuliers sont requis.'); return }
    setError('')
    setSaving(true)
    try {
      await fetch(`/api/animals/${form.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, moderation_status: 'pending' }),
      })
    } catch { /* non bloquant */ }
    setSaved(true)
    setSaving(false)
    setTimeout(() => { onSaved({ ...form, moderation_status: 'pending' }); onClose() }, 600)
  }

  const inputCls = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500'

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="font-bold text-slate-900 text-lg">Modifier l'annonce</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 space-y-4">

          {/* Type d'annonce */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Type d'annonce *</label>
            <div className="flex gap-2">
              {([
                { v: 'lost',     l: 'Perdu',     cls: 'border-red-300 bg-red-50 text-red-700' },
                { v: 'found',    l: 'Trouvé',    cls: 'border-amber-300 bg-amber-50 text-amber-700' },
                { v: 'to_adopt', l: 'À adopter', cls: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
              ] as const).map(({ v, l, cls }) => (
                <button key={v} type="button"
                  onClick={() => f('status', v)}
                  className={['flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all', form.status === v ? cls : 'border-slate-200 text-slate-500 hover:border-slate-300'].join(' ')}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Espèce */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Type d'animal *</label>
            <div className="flex gap-2 flex-wrap">
              {([
                { v: 'dog',    l: 'Chien' },
                { v: 'cat',    l: 'Chat' },
                { v: 'bird',   l: 'Oiseau' },
                { v: 'rabbit', l: 'Lapin' },
                { v: 'other',  l: 'Autre' },
              ] as const).map(({ v, l }) => (
                <button key={v} type="button"
                  onClick={() => f('species', v)}
                  className={['px-3 py-2 rounded-xl border text-sm font-medium transition-all', form.species === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'].join(' ')}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Nom + Âge */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Nom *</label>
              <input value={form.name ?? ''} onChange={e => f('name', e.target.value)}
                placeholder="Rex, Mimi…" className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Âge (années) *</label>
              <input type="number" min={0} max={30} value={form.age_years ?? ''}
                onChange={e => f('age_years', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="0" className={inputCls} />
            </div>
          </div>

          {/* Sexe */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Sexe *</label>
            <div className="flex gap-2">
              {([
                { v: 'male',    l: 'Mâle' },
                { v: 'female',  l: 'Femelle' },
                { v: 'unknown', l: 'Inconnu' },
              ] as const).map(({ v, l }) => (
                <button key={v} type="button"
                  onClick={() => f('gender', v)}
                  className={['flex-1 py-2 rounded-xl border text-sm font-medium transition-all', form.gender === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'].join(' ')}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Couleur */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Couleur / Robe *</label>
            <input value={form.color ?? ''} onChange={e => f('color', e.target.value)}
              placeholder="Noir et blanc, tigré gris…" className={inputCls} />
          </div>

          {/* Signes particuliers */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Signes particuliers *</label>
            <textarea value={form.specific_signs ?? ''} onChange={e => f('specific_signs', e.target.value)}
              rows={3} placeholder="Collier rouge, tache sur l'œil, queue coupée…"
              className={`${inputCls} resize-none`} />
          </div>

          {/* ICAD */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">N° ICAD / Puce (optionnel)</label>
            <input value={form.microchip_icad ?? ''} onChange={e => f('microchip_icad', e.target.value)}
              placeholder="250268500000000" className={inputCls} />
          </div>

          {/* Commune */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Commune *</label>
            <select value={form.location_city} onChange={e => f('location_city', e.target.value)}
              className={inputCls}>
              <option value="">Sélectionner une commune</option>
              {COMMUNES_974.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          {/* Photos actuelles */}
          {form.photos.length > 0 && (
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Photos soumises</label>
              <div className="flex gap-2 flex-wrap">
                {form.photos.map((p, i) => (
                  <div key={i} className="relative group">
                    <img src={p} alt="" className="h-20 w-20 rounded-xl object-cover border border-slate-200" />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded">Principale</span>
                    )}
                    <button type="button"
                      onClick={() => f('photos', form.photos.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-3 text-sm font-semibold hover:bg-slate-50 transition-colors">
              Annuler
            </button>
            <button type="button" onClick={handleSave} disabled={saving || saved}
              className={['flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors', saved ? 'bg-green-500 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60'].join(' ')}>
              {saved ? <><Check className="h-4 w-4" /> Enregistré !</> : saving ? 'Enregistrement…' : <><Save className="h-4 w-4" /> Enregistrer</>}
            </button>
          </div>

          <p className="text-xs text-center text-slate-400">
            ⚠️ Toute modification repasse en modération avant publication.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function MonEspacePage() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [tab,         setTab]         = useState<'annonces' | 'favoris'>('annonces')
  const [editProfile, setEditProfile] = useState(false)
  const [editAnimal,  setEditAnimal]  = useState<StoredAnimal | null>(null)
  const [myAnimals,   setMyAnimals]   = useState<StoredAnimal[]>([])

  useEffect(() => {
    if (!loading && !user) router.push('/connexion')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetch(`/api/animals?author=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then((data: StoredAnimal[]) => Array.isArray(data) ? setMyAnimals(data) : null)
      .catch(() => {})
  }, [user])

  if (loading || !user) {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <PawPrint className="h-10 w-10 text-slate-200 animate-pulse" />
      </main>
    )
  }

  const initials = user.name.split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2)

  const handleDeleteAnimal = async (id: string) => {
    if (!confirm('Supprimer cette annonce ?')) return
    await fetch(`/api/animals/${id}`, { method: 'DELETE' }).catch(() => {})
    setMyAnimals(prev => prev.filter(a => a.id !== id))
  }

  const handleAnimalSaved = (updated: StoredAnimal) => {
    setMyAnimals(prev => prev.map(a => a.id === updated.id ? { ...updated, moderation_status: 'pending' } : a))
  }

  const MY_FAVORITES = [
    { id: '1', status: 'to_adopt', name: 'Rex', species: 'dog', location_city: 'Saint-Denis' },
  ]

  return (
    <>
      {editProfile && <ProfileEditor onClose={() => setEditProfile(false)} />}
      {editAnimal  && (
        <AnimalEditor
          animal={editAnimal}
          onClose={() => setEditAnimal(null)}
          onSaved={handleAnimalSaved}
        />
      )}

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Profil */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                {user.avatar
                  ? <img src={user.avatar} alt="avatar" className="w-14 h-14 rounded-full object-cover border-2 border-emerald-200" />
                  : <div className="bg-emerald-100 text-emerald-700 rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl">{initials}</div>
                }
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">{user.name}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
                {user.city && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{user.city}</p>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setEditProfile(true)}
                className="flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-600 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
                <Edit className="h-4 w-4" /> Modifier
              </button>
              <button onClick={() => { logout(); router.push('/') }}
                className="flex items-center gap-1.5 border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {user.phone && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs text-amber-700 flex items-center gap-2">
              🔒 Votre téléphone est enregistré mais <strong>jamais affiché publiquement</strong>.
            </div>
          )}
        </div>

        {/* Onglets */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {([
            { v: 'annonces' as const, l: `Mes annonces (${myAnimals.length})` },
            { v: 'favoris'  as const, l: `Mes favoris (${MY_FAVORITES.length})` },
          ]).map(({ v, l }) => (
            <button key={v} onClick={() => setTab(v)}
              className={['flex-1 py-2 rounded-lg text-sm font-medium transition-all', tab === v ? 'bg-white shadow text-slate-900' : 'text-slate-500'].join(' ')}>
              {l}
            </button>
          ))}
        </div>

        {/* Mes annonces */}
        {tab === 'annonces' && (
          <div className="space-y-3">
            <Link href="/animaux/nouveau"
              className="flex items-center justify-center gap-2 border-2 border-dashed border-emerald-300 bg-emerald-50 text-emerald-700 rounded-2xl py-4 text-sm font-semibold hover:bg-emerald-100 transition-colors">
              <Plus className="h-4 w-4" /> Publier une nouvelle annonce
            </Link>

            {myAnimals.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <PawPrint className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium">Aucune annonce pour l'instant</p>
                <p className="text-sm mt-1">Publiez votre première annonce en cliquant ci-dessus</p>
              </div>
            ) : (
              myAnimals.map(a => (
                <div key={a.id} className={[
                  'bg-white border rounded-2xl p-4 flex items-center gap-4',
                  a.moderation_status === 'approved' ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200',
                ].join(' ')}>
                  {/* Photo ou icône espèce */}
                  <div className="text-3xl bg-slate-50 rounded-xl h-14 w-14 flex items-center justify-center shrink-0 overflow-hidden">
                    {a.photos[0]
                      ? <img src={a.photos[0]} alt="" className="w-full h-full object-cover" />
                      : SPECIES_ICON[a.species] ?? '🐾'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900">{a.name ?? 'Animal inconnu'}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[a.status] ?? ''}`}>
                        {STATUS_LABEL[a.status] ?? a.status}
                      </span>
                      {a.moderation_status === 'approved'
                        ? <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700">✓ Publiée</span>
                        : a.moderation_status === 'rejected'
                        ? <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700">✗ Refusée</span>
                        : <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700">⏳ En modération</span>
                      }
                      {a.boosted && <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700">⚡ Boostée</span>}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />{a.location_city}
                      <span className="mx-1">·</span>
                      <Clock className="h-3 w-3" />{timeAgo(a.created_at)}
                    </p>
                    {a.color && <p className="text-xs text-slate-400 mt-0.5 truncate">{a.color}{a.specific_signs ? ` · ${a.specific_signs}` : ''}</p>}
                  </div>

                  <div className="flex gap-1 shrink-0 flex-col sm:flex-row">
                    <Link href={`/animaux/${a.id}`}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-emerald-600 transition-colors"
                      title="Voir l'annonce">
                      <PawPrint className="h-4 w-4" />
                    </Link>
                    <button onClick={() => setEditAnimal(a)}
                      className="p-2 rounded-xl border border-emerald-100 hover:bg-emerald-50 text-emerald-500 transition-colors"
                      title="Modifier l'annonce">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteAnimal(a.id)}
                      className="p-2 rounded-xl border border-red-100 hover:bg-red-50 text-red-400 transition-colors"
                      title="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Mes favoris */}
        {tab === 'favoris' && (
          <div className="space-y-3">
            {MY_FAVORITES.map(a => (
              <Link key={a.id} href={`/animaux/${a.id}`}
                className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-sm transition-shadow">
                <div className="text-3xl bg-slate-50 rounded-xl h-14 w-14 flex items-center justify-center shrink-0">
                  {SPECIES_ICON[a.species] ?? '🐾'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{a.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />{a.location_city}
                  </p>
                </div>
                <Heart className="h-5 w-5 text-red-400 fill-red-400 shrink-0" />
              </Link>
            ))}
          </div>
        )}

      </main>
    </>
  )
}
