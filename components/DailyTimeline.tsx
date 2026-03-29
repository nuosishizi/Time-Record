
import React, { useState, useMemo, useEffect } from 'react';
import { TimeSegment, Task, Tag } from '../types';
import { analyzeDailyTimeline } from '../services/geminiService';

interface DailyTimelineProps {
  tasks: Task[];
  segments: TimeSegment[];
  tags: Tag[];
}

export const DailyTimeline: React.FC<DailyTimelineProps> = ({ tasks, segments, tags }) => {
  const getLocalDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDateString(new Date()));
  const [calDate, setCalDate] = useState(new Date());
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync calendar month with selected date when it changes externally
  useEffect(() => {
    const [y, m] = selectedDate.split('-');
    setCalDate(new Date(parseInt(y), parseInt(m) - 1, 1));
  }, [selectedDate]);

  const changeDate = (offset: number) => {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + offset);
      setSelectedDate(getLocalDateString(d));
      setAdvice('');
  };

  const daysWithData = useMemo(() => {
      const set = new Set<string>();
      segments.forEach(seg => {
          set.add(getLocalDateString(new Date(seg.startTime)));
      });
      return set;
  }, [segments]);

  const dailySegments = useMemo(() => {
    return segments
      .filter(seg => {
        const segDate = getLocalDateString(new Date(seg.startTime));
        return segDate === selectedDate;
      })
      .sort((a, b) => a.startTime - b.startTime);
  }, [segments, selectedDate]);

  const timelineItems = useMemo(() => {
    return dailySegments.map(seg => {
      const task = tasks.find(t => t.id === seg.taskId);
      const tag = tags.find(t => t.id === task?.tagId);
      const start = new Date(seg.startTime);
      const end = seg.endTime ? new Date(seg.endTime) : new Date(); 
      const durationMin = Math.floor((end.getTime() - start.getTime()) / 60000);
      
      return {
        id: seg.id,
        taskTitle: task?.title || 'Unknown Task',
        tagName: tag?.name || 'Uncategorized',
        tagColor: tag?.color || 'bg-slate-600',
        startTime: start.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        endTime: seg.endTime ? end.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '进行中...',
        duration: durationMin,
        isRunning: !seg.endTime
      };
    });
  }, [dailySegments, tasks, tags]);

  const handleAnalysis = async () => {
    setLoading(true);
    const timelineText = timelineItems.map(item => 
      `${item.startTime} - ${item.endTime}: [${item.tagName}] ${item.taskTitle} (${item.duration} min)`
    ).join('\n');

    const result = await analyzeDailyTimeline(selectedDate, timelineText);
    setAdvice(result);
    setLoading(false);
  };

  const formatDurationFriendly = (minutes: number) => {
      if (minutes < 60) return `${minutes}m`;
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h}h ${m}m`;
  };

  // Calendar Helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const changeMonth = (offset: number) => {
      const d = new Date(calDate);
      d.setMonth(d.getMonth() + offset);
      setCalDate(d);
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-72 shrink-0 space-y-6">
        {/* Monthly Calendar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 select-none shadow-lg">
          <div className="flex justify-between items-center mb-4">
              <button onClick={() => changeMonth(-1)} className="p-1 text-slate-400 hover:text-white transition-colors"><i className="fa-solid fa-chevron-left"></i></button>
              <span className="text-slate-200 font-bold text-sm">
                  {calDate.getFullYear()}年 {calDate.getMonth() + 1}月
              </span>
              <button onClick={() => changeMonth(1)} className="p-1 text-slate-400 hover:text-white transition-colors"><i className="fa-solid fa-chevron-right"></i></button>
          </div>
          <div className="grid grid-cols-7 text-center mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d} className="text-[10px] text-slate-500 font-bold">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-y-2 justify-items-center">
              {Array.from({ length: getFirstDayOfMonth(calDate.getFullYear(), calDate.getMonth()) }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-8 h-8"></div>
              ))}
              {Array.from({ length: daysInMonth(calDate.getFullYear(), calDate.getMonth()) }).map((_, i) => {
                  const d = i + 1;
                  const dateStr = getLocalDateString(new Date(calDate.getFullYear(), calDate.getMonth(), d));
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === getLocalDateString(new Date());
                  const hasData = daysWithData.has(dateStr);

                  return (
                      <button 
                        key={d}
                        onClick={() => { setSelectedDate(dateStr); setAdvice(''); }}
                        className={`relative w-8 h-8 rounded-full text-xs flex items-center justify-center transition-all ${
                            isSelected ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 scale-110' :
                            isToday ? 'text-blue-400 font-bold border border-blue-500/30' :
                            'text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                          {d}
                          {hasData && !isSelected && <span className="absolute bottom-1 w-1 h-1 bg-green-500 rounded-full"></span>}
                      </button>
                  );
              })}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-800 text-center flex justify-between items-center">
              <span className="text-[10px] text-slate-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span> 有记录</span>
              <button onClick={() => { setSelectedDate(getLocalDateString(new Date())); setAdvice(''); }} className="text-xs text-blue-400 hover:text-blue-300 font-medium px-3 py-1 rounded hover:bg-blue-500/10 transition-colors">回到今天</button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
           <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">AI 日报分析</h3>
              <i className="fa-solid fa-robot text-purple-400"></i>
           </div>
           <p className="text-xs text-slate-500 mb-4 leading-relaxed">
             让 Gemini 分析这一天的时间记录，找出碎片化时间，评估工作密度并给出优化建议。
           </p>
           <button 
             onClick={handleAnalysis}
             disabled={loading || timelineItems.length === 0}
             className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
           >
             {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
             {loading ? '分析中...' : '开始分析'}
           </button>
        </div>

        {advice && (
            <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-5 animate-fade-in shadow-lg">
                <h4 className="text-xs font-bold text-purple-300 mb-3 uppercase flex items-center gap-2">
                    <i className="fa-solid fa-lightbulb"></i> 分析建议
                </h4>
                <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {advice}
                </div>
            </div>
        )}
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-lg relative">
        {/* Sticky Header */}
        <div className="absolute top-0 left-0 right-0 bg-slate-900/90 backdrop-blur border-b border-slate-800 p-6 z-10 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-3">
                <i className="fa-solid fa-stopwatch text-blue-400"></i> 
                {new Date(selectedDate).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })} 详情
            </h2>
            <div className="text-xs font-normal text-slate-400 bg-slate-800 px-3 py-1 rounded-full flex gap-2 items-center">
                <span>共 {timelineItems.length} 条记录</span>
                <div className="hidden md:flex gap-1 ml-2 pl-2 border-l border-slate-600">
                    <button onClick={() => changeDate(-1)} className="hover:text-white px-1"><i className="fa-solid fa-chevron-left"></i></button>
                    <button onClick={() => changeDate(1)} className="hover:text-white px-1"><i className="fa-solid fa-chevron-right"></i></button>
                </div>
            </div>
        </div>

        <div 
            className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-6 pt-24 pb-12 transition-transform duration-300"
            onWheel={(e) => {
                // Horizontal swipe (trackpad)
                if (Math.abs(e.deltaX) > 50) {
                    if (e.deltaX > 0) changeDate(1);
                    else changeDate(-1);
                }
            }}
            onTouchStart={(e) => {
                (e.currentTarget as any).touchStartX = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
                const touchStartX = (e.currentTarget as any).touchStartX;
                if (touchStartX === undefined) return;
                const touchEndX = e.changedTouches[0].clientX;
                const diff = touchStartX - touchEndX;
                if (diff > 50) changeDate(1); // Swipe left -> Next day
                else if (diff < -50) changeDate(-1); // Swipe right -> Prev day
            }}
        >
            <div className="flex justify-center mb-8 opacity-50 md:hidden text-xs text-slate-500">
                <i className="fa-solid fa-arrows-left-right mr-2"></i> 左右滑动切换日期
            </div>

            <div className="relative border-l-2 border-slate-800 ml-20 space-y-8 min-h-[200px]">
               {timelineItems.length === 0 ? (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full">
                       <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                           <i className="fa-regular fa-calendar-xmark text-slate-500 text-2xl"></i>
                       </div>
                       <div className="text-slate-500 text-sm">该日期暂无时间记录。</div>
                   </div>
               ) : (
                   timelineItems.map((item, idx) => (
                       <div key={item.id} className="relative pl-8 group">
                           <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-slate-900 ${item.tagColor} shadow-lg group-hover:scale-125 transition-transform`}></div>
                           
                           <div className="absolute -left-20 top-0.5 text-xs font-mono text-slate-500 text-right w-12 group-hover:text-slate-300 transition-colors">
                               {item.startTime}
                           </div>

                           <div className={`bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl p-4 transition-all hover:shadow-lg ${item.isRunning ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : ''}`}>
                               <div className="flex justify-between items-start gap-4">
                                   <div className="flex-1">
                                       <div className="flex items-center gap-2 mb-2">
                                           <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${item.tagColor.replace('bg-', 'bg-').replace('500', '500/20')} ${item.tagColor.replace('bg-', 'text-').replace('500', '300')}`}>
                                               {item.tagName}
                                           </span>
                                           {item.isRunning && <span className="text-[10px] text-green-400 font-bold animate-pulse flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> 进行中</span>}
                                       </div>
                                       <h4 className="text-sm font-medium text-slate-200 leading-snug">{item.taskTitle}</h4>
                                   </div>
                                   <div className="text-right shrink-0">
                                       <div className="text-sm font-bold text-slate-200 font-mono">
                                           {formatDurationFriendly(item.duration)}
                                       </div>
                                       <div className="text-[10px] text-slate-500 mt-1 font-mono">
                                           ~ {item.endTime}
                                       </div>
                                   </div>
                               </div>
                           </div>
                       </div>
                   ))
               )}
            </div>
        </div>
      </div>
    </div>
  );
};
