const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'ImageTrans Pro',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    autoHideMenuBar: true,
  })

  // Always load built files from dist/
  mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 保存对话框 IPC
ipcMain.handle('show-save-dialog', async (event, options) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  return dialog.showSaveDialog(win, options)
})

// 打开文件对话框 IPC
ipcMain.handle('show-open-dialog', async (event, options) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  return dialog.showOpenDialog(win, options)
})

// 保存项目文件 IPC
ipcMain.handle('save-project', async (event, filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  return { success: true }
})

// 读取项目文件 IPC
ipcMain.handle('load-project', async (event, filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(content)
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
