
import React from 'react';

interface ReminderModalProps {
  message: string;
  nextTaskPreview?: string;
  onClose: () => void;
  onSnooze: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({ message, nextTaskPreview, onClose, onSnooze }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-blue-500/50 rounded-2xl w-full max-w-md shadow-2xl shadow-blue-900/50 p-6 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 animate-pulse">
             <i className="fa-solid fa-bell text-2xl text-white"></i>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">Gemini 智能提醒</h2>
          
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 w-full mb-6">
            <p className="text-blue-100 text-lg leading-relaxed font-medium">
              "{message}"
            </p>
          </div>

          {nextTaskPreview && (
             <div className="w-full mb-6 text-left bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Up Next</div>
                <div className="text-slate-300 text-sm flex items-center gap-2">
                    <i className="fa-solid fa-circle-arrow-right text-blue-500"></i>
                    {nextTaskPreview}
                </div>
             </div>
          )}

          <div className="flex w-full gap-3">
            <button 
              onClick={onSnooze}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 text-amber-400 hover:bg-slate-700 transition-colors font-medium border border-slate-700 hover:border-amber-500/30"
            >
              <i className="fa-solid fa-clock mr-2"></i>
              推迟 5 分钟
            </button>
            <button 
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors font-medium shadow-lg shadow-blue-600/20"
            >
              我知道了
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
