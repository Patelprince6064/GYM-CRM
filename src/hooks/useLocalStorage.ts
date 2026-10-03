import { useState, useEffect } from 'react'

/** useState persisted to localStorage. */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error(`Error saving "${key}" to localStorage`, e)
    }
  }, [key, value])

  return [value, setValue] as const
}
