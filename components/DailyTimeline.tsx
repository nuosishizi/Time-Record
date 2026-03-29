
import React, { useState, useMemo } from 'react';
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
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-64 shrink-0 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">选择日期</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
           <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">AI 日报分析</h3>
              <i className="fa-solid fa-robot text-purple-400"></i>
           </div>
           <p className="text-xs text-slate-500 mb-4">
             让 Gemini 分析这一天的时间记录，找出碎片化时间，评估工作密度并给出优化建议。
           </p>
           <button 
             onClick={handleAnalysis}
             disabled={loading || timelineItems.length === 0}
             className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
           >
             {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
             开始分析
           </button>
        </div>

        {advice && (
            <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-4 animate-fade-in">
                <h4 className="text-xs font-bold text-purple-300 mb-2 uppercase">分析建议</h4>
                <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {advice}
                </div>
            </div>
        )}
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-y-auto custom-scrollbar min-h-[500px]">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
             <i className="fa-solid fa-stopwatch text-blue-400"></i> 
             {new Date(selectedDate).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })} 详情
        </h2>

        <div className="relative border-l-2 border-slate-800 ml-20 space-y-8 pb-10">
           {timelineItems.length === 0 ? (
               <div className="pl-8 text-slate-500 text-sm">该日期暂无时间记录。</div>
           ) : (
               timelineItems.map((item, idx) => (
                   <div key={item.id} className="relative pl-8 group">
                       <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-slate-900 ${item.tagColor} shadow-lg group-hover:scale-125 transition-transform`}></div>
                       
                       <div className="absolute -left-20 top-0.5 text-xs font-mono text-slate-500 text-right w-12">
                           {item.startTime}
                       </div>

                       <div className={`bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg p-3 transition-all ${item.isRunning ? 'border-green-500/50 shadow-green-900/10' : ''}`}>
                           <div className="flex justify-between items-start">
                               <div>
                                   <div className="flex items-center gap-2 mb-1">
                                       <span className={`text-[10px] px-1.5 rounded ${item.tagColor.replace('bg-', 'bg-').replace('500', '500/20')} ${item.tagColor.replace('bg-', 'text-').replace('500', '300')}`}>
                                           {item.tagName}
                                       </span>
                                       {item.isRunning && <span className="text-[10px] text-green-400 font-bold animate-pulse">● 进行中</span>}
                                   </div>
                                   <h4 className="text-sm font-medium text-slate-200">{item.taskTitle}</h4>
                               </div>
                               <div className="text-right">
                                   <div className="text-xs font-bold text-slate-300">
                                       {formatDurationFriendly(item.duration)}
                                   </div>
                                   <div className="text-[10px] text-slate-600 mt-1">
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
  );
};
