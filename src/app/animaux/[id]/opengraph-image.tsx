import { ImageResponse } from 'next/og'

export const runtime     = 'edge'
export const alt         = 'SauvCœur.re — Cause animale à La Réunion'
export const size        = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Image OG générée côté serveur (Edge) pour chaque annonce.
// Les données animal étant en localStorage, on génère une image
// brandée SauvCœur.re qui s'affiche sur FB / WA / Twitter.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #064e3b 0%, #059669 55%, #10b981 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Pattern de pattes en fond (pseudo-éléments simulés) */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', flexWrap: 'wrap', gap: 60, padding: 40,
          opacity: 0.06,
          fontSize: 48,
        }}>
          {Array.from({ length: 35 }).map((_, i) => (
            <span key={i}>🐾</span>
          ))}
        </div>

        {/* Contenu principal */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
          {/* Icône */}
          <div style={{
            width: 100, height: 100,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 28,
            fontSize: 56,
          }}>
            🐾
          </div>

          {/* Logo texte */}
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 0,
            fontSize: 72, fontWeight: 'bold', color: 'white',
            letterSpacing: '-1px',
          }}>
            <span>Sauv</span>
            <span style={{ color: '#6ee7b7' }}>Cœur</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 48 }}>.re</span>
          </div>

          {/* Tagline */}
          <div style={{
            marginTop: 16,
            color: '#a7f3d0',
            fontSize: 28,
            textAlign: 'center',
            maxWidth: 780,
            lineHeight: 1.4,
          }}>
            La 1ère plateforme réunionnaise pour retrouver,
            signaler et adopter les animaux
          </div>

          {/* Pill d'appel à l'action */}
          <div style={{
            marginTop: 44,
            background: 'rgba(255,255,255,0.18)',
            border: '2px solid rgba(255,255,255,0.35)',
            borderRadius: 50,
            padding: '14px 40px',
            color: 'white',
            fontSize: 24,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <span>🔍</span>
            <span>Perdu · Trouvé · À adopter</span>
            <span>❤️</span>
          </div>
        </div>

        {/* Badge île de La Réunion */}
        <div style={{
          position: 'absolute', bottom: 32, right: 40,
          background: 'rgba(0,0,0,0.25)',
          borderRadius: 12,
          padding: '8px 20px',
          color: 'rgba(255,255,255,0.8)',
          fontSize: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          🏝️ La Réunion — 974
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
