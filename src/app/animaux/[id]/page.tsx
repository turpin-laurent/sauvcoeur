import type { Metadata } from 'next'
import AnimalDetailClient from './AnimalDetailClient'

const BASE_URL = 'https://www.sauvcoeur.re'

// ── Open Graph metadata ───────────────────────────────────────
// Note : les données animaux sont en localStorage (client-only).
// On génère donc des OG tags brandés SauvCœur.re qui s'affichent
// correctement sur Facebook, WhatsApp, Twitter etc.
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const pageUrl  = `${BASE_URL}/animaux/${id}`
  const ogImage  = `${BASE_URL}/animaux/${id}/opengraph-image`

  return {
    title: 'SauvCœur.re — Annonce animale à La Réunion',
    description:
      'Retrouvez cette annonce sur SauvCœur.re, la 1ère plateforme réunionnaise pour retrouver, signaler, adopter et accompagner les animaux.',
    openGraph: {
      title: '🐾 SauvCœur.re — Aidez-nous à retrouver cet animal !',
      description:
        'Animaux perdus, trouvés et à adopter à La Réunion. Partagez cette annonce pour aider !',
      url: pageUrl,
      siteName: 'SauvCœur.re',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'SauvCœur.re — La cause animale à La Réunion',
        },
      ],
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: '🐾 SauvCœur.re — Annonce animale à La Réunion',
      description: 'Animaux perdus, trouvés et à adopter à La Réunion.',
      images: [ogImage],
    },
    alternates: { canonical: pageUrl },
  }
}

// ── Page (rendu côté client via AnimalDetailClient) ───────────
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <AnimalDetailClient params={params} />
}
