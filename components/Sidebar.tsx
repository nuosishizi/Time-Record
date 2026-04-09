
import React from 'react';

interface SidebarProps {
  activeTab: 'tasks' | 'heatmap' | 'analytics' | 'timeline' | 'worldclock';
  setActiveTab: (tab: 'tasks' | 'heatmap' | 'analytics' | 'timeline' | 'worldclock') => void;
  isOpen: boolean;
  onToggle: () => void;
  onOpenTagManager: () => void;
  onExportCSV: () => void;
  onOpenSettings: () => void;
  onOpenRetroactive: () => void;
  onOpenBackup: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onToggle, onOpenTagManager, onExportCSV, onOpenSettings, onOpenRetroactive, onOpenBackup }) => {
  return (
    <>
      <div className={`fixed inset-y-0 left-0 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-30 ${isOpen ? 'w-64' : 'w-0 -translate-x-full opacity-0'}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                <i className="fa-solid fa-layer-group"></i>
            </div>
            <h1 className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 whitespace-nowrap">
                Task Central
            </h1>
          </div>
          <button onClick={onToggle} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-list-check w-5 text-center"></i>
            <span>执行列表</span>
          </button>
          
          <button
            onClick={onOpenRetroactive}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap text-green-400 hover:bg-slate-800 hover:text-green-300"
          >
            <i className="fa-solid fa-clock-rotate-left w-5 text-center"></i>
            <span>补录任务</span>
          </button>
          
          <button
            onClick={() => setActiveTab('timeline')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-calendar-week w-5 text-center"></i>
            <span>时间详情</span>
          </button>

          <button
            onClick={() => setActiveTab('worldclock')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
              activeTab === 'worldclock'
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-earth-americas w-5 text-center"></i>
            <span>世界时钟</span>
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
              activeTab === 'heatmap'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-border-all w-5 text-center"></i>
            <span>周视图复盘</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-chart-pie w-5 text-center"></i>
            <span>效率分析</span>
          </button>

          <div className="my-4 border-t border-slate-800"></div>

          <button
            onClick={onOpenTagManager}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <i className="fa-solid fa-tags w-5 text-center"></i>
            <span>标签管理</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
           <button
             onClick={onOpenBackup}
             className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-blue-700 text-blue-400 hover:text-white hover:bg-blue-800 transition-colors text-sm"
          >
             <i className="fa-solid fa-clock-rotate-left"></i> 历史记录面板
          </button>

           <button
             onClick={onExportCSV}
             className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm"
          >
             <i className="fa-solid fa-file-csv"></i> 导出 CSV
          </button>

           <button
             onClick={onOpenSettings}
             className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm"
          >
             <i className="fa-solid fa-gear"></i> 设置
          </button>

          <div className="mt-2 bg-slate-800/50 rounded-lg p-3 text-xs text-slate-500 text-center">
             V7.5 World Ready
          </div>
        </div>
      </div>
      
      {/* Toggle Button when Closed - Fixed Top Left */}
      {!isOpen && (
        <button 
            onClick={onToggle}
            className="fixed top-6 left-6 z-40 p-2 text-slate-400 hover:text-white transition-all bg-slate-900/50 rounded-lg border border-slate-800 backdrop-blur"
        >
            <i className="fa-solid fa-bars text-xl"></i>
        </button>
      )}
    </>
  );
};
