import { useCallback, useRef } from 'react'
import { renderRegions } from '../utils/canvasRenderer'

export function useCanvasRenderer(imageSrc, regions, selectedRegionId, transformScale) {
  const canvasRef = useRef(null)

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !imageSrc) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.src = imageSrc

    const draw = () => renderRegions(ctx, img, regions, selectedRegionId, transformScale)
    if (img.complete) draw()
    else img.onload = draw
  }, [imageSrc, regions, selectedRegionId, transformScale])

  return { canvasRef, renderCanvas }
}
