import { app, BrowserWindow, Menu } from 'electron';
import { createServer } from 'javascript-solid-server/src/server.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Address bar CSS - inspired by solid-docs browser
const ADDRESS_BAR_CSS = `
#worldwideweb-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #7C3AED 0%, #2563EB 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
#worldwideweb-nav label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
}
#worldwideweb-uri {
  flex: 1;
  min-width: 280px;
  padding: 10px 16px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  outline: none;
  transition: all 0.2s ease;
}
#worldwideweb-uri::placeholder {
  color: rgba(255, 255, 255, 0.6);
}
#worldwideweb-uri:focus {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
}
#worldwideweb-go {
  padding: 10px 20px;
  background: white;
  color: #7C3AED;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}
#worldwideweb-go:hover {
  background: #f8f8f8;
  transform: translateY(-1px);
}
`;

// Load config
let config = { port: 3012, width: 1200, height: 800 };
try {
  config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));
} catch (e) {
  console.log('Using default config');
}

const PORT = config.port || 3012;
let mainWindow;
let server;

async function startJSS() {
  server = createServer({
    mashlib: true,
    mashlibCdn: false,
    root: config.root || join(__dirname, 'data'),
    logger: false
  });

  await server.listen({ port: PORT, host: 'localhost' });
  console.log(`JSS running at http://localhost:${PORT}`);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: config.width || 1200,
    height: config.height || 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Simple menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'WorldWideWeb',
      submenu: [
        { label: 'Home', click: () => mainWindow.loadURL(`http://localhost:${PORT}/`) },
        { type: 'separator' },
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.reload() },
        { label: 'DevTools', accelerator: 'F12', click: () => mainWindow.webContents.toggleDevTools() },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);

  mainWindow.loadURL(`http://localhost:${PORT}/`);

  // Inject address bar
  const DEFAULT_URI = 'https://timbl.solidcommunity.net/profile/card#me';

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.insertCSS(ADDRESS_BAR_CSS);
    mainWindow.webContents.executeJavaScript(`
      if (!document.getElementById('worldwideweb-nav')) {
        const nav = document.createElement('div');
        nav.id = 'worldwideweb-nav';
        nav.innerHTML = \`
          <label>Visiting</label>
          <input type="text" id="worldwideweb-uri" placeholder="Enter a Solid URI..." value="${DEFAULT_URI}" />
          <button id="worldwideweb-go">Go</button>
        \`;
        document.body.insertBefore(nav, document.body.firstChild);

        const uriInput = document.getElementById('worldwideweb-uri');
        const goBtn = document.getElementById('worldwideweb-go');

        goBtn.addEventListener('click', () => {
          window.location.href = uriInput.value;
        });

        uriInput.addEventListener('keyup', (e) => {
          if (e.key === 'Enter') window.location.href = uriInput.value;
        });

        // Auto-navigate to default URI on first load
        if (window.location.href.endsWith(':${PORT}/') || window.location.href.endsWith(':${PORT}')) {
          setTimeout(() => {
            window.location.href = '${DEFAULT_URI}';
          }, 500);
        }
      }
    `);
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(async () => {
  await startJSS();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

app.on('before-quit', async () => {
  if (server) await server.close();
});
