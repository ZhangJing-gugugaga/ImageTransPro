// 导出结果为 PNG 下载
export function generateResult(imageSrc, regions, outputCanvas) {
  if (!outputCanvas || !imageSrc) return
  const canvas = outputCanvas
  const ctx = canvas.getContext('2d')
  const img = new Image()
  img.src = imageSrc
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)
    regions.forEach((r) => {
      ctx.fillStyle = r.bgColor
      ctx.fillRect(r.x, r.y, r.width, r.height)
      if (r.translatedText) {
        ctx.fillStyle = r.textColor
        ctx.textBaseline = 'top'
        ctx.textAlign = 'center'
        const lines = r.translatedText.split('\n')
        let fSize = r.autoScale !== false ? Math.min(Math.max(10, (r.height / (lines.length * 1.2)) * 0.9), 500) : r.fontSize
        ctx.font = `${r.isItalic ? 'italic' : 'normal'} ${r.isBold ? 'bold' : 'normal'} ${fSize}px ${r.fontFamily}`
        const lHeight = fSize * 1.2
        const startY = r.y + (r.height - lines.length * lHeight) / 2
        lines.forEach((line, i) => {
          const y = startY + i * lHeight
          const x = r.x + r.width / 2
          ctx.fillText(line, x, y)
          if (r.isUnderline) {
            const m = ctx.measureText(line)
            ctx.fillRect(x - m.width / 2, y + fSize * 0.95, m.width, Math.max(1, fSize * 0.05))
          }
        })
      }
    })
    const link = document.createElement('a')
    link.download = `translated_image_${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }
}
