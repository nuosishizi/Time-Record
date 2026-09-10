const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
fs.mkdirSync(path.resolve('release/debug'), { recursive: true });
app.setPath('userData', fs.mkdtempSync(path.join(app.getPath('temp'), 'mindflow-floating-test-')));
require(path.resolve('electron/apiServer.cjs')).init = () => {};
require(path.resolve('electron/main.cjs'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn) { for (let n = 0; n < 100; n++) { const value = await fn(); if (value) return value; await sleep(100); } throw Error('Timed out'); }
const js = (win, code) => win.webContents.executeJavaScript(code, true);
const click = (win, label) => js(win, `(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(label)});if(!b)throw Error('Missing button: '+${JSON.stringify(label)});b.click()})()`);
const input = (win, value) => js(win, `(()=>{const e=document.querySelector('input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}))})()`);
app.whenReady().then(async () => {
  try {
    const main = await until(() => BrowserWindow.getAllWindows()[0]);
    await until(() => js(main, `!![...document.querySelectorAll('button')].find(b=>b.textContent==='悬浮窗')`).catch(() => false));
    await click(main, '悬浮窗');
    let floating = await until(() => BrowserWindow.getAllWindows().find(w => w !== main));
    await until(() => js(floating, `!!document.querySelector('[aria-label="任务悬浮窗"]')`).catch(() => false));
    assert.equal(floating.isAlwaysOnTop(), true);
    assert(Math.abs(floating.getContentBounds().width - 530) <= 8);
    assert(Math.abs(floating.getContentBounds().height - 104) <= 8);
    assert.equal(await js(floating, `typeof window.require`), 'undefined');
    assert.equal(await js(floating, `getComputedStyle(document.querySelector('.float-shell')).opacity`), '0.58');
    fs.writeFileSync(path.resolve('release/debug/floating-inactive.png'), (await floating.webContents.capturePage()).toPNG());
    floating.webContents.sendInputEvent({ type: 'mouseMove', x: 200, y: 20 });
    await until(() => js(floating, `getComputedStyle(document.querySelector('.float-shell')).opacity==='1'`));
    await input(floating, '固定悬浮窗测试'); await click(floating, '开始');
    await until(() => js(floating, `document.querySelector('.float-task strong')?.textContent==='固定悬浮窗测试'`));
    await until(() => js(floating, `document.querySelector('[aria-label="持续时间"]').textContent!=='00:00'`));
    await sleep(150); fs.writeFileSync(path.resolve('release/debug/floating-fixed.png'), (await floating.webContents.capturePage()).toPNG());
    await click(floating, '暂停'); await until(() => js(floating, `!![...document.querySelectorAll('button')].find(b=>b.textContent==='继续')`));
    const paused = await js(floating, `document.querySelector('[aria-label="持续时间"]').textContent`); await sleep(1100);
    assert.equal(await js(floating, `document.querySelector('[aria-label="持续时间"]').textContent`), paused);
    await click(floating, '继续');
    await until(() => js(floating, `!![...document.querySelectorAll('button')].find(b=>b.textContent==='暂停'&&!b.disabled)`));
    await click(floating, '结束');
    await until(() => js(main, `JSON.parse(localStorage.getItem('mindflow_tasks_v7'))[0]?.status==='Completed'`));
    assert(Math.abs(floating.getContentBounds().height - 104) <= 8);
    floating.setPosition(180, 140); await sleep(250); await click(main, '悬浮窗'); await sleep(200);
    assert.equal(BrowserWindow.getAllWindows().filter(w => w !== main).length, 0);
    await click(main, '悬浮窗'); floating = await until(() => BrowserWindow.getAllWindows().find(w => w !== main));
    await until(() => js(floating, `!!document.querySelector('.float-shell')`).catch(() => false));
    assert.equal(floating.getBounds().x, 180); assert.equal(floating.getBounds().y, 140);
    fs.writeFileSync(path.resolve('release/debug/floating-smoke-result.json'), JSON.stringify({ ok: true, checks: ['fixed two-row window', 'inactive transparency', 'hover clarity', 'higher always-on-top level', 'create', 'live duration', 'pause/resume', 'complete', 'fixed size', 'toggle close', 'remember position'] }, null, 2));
    console.log('FLOATING_SMOKE_OK'); app.quit();
  } catch (error) { console.error(error); fs.writeFileSync(path.resolve('release/debug/floating-smoke-result.json'), JSON.stringify({ ok: false, error: error.stack })); app.exit(1); }
});
