const { app, BrowserWindow } = require('electron');
const path = require('path');

// 修复 Windows 安装时的快捷方式问题
if (require('electron-squirrel-startup')) app.quit();

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // 允许渲染进程使用 Node 能力（简单版配置）
    },
    // 隐藏菜单栏 (如果你想要原生菜单栏可以去掉这行)
    autoHideMenuBar: true, 
  });

  // 开发环境：加载 localhost:5173
  // 生产环境：加载打包后的 index.html
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    win.loadURL('http://localhost:5173');
    // win.webContents.openDevTools(); // 开发模式下自动打开控制台，调试用
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});