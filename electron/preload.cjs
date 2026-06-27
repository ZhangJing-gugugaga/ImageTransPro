const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
})
