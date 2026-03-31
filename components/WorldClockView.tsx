
import React, { useState, useEffect, useRef } from 'react';
import { CityConfig } from '../types';
import { getHourInZone, getTimezoneOffset } from '../utils/timeUtils';
import { GLOBAL_CITIES, CityDatabaseEntry, getCountryName } from '../utils/cityData';

interface WorldClockViewProps {
  baseTimezone: string;
}

const DEFAULT_CITIES: CityConfig[] = [
  { name: '纽约', timezone: 'America/New_York', countryCode: 'US' },
  { name: '洛杉矶', timezone: 'America/Los_Angeles', countryCode: 'US' },
  { name: '伦敦', timezone: 'Europe/London', countryCode: 'GB' },
  { name: '东京', timezone: 'Asia/Tokyo', countryCode: 'JP' },
];

export const WorldClockView: React.FC<WorldClockViewProps> = ({ baseTimezone }) => {
  const [now, setNow] = useState(new Date());
  const [cities, setCities] = useState<CityConfig[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drag and Drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  
  const currentRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    // Load persisted cities
    const saved = localStorage.getItem('mindflow_world_cities');
    if (saved) {
        setCities(JSON.parse(saved));
    } else {
        setCities(DEFAULT_CITIES);
    }

    // Update every 10 seconds for responsive minutes
    const timer = setInterval(() => setNow(new Date()), 10000); 
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
      localStorage.setItem('mindflow_world_cities', JSON.stringify(cities));
  }, [cities]);

  useEffect(() => {
      // Auto scroll to current time with a slight delay to ensure tab switching is done
      const timer = setTimeout(() => {
          if (currentRowRef.current) {
              currentRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }, 100);
      return () => clearTimeout(timer);
  }, [now]); 

  const baseHour = getHourInZone(now, baseTimezone);
  const currentMinutes = now.getMinutes();
  const rows = Array.from({ length: 24 }, (_, i) => i);

  const getTimeAtBaseHour = (targetHourOffset: number) => {
      const d = new Date(now);
      // We keep the current minutes but adjust the hour relative to the base timezone's current hour
      const diff = targetHourOffset - baseHour;
      d.setHours(d.getHours() + diff);
      return d;
  };

  const isNight = (hour: number) => hour >= 0 && hour < 6;

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
      setDraggedIdx(index);
      e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault(); 
      e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      if (draggedIdx === null || draggedIdx === targetIndex) return;

      const newCities = [...cities];
      const [draggedItem] = newCities.splice(draggedIdx, 1);
      newCities.splice(targetIndex, 0, draggedItem);
      
      setCities(newCities);
      setDraggedIdx(null);
  };

  const handleDragEnd = () => {
      setDraggedIdx(null);
  };

  const removeCity = (e: React.MouseEvent, index: number) => {
      e.stopPropagation(); 
      const newCities = cities.filter((_, i) => i !== index);
      setCities(newCities);
  };

  const addCity = (city: CityDatabaseEntry) => {
      if (cities.some(c => c.timezone === city.timezone)) {
          alert("该时区已存在");
          return;
      }
      setCities([...cities, { name: city.name, timezone: city.timezone, countryCode: city.countryCode }]);
      setShowAddModal(false);
      setSearchQuery('');
  };

  const filteredCities = GLOBAL_CITIES.filter(c => 
      c.name.includes(searchQuery) || c.countryCode.includes(searchQuery.toUpperCase())
  );

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col relative">
      <style>{`
        @keyframes breathe-glow {
          0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.2), inset 0 0 5px rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), inset 0 0 10px rgba(59, 130, 246, 0.3); border-color: rgba(59, 130, 246, 0.8); }
          100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.2), inset 0 0 5px rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.4); }
        }
        .current-time-row {
          animation: breathe-glow 3s infinite ease-in-out;
          position: relative;
          z-index: 10;
          background: rgba(30, 58, 138, 0.4) !important;
        }
      `}</style>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl overflow-hidden flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-earth-americas text-blue-500"></i> 世界时钟对照表
            </h2>
            <div className="flex gap-3">
                <div className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 flex items-center">
                    当前基准: {baseTimezone} ({getTimezoneOffset(baseTimezone)})
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-full transition-colors flex items-center gap-1"
                >
                    <i className="fa-solid fa-plus"></i> 添加城市
                </button>
            </div>
        </div>

        <div className="overflow-auto custom-scrollbar flex-1 relative rounded-lg border border-slate-800/50">
            <table className="w-full border-collapse">
                <thead className="sticky top-0 z-20 bg-slate-900 shadow-lg">
                    <tr>
                        {/* Base Column */}
                        <th className="p-2 text-center border-b-2 border-blue-500 bg-slate-800 min-w-[100px]">
                            <div className="text-[10px] text-blue-400 font-bold uppercase">我的位置</div>
                        </th>
                        {/* City Columns (Draggable) */}
                        {cities.map((city, idx) => (
                            <th 
                                key={`${city.name}-${idx}`} 
                                draggable
                                onDragStart={(e) => handleDragStart(e, idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDrop={(e) => handleDrop(e, idx)}
                                onDragEnd={handleDragEnd}
                                className={`p-2 text-center border-b border-slate-700 min-w-[110px] group bg-slate-900 cursor-grab active:cursor-grabbing hover:bg-slate-800 transition-colors ${draggedIdx === idx ? 'opacity-50 border-blue-500 border-2' : ''}`}
                            >
                                <div className="flex flex-col items-center gap-1 relative">
                                    <div className="absolute -top-1 right-0 opacity-0 group-hover:opacity-100 flex gap-1 z-30">
                                         <button onClick={(e) => removeCity(e, idx)} className="text-red-900 hover:text-red-500 ml-1 p-1 bg-slate-900 rounded-full"><i className="fa-solid fa-xmark text-[10px]"></i></button>
                                    </div>
                                    <div className="pointer-events-none">
                                        <img 
                                            src={`https://flagsapi.com/${city.countryCode}/flat/32.png`} 
                                            alt={city.countryCode}
                                            className="w-5 h-5 drop-shadow-sm" 
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-slate-300 pointer-events-none">{city.name}</span>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-slate-900/50">
                    {rows.map(hour => {
                        const rowTime = getTimeAtBaseHour(hour);
                        const isCurrentRow = hour === baseHour;
                        const displayMin = currentMinutes.toString().padStart(2, '0');

                        return (
                            <tr 
                                key={hour} 
                                ref={isCurrentRow ? currentRowRef : null}
                                className={`transition-all h-10 ${isCurrentRow ? 'current-time-row' : 'hover:bg-slate-800/30'}`}
                            >
                                {/* Base Time Cell */}
                                <td className={`text-center border-r border-slate-800/50 font-mono text-sm font-bold relative ${isNight(hour) ? 'bg-slate-800/40 text-slate-600' : 'text-blue-400'}`}>
                                    {isCurrentRow && (
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-500 text-[10px] animate-pulse">
                                            <i className="fa-solid fa-clock"></i>
                                        </div>
                                    )}
                                    {hour.toString().padStart(2, '0')}:{displayMin}
                                </td>
                                
                                {/* Other Cities Cells */}
                                {cities.map((city, idx) => {
                                    const cityHour = getHourInZone(rowTime, city.timezone);
                                    return (
                                        <td key={`${city.name}-${idx}`} className={`text-center border-b border-slate-800/30 font-mono text-sm ${isNight(cityHour) ? 'bg-slate-800/40 text-slate-600' : 'text-slate-300'}`}>
                                            {cityHour.toString().padStart(2, '0')}:{displayMin}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
        <div className="mt-2 text-center text-[10px] text-slate-600">
            提示：表格实时同步当前分钟；带有呼吸蓝光的一行为当前时刻。
        </div>
      </div>

      {/* Add City Modal */}
      {showAddModal && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 rounded-xl">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-xl p-4 shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white font-bold">添加城市</h3>
                      <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
                  </div>
                  <input 
                      type="text" 
                      placeholder="搜索城市..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none mb-4 focus:border-blue-500"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      autoFocus
                  />
                  <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                      {filteredCities.map(c => (
                          <button 
                            key={c.name}
                            onClick={() => addCity(c)}
                            className="w-full flex items-center justify-between p-2 hover:bg-slate-800 rounded transition-colors text-left group"
                          >
                              <div className="flex items-center gap-2">
                                  <img src={`https://flagsapi.com/${c.countryCode}/flat/24.png`} className="w-5 h-5"/>
                                  <div className="flex flex-col">
                                      <span className="text-slate-300 text-sm font-bold">{getCountryName(c.countryCode)} / {c.name}</span>
                                      <span className="text-[10px] text-slate-500 group-hover:text-blue-400">
                                         {c.timezone} ({getTimezoneOffset(c.timezone)})
                                      </span>
                                  </div>
                              </div>
                          </button>
                      ))}
                      {filteredCities.length === 0 && <div className="text-center text-slate-500 text-xs py-4">未找到匹配城市</div>}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
