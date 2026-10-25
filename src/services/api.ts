/**
 * Central API layer — every backend call goes through here.
 * Falls back gracefully when the backend is unreachable (offline-first UI).
 */
import { API_URL, STORAGE_KEYS } from '@/constants'
import type {
  AttendanceLog,
  ChatMessage,
  Client,
  DailyUpdate,
  NotificationItem,
  User,
  WeightEntry,
  WeightTableEntry,
} from '@/types'

export interface ApiResult<T> {
  ok: boolean
  data: T | null
  status: number
  /** Server-provided message when the request completed but failed. */
  error: string | null
  /** False when the request never reached the server (offline, timeout). */
  reachable: boolean
}

/** Session token issued by `/api/auth/login`, if one is stored. */
export function getSessionToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.token)
  } catch {
    return null
  }
}

/** Attached to every request so the API can verify and scope it. */
function authHeaders(): Record<string, string> {
  const token = getSessionToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Full-fidelity request: never throws, always reports why it failed.
 * Used where the UI must distinguish "the server said no" from
 * "there is no server".
 */
export async function requestResult<T>(path: string, options?: RequestInit): Promise<ApiResult<T>> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(options?.headers ?? {}) },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      let message = `Request failed (${res.status})`
      try {
        const body = (await res.json()) as { error?: string }
        if (body?.error) message = body.error
      } catch {
        /* non-JSON error body — keep the status message */
      }
      return { ok: false, data: null, status: res.status, error: message, reachable: true }
    }

    const data = (await res.json()) as T
    return { ok: true, data, status: res.status, error: null, reachable: true }
  } catch {
    clearTimeout(timeoutId)
    return { ok: false, data: null, status: 0, error: 'Backend unreachable', reachable: false }
  }
}

/** Legacy helper — `null` means "no usable response" (offline or error). */
async function request<T>(path: string, options?: RequestInit): Promise<T | null> {
  const result = await requestResult<T>(path, options)
  return result.ok ? result.data : null
}

const post = (path: string, body: unknown) =>
  requestResult<unknown>(path, { method: 'POST', body: JSON.stringify(body) })

export const api = {
  health: () => request<{ status: string; uptime?: number }>('/health'),

  // ---- Authentication -------------------------------------------------
  login: (email: string, password: string) =>
    requestResult<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    requestResult<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  me: () => requestResult<{ user: User }>('/auth/me'),
  changePassword: (email: string, currentPassword: string, newPassword: string) =>
    requestResult<{ success: boolean }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ email, currentPassword, newPassword }),
    }),

  getClients: () => request<Client[]>('/clients'),
  getClient: (id: number) => request<Client>(`/clients/${id}`),
  createClient: (data: object) =>
    request<Client>('/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id: number, data: object) =>
    request<Client>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClient: (id: number) =>
    request<{ id: number }>(`/clients/${id}`, { method: 'DELETE' }),

  getDailyUpdates: () => request<DailyUpdate[]>('/daily-updates'),
  createDailyUpdate: (data: object) =>
    request<DailyUpdate>('/daily-updates', { method: 'POST', body: JSON.stringify(data) }),

  getWeightHistory: () => request<WeightEntry[]>('/weight-history'),
  createWeightEntry: (data: object) =>
    request<WeightEntry>('/weight-history', { method: 'POST', body: JSON.stringify(data) }),

  getWeightTable: () => request<WeightTableEntry[]>('/weight-table-data'),
  createWeightTableEntry: (data: object) =>
    request<WeightTableEntry>('/weight-table-data', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getNotifications: () => request<NotificationItem[]>('/notifications'),
  createNotification: (data: object) =>
    request<NotificationItem>('/notifications', { method: 'POST', body: JSON.stringify(data) }),
  markNotificationRead: (id: number) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/read-all', { method: 'PUT' }),

  getChatMessages: () => request<ChatMessage[]>('/chat-messages'),
  createChatMessage: (data: object) =>
    request<ChatMessage>('/chat-messages', { method: 'POST', body: JSON.stringify(data) }),

  // Attendance
  getAttendance: (params?: { clientId?: number; from?: string; to?: string }) => {
    const qs = new URLSearchParams()
    if (params?.clientId != null) qs.set('clientId', String(params.clientId))
    if (params?.from) qs.set('from', params.from)
    if (params?.to) qs.set('to', params.to)
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return request<AttendanceLog[]>(`/attendance${suffix}`)
  },
  createAttendance: (log: { clientId: number; date: string; checkInTime: string; checkOutTime?: string; present: boolean }) =>
    requestResult<AttendanceLog>('/attendance', { method: 'POST', body: JSON.stringify(log) }),
  deleteAttendance: (id: number) =>
    requestResult<{ success: boolean }>(`/attendance/${id}`, { method: 'DELETE' }),

  // Dismissed insight signals (Smart Action Center)
  getDismissedSignals: () => request<string[]>('/signals/dismissed'),
  dismissSignal: (signalId: string, by?: string) =>
    post('/signals/dismissed', { signalId, by }),
  restoreSignal: (signalId: string) =>
    requestResult<{ success: boolean }>(`/signals/dismissed/${encodeURIComponent(signalId)}`, {
      method: 'DELETE',
    }),
}
