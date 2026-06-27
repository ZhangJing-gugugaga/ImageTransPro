import { useCallback, useRef } from 'react'

export function useCanvasRenderer(imageSrc, regions, selectedRegionId, transformScale) {
  const canvasRef = useRef(null)

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !imageSrc) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const img = new Image()
    img.src = imageSrc

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      regions.forEach((r) => {
        const isSelected = r.id === selectedRegionId

        // 背景
        ctx.fillStyle = r.bgColor
        ctx.fillRect(r.x, r.y, r.width, r.height)

        // 文字渲染
        if (r.translatedText) {
          ctx.fillStyle = r.textColor
          ctx.textBaseline = 'top'
          ctx.textAlign = 'center'

          const lines = r.translatedText.split('\n')
          let fontSize = 24

          if (r.autoScale !== false) {
            fontSize = Math.min(Math.max(10, (r.height / (lines.length * 1.2)) * 0.9), 500)
          } else {
            fontSize = r.fontSize || 24
          }

          const fontWeight = r.isBold ? 'bold' : 'normal'
          const fontStyle = r.isItalic ? 'italic' : 'normal'
          const fontFamily = r.fontFamily || '"Microsoft YaHei", sans-serif'

          ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`

          const lineHeight = fontSize * 1.2
          const totalTextHeight = lines.length * lineHeight
          const startY = r.y + (r.height - totalTextHeight) / 2

          lines.forEach((line, i) => {
            const y = startY + i * lineHeight
            const x = r.x + r.width / 2
            ctx.fillText(line, x, y)

            if (r.isUnderline) {
              const metrics = ctx.measureText(line)
              const lineX = x - metrics.width / 2
              const lineY = y + fontSize * 0.95
              ctx.fillRect(lineX, lineY, metrics.width, Math.max(1, fontSize * 0.05))
            }
          })
        }

        // 边框 & 手柄
        if (isSelected) {
          const lineWidth = 2 / transformScale
          ctx.strokeStyle = '#4f46e5'
          ctx.lineWidth = Math.max(1, lineWidth)
          ctx.strokeRect(r.x, r.y, r.width, r.height)

          const handleSize = 10 / transformScale
          const half = handleSize / 2
          ctx.fillStyle = '#ffffff'
          ctx.strokeStyle = '#4f46e5'
          ctx.lineWidth = 1

          const corners = [
            { x: r.x, y: r.y },
            { x: r.x + r.width, y: r.y },
            { x: r.x, y: r.y + r.height },
            { x: r.x + r.width, y: r.y + r.height },
          ]
          corners.forEach((c) => {
            ctx.beginPath()
            ctx.rect(c.x - half, c.y - half, handleSize, handleSize)
            ctx.fill()
            ctx.stroke()
          })
        }
      })
    }

    if (img.complete) draw()
    else img.onload = draw
  }, [imageSrc, regions, selectedRegionId, transformScale])

  return { canvasRef, renderCanvas }
}
