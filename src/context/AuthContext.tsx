/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'
import { STORAGE_KEYS } from '../constants'
import type { User } from '../types'

interface StoredUser extends User {
  password?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => boolean
  signup: (name: string, email: string, password: string) => boolean
  registerUser: (name: string, email: string, password: string) => boolean
  resetPassword: (email: string, newPassword: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.user)
    return saved ? JSON.parse(saved) : null
  })

  const login = (email: string, password: string): boolean => {
    const users: StoredUser[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]')
    const found = users.find((u) => u.email === email && (u.password || '').trim() === password)
    if (found) {
      const userData: User = { name: found.name, email: found.email, role: 'user' }
      setUser(userData)
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData))
      return true
    }
    // Default admin login
    if (email === 'admin123@gmail.com' && password === 'admin123') {
      const userData: User = { name: 'Admin', email, role: 'admin' }
      setUser(userData)
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData))
      return true
    }
    // Default user login
    if (email === 'user@gymcrm.com' && password === 'user123') {
      const userData: User = { name: 'Demo User', email, role: 'user' }
      setUser(userData)
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData))
      return true
    }
    return false
  }

  const signup = (name: string, email: string, password: string): boolean => {
    const success = registerUser(name, email, password)
    if (success) {
      const userData: User = { name, email, role: 'user' }
      setUser(userData)
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData))
    }
    return success
  }

  const registerUser = (name: string, email: string, password: string): boolean => {
    const users: StoredUser[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]')
    if (users.find((u) => u.email === email)) return false
    users.push({ name, email, password, role: 'user' })
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users))
    return true
  }

  const resetPassword = (email: string, newPassword: string): boolean => {
    const users: StoredUser[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]')
    const userIndex = users.findIndex((u) => u.email === email)
    if (userIndex !== -1) {
      users[userIndex].password = newPassword
      localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEYS.user)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, registerUser, resetPassword, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
