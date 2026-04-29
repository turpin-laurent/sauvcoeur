'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQ = [
  {
    category: 'Animaux perdus & trouvés',
    questions: [
      {
        q: "Mon animal vient de disparaître, que faire en premier ?",
        a: "Publiez immédiatement une annonce sur SauvCœur.re avec une photo récente, la date et le lieu de disparition, et vos coordonnées. Partagez l'annonce sur les groupes Facebook locaux. Contactez également les mairies, fourrières, refuges et cliniques vétérinaires de votre commune."
      },
      {
        q: "J'ai trouvé un animal, quelles sont mes obligations légales ?",
        a: "En France, tout animal trouvé doit être déclaré à la mairie ou à la fourrière de la commune dans les 24h. Vous pouvez le garder provisoirement sous votre garde, mais vous devez le signaler. Publiez également une annonce sur SauvCœur.re pour permettre au propriétaire de vous retrouver."
      },
      {
        q: "Comment vérifier si un animal a une puce électronique ?",
        a: "Amenez l'animal chez un vétérinaire ou une fourrière : ils peuvent lire la puce I-CAD gratuitement. Le numéro I-CAD (15 chiffres) permet d'identifier le propriétaire via le fichier national d'identification des carnivores domestiques."
      },
      {
        q: "Mon annonce n'est pas encore visible, pourquoi ?",
        a: "Toutes les annonces sont vérifiées par notre équipe avant publication pour garantir la qualité et la sécurité de la plateforme. Ce processus prend généralement moins de 24h. Vous recevrez un email de confirmation dès la publication."
      },
    ]
  },
  {
    category: 'Adoption',
    questions: [
      {
        q: "Quelle est la procédure d'adoption sur SauvCœur.re ?",
        a: "1. Consultez les animaux à adopter. 2. Cliquez sur 'Faire une demande d'adoption'. 3. Remplissez votre profil et signez le certificat d'engagement. 4. Un délai légal de réflexion de 7 jours s'applique. 5. L'adoption est finalisée après ce délai."
      },
      {
        q: "Qu'est-ce que le délai de réflexion de 7 jours ?",
        a: "La loi française impose un délai de 7 jours entre la signature du certificat d'engagement et la remise définitive de l'animal. Ce délai protège l'adoptant et l'animal en permettant une réflexion approfondie."
      },
      {
        q: "Qu'est-ce que le certificat d'engagement ?",
        a: "C'est un document obligatoire (article L214-8 du Code rural) que tout adoptant doit signer. Il atteste que l'adoptant connaît les besoins de l'animal et s'engage à les respecter. Ce document est requis pour tout animal de compagnie."
      },
      {
        q: "Est-il possible d'adopter si je suis locataire ?",
        a: "Légalement, oui. La loi interdit aux propriétaires d'inclure des clauses anti-animaux dans les baux depuis 1999. Cependant, certains propriétaires peuvent s'y opposer pour les chiens de grande taille. Vérifiez votre bail avant d'adopter."
      },
    ]
  },
  {
    category: 'Compte & Annonces',
    questions: [
      {
        q: "Comment créer un compte ?",
        a: "Cliquez sur 'Connexion' dans le menu, puis sur l'onglet 'Inscription'. Renseignez votre email, créez un mot de passe et validez votre email via le lien de confirmation. L'inscription est gratuite."
      },
      {
        q: "Comment modifier ou supprimer mon annonce ?",
        a: "Connectez-vous à votre compte, rendez-vous dans 'Mon espace' > 'Mes annonces'. Vous pouvez modifier ou supprimer vos annonces à tout moment."
      },
      {
        q: "Comment signaler une annonce suspecte ?",
        a: "Utilisez le bouton 'Signaler' sur chaque annonce, ou contactez-nous directement à sauvcoeur974@gmail.com. Notre équipe traite les signalements sous 24h."
      },
    ]
  },
  {
    category: 'Annuaire professionnel',
    questions: [
      {
        q: "Comment référencer mon cabinet vétérinaire ou mon activité ?",
        a: "Créez un compte professionnel et soumettez votre demande d'inscription dans l'annuaire. Les vétérinaires sont référencés gratuitement. Les autres professionnels (pet-sitter, éducateur, toiletteur) peuvent bénéficier du badge 'Pro Vérifié' via un abonnement."
      },
      {
        q: "Pourquoi les vétérinaires apparaissent-ils en premier ?",
        a: "Les vétérinaires sont affichés en priorité en raison de leur rôle central dans la santé animale. Ce classement est basé sur leur catégorie professionnelle, pas sur un achat, conformément à la déontologie vétérinaire."
      },
    ]
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-medium text-slate-900 pr-4">{q}</span>
        <ChevronDown className={`h-5 w-5 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
          {a}
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Questions fréquentes</h1>
        <p className="text-slate-500 mt-2">
          Toutes les réponses sur SauvCœur.re et la cause animale à La Réunion.
        </p>
      </div>

      {FAQ.map(({ category, questions }) => (
        <section key={category} className="space-y-3">
          <h2 className="font-bold text-emerald-700 text-sm uppercase tracking-wide">{category}</h2>
          <div className="space-y-2">
            {questions.map(({ q, a }) => (
              <FAQItem key={q} q={q} a={a} />
            ))}
          </div>
        </section>
      ))}

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
        <p className="font-semibold text-slate-900">Vous n'avez pas trouvé votre réponse ?</p>
        <p className="text-sm text-slate-500">Notre équipe vous répond sous 48h</p>
        <a href="mailto:sauvcoeur974@gmail.com"
          className="inline-block mt-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
          Contactez-nous
        </a>
      </div>
    </main>
  )
}
