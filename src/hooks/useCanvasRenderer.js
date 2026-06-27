import { useCallback, useRef, useEffect } from 'react'
import { renderRegions } from '../utils/canvasRenderer'

export function useCanvasRenderer(imageSrc, regions, selectedRegionId, transformScale) {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)

  // imageSrc 变化时重新加载 Image 对象
  useEffect(() => {
    if (!imageSrc) { imageRef.current = null; return }
    const img = new Image()
    img.src = imageSrc
    imageRef.current = img
  }, [imageSrc])

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !imageSrc || !imageRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = imageRef.current

    const draw = () => renderRegions(ctx, img, regions, selectedRegionId, transformScale)
    if (img.complete) draw()
    else img.onload = draw
  }, [imageSrc, regions, selectedRegionId, transformScale])

  return { canvasRef, renderCanvas }
}
