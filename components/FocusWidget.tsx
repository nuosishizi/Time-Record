
import React, { useEffect, useState } from 'react';
import { Task } from '../types';

interface FocusWidgetProps {
  task: Task;
  currentSegmentStartTime?: number;
  onStop: () => void;
  onComplete: () => void;
  onExit: () => void;
}

export const FocusWidget: React.FC<FocusWidgetProps> = ({ task, currentSegmentStartTime, onStop, onComplete, onExit }) => {
  // Calculate initial elapsed time correctly including current running segment
  const getTotalDuration = () => {
    let total = task.totalDuration;
    if (currentSegmentStartTime) {
      // Add the time elapsed in the CURRENT session to the historical total
      total += Math.floor((Date.now() - currentSegmentStartTime) / 1000);
    }
    return total;
  };

  const [duration, setDuration] = useState(getTotalDuration());

  useEffect(() => {
    // Update every second
    const timer = setInterval(() => {
       setDuration(getTotalDuration());
    }, 1000);
    return () => clearInterval(timer);
  }, [task, currentSegmentStartTime]);

  const format = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-8 animate-fade-in">
      <button onClick={onExit} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
        <i className="fa-solid fa-expand"></i> 退出专注模式
      </button>

      <div className="mb-8 text-slate-400 uppercase tracking-widest text-sm animate-pulse">Now Focusing On</div>
      
      <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-12 leading-tight max-w-4xl">
        {task.title}
      </h1>

      <div className="font-mono text-8xl md:text-9xl text-blue-500 font-bold mb-16 tracking-tighter tabular-nums drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
        {format(duration)}
      </div>

      <div className="flex gap-8">
        <button 
          onClick={onStop}
          className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 text-amber-400 hover:border-amber-500 hover:text-amber-300 hover:scale-110 transition-all flex flex-col items-center justify-center gap-2"
        >
          <i className="fa-solid fa-pause text-2xl"></i>
          <span className="text-xs font-bold uppercase">暂停</span>
        </button>

        <button 
          onClick={onComplete}
          className="w-24 h-24 rounded-full bg-blue-600 border-4 border-blue-500 text-white hover:bg-blue-500 hover:scale-110 shadow-2xl shadow-blue-500/40 transition-all flex flex-col items-center justify-center gap-2"
        >
          <i className="fa-solid fa-check text-3xl"></i>
          <span className="text-xs font-bold uppercase">完成</span>
        </button>
      </div>
    </div>
  );
};
