'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Clock, MapPin, CheckCircle2, AlertCircle, PawPrint } from 'lucide-react'
import type { PublicAnimal, AdoptionRequest } from '@/types'

interface AdoptionCardProps {
  animal: PublicAnimal
  request?: AdoptionRequest   // injecté si l'utilisateur a une demande active
  onAdopt?: () => void
}

function useCoolOffCountdown(coolOffEndsAt?: string) {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (!coolOffEndsAt) return
    const end = new Date(coolOffEndsAt).getTime()

    const tick = () => setRemaining(Math.max(0, end - Date.now()))
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [coolOffEndsAt])

  return remaining
}

function formatCountdown(ms: number) {
  const days  = Math.floor(ms / 86_400_000)
  const hours = Math.floor((ms % 86_400_000) / 3_600_000)
  if (days > 0) return `${days}j ${hours}h restants`
  return `${hours}h restantes`
}

const SPECIES_EMOJI: Record<string, string> = {
  dog: '🐕', cat: '🐈', bird: '🐦', rabbit: '🐇', other: '🐾',
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  lost:     { label: 'Perdu',      className: 'bg-red-100 text-red-700' },
  found:    { label: 'Trouvé',     className: 'bg-amber-100 text-amber-700' },
  to_adopt: { label: 'À adopter',  className: 'bg-emerald-100 text-emerald-700' },
  adopted:  { label: 'Adopté ✓',  className: 'bg-slate-100 text-slate-500' },
}

export function AdoptionCard({ animal, request, onAdopt }: AdoptionCardProps) {
  const coolOff = useCoolOffCountdown(request?.cool_off_ends_at)
  const inCoolOff = coolOff !== null && coolOff > 0
  const certSigned = Boolean(request?.certificate_signed_at)
  const badge = STATUS_BADGE[animal.status] ?? STATUS_BADGE.found
  const isAdoptable = animal.status === 'to_adopt'

  return (
    <article className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="relative h-48 bg-slate-100">
        {animal.photos[0] ? (
          <Image
            src={animal.photos[0]}
            alt={animal.name ?? 'Animal'}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">
            {SPECIES_EMOJI[animal.species] ?? '🐾'}
          </div>
        )}
        {/* Badge statut */}
        <span className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {/* Contenu */}
      <div className="flex flex-col flex-1 p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-base">
            {animal.name ?? 'Identité inconnue'}
          </h3>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="h-3.5 w-3.5" />
            {animal.location_city}
            {animal.age_years !== undefined && ` · ${animal.age_years} an${animal.age_years > 1 ? 's' : ''}`}
          </p>
        </div>

        {animal.specific_signs && (
          <p className="text-sm text-slate-600 line-clamp-2">{animal.specific_signs}</p>
        )}

        {/* Countdown délai légal de réflexion (J+7) */}
        {certSigned && (
          <div className={[
            'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium',
            inCoolOff
              ? 'bg-amber-50 text-amber-700'
              : 'bg-emerald-50 text-emerald-700',
          ].join(' ')}>
            {inCoolOff ? (
              <>
                <Clock className="h-4 w-4 shrink-0" />
                <span>
                  Délai de réflexion : {coolOff !== null ? formatCountdown(coolOff) : '…'}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Délai légal écoulé — adoption finalisable</span>
              </>
            )}
          </div>
        )}

        {/* CTA */}
        {isAdoptable && (
          <div className="mt-auto pt-2">
            {!request ? (
              <button
                onClick={onAdopt}
                className="w-full rounded-xl bg-emerald-600 text-white py-2.5 text-sm font-semibold hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <PawPrint className="h-4 w-4" />
                Faire une demande d'adoption
              </button>
            ) : inCoolOff ? (
              <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                Demande en cours — délai de réflexion actif
              </p>
            ) : !certSigned ? (
              <button className="w-full rounded-xl border-2 border-emerald-600 text-emerald-700 py-2.5 text-sm font-semibold hover:bg-emerald-50 transition-colors">
                Signer le certificat d'engagement
              </button>
            ) : (
              <button className="w-full rounded-xl bg-emerald-600 text-white py-2.5 text-sm font-semibold hover:bg-emerald-700 transition-colors">
                Finaliser l'adoption
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
