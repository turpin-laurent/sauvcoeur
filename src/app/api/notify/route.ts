import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { animalName, species, city, status, authorName, authorEmail } = await req.json()

    const statusLabel: Record<string, string> = {
      lost: 'Animal perdu', found: 'Animal trouvé', to_adopt: 'À adopter',
    }
    const speciesLabel: Record<string, string> = {
      dog: 'Chien', cat: 'Chat', bird: 'Oiseau', rabbit: 'Lapin', other: 'Autre',
    }

    const subject = `[SauvCœur] Nouvelle annonce : ${animalName ?? 'Animal'} (${statusLabel[status] ?? status})`
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#10b981;padding:20px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:20px">🐾 Nouvelle annonce sur SauvCœur.re</h1>
        </div>
        <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Statut</td><td style="padding:8px 0;font-weight:600">${statusLabel[status] ?? status}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Type</td><td style="padding:8px 0;font-weight:600">${speciesLabel[species] ?? species}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Nom</td><td style="padding:8px 0;font-weight:600">${animalName ?? '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Commune</td><td style="padding:8px 0;font-weight:600">${city}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Auteur</td><td style="padding:8px 0;font-weight:600">${authorName} (${authorEmail})</td></tr>
          </table>
          <p style="margin-top:20px">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sauvcoeur.re'}/manage"
               style="background:#10b981;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
              Modérer l'annonce →
            </a>
          </p>
          <p style="color:#94a3b8;font-size:12px;margin-top:16px">
            Cet email est envoyé automatiquement par SauvCœur.re
          </p>
        </div>
      </div>
    `

    // Envoi via Resend (si RESEND_API_KEY configurée)
    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? 'noreply@sauvcoeur.re',
          to: ['sauvcoeur974@gmail.com'],
          subject,
          html,
        }),
      })
    } else {
      // Log en développement si pas de clé API
      console.log('[NOTIFY] Nouvelle annonce:', { animalName, species, city, status, authorName, authorEmail })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[NOTIFY] Error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
