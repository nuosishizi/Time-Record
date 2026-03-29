import React, { useEffect, useState } from 'react';
import { Tag, Task, TimeSegment } from '../types';
import { analyzeEfficiencyAI } from '../services/geminiService';

interface AnalyticsViewProps {
  tasks: Task[];
  tags: Tag[];
  segments: TimeSegment[];
}

interface DailyStat {
    dateStr: string;
    totalSeconds: number;
    tagBreakdown: Record<string, number>; // tagId -> seconds
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tasks, tags, segments }) => {
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{tagId: string, duration: number, percentage: number}[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);

  useEffect(() => {
    calculateStats();
    calculateDailyTrends();
  }, [tasks, segments, tags]);

  const calculateStats = async () => {
    // 1. Calculate duration per tag (Overall)
    const tagDurations: Record<string, number> = {};
    let totalDuration = 0;

    tasks.forEach(task => {
      const duration = task.totalDuration; // In seconds
      if (duration > 0) {
        tagDurations[task.tagId] = (tagDurations[task.tagId] || 0) + duration;
        totalDuration += duration;
      }
    });

    const calculatedStats = tags.map(tag => ({
      tagId: tag.id,
      duration: tagDurations[tag.id] || 0,
      percentage: totalDuration > 0 ? ((tagDurations[tag.id] || 0) / totalDuration) * 100 : 0
    })).sort((a, b) => b.duration - a.duration);

    setStats(calculatedStats);
  };

  const calculateDailyTrends = () => {
      // Group segments by day
      const days: Record<string, DailyStat> = {};

      segments.forEach(seg => {
          const date = new Date(seg.startTime);
          const dateStr = date.toISOString().split('T')[0];
          const task = tasks.find(t => t.id === seg.taskId);
          
          if (!days[dateStr]) {
              days[dateStr] = { dateStr, totalSeconds: 0, tagBreakdown: {} };
          }

          let duration = 0;
          if (seg.endTime) {
              duration = Math.floor((seg.endTime - seg.startTime) / 1000);
          } else {
              // Current running segment
              duration = Math.floor((Date.now() - seg.startTime) / 1000);
          }
          
          if (duration > 0 && task) {
             days[dateStr].totalSeconds += duration;
             days[dateStr].tagBreakdown[task.tagId] = (days[dateStr].tagBreakdown[task.tagId] || 0) + duration;
          }
      });

      // Convert to array and sort by date descending (last 7 days maybe)
      const sortedDays = Object.values(days).sort((a, b) => b.dateStr.localeCompare(a.dateStr));
      setDailyStats(sortedDays);
  };

  const handleGetAdvice = async () => {
    setLoading(true);
    const aiInput = stats.map(s => {
      const t = tags.find(tag => tag.id === s.tagId);
      return { tagName: t?.name || 'Unknown', durationMinutes: s.duration / 60 };
    });

    const result = await analyzeEfficiencyAI(aiInput);
    setAdvice(result);
    setLoading(false);
  };

  const formatDuration = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Overall Distribution & AI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">总体分类时间统计</h3>
          <div className="space-y-4">
            {stats.map(s => {
              const tag = tags.find(t => t.id === s.tagId);
              if (!tag || s.duration === 0) return null;
              return (
                <div key={s.tagId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300 font-medium">{tag.name}</span>
                    <span className="text-slate-400">{formatDuration(s.duration)} ({s.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${tag.color}`} 
                      style={{ width: `${s.percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {stats.every(s => s.duration === 0) && (
              <p className="text-slate-500 text-center py-8">暂无数据，请先开始一些任务。</p>
            )}
          </div>
        </div>

        {/* AI Advice Section */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-wand-magic-sparkles text-purple-400"></i> AI 效率分析
            </h3>
            <button 
              onClick={handleGetAdvice}
              disabled={loading || stats.every(s => s.duration === 0)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs rounded-lg transition-colors"
            >
              {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : '生成建议'}
            </button>
          </div>

          <div className="bg-slate-950/30 rounded-xl p-4 min-h-[200px] border border-slate-700/50 relative z-10">
            {advice ? (
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line animate-fade-in">
                {advice}
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm gap-2">
                <i className="fa-solid fa-robot text-2xl mb-2 opacity-50"></i>
                <p>点击上方按钮，让 AI 分析您的时间分配并给出建议。</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Trends Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <i className="fa-regular fa-calendar-check"></i> 每日时间占比分析
        </h3>
        <div className="space-y-4">
             {dailyStats.map(day => {
                 const date = new Date(day.dateStr);
                 const weekDay = date.toLocaleDateString('zh-CN', { weekday: 'short' });
                 
                 // Sort breakdown items by duration desc
                 const breakdownItems = Object.entries(day.tagBreakdown)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([tagId, val]) => {
                        const duration = val as number;
                        const tag = tags.find(t => t.id === tagId);
                        const pct = (duration / day.totalSeconds) * 100;
                        return { tag, duration, pct, tagId };
                    })
                    .filter(item => item.tag); // filter out deleted tags

                 return (
                     <div key={day.dateStr} className="bg-slate-800/30 rounded-lg p-4 border border-slate-800/50">
                         {/* Header: Date + Total */}
                         <div className="flex justify-between items-center mb-3">
                             <div className="flex items-center gap-2">
                                <div className="text-sm font-bold text-slate-200">{day.dateStr}</div>
                                <div className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{weekDay}</div>
                             </div>
                             <div className="text-sm font-mono text-slate-400 font-bold">
                                总计: {formatDuration(day.totalSeconds)}
                             </div>
                         </div>
                         
                         {/* Progress Bar */}
                         <div className="w-full h-3 flex rounded-full overflow-hidden bg-slate-800 mb-4">
                            {breakdownItems.map(({ tag, duration, pct, tagId }) => (
                                <div 
                                    key={tagId} 
                                    className={`${tag!.color} h-full relative group hover:opacity-90 transition-opacity`} 
                                    style={{ width: `${pct}%` }}
                                ></div>
                            ))}
                         </div>

                         {/* Legend / Breakdown Grid */}
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {breakdownItems.map(({ tag, duration, pct, tagId }) => (
                                <div key={tagId} className="flex items-center gap-2 bg-slate-900/50 rounded px-2 py-1.5 border border-slate-800">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${tag!.color}`}></div>
                                    <div className="flex flex-col min-w-0">
                                        <div className="text-xs text-slate-300 font-medium truncate">{tag!.name}</div>
                                        <div className="text-[10px] text-slate-500">
                                            {Math.round(pct)}% ({formatDuration(duration)})
                                        </div>
                                    </div>
                                </div>
                            ))}
                         </div>
                     </div>
                 );
             })}
             {dailyStats.length === 0 && (
                 <div className="text-center text-slate-500 py-8">暂无历史数据</div>
             )}
        </div>
      </div>
    </div>
  );
};