const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  saveProject: (filePath, data) => ipcRenderer.invoke('save-project', filePath, data),
  loadProject: (filePath) => ipcRenderer.invoke('load-project', filePath),
})
