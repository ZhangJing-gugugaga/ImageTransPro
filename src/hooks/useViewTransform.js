import { useState, useCallback, useRef } from 'react'

export function useViewTransform(viewportRef) {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })

  const fitScreen = useCallback((w, h) => {
    if (viewportRef.current && w > 0) {
      const vw = viewportRef.current.clientWidth
      const vh = viewportRef.current.clientHeight
      const padding = 60
      const scale = Math.min((vw - padding) / w, (vh - padding) / h)
      const x = (vw - w * scale) / 2
      const y = (vh - h * scale) / 2
      setTransform({ x, y, scale })
    }
  }, [viewportRef])

  const zoom = useCallback((delta, center) => {
    setTransform((prev) => {
      const newScale = Math.max(0.05, Math.min(prev.scale * (1 - delta * 0.1), 20))
      let cx, cy
      if (center) {
        cx = center.x
        cy = center.y
      } else if (viewportRef.current) {
        const rect = viewportRef.current.getBoundingClientRect()
        cx = rect.width / 2
        cy = rect.height / 2
      } else {
        return prev
      }
      const imageX = (cx - prev.x) / prev.scale
      const imageY = (cy - prev.y) / prev.scale
      const newX = cx - imageX * newScale
      const newY = cy - imageY * newScale
      return { x: newX, y: newY, scale: newScale }
    })
  }, [viewportRef])

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const rect = viewportRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const delta = e.deltaY > 0 ? 1 : -1
    zoom(delta, { x: mouseX, y: mouseY })
  }, [viewportRef, zoom])

  const screenToImage = useCallback((sx, sy) => ({
    x: (sx - transform.x) / transform.scale,
    y: (sy - transform.y) / transform.scale,
  }), [transform])

  return { transform, setTransform, fitScreen, zoom, handleWheel, screenToImage }
}
