import { app, shell, BrowserWindow, ipcMain, desktopCapturer, session, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow = null
let tray = null
let isQuitting = false

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Minimize to tray instead of closing
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow.hide()

      // Show notification on first minimize (Windows)
      if (process.platform === 'win32' && tray) {
        tray.displayBalloon({
          iconType: 'info',
          title: 'FocusRoom',
          content: 'App minimized to tray. Click the tray icon to open.'
        })
      }
    }
    return false
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

function createTray() {
  // Create tray icon
  const trayIcon = nativeImage.createFromPath(icon)

  // Resize for tray (16x16 on Windows, 22x22 on macOS)
  const resizedIcon = trayIcon.resize({
    width: process.platform === 'darwin' ? 22 : 16,
    height: process.platform === 'darwin' ? 22 : 16
  })

  tray = new Tray(resizedIcon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '📖 Open FocusRoom',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    {
      label: '🎯 Start Focus Session',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
          // Could send IPC to start a focus session
        }
      }
    },
    { type: 'separator' },
    {
      label: '⚙️ Settings',
      enabled: false // Can be implemented later
    },
    { type: 'separator' },
    {
      label: '❌ Exit',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('FocusRoom - Virtual Study Space')
  tray.setContextMenu(contextMenu)

  // Double-click to show window
  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus()
      } else {
        mainWindow.show()
      }
    }
  })

  // Single click on Windows to show window
  if (process.platform === 'win32') {
    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.focus()
        } else {
          mainWindow.show()
        }
      }
    })
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.focusroom.desktop')

  // Handle permissions for media devices (camera, microphone)
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['media', 'mediaKeySystem', 'geolocation', 'notifications', 'fullscreen', 'display-capture']

    if (allowedPermissions.includes(permission)) {
      callback(true)
    } else {
      console.log(`Permission denied: ${permission}`)
      callback(false)
    }
  })

  // Handle permission check
  session.defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    const allowedPermissions = ['media', 'mediaKeySystem', 'display-capture']
    return allowedPermissions.includes(permission)
  })

  // Default open or close DevTools by F12 in development
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // IPC handler for getting desktop sources for screen sharing
  ipcMain.handle('get-sources', async () => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['window', 'screen'],
        thumbnailSize: { width: 150, height: 150 }
      })
      return sources.map(source => ({
        id: source.id,
        name: source.name,
        thumbnail: source.thumbnail.toDataURL(),
        appIcon: source.appIcon ? source.appIcon.toDataURL() : null
      }))
    } catch (error) {
      console.error('Error getting sources:', error)
      return []
    }
  })

  // Create window and tray
  createWindow()
  createTray()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else if (mainWindow) {
      mainWindow.show()
    }
  })
})

// Handle before-quit to properly exit
app.on('before-quit', () => {
  isQuitting = true
})

// On macOS, keep app running even when all windows are closed
app.on('window-all-closed', () => {
  // Don't quit - app stays in tray
  // User must explicitly quit from tray menu
})

// Cleanup on quit
app.on('quit', () => {
  if (tray) {
    tray.destroy()
  }
})
