'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface AuthUser {
  id: string
  email: string
  name: string
  city?: string
  phone?: string
  avatar?: string   // data URL ou URL Supabase Storage
  newsletter?: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (name: string, email: string, password: string, newsletter: boolean) => Promise<{ error?: string }>
  updateProfile: (data: Partial<AuthUser>) => void
  logout: () => void
  forgotPassword: (email: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'sauvcoeur_user'
const USERS_KEY   = 'sauvcoeur_users'

function getStoredUser(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') } catch { return null }
}
function getStoredUsers(): Record<string, { name: string; password: string; newsletter: boolean; city?: string; phone?: string; avatar?: string }> {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '{}') } catch { return {} }
}

// Sync profil vers Supabase (sans bloquer l'UX)
function syncUserToSupabase(user: AuthUser, password?: string) {
  fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id:           user.id,
      email:        user.email,
      name:         user.name,
      password_enc: password,
      newsletter:   user.newsletter ?? false,
      city:         user.city,
      phone:        user.phone,
    }),
  }).catch(() => { /* non bloquant */ })
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(getStoredUser())
    setLoading(false)
  }, [])

  const login: AuthContextValue['login'] = async (email, password) => {
    const users = getStoredUsers()
    const key   = email.toLowerCase()

    // 1. Vérifier en localStorage (même navigateur)
    if (users[key]) {
      if (users[key].password !== password) return { error: 'Mot de passe incorrect.' }
      const u: AuthUser = { id: key, email, name: users[key].name, city: users[key].city, phone: users[key].phone, avatar: users[key].avatar, newsletter: users[key].newsletter }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
      setUser(u)
      return {}
    }

    // 2. Vérifier depuis Supabase (autre navigateur / autre appareil)
    try {
      const res  = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, email, name: '', check_only: true }),
      })
      const data = await res.json()
      if (data.exists) {
        if (data.password_enc !== password) return { error: 'Mot de passe incorrect.' }
        // Reconstituer la session locale
        const u: AuthUser = { id: key, email, name: data.name ?? email, newsletter: data.newsletter }
        users[key] = { name: u.name, password, newsletter: data.newsletter ?? false }
        localStorage.setItem(USERS_KEY, JSON.stringify(users))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
        setUser(u)
        return {}
      }
    } catch { /* fallback silencieux */ }

    return { error: 'Aucun compte trouvé pour cet email.' }
  }

  const register: AuthContextValue['register'] = async (name, email, password, newsletter) => {
    const users = getStoredUsers()
    const key   = email.toLowerCase()
    if (users[key]) return { error: 'Un compte existe déjà avec cet email.' }

    // Sauvegarder localement
    users[key] = { name, password, newsletter }
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    const u: AuthUser = { id: key, email, name, newsletter }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    setUser(u)

    // Synchroniser vers Supabase (pour la liste membres admin)
    syncUserToSupabase(u, password)

    return {}
  }

  const updateProfile: AuthContextValue['updateProfile'] = (data) => {
    if (!user) return
    const updated = { ...user, ...data }
    // Met à jour aussi dans la liste des users locaux
    const users = getStoredUsers()
    if (users[user.id]) {
      users[user.id] = { ...users[user.id], city: data.city, phone: data.phone, avatar: data.avatar }
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setUser(updated)

    // Sync Supabase
    syncUserToSupabase(updated)
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  const forgotPassword: AuthContextValue['forgotPassword'] = async (email) => {
    const users = getStoredUsers()
    if (!users[email.toLowerCase()]) return { error: 'Aucun compte trouvé pour cet email.' }
    return {}
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
