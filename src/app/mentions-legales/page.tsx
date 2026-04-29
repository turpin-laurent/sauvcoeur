export default function MentionsLegalesPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Mentions légales</h1>

      {[
        {
          title: '1. Éditeur du site',
          content: `SauvCœur.re est une plateforme numérique dédiée à la cause animale à La Réunion (974).
Email de contact : sauvcoeur974@gmail.com
Hébergement : Vercel Inc. / Supabase Inc.`,
        },
        {
          title: '2. Objet du site',
          content: `SauvCœur.re a pour objet de faciliter la mise en relation entre les particuliers, les associations et les professionnels de la cause animale à La Réunion. La plateforme permet de signaler des animaux perdus ou trouvés, de proposer des animaux à l'adoption et de consulter un annuaire de professionnels du secteur.`,
        },
        {
          title: '3. Responsabilité',
          content: `SauvCœur.re agit en tant qu'intermédiaire technique. Les annonces publiées sont soumises à modération, mais l'exactitude des informations fournies relève de la responsabilité de leurs auteurs. SauvCœur.re ne peut être tenu responsable d'éventuelles erreurs ou omissions dans les annonces.`,
        },
        {
          title: '4. Propriété intellectuelle',
          content: `Le contenu du site (textes, logos, graphismes) est protégé par les lois françaises sur la propriété intellectuelle. Toute reproduction totale ou partielle est interdite sans autorisation préalable.`,
        },
        {
          title: '5. Données personnelles (RGPD)',
          content: `Les données collectées (nom, email, téléphone, localisation approximative) sont utilisées uniquement dans le cadre des services proposés par SauvCœur.re. Elles ne sont jamais revendues à des tiers. Conformément au RGPD et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits : sauvcoeur974@gmail.com.`,
        },
        {
          title: '6. Cookies',
          content: `Le site utilise des cookies techniques nécessaires à son fonctionnement (session, authentification). Aucun cookie publicitaire tiers n'est déposé sans votre consentement explicite.`,
        },
        {
          title: '7. Loi applicable',
          content: `Les présentes mentions légales sont soumises au droit français. Tout litige sera soumis à la compétence exclusive des tribunaux compétents de La Réunion.`,
        },
        {
          title: '8. Contact',
          content: `Pour toute question relative aux présentes mentions légales : sauvcoeur974@gmail.com`,
        },
      ].map(({ title, content }) => (
        <section key={title} className="space-y-2">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm">{content}</p>
        </section>
      ))}

      <p className="text-xs text-slate-400 border-t border-slate-100 pt-6">
        Dernière mise à jour : janvier 2026
      </p>
    </main>
  )
}
