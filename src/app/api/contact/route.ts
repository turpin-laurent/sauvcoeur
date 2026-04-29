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
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#10b981;padding:20px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:20px">📬 Nouveau message via SauvCœur.re</h1>
        </div>
        <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:100px">Nom</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Email</td><td style="padding:8px 0;font-weight:600">${email}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Sujet</td><td style="padding:8px 0;font-weight:600">${subject || '—'}</td></tr>
          </table>
          <div style="margin-top:16px;background:white;border:1px solid #e2e8f0;border-radius:8px;padding:16px">
            <p style="color:#64748b;font-size:12px;margin:0 0 8px">Message :</p>
            <p style="margin:0;white-space:pre-wrap;font-size:15px">${message}</p>
          </div>
          <p style="color:#94a3b8;font-size:12px;margin-top:16px">
            Répondre à : <a href="mailto:${email}">${email}</a>
          </p>
        </div>
      </div>
    `

    if (process.env.RESEND_API_KEY) {
      await sendViaResend({
        from: process.env.EMAIL_FROM ?? 'noreply@sauvcoeur.re',
        to: ['sauvcoeur974@gmail.com'],
        reply_to: email,
        subject: `[SauvCœur] Contact : ${subject || 'Message sans sujet'} — ${name}`,
        html,
      })
    } else {
      console.log('[CONTACT] Pas de RESEND_API_KEY — email simulé:', { name, email, subject, message })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[CONTACT] Error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
