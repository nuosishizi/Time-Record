import React, { useEffect, useState } from 'react';
import { getBackups, restoreBackup, BackupData } from '../utils/backupService';
import { Task, TimeSegment, Tag } from '../types';

interface BackupModalProps {
  onClose: () => void;
  onRestore: (tasks: Task[], segments: TimeSegment[], tags: Tag[]) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ onClose, onRestore }) => {
  const [backups, setBackups] = useState<BackupData[]>([]);

  useEffect(() => {
    setBackups(getBackups());
  }, []);

  const handleRestore = (id: string) => {
    if (confirm('确定要恢复到此备份吗？当前未备份的数据将会丢失。')) {
      const backup = restoreBackup(id);
      if (backup) {
        onRestore(backup.tasks, backup.segments, backup.tags);
        onClose();
      } else {
        alert('无法恢复此备份');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[80vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-900/50 flex items-center justify-center text-blue-400">
               <i className="fa-solid fa-clock-rotate-left"></i>
            </div>
            <h2 className="text-xl font-bold text-white">历史备份</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {backups.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <i className="fa-solid fa-box-open text-4xl mb-4 opacity-50"></i>
            <p className="text-sm">暂无备份记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((b) => (
              <div key={b.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between hover:border-slate-600 transition-colors group">
                <div>
                  <div className="text-sm font-bold text-white mb-1">
                    {new Date(b.timestamp).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-3">
                    <span><i className="fa-solid fa-list-check mr-1"></i> {b.tasks?.length || 0} 任务</span>
                    <span><i className="fa-solid fa-clock mr-1"></i> {b.segments?.length || 0} 时间段</span>
                    <span><i className="fa-solid fa-tags mr-1"></i> {b.tags?.length || 0} 标签</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRestore(b.id)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
                >
                  <i className="fa-solid fa-rotate-left"></i> 恢复
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
