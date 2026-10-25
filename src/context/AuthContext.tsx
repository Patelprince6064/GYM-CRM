/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { api } from '@/services/api'
import { STORAGE_KEYS } from '@/constants'
import type { Client, User } from '@/types'

interface StoredUser extends User {
  password?: string
}

/** Result shape so callers can show the server's own explanation. */
export interface AuthOutcome {
  ok: boolean
  error?: string
  user?: User
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, requiredRole?: 'admin' | 'user') => Promise<AuthOutcome>
  signup: (name: string, email: string, password: string) => Promise<AuthOutcome>
  registerUser: (name: string, email: string, password: string) => Promise<AuthOutcome>
  /** Requires the current password — an email alone must never suffice. */
  changePassword: (email: string, currentPassword: string, newPassword: string) => Promise<AuthOutcome>
  logout: () => void
  isAuthenticated: boolean
  /**
   * `server`  = the session token was issued by the API
   * `local`   = offline fallback against credentials held in this browser
   * `none`    = signed out
   */
  authMode: 'server' | 'local' | 'none'
}

const AuthContext = createContext<AuthContextType | null>(null)

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const stripPassword = (user: StoredUser): User => ({
  name: user.name,
  email: user.email,
  role: user.role,
  clientId: user.clientId ?? null,
})

/** Writes the session to storage. Called with the token first so the very
 *  next API request (DataContext re-hydration) is already authenticated. */
const persistSession = (token: string | null, user: User | null) => {
  try {
    if (token) localStorage.setItem(STORAGE_KEYS.token, token)
    else localStorage.removeItem(STORAGE_KEYS.token)
    if (user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEYS.user)
  } catch {
    /* storage unavailable (private mode) — session simply won't survive reload */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readJson<User | null>(STORAGE_KEYS.user, null))
  const [authMode, setAuthMode] = useState<'server' | 'local' | 'none'>(() => {
    const stored = readJson<User | null>(STORAGE_KEYS.user, null)
    if (!stored) return 'none'
    // A stored token is the tell-tale for a session the API issued.
    try {
      return localStorage.getItem(STORAGE_KEYS.token) ? 'server' : 'local'
    } catch {
      return 'local'
    }
  })

  const finishSession = useCallback(
    (token: string | null, nextUser: User | null, mode: 'server' | 'local' | 'none') => {
    persistSession(token, nextUser)
    setUser(nextUser)
    setAuthMode(nextUser ? mode : 'none')
  },
    [],
  )

  /**
   * Sign in. The API is tried first; local credential verification is only
   * used when the server cannot be reached, and is labelled as such so the
   * UI never claims a server round-trip that did not happen.
   */
  const login = useCallback(
    async (email: string, password: string, requiredRole?: 'admin' | 'user'): Promise<AuthOutcome> => {
    const trimmed = email.trim().toLowerCase()

    const result = await api.login(trimmed, password)
    if (result.ok && result.data?.token) {
      const signedIn = result.data.user
      // The chosen tab is a capability check, not a hint: refuse the session
      // rather than signing somebody in and then showing them the wrong door.
      if (requiredRole && signedIn.role !== requiredRole) {
        return {
          ok: false,
          error:
            requiredRole === 'admin'
              ? 'That account does not have administrator access'
              : 'That account is an administrator — sign in on the Administrator tab',
        }
      }
      finishSession(result.data.token, signedIn, 'server')
      return { ok: true, user: signedIn }
    }
    // The server answered and said no — do not fall through to a local
    // acceptance that would contradict it. A 404/501 means this deployment
    // has no auth routes at all, which is treated as "unavailable".
    if (result.reachable && result.status !== 404 && result.status !== 501) {
      return { ok: false, error: result.error ?? 'Email or password is incorrect' }
    }

    const users = readJson<StoredUser[]>(STORAGE_KEYS.users, [])
    const match = users.find((u) => u.email.toLowerCase() === trimmed && u.password === password)
    if (match) {
      const signedIn = stripPassword(match)
      if (requiredRole && signedIn.role !== requiredRole) {
        return {
          ok: false,
          error:
            requiredRole === 'admin'
              ? 'That account does not have administrator access'
              : 'That account is an administrator — sign in on the Administrator tab',
        }
      }
      finishSession(null, signedIn, 'local')
      return { ok: true, user: signedIn }
    }
    return { ok: false, error: 'Backend unreachable — that local account does not match' }
  },
  [finishSession],
  )

  /** Create an account for an email an administrator has already added. */
  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<AuthOutcome> => {
      const trimmed = email.trim().toLowerCase()
      const result = await api.register(name, trimmed, password)
      if (result.ok && result.data?.token) {
        finishSession(result.data.token, result.data.user, 'server')
        return { ok: true, user: result.data.user }
      }
      if (result.reachable && result.status !== 404 && result.status !== 501) {
        return { ok: false, error: result.error ?? 'Unable to create the account' }
      }

      // Offline: keep the legacy localStorage flow so the demo still works.
      const users = readJson<StoredUser[]>(STORAGE_KEYS.users, [])
      if (users.some((u) => u.email.toLowerCase() === trimmed)) {
        return { ok: false, error: 'An account with that email already exists' }
      }
      users.push({ name, email: trimmed, password, role: 'user' })
      try {
        localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users))
      } catch {
        /* ignore */
      }
      finishSession(null, { name, email: trimmed, role: 'user' }, 'local')
      return { ok: true, user: { name, email: trimmed, role: 'user' } }
    },
    [finishSession],
  )

  const registerUser = useCallback(
    (name: string, email: string, password: string) => signup(name, email, password),
    [signup],
  )

  const changePassword = useCallback(
    async (email: string, currentPassword: string, newPassword: string): Promise<AuthOutcome> => {
      const trimmed = email.trim().toLowerCase()
      const result = await api.changePassword(trimmed, currentPassword, newPassword)
      if (result.ok) return { ok: true }
      if (result.reachable && result.status !== 404 && result.status !== 501) {
        return { ok: false, error: result.error ?? 'Unable to update the password' }
      }

      const users = readJson<StoredUser[]>(STORAGE_KEYS.users, [])
      const match = users.find((u) => u.email.toLowerCase() === trimmed && u.password === currentPassword)
      if (!match) return { ok: false, error: 'No local account matches that email and current password' }
      match.password = newPassword
      try {
        localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users))
      } catch {
        /* ignore */
      }
      return { ok: true }
    },
    [],
  )

  const logout = useCallback(() => {
    finishSession(null, null, 'none')
  }, [finishSession])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      login,
      signup,
      registerUser,
      changePassword,
      logout,
      isAuthenticated: !!user,
      authMode,
    }),
    [user, login, signup, registerUser, changePassword, logout, authMode],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

/** Convenience for pages that only need the signed-in member's record. */
export function findOwnMember(user: User | null, clients: Client[]): Client | undefined {
  if (!user) return undefined
  if (user.clientId != null) {
    const byId = clients.find((c) => Number(c.id) === Number(user.clientId))
    if (byId) return byId
  }
  return clients.find((c) => c.email?.toLowerCase() === user.email.toLowerCase())
}
