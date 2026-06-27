const PROJECT_VERSION = 1
const RECENT_KEY = 'imagetrans_recent_files'
const MAX_RECENT = 10

// --- 最近文件管理 ---
export function getRecentFiles() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || []
  } catch {
    return []
  }
}

function addRecentFile(filePath) {
  const recent = getRecentFiles().filter((f) => f !== filePath)
  recent.unshift(filePath)
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
}

// --- 保存项目 ---
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
  addRecentFile(result.filePath)
  return result.filePath
}

// --- 打开项目 ---
export async function openProject(filePath) {
  const api = window.electronAPI
  if (!api?.loadProject) {
    alert('项目打开功能需要 Electron 环境')
    return null
  }

  // 如果没有指定路径，弹出对话框
  if (!filePath) {
    if (!api.showOpenDialog) return null
    const result = await api.showOpenDialog({
      filters: [{ name: 'ImageTrans 项目', extensions: ['imagetrans'] }],
      properties: ['openFile'],
    })
    if (result.canceled || !result.filePaths[0]) return null
    filePath = result.filePaths[0]
  }

  const data = await api.loadProject(filePath)
  if (data.version !== PROJECT_VERSION) {
    alert('项目文件版本不兼容')
    return null
  }
  addRecentFile(filePath)
  return data
}
