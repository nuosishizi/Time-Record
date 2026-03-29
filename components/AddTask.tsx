import React, { useState } from 'react';
import { Priority } from '../types';

interface AddTaskProps {
  onAdd: (title: string, date: string, priority: Priority) => void;
}

export const AddTask: React.FC<AddTaskProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    // Construct ISO date string
    const today = new Date();
    const dateStr = date || today.toISOString().split('T')[0];
    const timeStr = time || '23:59';
    const dueTime = new Date(`${dateStr}T${timeStr}`).toISOString();

    onAdd(title, dueTime, priority);
    setTitle('');
    setDate('');
    setTime('');
    setPriority(Priority.MEDIUM);
    setIsExpanded(false);
  };

  return (
    <div className={`glass-panel rounded-2xl p-4 transition-all duration-300 ${isExpanded ? 'ring-2 ring-blue-500/50' : ''}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
             <i className="fa-solid fa-plus"></i>
          </div>
          <input
            type="text"
            placeholder="今天想做什么？..."
            className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 h-10"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
          />
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-wrap gap-4 items-center animate-fade-in-down">
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
              <i className="fa-regular fa-calendar text-slate-400 text-xs"></i>
              <input 
                type="date" 
                className="bg-transparent border-none outline-none text-sm text-slate-300 w-28"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
              <i className="fa-regular fa-clock text-slate-400 text-xs"></i>
              <input 
                type="time" 
                className="bg-transparent border-none outline-none text-sm text-slate-300 w-24"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="bg-slate-800/50 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-blue-500"
              >
                <option value={Priority.LOW}>低优先级</option>
                <option value={Priority.MEDIUM}>中优先级</option>
                <option value={Priority.HIGH}>高优先级</option>
              </select>
            </div>

            <div className="flex-1"></div>

            <button 
              type="button" 
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-slate-200 text-sm px-3"
            >
              取消
            </button>
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-5 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20"
            >
              添加任务
            </button>
          </div>
        )}
      </form>
    </div>
  );
};