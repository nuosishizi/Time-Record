
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
  
  const getTag = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;
    return tags.find(t => t.id === task.tagId);
  };

  const getTaskName = (taskId: string) => {
    return tasks.find(t => t.id === taskId)?.title || '';
  };

  // Build grid data
  // grid[day][hour] = taskId
  const grid = Array.from({ length: 7 }, () => Array(24).fill(null));

  segments.forEach(seg => {
    const start = new Date(seg.startTime);
    const day = start.getDay();
    const hour = start.getHours();
    
    // In a real robust heatmap, we would calculate duration and span multiple cells.
    // Here we strictly mark the "Started Hour" to keep visualization simple for this version.
    grid[day][hour] = seg.taskId;
  });

  return (
    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto relative">
      <div className="flex justify-between items-center mb-4 sticky left-0">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          <i className="fa-solid fa-border-all mr-2"></i> 时间分布热力图
        </h3>
        <div className="text-xs text-slate-500">
           展示每个小时的开始任务
        </div>
      </div>

      <div className="min-w-[800px]">
        {/* Header Row */}
        <div className="grid grid-cols-[50px_repeat(7,1fr)] gap-1 mb-2">
           <div className="text-xs text-slate-500"></div>
           {days.map(d => <div key={d} className="text-center text-xs text-slate-400 font-medium">{d}</div>)}
        </div>
        
        {/* Grid Body */}
        <div className="grid grid-cols-[50px_repeat(7,1fr)] gap-1">
          {hours.map(h => (
            <React.Fragment key={h}>
              <div className="text-[10px] text-slate-600 text-right pr-2 pt-1.5">{h}:00</div>
              {days.map((_, dIndex) => {
                const taskId = grid[dIndex][h];
                const tag = taskId ? getTag(taskId) : null;
                const taskName = taskId ? getTaskName(taskId) : '';

                return (
                  <div 
                    key={`${dIndex}-${h}`} 
                    className={`
                      h-10 rounded-md transition-all border border-slate-800/50 overflow-hidden relative group
                      ${taskId ? (tag?.color || 'bg-slate-600') : 'bg-slate-800/30'} 
                      ${taskId ? 'opacity-90 hover:opacity-100 hover:scale-[1.05] hover:z-10 shadow-sm cursor-help' : ''}
                    `}
                  >
                    {taskId && (
                      <div className="w-full h-full flex items-center justify-center p-0.5">
                        <span className="text-[9px] text-white/90 font-medium truncate w-full text-center drop-shadow-md">
                          {taskName}
                        </span>
                      </div>
                    )}
                    
                    {/* Tooltip on Hover */}
                    {taskId && (
                       <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs px-2 py-1 rounded border border-slate-700 whitespace-nowrap z-50 pointer-events-none shadow-xl transition-opacity">
                         <div className="font-bold">{taskName}</div>
                         <div className="text-[10px] opacity-80">{tag?.name}</div>
                       </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 justify-center text-[10px] text-slate-400 sticky left-0 pt-4 border-t border-slate-800">
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
