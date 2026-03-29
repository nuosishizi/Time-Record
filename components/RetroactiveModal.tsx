
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
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [description, setDescription] = useState('');

  // Auto-sync end date if start date changes and end date was the same
  const handleStartDateChange = (newDate: string) => {
      setStartDate(newDate);
      if (new Date(endDate) < new Date(newDate)) {
          setEndDate(newDate);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const startObj = new Date(`${startDate}T${startTime}`);
    const endObj = new Date(`${endDate}T${endTime}`);

    if (endObj.getTime() <= startObj.getTime()) {
        alert("结束时间必须晚于开始时间！如果跨天了，请修改结束日期。");
        return;
    }

    onSave(title, tagId, startObj.getTime(), endObj.getTime(), description);
  };

  const getDurationPreview = () => {
    const start = new Date(`${startDate}T${startTime}`).getTime();
    const end = new Date(`${endDate}T${endTime}`).getTime();
    
    if (end <= start) return "时间无效";

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

          <div className="grid grid-cols-2 gap-4 items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
             <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">开始时间</label>
                <div className="flex gap-2">
                    <input 
                        type="date"
                        value={startDate}
                        onChange={e => handleStartDateChange(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded flex-1 px-2 py-1.5 text-xs text-white outline-none"
                    />
                    <input 
                        type="time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white outline-none"
                    />
                </div>
             </div>

             <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">结束时间</label>
                <div className="flex gap-2">
                    <input 
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded flex-1 px-2 py-1.5 text-xs text-white outline-none"
                    />
                    <input 
                        type="time"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white outline-none"
                    />
                </div>
             </div>
             
             <div className="col-span-2 text-right mt-1">
                 <span className="text-xs text-green-400 font-mono bg-green-900/20 px-2 py-1 rounded">
                     总计: {getDurationPreview()}
                 </span>
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
