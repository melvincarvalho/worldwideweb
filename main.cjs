#!/usr/bin/env node

const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const url = require('url')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false
    }
  })

  const start = 'https://solidos.solidcommunity.net/public/Roadmap/Tasks/'
  // mainWindow.loadURL('https://solidos.github.io/mashlib/dist/browse.html')
  // Load a URL to start with

  const uri = url.format({
    pathname: path.join('https://', 'index.html'),
    protocol: 'file:',
    slashes: true,
    query: { uri: start }
  })

  console.log('loading', uri)
  mainWindow.loadURL('https://solidos.github.io/mashlib/dist/browse.html?uri=' + start)

  const mainMenu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(mainMenu)
}

const menuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Exit',
        click() {
          app.quit()
        }
      }
    ]
  },
  {
    label: 'Navigation',
    submenu: [
      {
        label: 'Back',
        accelerator: 'CmdOrCtrl+[',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.goBack()
        }
      },
      {
        label: 'Forward',
        accelerator: 'CmdOrCtrl+]',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.goForward()
        }
      },
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload()
        }
      }
    ]
  }
]

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
