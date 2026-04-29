'use client'

import { useEffect, useRef } from 'react'
import { COMMUNES_974 } from '@/lib/geo/communes974'

interface MapAnimal {
  id: string
  name?: string
  status: 'lost' | 'found' | 'to_adopt'
  species: string
  location_city: string
}

const STATUS_COLOR: Record<string, string> = {
  lost:     '#ef4444',
  found:    '#f59e0b',
  to_adopt: '#10b981',
}
const STATUS_LABEL: Record<string, string> = {
  lost: 'Perdu', found: 'Trouvé', to_adopt: 'À adopter',
}
const SPECIES_ICON: Record<string, string> = {
  dog: '🐕', cat: '🐱', bird: '🐦', rabbit: '🐰', other: '🐾',
}

interface ReunionMapProps {
  animals?: MapAnimal[]
  filter?: 'lost' | 'found' | 'to_adopt' | 'all'
  height?: string
}

export default function ReunionMap({ animals = [], filter = 'all', height = '400px' }: ReunionMapProps) {
  const mapRef  = useRef<HTMLDivElement>(null)
  const mapInst = useRef<any>(null)

  // Animaux mock géocodés par commune
  const MOCK_ANIMALS: MapAnimal[] = [
    { id: '2', name: 'Mimi',   status: 'lost',     species: 'cat', location_city: 'Le Tampon' },
    { id: '3',                  status: 'found',    species: 'dog', location_city: 'Saint-Paul' },
    { id: '1', name: 'Rex',    status: 'to_adopt', species: 'dog', location_city: 'Saint-Denis' },
    { id: '4', name: 'Luna',   status: 'to_adopt', species: 'cat', location_city: 'Saint-Pierre' },
  ]

  const data = (animals.length > 0 ? animals : MOCK_ANIMALS).filter(a =>
    filter === 'all' || a.status === filter
  )

  useEffect(() => {
    if (!mapRef.current || mapInst.current) return
    // Guard contre la double initialisation Leaflet (React StrictMode)
    if ((mapRef.current as any)._leaflet_id) return

    // Import dynamique pour éviter SSR
    import('leaflet').then(L => {
      // Re-vérifier après le await de l'import (unmount possible entre-temps)
      if (!mapRef.current || mapInst.current) return
      if ((mapRef.current as any)._leaflet_id) return

      // Fix icônes Leaflet avec Webpack/Next
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center:    [-21.115, 55.536],
        zoom:      10,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      mapInst.current = map

      // Ajouter les marqueurs
      data.forEach(animal => {
        const commune = COMMUNES_974.find(c => c.name === animal.location_city)
        if (!commune) return

        const color = STATUS_COLOR[animal.status] ?? '#64748b'
        const icon  = SPECIES_ICON[animal.species] ?? '🐾'

        const marker = L.divIcon({
          html: `<div style="background:${color};color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)">${icon}</div>`,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        })

        L.marker([commune.lat, commune.lng], { icon: marker })
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:140px">
              <p style="font-weight:700;margin:0 0 4px">${animal.name ?? 'Animal inconnu'}</p>
              <span style="background:${color};color:white;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600">${STATUS_LABEL[animal.status]}</span>
              <p style="color:#64748b;font-size:12px;margin:6px 0 0">${commune.name}</p>
              <a href="/animaux/${animal.id}" style="color:#10b981;font-size:12px;font-weight:600">Voir l'annonce →</a>
            </div>
          `)
          .addTo(map)
      })
    })

    // Charger le CSS Leaflet
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id   = 'leaflet-css'
      link.rel  = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    return () => {
      mapInst.current?.remove()
      mapInst.current = null
    }
  }, [])

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      <div ref={mapRef} className="w-full h-full z-0" />
    </div>
  )
}
