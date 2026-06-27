import { renderRegions } from './canvasRenderer'

// 导出结果为 PNG（优先使用原生保存对话框）
export async function generateResult(imageSrc, regions, outputCanvas) {
  if (!outputCanvas || !imageSrc) return
  const ctx = outputCanvas.getContext('2d')
  const img = new Image()
  img.src = imageSrc
  img.onload = async () => {
    renderRegions(ctx, img, regions, null)

    // 尝试使用 Electron 原生对话框
    if (window.electronAPI?.showSaveDialog) {
      const result = await window.electronAPI.showSaveDialog({
        defaultPath: `translated_image_${Date.now()}.png`,
        filters: [{ name: 'PNG 图片', extensions: ['png'] }],
      })
      if (result.canceled) return
      // ponytail: 通过 IPC 发送文件需要 fs，暂用 blob 下载兜底
      // 后续可通过 IPC 将 buffer 传到主进程写文件
      outputCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = result.filePath ? result.filePath.split(/[/\\]/).pop() : `translated_image_${Date.now()}.png`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
      return
    }

    // 浏览器环境降级：直接下载
    outputCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `translated_image_${Date.now()}.png`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }
}
