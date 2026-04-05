import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, Task, Tag, TimeSegment } from '../types';
import { GLOBAL_CITIES, getCountryName } from '../utils/cityData';
import { getTimezoneOffset } from '../utils/timeUtils';

interface SettingsModalProps {
  onClose: () => void;
  tasks?: Task[];
  tags?: Tag[];
  segments?: TimeSegment[];
  onImportData?: (data: any) => void;
  onClearData?: () => void;
}

const STORAGE_KEY = 'mindflow_settings_v7';

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, tasks, tags, segments, onImportData, onClearData }) => {
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [autoBackupInterval, setAutoBackupInterval] = useState(1);
  const [clearConfirm, setClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: AppSettings = JSON.parse(saved);
      if (parsed.timezone) setTimezone(parsed.timezone);
      if (parsed.autoBackupInterval) setAutoBackupInterval(parsed.autoBackupInterval);
    }
  }, []);

  const handleSave = () => {
    // Preserve existing settings but update timezone
    const savedRaw = localStorage.getItem(STORAGE_KEY);
    const existing = savedRaw ? JSON.parse(savedRaw) : { model: 'gemini-2.5-flash' };
    
    const settings: AppSettings = {
      ...existing,
      timezone: timezone,
      autoBackupInterval: autoBackupInterval
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    window.location.reload(); 
  };

  const handleExport = () => {
      const data = {
          tasks,
          tags,
          segments,
          exportDate: new Date().toISOString()
      };
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}-${String(now.getSeconds()).padStart(2,'0')}`;
      
      link.download = `MindFlow_Record_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
          try {
              const text = ev.target?.result as string;
              const data = JSON.parse(text);
              if (onImportData) {
                  onImportData(data);
                  alert('数据恢复成功！');
                  onClose();
              }
          } catch (err) {
              alert('文件解析失败，请确保是有效的备份 JSON 文件。');
          }
      };
      reader.readAsText(file);
  };

  const handleClearClick = () => {
      if (!clearConfirm) {
          setClearConfirm(true);
          return;
      }
      if (onClearData) {
          onClearData();
          setClearConfirm(false);
          onClose();
      }
  };

  // Prepare city options for selector, sorted by offset
  const sortedCities = [...GLOBAL_CITIES].sort((a, b) => {
      const offsetA = getTimezoneOffset(a.timezone);
      const offsetB = getTimezoneOffset(b.timezone);
      return offsetA.localeCompare(offsetB) || a.countryCode.localeCompare(b.countryCode);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
               <i className="fa-solid fa-gear"></i>
            </div>
            <h2 className="text-xl font-bold text-white">系统设置</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="space-y-8">
          
          {/* Section: General Config */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">基础配置</h3>
            
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">所在时区 (国家/城市)</label>
                <div className="relative">
                    <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-10 pr-8 py-2.5 outline-none focus:border-blue-500 appearance-none cursor-pointer text-xs"
                    >
                        {sortedCities.map((city, idx) => (
                            <option key={`${city.timezone}-${idx}`} value={city.timezone}>
                                {getCountryName(city.countryCode)}/{city.name} - {city.timezone} ({getTimezoneOffset(city.timezone)})
                            </option>
                        ))}
                    </select>
                    <i className="fa-solid fa-globe absolute left-3 top-3.5 text-slate-500 text-xs"></i>
                    <i className="fa-solid fa-chevron-down absolute right-3 top-3.5 text-slate-500 text-xs pointer-events-none"></i>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">改变时区后页面将自动刷新。</p>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">自动备份频率</label>
                <div className="relative">
                    <select
                        value={autoBackupInterval}
                        onChange={(e) => setAutoBackupInterval(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-10 pr-8 py-2.5 outline-none focus:border-blue-500 appearance-none cursor-pointer text-xs"
                    >
                        <option value={1}>每 1 小时 (推荐)</option>
                        <option value={4}>每 4 小时</option>
                        <option value={12}>每 12 小时</option>
                        <option value={24}>每 24 小时</option>
                    </select>
                    <i className="fa-solid fa-clock-rotate-left absolute left-3 top-3.5 text-slate-500 text-xs"></i>
                    <i className="fa-solid fa-chevron-down absolute right-3 top-3.5 text-slate-500 text-xs pointer-events-none"></i>
                </div>
            </div>
          </div>

          {/* Section: Data Management */}
          <div className="space-y-4">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">数据管理</h3>
             
             <div className="grid grid-cols-2 gap-3">
                 <button 
                    onClick={handleExport}
                    className="flex flex-col items-center justify-center p-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
                 >
                     <i className="fa-solid fa-file-export text-blue-400 text-xl mb-2"></i>
                     <span className="text-sm font-medium text-slate-300">备份导出</span>
                     <span className="text-[10px] text-slate-500">.json 格式</span>
                 </button>

                 <button 
                    onClick={handleImportClick}
                    className="flex flex-col items-center justify-center p-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
                 >
                     <i className="fa-solid fa-file-import text-green-400 text-xl mb-2"></i>
                     <span className="text-sm font-medium text-slate-300">恢复数据</span>
                     <span className="text-[10px] text-slate-500">覆盖当前记录</span>
                 </button>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json" 
                    onChange={handleFileChange}
                 />
             </div>

             <div className="pt-2">
                 <button 
                    onClick={handleClearClick}
                    onMouseLeave={() => setClearConfirm(false)}
                    className={`w-full py-2.5 rounded-lg text-sm font-bold border transition-all flex items-center justify-center gap-2 ${
                        clearConfirm 
                        ? 'bg-red-600 text-white border-red-500 animate-pulse' 
                        : 'bg-red-900/20 text-red-400 border-red-900/30 hover:bg-red-900/30'
                    }`}
                 >
                     <i className={`fa-solid ${clearConfirm ? 'fa-triangle-exclamation' : 'fa-trash-can'}`}></i>
                     {clearConfirm ? '再次点击确认清空所有数据！' : '清空所有数据'}
                 </button>
             </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
             <button 
                onClick={handleSave}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
             >
                保存设置并关闭
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};