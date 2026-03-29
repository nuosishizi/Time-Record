
import React, { useState } from 'react';
import { Task, Tag, RecurrenceType } from '../types';

interface EditTaskModalProps {
  task: Task;
  tags: Tag[];
  onSave: (updatedTask: Task) => void;
  onClose: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, tags, onSave, onClose }) => {
  const [title, setTitle] = useState(task.title);
  const [tagId, setTagId] = useState(task.tagId);
  const [description, setDescription] = useState(task.description || '');
  const [links, setLinks] = useState(task.links || '');
  const [planDate, setPlanDate] = useState(new Date(task.planTime).toISOString().split('T')[0]);
  const [planTime, setPlanTime] = useState(new Date(task.planTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
  const [recurrence, setRecurrence] = useState<RecurrenceType>(task.recurrence);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newPlanTime = new Date(`${planDate}T${planTime}`).toISOString();

    const updatedTask: Task = {
      ...task,
      title,
      tagId,
      description,
      links,
      planTime: newPlanTime,
      recurrence,
    };

    onSave(updatedTask);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">编辑任务</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">任务名称</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs text-slate-400 block mb-1">日期</label>
                <input 
                  type="date"
                  value={planDate}
                  onChange={e => setPlanDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                />
             </div>
             <div>
                <label className="text-xs text-slate-400 block mb-1">时间</label>
                <input 
                  type="time"
                  value={planTime}
                  onChange={e => setPlanTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">分类标签</label>
              <select 
                value={tagId} 
                onChange={e => setTagId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
              >
                {tags.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">循环模式</label>
              <select 
                value={recurrence} 
                onChange={e => setRecurrence(e.target.value as RecurrenceType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
              >
                {Object.values(RecurrenceType).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">备注描述</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full h-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">链接</label>
            <input 
              type="text" 
              value={links}
              onChange={e => setLinks(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-blue-400 outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg"
            >
              保存更改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
