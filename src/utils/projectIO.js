const PROJECT_VERSION = 1

// 保存项目为 .imagetrans 文件
export async function saveProject(state) {
  const api = window.electronAPI
  if (!api?.showSaveDialog) {
    alert('项目保存功能需要 Electron 环境')
    return
  }

  const result = await api.showSaveDialog({
    defaultPath: 'untitled.imagetrans',
    filters: [{ name: 'ImageTrans 项目', extensions: ['imagetrans'] }],
  })
  if (result.canceled) return

  const data = {
    version: PROJECT_VERSION,
    createdAt: new Date().toISOString(),
    imageSrc: state.imageSrc,
    imgSize: state.imgSize,
    regions: state.regions,
    transform: state.transform,
  }

  await api.saveProject(result.filePath, data)
  return result.filePath
}

// 打开 .imagetrans 文件
export async function openProject() {
  const api = window.electronAPI
  if (!api?.showOpenDialog) {
    alert('项目打开功能需要 Electron 环境')
    return null
  }

  const result = await api.showOpenDialog({
    filters: [{ name: 'ImageTrans 项目', extensions: ['imagetrans'] }],
    properties: ['openFile'],
  })
  if (result.canceled || !result.filePaths[0]) return null

  const data = await api.loadProject(result.filePaths[0])
  if (data.version !== PROJECT_VERSION) {
    alert('项目文件版本不兼容')
    return null
  }
  return data
}
