import { ModerationDashboard } from '@/components/admin/ModerationDashboard'

const MOCK_PENDING = [
  {
    id: 'm1',
    status: 'to_adopt' as const,
    species: 'dog' as const,
    gender: 'male' as const,
    name: 'Caramel',
    age_years: 1,
    specific_signs: 'Chiot croisé, trouvé abandonné route des Plaines.',
    color: 'Caramel',
    photos: [],
    location_city: 'La Plaine-des-Palmistes',
    moderation_status: 'pending' as const,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    author_name: 'Marie Dupont',
    author_email: 'marie@example.re',
  },
  {
    id: 'm2',
    status: 'lost' as const,
    species: 'cat' as const,
    gender: 'female' as const,
    name: 'Luna',
    specific_signs: 'Chatte noire, disparue depuis 3 jours quartier Sainte-Clotilde.',
    color: 'Noire',
    photos: [],
    location_city: 'Saint-Denis',
    moderation_status: 'pending' as const,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    author_name: 'Paul Martin',
    author_email: 'paul@example.re',
  },
]

async function approve(id: string) {
  'use server'
  console.log('approve', id)
}

async function reject(id: string, reason: string) {
  'use server'
  console.log('reject', id, reason)
}

export default function ModerationPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <ModerationDashboard
        items={MOCK_PENDING}
        onApprove={approve}
        onReject={reject}
      />
    </main>
  )
}
