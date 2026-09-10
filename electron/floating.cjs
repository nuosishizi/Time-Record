const { BrowserWindow, ipcMain, screen, app } = require('electron');
const path = require('path');
const fs = require('fs');

// The main renderer owns task data. This window only receives snapshots and sends commands.
module.exports = function setupFloating(getMain) {
  let win, snapshot = null, saved = {};
  const pending = new Map();
  const file = path.join(app.getPath('userData'), 'floating-window.json');
  try { saved = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
  const mainSender = e => e.sender === getMain()?.webContents;
  const floatingSender = e => e.sender === win?.webContents;
  const fit = bounds => {
    const area = screen.getDisplayMatching(bounds).workArea;
    return { ...bounds, x: Math.round(Math.max(area.x, Math.min(bounds.x, area.x + area.width - bounds.width))), y: Math.round(Math.max(area.y, Math.min(bounds.y, area.y + area.height - bounds.height))) };
  };
  const remember = () => {
    if (!win || win.isDestroyed()) return;
    const { x, y } = win.getBounds();
    saved = { x, y };
    try { fs.writeFileSync(file, JSON.stringify(saved)); } catch (error) { console.error('Cannot save floating position', error); }
  };
  function open() {
    if (win && !win.isDestroyed()) { win.close(); return; }
    const area = screen.getPrimaryDisplay().workArea;
    const bounds = fit({ x: Number.isFinite(saved.x) ? saved.x : area.x + area.width - 550, y: Number.isFinite(saved.y) ? saved.y : area.y + 80, width: 530, height: 104 });
    win = new BrowserWindow({ ...bounds, useContentSize: true, frame: false, thickFrame: false, transparent: true, resizable: false, maximizable: false, fullscreenable: false, alwaysOnTop: true, skipTaskbar: true, show: false, backgroundColor: '#00000000', title: 'MindFlow 悬浮窗', webPreferences: { preload: path.join(__dirname, 'floating-preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
    const enforceTop = () => { if (win && !win.isDestroyed()) { win.setAlwaysOnTop(true, 'screen-saver', 1); win.moveTop(); } };
    enforceTop();
    win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    win.webContents.on('will-navigate', e => e.preventDefault());
    win.once('ready-to-show', () => { enforceTop(); win?.showInactive(); });
    win.on('blur', enforceTop);
    win.on('show', enforceTop);
    win.on('moved', remember);
    win.on('close', remember);
    win.on('closed', () => { win = null; });
    if (process.env.NODE_ENV === 'development') win.loadURL('http://localhost:5173/#floating');
    else win.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'floating' });
  }
  ipcMain.on('floating:open', e => { if (mainSender(e)) open(); });
  ipcMain.on('floating:publish', (e, state) => {
    if (!mainSender(e)) return;
    snapshot = state;
    if (win && !win.isDestroyed()) win.webContents.send('floating:state', state);
  });
  ipcMain.handle('floating:state', e => floatingSender(e) ? snapshot : null);
  ipcMain.handle('floating:command', (e, command) => {
    if (!floatingSender(e) || !snapshot || !getMain() || getMain().webContents.isLoading()) return { ok: false, error: '主窗口正在加载，请稍后重试。' };
    if (!command || !['create', 'pause', 'complete', 'resume'].includes(command.type)) return { ok: false, error: '无效操作。' };
    const id = require('crypto').randomUUID();
    return new Promise(resolve => {
      const timer = setTimeout(() => { pending.delete(id); resolve({ ok: false, error: '未收到确认，请打开主窗口检查任务后再操作。' }); }, 8000);
      pending.set(id, result => { clearTimeout(timer); resolve(result); });
      getMain().webContents.send('floating:command', { id, command });
    });
  });
  ipcMain.on('floating:result', (e, { id, result }) => {
    if (!mainSender(e)) return;
    pending.get(id)?.(result); pending.delete(id);
  });
  screen.on('display-removed', () => { if (win) win.setBounds(fit(win.getBounds())); });
  return { close: () => win?.close() };
};
