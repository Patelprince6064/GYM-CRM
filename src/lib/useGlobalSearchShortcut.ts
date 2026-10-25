import { useEffect } from 'react'

/**
 * Registers the ⌘K / Ctrl-K shortcut. Mounted once by the app shell;
 * kept out of component files so it survives React Fast Refresh.
 */
export function useGlobalSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpen()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onOpen])
}
