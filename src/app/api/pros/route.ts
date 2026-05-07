import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail, ADMIN_EMAIL, SITE_URL } from '@/lib/email/send'

export const runtime = 'nodejs'

// GET /api/pros — approuvés pour le public, tous pour l'admin
export async function GET(req: NextRequest) {
  try {
    const admin = req.headers.get('x-admin') === '1'
    const sb = supabaseAdmin()

    let query = sb
      .from('sc_pros')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (!admin) query = query.eq('moderation_status', 'approved')

    const { data, error } = await query

    // Si la colonne moderation_status n'existe pas encore (migration pas encore exécutée),
    // on retourne quand même tous les pros pour ne pas casser l'annuaire
    if (error) {
      if (error.message?.includes('moderation_status') || error.code === '42703') {
        console.warn('[API/pros] Colonne moderation_status absente — retour sans filtre')
        const { data: fallback } = await sb
          .from('sc_pros')
          .select('*')
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
        return NextResponse.json(fallback ?? [])
      }
      throw error
    }

    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('[API/pros GET]', err)
    return NextResponse.json([], { status: 500 })
  }
}

// POST /api/pros — inscription pro (toujours pending)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id || !body.business_name || !body.category || !body.city) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Forcer pending sauf si l'admin l'approuve explicitement
    const proData = { ...body, moderation_status: body.moderation_status ?? 'pending' }

    const sb = supabaseAdmin()
    const { error } = await sb.from('sc_pros').upsert(proData, { onConflict: 'id' })
    if (error) throw error

    // Notifier l'admin seulement pour les nouvelles inscriptions (pas les mises à jour admin)
    if (!body.moderation_status || body.moderation_status === 'pending') {
      const catLabel: Record<string, string> = {
        vet: 'Vétérinaire & santé', rescue: 'Association & refuge',
        sitter: 'Garde & pension', education: 'Éducation & comportement',
        groomer: 'Toilettage', shop: 'Animalerie & alimentation', leisure: 'Loisirs & services',
      }

      // Email admin
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `[SauvCœur] Nouveau pro à valider : ${body.business_name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#0f172a;padding:20px;border-radius:12px 12px 0 0">
              <h1 style="color:white;margin:0;font-size:20px">🏢 Nouveau professionnel à valider</h1>
            </div>
            <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px">
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:40%">Établissement</td><td style="padding:8px 0;font-weight:600">${body.business_name}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Responsable</td><td style="padding:8px 0;font-weight:600">${body.contact_name ?? '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Catégorie</td><td style="padding:8px 0;font-weight:600">${catLabel[body.category] ?? body.category}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Commune</td><td style="padding:8px 0;font-weight:600">${body.city}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Téléphone</td><td style="padding:8px 0">${body.phone ?? '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Email</td><td style="padding:8px 0">${body.email ?? '—'}</td></tr>
                ${body.website ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px">Site web</td><td style="padding:8px 0">${body.website}</td></tr>` : ''}
                ${body.description ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px">Description</td><td style="padding:8px 0">${body.description}</td></tr>` : ''}
                <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Type</td><td style="padding:8px 0">${body.is_association ? '🤝 Association (gratuit)' : body.is_featured ? '⭐ En avant (payant)' : '📋 Standard'}</td></tr>
              </table>
              <p style="margin-top:20px">
                <a href="${SITE_URL}/manage?tab=pros"
                   style="background:#0f172a;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
                  Valider dans l'admin →
                </a>
              </p>
            </div>
          </div>
        `,
      })

      // Notification dashboard
      await sb.from('sc_notifications').insert({
        type:    'new_pro',
        title:   `Nouveau pro à valider : ${body.business_name}`,
        message: `${catLabel[body.category] ?? body.category} · ${body.city}${body.contact_name ? ` · ${body.contact_name}` : ''}`,
        data:    { id: body.id, business_name: body.business_name, category: body.category, city: body.city },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API/pros POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
