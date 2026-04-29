interface RejectionEmailParams {
  to: string
  authorName: string
  animalName: string
  reason: string
}

/**
 * Envoie le mail de refus de modération via Resend (ou tout autre provider).
 * Remplacer le body fetch par l'SDK de votre provider.
 */
export async function sendRejectionEmail({ to, authorName, animalName, reason }: RejectionEmailParams) {
  const body = {
    from: process.env.EMAIL_FROM,
    to,
    subject: `SauvCoeur.re — Votre annonce pour "${animalName}" n'a pas été publiée`,
    html: `
      <p>Bonjour ${authorName},</p>
      <p>
        Après examen, votre annonce concernant <strong>${animalName}</strong>
        n'a pas pu être publiée sur SauvCoeur.re pour la raison suivante :
      </p>
      <blockquote style="border-left:3px solid #e2e8f0;padding:8px 16px;color:#64748b">
        ${reason}
      </blockquote>
      <p>
        Vous pouvez corriger votre annonce et la soumettre à nouveau.
        Si vous estimez que ce refus est une erreur, contactez-nous à
        <a href="mailto:contact@sauvcoeur.re">contact@sauvcoeur.re</a>.
      </p>
      <p>L'équipe SauvCoeur.re</p>
    `,
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify(body),
  })
}
