
import React from 'react';

interface DeleteConfirmModalProps {
  taskTitle: string;
  count: number; // How many tasks with this title exist
  onConfirm: (scope: 'single' | 'all') => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ taskTitle, count, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-red-500/30 rounded-xl w-full max-w-md p-6 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
           <i className="fa-solid fa-trash-can text-red-500 text-xl"></i>
        </div>
        
        <h2 className="text-lg font-bold text-white text-center mb-2">删除确认</h2>
        <p className="text-slate-400 text-center mb-6 text-sm">
          您想如何删除 <span className="text-white font-bold">"{taskTitle}"</span> ?
        </p>

        <div className="space-y-3">
          <button 
            onClick={() => onConfirm('single')}
            className="w-full p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center justify-between group"
          >
             <div className="text-left">
                <div className="text-slate-200 font-bold text-sm">仅删除此任务</div>
                <div className="text-slate-500 text-xs">只移除当前选中的这一条记录</div>
             </div>
             <i className="fa-solid fa-check text-slate-600 group-hover:text-blue-500"></i>
          </button>

          <button 
            onClick={() => onConfirm('all')}
            className="w-full p-4 rounded-xl bg-red-900/10 hover:bg-red-900/20 border border-red-900/30 transition-all flex items-center justify-between group"
          >
             <div className="text-left">
                <div className="text-red-400 font-bold text-sm">删除所有同名记录 ({count} 条)</div>
                <div className="text-red-500/60 text-xs">包括历史记录、今天和未来的所有循环任务</div>
             </div>
             <i className="fa-solid fa-trash text-red-800 group-hover:text-red-500"></i>
          </button>
        </div>

        <button 
          onClick={onCancel}
          className="w-full mt-4 py-3 text-slate-500 hover:text-white transition-colors text-sm"
        >
          取消
        </button>
      </div>
    </div>
  );
};
