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

// Annonce par défaut créée à l'inscription (mock)
const DEFAULT_ANNONCE = {
  id: 'welcome',
  status: 'to_adopt',
  name: 'Mon premier animal',
  species: 'other',
  location_city: '',
  created_at: new Date().toISOString(),
  moderation_status: 'pending',
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
    if (!users[key]) return { error: 'Aucun compte trouvé pour cet email.' }
    if (users[key].password !== password) return { error: 'Mot de passe incorrect.' }
    const u: AuthUser = { id: key, email, name: users[key].name, city: users[key].city, phone: users[key].phone, avatar: users[key].avatar, newsletter: users[key].newsletter }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    setUser(u)
    return {}
  }

  const register: AuthContextValue['register'] = async (name, email, password, newsletter) => {
    const users = getStoredUsers()
    const key   = email.toLowerCase()
    if (users[key]) return { error: 'Un compte existe déjà avec cet email.' }
    users[key] = { name, password, newsletter }
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    const u: AuthUser = { id: key, email, name, newsletter }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    setUser(u)
    return {}
  }

  const updateProfile: AuthContextValue['updateProfile'] = (data) => {
    if (!user) return
    const updated = { ...user, ...data }
    // Met à jour aussi dans la liste des users
    const users = getStoredUsers()
    if (users[user.id]) {
      users[user.id] = { ...users[user.id], city: data.city, phone: data.phone, avatar: data.avatar }
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setUser(updated)
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
