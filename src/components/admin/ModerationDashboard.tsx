'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { CheckCircle2, XCircle, MapPin, Eye, Clock } from 'lucide-react'
import type { PublicAnimal } from '@/types'

interface ModerationItem extends PublicAnimal {
  author_name: string
  author_email: string
}

interface ModerationDashboardProps {
  items: ModerationItem[]
  onApprove: (id: string) => Promise<void>
  onReject: (id: string, reason: string) => Promise<void>
}

function RelativeTime({ iso }: { iso: string }) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  const d = Math.floor(h / 24)
  const label = d > 0 ? `il y a ${d}j` : h > 0 ? `il y a ${h}h` : "à l'instant"
  return <span className="text-xs text-slate-400">{label}</span>
}

function RejectionModal({
  animal,
  onConfirm,
  onCancel,
}: {
  animal: ModerationItem
  onConfirm: (reason: string) => void
  onCancel: () => void
}) {
  const [reason, setReason] = useState('')
  const PRESETS = [
    'Annonce de vente détectée — interdit sur SauvCoeur.re',
    'Photos manquantes ou de mauvaise qualité',
    "Informations insuffisantes pour identifier l'animal",
    "Doublon d'une annonce existante",
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
        <h2 className="font-semibold text-slate-900">Motif de refus</h2>
        <p className="text-sm text-slate-500">
          Ce motif sera envoyé par email à <strong>{animal.author_email}</strong>.
        </p>
        <div className="space-y-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setReason(p)}
              className={[
                'w-full text-left rounded-xl border px-3 py-2 text-sm transition-colors',
                reason === p
                  ? 'border-red-400 bg-red-50 text-red-700'
                  : 'border-slate-200 hover:bg-slate-50',
              ].join(' ')}
            >
              {p}
            </button>
          ))}
        </div>
        <textarea
          placeholder="Ou saisissez un motif personnalisé…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400 resize-none"
        />
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => reason.trim() && onConfirm(reason.trim())}
            disabled={!reason.trim()}
            className="flex-1 rounded-xl bg-red-600 text-white py-2.5 text-sm font-semibold hover:bg-red-700 disabled:opacity-40 transition-colors"
          >
            Envoyer le refus
          </button>
        </div>
      </div>
    </div>
  )
}

export function ModerationDashboard({ items, onApprove, onReject }: ModerationDashboardProps) {
  const [isPending, startTransition] = useTransition()
  const [rejecting, setRejecting] = useState<ModerationItem | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)

  const handleApprove = (item: ModerationItem) => {
    setActionId(item.id)
    startTransition(async () => {
      await onApprove(item.id)
      setActionId(null)
    })
  }

  const handleReject = (item: ModerationItem, reason: string) => {
    setRejecting(null)
    setActionId(item.id)
    startTransition(async () => {
      await onReject(item.id, reason)
      setActionId(null)
    })
  }

  const pending = items.filter((i) => i.moderation_status === 'pending')

  return (
    <>
      {rejecting && (
        <RejectionModal
          animal={rejecting}
          onConfirm={(reason) => handleReject(rejecting, reason)}
          onCancel={() => setRejecting(null)}
        />
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Modération des annonces</h1>
          <span className="rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-sm font-semibold">
            {pending.length} en attente
          </span>
        </div>

        {pending.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center text-slate-400">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-emerald-300" />
            <p className="font-medium">File de modération vide</p>
          </div>
        )}

        <div className="grid gap-4">
          {pending.map((item) => {
            const busy = isPending && actionId === item.id
            return (
              <div
                key={item.id}
                className={[
                  'rounded-2xl border border-slate-200 bg-white p-4 transition-opacity',
                  busy ? 'opacity-50 pointer-events-none' : '',
                ].join(' ')}
              >
                <div className="flex gap-4">
                  {/* Miniature photo */}
                  <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-slate-100">
                    {item.photos[0] ? (
                      <Image src={item.photos[0]} alt="" fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">🐾</div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.name ?? 'Animal sans nom'}{' '}
                          <span className="text-slate-400 font-normal text-sm">
                            · {item.species}
                          </span>
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {item.location_city}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Clock className="h-3.5 w-3.5 text-slate-300" />
                        <RelativeTime iso={item.created_at} />
                      </div>
                    </div>

                    {item.specific_signs && (
                      <p className="mt-1 text-sm text-slate-600 line-clamp-2">{item.specific_signs}</p>
                    )}

                    <p className="mt-1 text-xs text-slate-400">
                      Par <span className="font-medium text-slate-600">{item.author_name}</span>{' '}
                      ({item.author_email})
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-2 justify-end">
                  <button className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 transition-colors">
                    <Eye className="h-4 w-4 text-slate-400" />
                    Prévisualiser
                  </button>
                  <button
                    onClick={() => setRejecting(item)}
                    className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 font-medium hover:bg-red-100 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    Refuser
                  </button>
                  <button
                    onClick={() => handleApprove(item)}
                    className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm text-white font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approuver
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
