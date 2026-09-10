const { app, BrowserWindow } = require('electron');
const { execFileSync } = require('child_process');
const path = require('path');
const assert = require('assert/strict');

const handle = win => Number(win.getMediaSourceId().split(':')[1]);
app.whenReady().then(async () => {
  // This mirrors the stronger level used by the task window.
  const floating = new BrowserWindow({ width: 530, height: 104, frame: false, show: true });
  floating.setAlwaysOnTop(true, 'screen-saver', 1);
  floating.moveTop();
  floating.loadURL('data:text/html,floating');
  const competitor = new BrowserWindow({ width: 200, height: 100, alwaysOnTop: true, show: true });
  competitor.loadURL('data:text/html,competitor');
  competitor.focus();
  await new Promise(resolve => setTimeout(resolve, 300));
  try {
    const top = execFileSync('pwsh', ['-NoProfile', '-File', path.resolve('scripts/window-zorder.ps1'), '-Floating', String(handle(floating)), '-Competitor', String(handle(competitor))], { encoding: 'utf8' }).trim();
    assert.equal(top, 'floating', 'the floating task window must remain above another ordinary always-on-top window');
    console.log('FLOATING_ZORDER_OK'); app.quit();
  } catch (error) { console.error(`FLOATING_ZORDER_FAIL: ${error.message}`); app.exit(1); }
});
