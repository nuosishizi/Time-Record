
import React, { useState } from 'react';
import { Tag } from '../types';

interface TagManagerProps {
  tags: Tag[];
  onUpdateTags: (tags: Tag[]) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  { name: 'Blue', class: 'bg-blue-500', border: 'border-blue-500' },
  { name: 'Purple', class: 'bg-purple-500', border: 'border-purple-500' },
  { name: 'Green', class: 'bg-green-500', border: 'border-green-500' },
  { name: 'Red', class: 'bg-red-500', border: 'border-red-500' },
  { name: 'Orange', class: 'bg-orange-500', border: 'border-orange-500' },
  { name: 'Pink', class: 'bg-pink-500', border: 'border-pink-500' },
  { name: 'Teal', class: 'bg-teal-500', border: 'border-teal-500' },
  { name: 'Slate', class: 'bg-slate-500', border: 'border-slate-500' },
];

export const TagManager: React.FC<TagManagerProps> = ({ tags, onUpdateTags, onClose }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) return;
    
    if (editingId) {
      // Update existing
      const updated = tags.map(t => t.id === editingId ? { ...t, name, description: desc || name, color: selectedColor.class } : t);
      onUpdateTags(updated);
      setEditingId(null);
    } else {
      // Add new
      const newTag: Tag = {
        id: crypto.randomUUID(),
        name,
        description: desc || name, // Fallback desc
        color: selectedColor.class
      };
      onUpdateTags([...tags, newTag]);
    }
    resetForm();
  };

  const handleEditClick = (tag: Tag) => {
    setEditingId(tag.id);
    setName(tag.name);
    setDesc(tag.description);
    const color = PRESET_COLORS.find(c => c.class === tag.color) || PRESET_COLORS[0];
    setSelectedColor(color);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tags.length <= 1) {
      alert("At least one tag is required.");
      return;
    }
    onUpdateTags(tags.filter(t => t.id !== id));
    if (editingId === id) resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDesc('');
    setSelectedColor(PRESET_COLORS[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">自定义标签 & AI 分类规则</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* List of existing tags */}
        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
          {tags.map(tag => (
            <div 
              key={tag.id} 
              onClick={() => handleEditClick(tag)}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${editingId === tag.id ? 'bg-slate-800 border-blue-500 ring-1 ring-blue-500' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${tag.color}`}></div>
                <div>
                  <div className="font-bold text-slate-200 text-sm">{tag.name}</div>
                  <div className="text-xs text-slate-500 truncate max-w-[200px]">{tag.description}</div>
                </div>
              </div>
              <button onClick={(e) => handleDelete(tag.id, e)} className="text-slate-600 hover:text-red-400 p-2">
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          ))}
        </div>

        {/* Add/Edit form */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 transition-all">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase">
              {editingId ? '编辑标签' : '添加新标签'}
            </h3>
            {editingId && (
              <button onClick={resetForm} className="text-xs text-blue-400 hover:text-blue-300">
                取消编辑
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="标签名称 (例如: 深度工作)" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
            />
            <input 
              type="text" 
              placeholder="AI 识别关键词 (例如: 代码, 文档, 会议)" 
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
            />
            
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c)}
                  className={`w-6 h-6 rounded-full ${c.class} ${selectedColor.name === c.name ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'} transition-all`}
                />
              ))}
            </div>

            <button 
              onClick={handleSave}
              disabled={!name}
              className={`w-full py-2 rounded-lg text-sm font-medium transition-colors text-white ${editingId ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'}`}
            >
              {editingId ? '保存修改' : '添加标签'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
