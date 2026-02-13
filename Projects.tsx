
import React, { useState, useMemo } from 'react';
import { Plus, Search, FolderKanban, CheckCircle2, PlayCircle, X, Edit2 } from 'lucide-react';
import { useApp } from './AppContext';
import { Project } from './types';

const Projects: React.FC = () => {
  const { projects, setProjects, addNotification } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const [form, setForm] = useState<Partial<Project>>({});

  const filtered = useMemo(() => projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase())), [projects, search]);

  const openForm = (p?: Project) => {
    if (p) { setForm(p); setSelected(p); }
    else { setForm({ name: '', budget: 0, deadline: new Date().toISOString().split('T')[0], status: 'Pending', progress: 0 }); setSelected(null); }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); if (!form.name) return;
    if (selected) setProjects(prev => prev.map(p => p.id === selected.id ? { ...p, ...form } as Project : p));
    else setProjects(prev => [{ ...form, id: Date.now().toString(), assignedTo: [], expenses: 0 } as Project, ...prev]);
    setIsModalOpen(false); addNotification('Sprint Launched');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end"><h1 className="text-2xl font-black">Strategic Projects</h1><button onClick={() => openForm()} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"><Plus size={20}/> Launch Sprint</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(proj => (
          <div key={proj.id} className="bg-white p-8 rounded-[2rem] border shadow-sm space-y-4 group relative">
             <button onClick={() => openForm(proj)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={16}/></button>
             <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${proj.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>{proj.status}</span>
             <h3 className="text-xl font-black">{proj.name}</h3>
             <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase"><span>Progress</span><span>{proj.progress}%</span></div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600" style={{ width: `${proj.progress}%` }} /></div>
             </div>
             <p className="text-xs text-slate-400 font-bold uppercase">Deadline: {proj.deadline}</p>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] w-full max-w-md p-8 animate-in zoom-in space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-black">Sprint Logistics</h2><button type="button" onClick={() => setIsModalOpen(false)}><X size={24}/></button></div>
            <input required type="text" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Sprint Title *" />
            <input required type="number" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={form.budget} onChange={e => setForm({...form, budget: Number(e.target.value)})} placeholder="Budget *" />
            <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black">Confirm Launch</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default Projects;
