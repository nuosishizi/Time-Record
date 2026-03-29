
import React from 'react';
import { TimeSegment, Tag, Task } from '../types';

interface WeeklyHeatmapProps {
  segments: TimeSegment[];
  tasks: Task[];
  tags: Tag[];
}

export const WeeklyHeatmap: React.FC<WeeklyHeatmapProps> = ({ segments, tasks, tags }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  
  // grid[day][hour] = array of { taskId, name, tagColor, topPct, heightPct }
  const grid: { id: string, name: string, color: string, tagName: string, topPct: number, heightPct: number }[][][] = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => []));

  segments.forEach(seg => {
    const start = new Date(seg.startTime);
    const end = seg.endTime ? new Date(seg.endTime) : new Date();
    
    // Safety cap at 7 days to prevent infinite loops from corrupted data
    const maxEnd = new Date(start.getTime() + 7 * 24 * 3600 * 1000);
    const actualEnd = end > maxEnd ? maxEnd : end;

    let current = new Date(start);
    while (current < actualEnd) {
        const day = current.getDay();
        const hour = current.getHours();
        
        const nextHour = new Date(current);
        nextHour.setHours(hour + 1, 0, 0, 0);
        
        const segmentEndForThisHour = actualEnd < nextHour ? actualEnd : nextHour;
        
        const durationMin = (segmentEndForThisHour.getTime() - current.getTime()) / 60000;
        const topPct = (current.getMinutes() / 60) * 100;
        let heightPct = (durationMin / 60) * 100;
        
        // Visual minimum to ensure very short tasks are clickable/visible
        if (heightPct < 5) heightPct = 5;

        const task = tasks.find(t => t.id === seg.taskId);
        const tag = tags.find(t => t.id === task?.tagId);
        
        grid[day][hour].push({
            id: seg.id + current.getTime(), 
            name: task?.title || 'Unknown',
            tagName: tag?.name || 'Unknown',
            color: tag?.color || 'bg-slate-600',
            topPct,
            heightPct
        });

        current = nextHour;
    }
  });

  const copyToSpreadsheet = (daysToExport: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates: Date[] = [];
    for (let i = daysToExport - 1; i >= 0; i--) {
        const d = new Date(today.getTime() - i * 24 * 3600 * 1000);
        dates.push(d);
    }
    
    // Header row
    let tsv = "时间 \\ 日期\t" + dates.map(d => `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`).join("\t") + "\n";
    
    // Iterate every 30 mins
    for (let h = 0; h < 24; h++) {
        for (let m of [0, 30]) {
            const timeLabel = `${h}:${m === 0 ? '00' : '30'}`;
            let row = [timeLabel];
            
            for (const d of dates) {
                const blockStart = new Date(d);
                blockStart.setHours(h, m, 0, 0);
                const blockEnd = new Date(blockStart.getTime() + 30 * 60000);
                
                // Find segments intersecting this 30-min block
                const overlappingSegs = segments.filter(seg => {
                    const s = new Date(seg.startTime);
                    const e = seg.endTime ? new Date(seg.endTime) : new Date();
                    return s < blockEnd && e > blockStart;
                });
                
                if (overlappingSegs.length > 0) {
                    const taskNames = overlappingSegs.map(seg => {
                        const t = tasks.find(tsk => tsk.id === seg.taskId);
                        return t ? t.title : '未知';
                    });
                    const uniqueNames = Array.from(new Set(taskNames));
                    row.push(uniqueNames.join(" / "));
                } else {
                    row.push("");
                }
            }
            tsv += row.join("\t") + "\n";
        }
    }
    
    navigator.clipboard.writeText(tsv).then(() => {
        alert(`已复制 ${daysToExport === 1 ? '今日' : '近7天'} 的排期表，可直接粘贴至 Excel/Google 表格`);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto relative">
      <div className="flex justify-between items-center mb-4 sticky left-0 z-20">
        <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <i className="fa-solid fa-border-all"></i> 时间分布热力图
            </h3>
            <div className="text-xs text-slate-500 mt-1">
            基于真实专注时长的百分比占比
            </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => copyToSpreadsheet(1)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
                title="复制今日数据矩阵"
            >
                <i className="fa-regular fa-copy"></i> 复制今日
            </button>
            <button 
                onClick={() => copyToSpreadsheet(7)}
                className="px-3 py-1.5 bg-blue-900/30 hover:bg-blue-800/50 text-blue-400 text-xs rounded-lg border border-blue-800/50 transition-colors flex items-center gap-2"
                title="复制最近7天数据矩阵"
            >
                <i className="fa-regular fa-calendar-days"></i> 复制本周
            </button>
        </div>
      </div>

      <div className="min-w-[800px]">
        {/* Header Row */}
        <div className="grid grid-cols-[50px_repeat(7,1fr)] gap-1 mb-2 sticky top-0 bg-slate-900 z-10 py-2">
           <div className="text-xs text-slate-500"></div>
           {days.map(d => <div key={d} className="text-center text-xs text-slate-400 font-medium">{d}</div>)}
        </div>
        
        {/* Grid Body */}
        <div className="grid grid-cols-[50px_repeat(7,1fr)] gap-x-1 gap-y-0.5">
          {hours.map(h => (
            <React.Fragment key={h}>
              <div className="text-[10px] text-slate-600 text-right pr-2 -mt-2 z-10">{h}:00</div>
              {days.map((_, dIndex) => {
                const cellItems = grid[dIndex][h];

                return (
                  <div 
                    key={`${dIndex}-${h}`} 
                    className="h-12 border-t border-slate-800/50 relative bg-slate-800/10 hover:bg-slate-800/30 transition-colors"
                  >
                     {cellItems.map((item, idx) => (
                         <div 
                            key={item.id + idx}
                            className={`absolute left-0 right-0 ${item.color} rounded-sm opacity-90 hover:opacity-100 hover:scale-[1.02] hover:z-30 shadow-sm cursor-help transition-all group`}
                            style={{ 
                                top: `${item.topPct}%`, 
                                height: `${item.heightPct}%`,
                                minHeight: '4px' // Ensure it doesn't disappear completely
                            }}
                         >
                            {/* Tiny label if height allows */}
                            {item.heightPct >= 25 && (
                               <div className="w-full h-full flex items-start justify-center pt-0.5 overflow-hidden">
                                  <span className="text-[8px] text-white/90 font-medium truncate px-1 drop-shadow-md leading-none">
                                     {item.name}
                                  </span>
                               </div>
                            )}

                            {/* Tooltip on Hover */}
                            <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 text-white text-xs px-2 py-1.5 rounded-lg border border-slate-700 whitespace-nowrap z-50 pointer-events-none shadow-2xl transition-opacity">
                              <div className="font-bold mb-0.5">{item.name}</div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${item.color}`}></span>
                                  {item.tagName}
                              </div>
                            </div>
                         </div>
                     ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-8 justify-center text-[10px] text-slate-400 sticky left-0 pt-4 border-t border-slate-800">
        {tags.map(t => (
          <div key={t.id} className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded">
            <div className={`w-2.5 h-2.5 rounded-sm ${t.color}`}></div> 
            <span>{t.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
