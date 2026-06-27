/**
 * 在 Canvas 上绘制图片和所有区域（背景 + 文字 + 可选手柄）
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLImageElement} img
 * @param {Array} regions
 * @param {string|null} selectedRegionId - 选中区域 ID，null 则不画手柄
 * @param {number} transformScale - 当前缩放比，用于手柄大小计算
 */
export function renderRegions(ctx, img, regions, selectedRegionId, transformScale = 1) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.drawImage(img, 0, 0)

  regions.forEach((r) => {
    // 背景
    ctx.fillStyle = r.bgColor
    ctx.fillRect(r.x, r.y, r.width, r.height)

    // 文字渲染
    if (r.translatedText) {
      ctx.fillStyle = r.textColor
      ctx.textBaseline = 'top'
      ctx.textAlign = 'center'

      const lines = r.translatedText.split('\n')
      const fontSize = r.autoScale !== false
        ? Math.min(Math.max(10, (r.height / (lines.length * 1.2)) * 0.9), 500)
        : (r.fontSize || 24)

      ctx.font = `${r.isItalic ? 'italic' : 'normal'} ${r.isBold ? 'bold' : 'normal'} ${fontSize}px ${r.fontFamily || '"Microsoft YaHei", sans-serif'}`

      const lineHeight = fontSize * 1.2
      const startY = r.y + (r.height - lines.length * lineHeight) / 2

      lines.forEach((line, i) => {
        const y = startY + i * lineHeight
        const x = r.x + r.width / 2
        ctx.fillText(line, x, y)

        if (r.isUnderline) {
          const m = ctx.measureText(line)
          ctx.fillRect(x - m.width / 2, y + fontSize * 0.95, m.width, Math.max(1, fontSize * 0.05))
        }
      })
    }

    // 选中区域边框 & 手柄
    if (selectedRegionId && r.id === selectedRegionId) {
      ctx.strokeStyle = '#4f46e5'
      ctx.lineWidth = Math.max(1, 2 / transformScale)
      ctx.strokeRect(r.x, r.y, r.width, r.height)

      const handleSize = 10 / transformScale
      const half = handleSize / 2
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#4f46e5'
      ctx.lineWidth = 1
      ;[
        { x: r.x, y: r.y },
        { x: r.x + r.width, y: r.y },
        { x: r.x, y: r.y + r.height },
        { x: r.x + r.width, y: r.y + r.height },
      ].forEach((c) => {
        ctx.beginPath()
        ctx.rect(c.x - half, c.y - half, handleSize, handleSize)
        ctx.fill()
        ctx.stroke()
      })
    }
  })
}
