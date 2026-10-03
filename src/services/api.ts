/**
 * Central API layer — every backend call goes through here.
 * Falls back gracefully when the backend is unreachable (offline-first UI).
 */
import { API_URL } from '@/constants'
import type {
  ChatMessage,
  Client,
  DailyUpdate,
  NotificationItem,
  WeightEntry,
  WeightTableEntry,
} from '@/types'

async function request<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    })
    clearTimeout(timeoutId)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export const api = {
  getClients: () => request<Client[]>('/clients'),
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
}
