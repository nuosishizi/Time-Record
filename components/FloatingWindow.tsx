import React, { useEffect, useMemo, useRef, useState } from 'react';
import './floating.css';

export interface FloatingState {
  task: { id: string; title: string; status: string; start: number | null; elapsed: number; sampledAt: number } | null;
  tags: { id: string; name: string }[];
  timezone: string;
}
export type FloatingCommand = { type: 'create' | 'pause' | 'complete' | 'resume'; taskId?: string; title?: string; tagId?: string; start?: boolean };
declare global {
  interface Window {
    floating?: {
      getState(): Promise<FloatingState | null>;
      subscribe(callback: (state: FloatingState) => void): () => void;
      command(command: FloatingCommand): Promise<{ ok: boolean; error?: string }>;
      window(action: string): void;
    };
  }
}
const duration = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
export function FloatingWindow() {
  const [state, setState] = useState<FloatingState | null>(null);
  const [now, setNow] = useState(Date.now());
  const [mode, setMode] = useState<'compact' | 'normal' | 'input'>('normal');
  const [title, setTitle] = useState('');
  const [tagId, setTagId] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [message, setMessage] = useState('');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let active = true, received = false;
    const unsubscribe = window.floating?.subscribe(next => { received = true; setState(next); });
    window.floating?.getState().then(next => { if (active && !received) setState(next); });
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => { active = false; unsubscribe?.(); clearInterval(timer); };
  }, []);
  const formatter = useMemo(() => new Intl.DateTimeFormat('zh-CN', { timeZone: state?.timezone || 'UTC', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }), [state?.timezone]);
  const task = state?.task;
  const running = task?.status === 'Running';
  const elapsed = task ? task.elapsed + (running ? Math.max(0, now - task.sampledAt) / 1000 : 0) : 0;
  const resize = (next: typeof mode) => { setMode(next); window.floating?.window(next); };
  useEffect(() => { if (mode === 'input') input.current?.focus(); }, [mode]);
  const send = async (command: FloatingCommand) => {
    if (lock.current || !window.floating) return;
    lock.current = true; setBusy(true); setMessage('');
    try {
      const result = await window.floating.command(command);
      if (!result.ok) { setMessage(result.error || '操作失败'); return; }
      if (command.type === 'create') { setTitle(''); resize('normal'); }
      setMessage(command.type === 'create' ? (command.start ? '已开始计时' : '已加入待办') : command.type === 'complete' ? '任务已结束并保存' : command.type === 'pause' ? '已暂停' : '已继续计时');
    } catch { setMessage('连接中断，请打开主窗口检查。'); }
    finally { lock.current = false; setBusy(false); }
  };
  return <div className="float-shell">
    <header className="float-drag">
      <span className="float-heading" title={task?.title}>{mode === 'compact' ? task?.title || '暂无进行中任务' : '● 任务随手记'}</span>
      {mode === 'compact' && <span className="float-mini-time">{duration(elapsed)}</span>}
      <button aria-label={mode === 'compact' ? '展开悬浮窗' : '折叠悬浮窗'} title="折叠 / 展开" onClick={() => resize(mode === 'compact' ? 'normal' : 'compact')}>{mode === 'compact' ? '⌄' : '−'}</button>
      <button aria-label="打开主窗口" title="打开主窗口" onClick={() => window.floating?.window('main')}>↗</button>
      <button aria-label="关闭悬浮窗" title="关闭悬浮窗（不结束任务）" onClick={() => window.floating?.window('close')}>×</button>
    </header>
    {mode !== 'compact' && <main className="float-body">
      <div className="float-task" title={task?.title}>{task?.title || (state ? '现在想做什么？' : '正在连接主窗口…')}</div>
      <div className="float-meta">{task?.start ? `本次开始 ${formatter.format(task.start)}` : task ? '任务已暂停' : '点击下方新建，开始记录'}{task?.start && <span> · 本次 {duration((now - task.start) / 1000)}</span>}</div>
      <div className="float-controls"><strong aria-label="累计用时">{duration(elapsed)}</strong>
        {task && <><button disabled={busy || !state} onClick={() => send({ type: running ? 'pause' : 'resume', taskId: task.id })}>{running ? '暂停' : '继续'}</button><button className="float-finish" disabled={busy} onClick={() => send({ type: 'complete', taskId: task.id })}>结束</button></>}
      </div>
      <div className="float-bottom"><button disabled={!state || busy} onClick={() => resize(mode === 'input' ? 'normal' : 'input')}>{mode === 'input' ? '收起输入' : '＋ 快速新建'}</button><span role="status" title={message}>{message || (running ? '计时中' : task ? '已暂停' : '随时开始')}</span></div>
      {mode === 'input' && <form className="float-input" onSubmit={e => { e.preventDefault(); if (title.trim()) send({ type: 'create', title: title.trim(), tagId: tagId || state?.tags[0]?.id, start: true }); }}>
        <input ref={input} aria-label="新任务名称" placeholder="输入任务，回车开始" maxLength={200} value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && e.nativeEvent.isComposing) e.preventDefault(); if (e.key === 'Escape') resize('normal'); }} />
        <div><select aria-label="任务分类" value={tagId || state?.tags[0]?.id || ''} onChange={e => setTagId(e.target.value)}>{state?.tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select><button disabled={busy || !title.trim()} type="button" onClick={() => send({ type: 'create', title: title.trim(), tagId: tagId || state?.tags[0]?.id, start: false })}>待办</button><button className="float-finish" disabled={busy || !title.trim()} type="submit">开始</button></div>
        <p>{running ? '开始新任务会暂停当前任务' : 'Enter 开始 · Esc 收起'}</p>
      </form>}
    </main>}
  </div>;
}
