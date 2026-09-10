import React, { useEffect, useMemo, useRef, useState } from 'react';
import './floating.css';

export interface FloatingState {
  task: { id: string; title: string; status: string; start: number | null; elapsed: number; sampledAt: number } | null;
  tags: { id: string; name: string }[];
  timezone: string;
}
export type FloatingCommand = { type: 'create' | 'pause' | 'complete' | 'resume'; taskId?: string; title?: string; tagId?: string; start?: boolean };
declare global { interface Window { floating?: { getState(): Promise<FloatingState | null>; subscribe(callback: (state: FloatingState) => void): () => void; command(command: FloatingCommand): Promise<{ ok: boolean; error?: string }> } } }

const formatDuration = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600), m = Math.floor(total / 60) % 60, s = total % 60;
  return h > 0 ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export function FloatingWindow() {
  const [state, setState] = useState<FloatingState | null>(null);
  const [now, setNow] = useState(Date.now());
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const lock = useRef(false);
  useEffect(() => {
    let active = true, received = false;
    const unsubscribe = window.floating?.subscribe(next => { received = true; setState(next); });
    window.floating?.getState().then(next => { if (active && !received) setState(next); });
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { active = false; unsubscribe?.(); window.clearInterval(timer); };
  }, []);
  const timeFormatter = useMemo(() => new Intl.DateTimeFormat('zh-CN', { timeZone: state?.timezone || 'UTC', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }), [state?.timezone]);
  const task = state?.task;
  const running = task?.status === 'Running';
  const elapsed = task ? task.elapsed + (running ? Math.max(0, now - task.sampledAt) / 1000 : 0) : 0;
  const send = async (command: FloatingCommand) => {
    if (lock.current || !window.floating) return;
    lock.current = true; setBusy(true); setMessage('');
    try {
      const result = await window.floating.command(command);
      if (!result.ok) { setMessage(result.error || '操作失败'); return; }
      if (command.type === 'create') setTitle('');
      setMessage('');
    } catch { setMessage('连接中断'); }
    finally { lock.current = false; setBusy(false); }
  };
  const start = (event: React.FormEvent) => {
    event.preventDefault();
    const name = title.trim();
    if (name && state?.tags[0]) send({ type: 'create', title: name, tagId: state.tags[0].id, start: true });
  };
  return <main className="float-shell" aria-label="任务悬浮窗">
    <form className="float-row float-create" onSubmit={start}>
      <input aria-label="新任务名称" maxLength={200} value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && e.nativeEvent.isComposing) e.preventDefault(); }} placeholder="新建任务…" />
      <button className="float-start" disabled={busy || !state || !title.trim()} type="submit">开始</button>
    </form>
    <section className="float-row float-current">
      <div className="float-task float-drag" title="拖动悬浮窗">
        <strong title={task?.title}>{task?.title || (state ? '暂无进行中任务' : '正在连接…')}</strong>
        <small>{task?.start ? `${timeFormatter.format(task.start)} 开始` : task ? '已暂停' : message || '拖动这里移动'}</small>
      </div>
      <time aria-label="持续时间">{task ? formatDuration(elapsed) : '--:--'}</time>
      <button disabled={busy || !task} onClick={() => task && send({ type: running ? 'pause' : 'resume', taskId: task.id })}>{running ? '暂停' : '继续'}</button>
      <button className="float-end" disabled={busy || !task} onClick={() => task && send({ type: 'complete', taskId: task.id })}>结束</button>
    </section>
    {message && <output className="float-status">{message}</output>}
  </main>;
}
