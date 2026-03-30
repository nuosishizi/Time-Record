
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
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [enableAutoAITagging, setEnableAutoAITagging] = useState(true);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: AppSettings = JSON.parse(saved);
      setApiKey(parsed.apiKey || '');
      
      const savedModel = parsed.model || 'gemini-2.5-flash';
      setModel(savedModel);
      
      if (!['gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'].includes(savedModel)) {
          setIsCustomModel(true);
      }
      
      if (parsed.timezone) setTimezone(parsed.timezone);
      if (parsed.enableAutoAITagging !== undefined) setEnableAutoAITagging(parsed.enableAutoAITagging);
    }
  }, []);

  const handleSave = () => {
    const settings: AppSettings = {
      apiKey: apiKey.trim(),
      model: model.trim() || 'gemini-2.5-flash',
      timezone: timezone,
      enableAutoAITagging: enableAutoAITagging
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    // Explicitly update App state if possible, but reload is safer for global Date changes
    window.location.reload(); 
  };

  const handleModelSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (val === 'custom') {
          setIsCustomModel(true);
          setModel('');
      } else {
          setIsCustomModel(false);
          setModel(val);
      }
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
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        checked={enableAutoAITagging} 
                        onChange={(e) => setEnableAutoAITagging(e.target.checked)}
                        className="accent-blue-500 w-4 h-4"
                    />
                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">开启 AI 自动任务分类</span>
                </label>
                <p className="text-[10px] text-slate-500 ml-6">如果关闭，创建任务时将默认不调用 AI，以节省您的 API 额度，除非手动点击 AI 分类按钮。</p>
            </div>
            
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
                <label className="text-xs font-bold text-slate-400">Gemini API Key</label>
                <div className="relative">
                    <input 
                        type="password" 
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="默认使用系统预设 Key"
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-10 pr-3 py-2.5 outline-none focus:border-blue-500 transition-colors placeholder-slate-600"
                    />
                    <i className="fa-solid fa-key absolute left-3 top-3.5 text-slate-500 text-xs"></i>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">模型版本</label>
                <div className="space-y-2">
                    <div className="relative">
                        <select
                            value={isCustomModel ? 'custom' : model}
                            onChange={handleModelSelect}
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-10 pr-3 py-2.5 outline-none focus:border-blue-500 appearance-none cursor-pointer"
                        >
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash (推荐 - 平衡)</option>
                            <option value="gemini-1.5-pro">Gemini 1.5 Pro (更强推理)</option>
                            <option value="gemini-1.5-flash">Gemini 1.5 Flash (快速)</option>
                            <option value="custom">自定义输入...</option>
                        </select>
                        <i className="fa-solid fa-microchip absolute left-3 top-3.5 text-slate-500 text-xs"></i>
                        <i className="fa-solid fa-chevron-down absolute right-3 top-3.5 text-slate-500 text-xs pointer-events-none"></i>
                    </div>
                    {isCustomModel && (
                        <div className="relative animate-fade-in-up">
                            <input 
                                type="text" 
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                placeholder="输入自定义模型名称 (如: gemini-experimental)"
                                className="w-full bg-slate-800 border border-blue-500/50 text-white rounded-lg pl-10 pr-3 py-2.5 outline-none focus:border-blue-500 transition-colors"
                                autoFocus
                            />
                            <i className="fa-solid fa-pen-to-square absolute left-3 top-3.5 text-blue-500 text-xs"></i>
                        </div>
                    )}
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
