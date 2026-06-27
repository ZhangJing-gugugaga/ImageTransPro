import { renderRegions } from './canvasRenderer'

// 导出结果为 PNG 下载
export function generateResult(imageSrc, regions, outputCanvas) {
  if (!outputCanvas || !imageSrc) return
  const ctx = outputCanvas.getContext('2d')
  const img = new Image()
  img.src = imageSrc
  img.onload = () => {
    renderRegions(ctx, img, regions, null)
    const link = document.createElement('a')
    link.download = `translated_image_${Date.now()}.png`
    link.href = outputCanvas.toDataURL('image/png')
    link.click()
  }
}
