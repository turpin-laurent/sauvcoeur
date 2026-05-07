// ── Helper envoi email via Resend ─────────────────────────────

export async function sendEmail({ to, subject, html }: {
  to: string | string[]
  subject: string
  html: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[EMAIL] Pas de RESEND_API_KEY — email non envoyé:', subject)
    return
  }
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? 'noreply@sauvcoeur.re',
      to:   Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  })
}

export const ADMIN_EMAIL = 'sauvcoeur974@gmail.com'
export const SITE_URL    = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sauvcoeur.re'
