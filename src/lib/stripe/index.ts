import Stripe from 'stripe'

// Initialisation lazy pour éviter l'erreur au build si STRIPE_SECRET_KEY n'est pas défini
const stripeKey = process.env.STRIPE_SECRET_KEY ?? 'sk_placeholder_not_configured'

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2026-04-22.dahlia',
})

/**
 * Plans tarifaires SauvCoeur Pro :
 *
 * - VET (vétérinaire)  : 0 €/mois — apparaissent en tête en vertu de leur
 *   utilité pour la cause animale, SANS label "Publicité" (respect de la
 *   déontologie vétérinaire — Ordre National des Vétérinaires).
 *   sort_boost = 100 ; pas d'abonnement Stripe requis.
 *
 * - PRO_VERIFIED : 19 €/mois — badge "Pro Vérifié", visibilité améliorée.
 *   sort_boost = 10.
 *
 * Note : les vétérinaires ne "paient" pas pour leur position — leur priorité
 * est déterminée par leur catégorie, pas par un achat.
 */
export const STRIPE_PLANS = {
  PRO_MONTHLY: process.env.STRIPE_PRO_PRICE_ID!,   // 19 €/mois
  PRO_YEARLY:  process.env.STRIPE_PRO_YEARLY_ID!,  // 179 €/an
} as const

export async function createProCheckoutSession({
  proId,
  email,
  priceId,
  successUrl,
  cancelUrl,
}: {
  proId: string
  email: string
  priceId: string
  successUrl: string
  cancelUrl: string
}) {
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { pro_id: proId },
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: { pro_id: proId },
    },
  })
}

export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}
