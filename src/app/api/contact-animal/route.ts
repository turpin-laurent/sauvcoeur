import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

async function sendViaResend(payload: object) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await res.text())
}

export async function POST(req: NextRequest) {
  try {
    const {
      senderName, senderPhone, senderEmail,
      message, animalName, animalStatus, animalCity,
      ownerEmail, animalId,
    } = await req.json()

    if (!senderName || !senderPhone || !message || !ownerEmail) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const statusLabel: Record<string, string> = {
      lost: 'Animal perdu', found: 'Animal trouvé', to_adopt: 'À adopter',
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sauvcoeur.re'

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#10b981;padding:20px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:20px">🐾 Quelqu'un vous a contacté via SauvCœur.re</h1>
        </div>
        <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px">
          <p style="font-size:15px;color:#334155">
            Bonjour,<br/><br/>
            Une personne a lu votre annonce <strong>${statusLabel[animalStatus] ?? ''}</strong> concernant
            <strong>${animalName ?? 'votre animal'}</strong> à <strong>${animalCity}</strong>
            et souhaite vous contacter.
          </p>
          <div style="background:white;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:16px 0">
            <p style="color:#64748b;font-size:12px;margin:0 0 12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Coordonnées de la personne</p>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:6px 0;color:#64748b;font-size:14px;width:80px">Nom</td><td style="font-weight:600;font-size:14px">${senderName}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;font-size:14px">Téléphone</td><td style="font-weight:600;font-size:14px">${senderPhone}</td></tr>
              ${senderEmail ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px">Email</td><td style="font-weight:600;font-size:14px">${senderEmail}</td></tr>` : ''}
            </table>
          </div>
          <div style="background:white;border:1px solid #e2e8f0;border-radius:10px;padding:16px">
            <p style="color:#64748b;font-size:12px;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Message</p>
            <p style="margin:0;white-space:pre-wrap;font-size:15px">${message}</p>
          </div>
          <p style="margin-top:20px">
            <a href="${siteUrl}/animaux/${animalId}"
               style="background:#10b981;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
              Voir votre annonce →
            </a>
          </p>
          <p style="color:#94a3b8;font-size:12px;margin-top:16px">
            Cet email est envoyé automatiquement par SauvCœur.re. Ne pas répondre à cet email — contactez directement la personne via les coordonnées ci-dessus.
          </p>
        </div>
      </div>
    `

    if (process.env.RESEND_API_KEY) {
      await sendViaResend({
        from: process.env.EMAIL_FROM ?? 'noreply@sauvcoeur.re',
        to: [ownerEmail],
        subject: `[SauvCœur] ${senderName} vous a contacté pour votre annonce "${animalName ?? 'votre animal'}"`,
        html,
      })
    } else {
      console.log('[CONTACT-ANIMAL] Pas de RESEND_API_KEY — email simulé:', { senderName, senderPhone, ownerEmail })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[CONTACT-ANIMAL] Error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
