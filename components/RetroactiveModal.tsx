
import React, { useState } from 'react';
import { Tag } from '../types';

interface RetroactiveModalProps {
  tags: Tag[];
  onSave: (title: string, tagId: string, startTime: number, endTime: number, description: string) => void;
  onClose: () => void;
}

export const RetroactiveModal: React.FC<RetroactiveModalProps> = ({ tags, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [tagId, setTagId] = useState(tags[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Construct timestamps
    const startObj = new Date(`${date}T${startTime}`);
    let endObj = new Date(`${date}T${endTime}`);

    // Cross-day logic: If end time is earlier than start time, it likely crossed midnight
    if (endObj.getTime() <= startObj.getTime()) {
        endObj.setDate(endObj.getDate() + 1);
    }

    onSave(title, tagId, startObj.getTime(), endObj.getTime(), description);
  };

  // Calculate duration preview
  const getDurationPreview = () => {
    const start = new Date(`${date}T${startTime}`).getTime();
    let end = new Date(`${date}T${endTime}`).getTime();
    
    if (end <= start) {
        end += 24 * 60 * 60 * 1000; // Add 1 day if crossed midnight
    }

    const diffMin = Math.floor((end - start) / 60000);
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    return `${h}小时 ${m}分钟`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-600/20 flex items-center justify-center text-green-400">
               <i className="fa-solid fa-calendar-plus"></i>
            </div>
            <h2 className="text-xl font-bold text-white">补录历史任务</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">任务名称</label>
            <input 
              type="text" 
              placeholder="例如：刚才开了个会..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs text-slate-400 block mb-1">日期</label>
               <input 
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
               />
             </div>
             <div>
               <label className="text-xs text-slate-400 block mb-1">分类标签</label>
               <select 
                  value={tagId}
                  onChange={e => setTagId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
               >
                 {tags.map(t => (
                   <option key={t.id} value={t.id}>{t.name}</option>
                 ))}
               </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
             <div className="relative">
                <label className="text-xs text-slate-400 block mb-1">开始时间</label>
                <input 
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-left outline-none"
                />
             </div>

             <div className="relative">
                <label className="text-xs text-slate-400 block mb-1">结束时间</label>
                <input 
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-left outline-none"
                />
                
                <div className="absolute top-8 right-12 text-[10px] text-green-400 font-mono pointer-events-none">
                    {getDurationPreview()}
                </div>
             </div>
          </div>

          <div>
             <label className="text-xs text-slate-400 block mb-1">备注 (可选)</label>
             <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="任务详情..."
                className="w-full h-20 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
             />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
             <button 
               type="button" 
               onClick={onClose}
               className="px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
             >
               取消
             </button>
             <button 
               type="submit"
               className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium shadow-lg shadow-green-600/20"
             >
               确认补录
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};
