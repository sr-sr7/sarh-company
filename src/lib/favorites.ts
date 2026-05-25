import { useState, useEffect } from 'react'

const KEY = 'sarh_favorites'

export function useFavorites() {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    try { setIds(JSON.parse(localStorage.getItem(KEY) || '[]')) } catch {}
  }, [])

  function toggle(id: string) {
    setIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }

  return { ids, toggle, has: (id: string) => ids.includes(id) }
}

export const KEY_COMPARE = 'sarh_compare'

export function useCompare() {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    try { setIds(JSON.parse(localStorage.getItem(KEY_COMPARE) || '[]')) } catch {}
  }, [])

  function toggle(id: string) {
    setIds(prev => {
      const next = prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length >= 2 ? [prev[1], id] : [...prev, id]
      localStorage.setItem(KEY_COMPARE, JSON.stringify(next))
      return next
    })
  }

  function clear() {
    setIds([])
    localStorage.removeItem(KEY_COMPARE)
  }

  return { ids, toggle, has: (id: string) => ids.includes(id), clear }
}
