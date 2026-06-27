import { useState, useCallback } from 'react'

const MAX_HISTORY = 50

export function useHistory() {
  const [history, setHistory] = useState([[]])
  const [historyIndex, setHistoryIndex] = useState(0)

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const pushHistory = useCallback((newRegions) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(JSON.parse(JSON.stringify(newRegions)))
      if (newHistory.length > MAX_HISTORY) newHistory.shift()
      return newHistory
    })
    setHistoryIndex(history.length)
  }, [historyIndex, history.length])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      return JSON.parse(JSON.stringify(history[newIndex]))
    }
    return null
  }, [historyIndex, history])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      return JSON.parse(JSON.stringify(history[newIndex]))
    }
    return null
  }, [historyIndex, history])

  const resetHistory = useCallback(() => {
    setHistory([[]])
    setHistoryIndex(0)
  }, [])

  return { pushHistory, undo, redo, canUndo, canRedo, resetHistory }
}
