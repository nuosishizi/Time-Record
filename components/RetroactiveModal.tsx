import React, { useState, useEffect, useRef } from 'react';
import { Tag } from '../types';

interface RetroactiveModalProps {
  tags: Tag[];
  onSave: (title: string, tagId: string, startTime: number, endTime: number, description: string) => void;
  onClose: () => void;
}

export const RetroactiveModal: React.FC<RetroactiveModalProps> = ({ tags, onSave, onClose }) => {
  const getLocalDateStr = (d: Date) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const getLocalTimeStr = (d: Date) => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');

  const [title, setTitle] = useState('');
  const [tagId, setTagId] = useState(tags[0]?.id || '');
  const [startDate, setStartDate] = useState(getLocalDateStr(new Date()));
  const [endDate, setEndDate] = useState(getLocalDateStr(new Date()));
  const [startTime, setStartTime] = useState(getLocalTimeStr(new Date()));
  const [endTime, setEndTime] = useState(getLocalTimeStr(new Date()));
  const [description, setDescription] = useState('');
  
  const [editingTarget, setEditingTarget] = useState<'start' | 'end'>('start');

  // Auto-sync end date if start date changes and end date was earlier
  const handleStartDateChange = (newDate: string) => {
      setStartDate(newDate);
      if (new Date(endDate) < new Date(newDate)) {
          setEndDate(newDate);
      }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
        alert("请输入任务名称！");
        return;
    }

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

  // Generate last 3 days
  const last3Days = Array.from({length: 3}).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (2 - i));
      return d;
  });

  const datesScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
      // scroll to rightmost (latest date) on mount
      if (datesScrollRef.current) {
          datesScrollRef.current.scrollLeft = datesScrollRef.current.scrollWidth;
      }
  }, [editingTarget]); // scroll when target changes

  const activeDate = editingTarget === 'start' ? startDate : endDate;
  const activeTime = editingTarget === 'start' ? startTime : endTime;
  
  const handleDateClick = (dStr: string) => {
      if (editingTarget === 'start') handleStartDateChange(dStr);
      else setEndDate(dStr);
  };

  const handleTimeChange = (newTime: string) => {
      if (editingTarget === 'start') setStartTime(newTime);
      else setEndTime(newTime);
  };

  const activeHour = parseInt(activeTime.split(':')[0]);
  const activeMinute = parseInt(activeTime.split(':')[1]);
  const isPM = activeHour >= 12;
  const displayHour12 = activeHour === 0 ? 12 : (activeHour > 12 ? activeHour - 12 : activeHour);

  const handleHourClick = (h: number) => {
      const mmStr = String(activeMinute).padStart(2, '0');
      let newH24 = isPM ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
      handleTimeChange(`${String(newH24).padStart(2, '0')}:${mmStr}`);
  };

  const handleMinuteClick = (m: number) => {
      const hhStr = String(activeHour).padStart(2, '0');
      handleTimeChange(`${hhStr}:${String(m).padStart(2, '0')}`);
  };

  const handlePMToggle = (pm: boolean) => {
      if (isPM === pm) return;
      let newH = activeHour;
      if (pm) newH += 12;
      else newH -= 12;
      handleTimeChange(`${String(newH).padStart(2, '0')}:${String(activeMinute).padStart(2, '0')}`);
  };

  const setNow = () => {
      const d = new Date();
      handleDateClick(getLocalDateStr(d));
      handleTimeChange(getLocalTimeStr(d));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 shrink-0">
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

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Time Selection Header (Tabs) */}
            <div className="flex gap-4 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <button 
                    type="button"
                    onClick={() => setEditingTarget('start')}
                    className={`flex-1 p-3 rounded-lg flex flex-col items-center justify-center transition-all ${editingTarget === 'start' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                    <span className="text-[10px] uppercase font-bold opacity-80 mb-1">开始时间</span>
                    <span className="font-mono text-lg">{startDate} {startTime}</span>
                </button>
                <div className="flex items-center justify-center text-slate-500">
                    <i className="fa-solid fa-arrow-right"></i>
                </div>
                <button 
                    type="button"
                    onClick={() => setEditingTarget('end')}
                    className={`flex-1 p-3 rounded-lg flex flex-col items-center justify-center transition-all ${editingTarget === 'end' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                    <span className="text-[10px] uppercase font-bold opacity-80 mb-1">结束时间</span>
                    <span className="font-mono text-lg">{endDate} {endTime}</span>
                </button>
            </div>

            {/* Expanded Custom Picker */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <i className="fa-solid fa-calendar-days text-blue-400"></i> 选择 {editingTarget === 'start' ? '开始' : '结束'} 日期
                    </h3>
                    <button type="button" onClick={setNow} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded transition-colors">
                        设定为现在
                    </button>
                </div>
                
                {/* 3 Days Selection */}
                <div ref={datesScrollRef} className="flex gap-2 pb-2">
                    {last3Days.map((d, index) => {
                        const dStr = getLocalDateStr(d);
                        const isSelected = activeDate === dStr;
                        const labelName = index === 2 ? '今天' : (index === 1 ? '昨天' : '前天');
                        return (
                            <button
                                key={dStr}
                                type="button"
                                onClick={() => handleDateClick(dStr)}
                                className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg border transition-all ${isSelected ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                            >
                                <span className="text-xs uppercase font-bold mb-1">{labelName}</span>
                                <span className="text-lg font-bold">{d.getDate()}</span>
                                <span className="text-[9px] opacity-50">{d.getMonth()+1}月</span>
                            </button>
                        );
                    })}
                </div>

                <div className="border-t border-slate-700/50 pt-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                        <i className="fa-regular fa-clock text-blue-400"></i> 选择具体时间
                    </h3>
                    
                    <div className="flex flex-col gap-4">
                        {/* AM / PM */}
                        <div className="flex gap-2">
                            <button type="button" onClick={() => handlePMToggle(false)} className={`flex-1 py-2 rounded-lg font-bold text-sm border transition-all ${!isPM ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'}`}>
                                <i className="fa-regular fa-sun mr-1"></i> 上午 (AM)
                            </button>
                            <button type="button" onClick={() => handlePMToggle(true)} className={`flex-1 py-2 rounded-lg font-bold text-sm border transition-all ${isPM ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'}`}>
                                <i className="fa-solid fa-moon mr-1"></i> 下午 (PM)
                            </button>
                        </div>

                        {/* Hours */}
                        <div>
                            <div className="text-xs text-slate-500 mb-2 font-bold">小时</div>
                            <div className="grid grid-cols-6 gap-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => {
                                    const isSelected = displayHour12 === h;
                                    return (
                                        <button 
                                            key={`h-${h}`} 
                                            type="button"
                                            onClick={() => handleHourClick(h)}
                                            className={`py-2 rounded-lg text-sm font-bold border transition-all ${isSelected ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                                        >
                                            {h}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Minutes */}
                        <div>
                            <div className="text-xs text-slate-500 mb-2 font-bold">分钟</div>
                            <div className="grid grid-cols-10 gap-1">
                                {Array.from({ length: 60 }).map((_, m) => {
                                    const isSelected = activeMinute === m;
                                    return (
                                        <button 
                                            key={`m-${m}`} 
                                            type="button"
                                            onClick={() => handleMinuteClick(m)}
                                            className={`py-1 rounded cursor-pointer text-xs font-bold border transition-all ${isSelected ? 'bg-purple-600 border-purple-500 text-white shadow-lg scale-110 z-10' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                                        >
                                            {String(m).padStart(2, '0')}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
             <label className="text-xs text-slate-400 block mb-1">备注 (可选)</label>
             <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="任务详情..."
                className="w-full h-16 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
             />
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-800 flex justify-between items-center shrink-0">
             <span className="text-sm text-green-400 font-mono bg-green-900/20 px-3 py-1.5 rounded-lg border border-green-500/20">
                 总计: {getDurationPreview()}
             </span>
             <div className="flex gap-3">
                <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors font-medium"
                >
                取消
                </button>
                <button 
                onClick={handleSubmit}
                className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg shadow-green-600/20"
                >
                确认补录
                </button>
             </div>
        </div>
      </div>
    </div>
  );
};
