'use client'

import { useState } from 'react'
import { Mail, MessageCircle, CheckCircle2 } from 'lucide-react'

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Nous contacter</h1>
        <p className="text-slate-500 mt-2">Une question, un signalement, un partenariat ? On vous répond sous 48h.</p>
      </div>

      {/* Email direct */}
      <a href="mailto:sauvcoeur974@gmail.com"
        className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 hover:bg-emerald-100 transition-colors group">
        <div className="bg-emerald-600 text-white rounded-xl p-2">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">Email direct</p>
          <p className="text-sm text-emerald-600 group-hover:underline">sauvcoeur974@gmail.com</p>
        </div>
      </a>

      {/* Formulaire */}
      {sent ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-2">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
          <p className="font-bold text-slate-900">Message envoyé !</p>
          <p className="text-sm text-slate-500">Nous vous répondrons à <strong>{form.email}</strong> sous 48h.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <p className="font-semibold text-slate-800 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-emerald-500" /> Formulaire de contact
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Nom *</label>
              <input required type="text" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Marie Dupont" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Email *</label>
              <input required type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="vous@exemple.re" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Sujet</label>
            <select value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Choisir un sujet</option>
              <option>Signalement d'une annonce</option>
              <option>Problème technique</option>
              <option>Partenariat / Association</option>
              <option>Annuaire professionnel</option>
              <option>Autre</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Message *</label>
            <textarea required rows={5} value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              placeholder="Décrivez votre demande…" />
          </div>
          <button type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors">
            Envoyer le message
          </button>
        </form>
      )}
    </main>
  )
}
