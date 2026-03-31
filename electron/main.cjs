const { app, BrowserWindow } = require('electron');
const path = require('path');

// 修复 Windows 安装时的快捷方式问题
if (require('electron-squirrel-startup')) app.quit();

let mainWindow = null;

// --- 单实例锁逻辑 ---
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // 如果获取锁失败，说明已经有一个实例在运行，直接退出
  app.quit();
} else {
  // 当第二个实例启动时，唤醒并聚焦到主窗口
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createWindow() {
    mainWindow = new BrowserWindow({
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
      mainWindow.loadURL('http://localhost:5173');
      // mainWindow.webContents.openDevTools(); // 开发模式下自动打开控制台，调试用
    } else {
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});