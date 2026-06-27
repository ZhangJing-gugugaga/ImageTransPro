import { useEffect } from 'react'

export function useKeyboardShortcuts({
  selectedRegionId,
  selectedRegionIds,
  regions,
  toolMode,
  setToolMode,
  setRegions,
  interactionState,
  undo,
  redo,
  deleteRegion,
  deleteSelectedRegions,
  addRegion,
  viewportRef,
  step,
}) {
  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT'
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault(); e.shiftKey ? redo() : undo(); return
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault(); redo(); return
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedRegionId && !isInput) {
        e.preventDefault()
        const src = regions.find((r) => r.id === selectedRegionId)
        if (src) addRegion({ ...src, id: crypto.randomUUID(), x: src.x + 10, y: src.y + 10 })
        return
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedRegionId && !isInput) {
        e.preventDefault()
        const s = e.shiftKey ? 10 : 1
        const src = regions.find((r) => r.id === selectedRegionId)
        if (!src) return
        const dx = e.key === 'ArrowLeft' ? -s : e.key === 'ArrowRight' ? s : 0
        const dy = e.key === 'ArrowUp' ? -s : e.key === 'ArrowDown' ? s : 0
        setRegions(regions.map((r) => r.id === selectedRegionId ? { ...r, x: src.x + dx, y: src.y + dy } : r))
        return
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedRegionId && interactionState === 'idle' && !isInput) {
        selectedRegionIds.length > 1 ? deleteSelectedRegions() : deleteRegion(selectedRegionId)
      }
      if (e.key === 'Escape' && toolMode === 'picker') setToolMode('draw')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedRegionId, selectedRegionIds, toolMode, regions, interactionState, undo, redo, deleteRegion, deleteSelectedRegions, addRegion, setRegions, setToolMode])

  // Space 键切换 grab 光标
  useEffect(() => {
    if (step !== 2 || !viewportRef.current) return
    const el = viewportRef.current
    const onDown = (e) => {
      if (e.code === 'Space' && interactionState === 'idle') { e.preventDefault(); el.style.cursor = 'grab' }
    }
    const onUp = (e) => {
      if (e.code === 'Space' && interactionState === 'idle') el.style.cursor = 'crosshair'
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp) }
  }, [step, interactionState, viewportRef])
}
