
import React from 'react';

interface ResumeModalProps {
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ taskTitle, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-blue-500/50 rounded-2xl w-full max-w-sm p-6 shadow-2xl shadow-blue-900/30 relative overflow-hidden">
        
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center mb-4 text-blue-400">
             <i className="fa-solid fa-rotate-left text-xl"></i>
          </div>
          
          <h2 className="text-lg font-bold text-white mb-2">继续之前的任务?</h2>
          
          <p className="text-slate-400 text-sm mb-6">
            您刚才正在进行 <span className="text-white font-bold">"{taskTitle}"</span>。是否要立即恢复它？
          </p>

          <div className="flex w-full gap-3">
            <button 
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-sm font-medium"
            >
              不，稍后再说
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors text-sm font-medium shadow-lg shadow-blue-600/20"
            >
              是的，继续
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
