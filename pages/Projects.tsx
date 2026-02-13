
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, X, FolderKanban, Calendar, DollarSign, 
  Users, Edit2, Trash2, CheckCircle2, Clock, PlayCircle, 
  TrendingUp, ArrowRight, LayoutGrid, List, BarChart3,
  Download, Printer
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Project, UserRole } from '../types';

const Projects: React.FC = () => {
  const { projects, setProjects, employees, addNotification, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Selection
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Project>>({});

  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  const stats = useMemo(() => {
    const active = projects.filter(p => p.status === 'In Progress').length;
    const completed = projects.filter(p => p.status === 'Completed').length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const avgProgress = projects.length > 0 
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
      : 0;
    return { active, completed, totalBudget, avgProgress };
  }, [projects]);

  const openForm = (proj?: Project) => {
    if (proj) {
      setFormData(proj);
      setSelectedProject(proj);
    } else {
      setFormData({
        name: '',
        assignedTo: [],
        budget: 0,
        deadline: new Date().toISOString().split('T')[0],
        status: 'Pending',
        progress: 0,
        expenses: 0
      });
      setSelectedProject(null);
    }
    setIsFormModalOpen(true);
  };

  const handleDeleteRequest = (proj: Project) => {
    if (user?.role !== UserRole.ADMIN) {
      addNotification('Access Denied: Only Admins can delete projects.');
      return;
    }
    setSelectedProject(proj);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProject) {
      setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
      addNotification('Project deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedProject(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (selectedProject) {
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, ...formData } as Project : p));
      addNotification('Project updated successfully');
    } else {
      const newProj: Project = {
        ...formData,
        id: Date.now().toString(),
        progress: formData.progress || 0,
        expenses: formData.expenses || 0
      } as Project;
      setProjects(prev => [newProj, ...prev]);
      addNotification('Project launched successfully');
    }
    setIsFormModalOpen(false);
  };

  const toggleEmployee = (empId: string) => {
    const current = formData.assignedTo || [];
    if (current.includes(empId)) {
      setFormData({ ...formData, assignedTo: current.filter(id => id !== empId) });
    } else {
      setFormData({ ...formData, assignedTo: [...current, empId] });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 size={14} />;
      case 'In Progress': return <PlayCircle size={14} className="animate-pulse" />;
      default: return <Clock size={14} />;
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Project Sprints</h1>
          <p className="text-slate-500">Track deadlines, team allocations, and operational budgets.</p>
        </div>
        <div className="flex items-center gap-4 no-print">
          <div className="bg-white p-1 rounded-xl border border-slate-200 flex gap-1 shadow-sm">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={18}/></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}><List size={18}/></button>
          </div>
          <button onClick={handleExportPDF} title="Export PDF" className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm"><Download size={20}/></button>
          <button 
            onClick={() => openForm()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={20} />
            <span>Launch Project</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-2">
          <div className="p-2 w-fit bg-blue-50 text-blue-600 rounded-xl"><FolderKanban size={20}/></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Sprints</p>
          <p className="text-2xl font-black text-slate-800">{stats.active}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-2">
          <div className="p-2 w-fit bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={20}/></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
          <p className="text-2xl font-black text-slate-800">{stats.completed}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-2">
          <div className="p-2 w-fit bg-indigo-50 text-indigo-600 rounded-xl"><DollarSign size={20}/></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Budget</p>
          <p className="text-2xl font-black text-slate-800">${stats.totalBudget.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-2">
          <div className="p-2 w-fit bg-amber-50 text-amber-600 rounded-xl"><TrendingUp size={20}/></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Progress</p>
          <p className="text-2xl font-black text-slate-800">{stats.avgProgress}%</p>
        </div>
      </div>

      <div className="relative no-print">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Filter projects by title..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full py-20 text-center space-y-4">
              <FolderKanban size={64} className="mx-auto text-slate-100" />
              <p className="text-slate-400 font-medium">No projects found. Launch a new one to get started.</p>
            </div>
          ) : (
            filteredProjects.map(proj => (
              <div key={proj.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative">
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                  <div className="flex gap-2">
                    <button onClick={() => openForm(proj)} className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"><Edit2 size={16}/></button>
                    <button onClick={() => handleDeleteRequest(proj)} className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"><Trash2 size={16}/></button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(proj.status)}`}>
                      {getStatusIcon(proj.status)}
                      {proj.status}
                    </span>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight line-clamp-1">{proj.name}</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Completion</span>
                        <span className="text-slate-800">{proj.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${proj.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={10}/> Deadline</p>
                        <p className="text-sm font-bold text-slate-700">{proj.deadline}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><DollarSign size={10}/> Budget</p>
                        <p className="text-sm font-bold text-slate-700">${proj.budget.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                     <div className="flex -space-x-2">
                        {proj.assignedTo.map(empId => {
                          const emp = employees.find(e => e.id === empId);
                          return (
                            <div key={empId} title={emp?.name} className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase">
                              {emp?.name.charAt(0)}
                            </div>
                          );
                        })}
                        {proj.assignedTo.length === 0 && <span className="text-xs text-slate-400 font-medium italic">Unassigned</span>}
                     </div>
                     <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors no-print"><ArrowRight size={20}/></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Project Name</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Team</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Budget</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Progress</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProjects.map(proj => (
                  <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(proj.status)}`}>
                        {getStatusIcon(proj.status)}
                        {proj.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-slate-800">{proj.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5"><Calendar size={10}/> Due {proj.deadline}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-1.5">
                        {proj.assignedTo.map(empId => (
                          <div key={empId} className="w-7 h-7 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[8px] font-black text-slate-600 uppercase">
                            {employees.find(e => e.id === empId)?.name.charAt(0)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-slate-800">${proj.budget.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32 flex items-center gap-3">
                         <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-600" style={{ width: `${proj.progress}%` }} />
                         </div>
                         <span className="text-[10px] font-black text-slate-500">{proj.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right no-print">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openForm(proj)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteRequest(proj)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Launch/Edit Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedProject ? 'Modify Sprint' : 'Launch New Sprint'}</h2>
              <button onClick={() => setIsFormModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-h-[75vh] overflow-y-auto scrollbar-hide">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Title *</label>
                <input required type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Allocated Budget ($)</label>
                <div className="relative">
                   <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                   <input required type="number" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold" value={formData.budget} onChange={e => setFormData({...formData, budget: Number(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Deadline</label>
                <div className="relative">
                   <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                   <input required type="date" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sprint Status</label>
                <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Progress (%)</label>
                <input type="range" min="0" max="100" step="1" className="w-full h-10 mt-2 accent-blue-600 cursor-pointer" value={formData.progress || 0} onChange={e => setFormData({...formData, progress: Number(e.target.value)})} />
                <div className="text-right font-black text-blue-600">{formData.progress}%</div>
              </div>

              <div className="md:col-span-2 pt-4 border-t border-slate-50">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4 block">Assign Personnel</label>
                <div className="flex flex-wrap gap-2">
                  {employees.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No employees registered in HR system.</p>
                  ) : (
                    employees.map(emp => (
                      <button 
                        key={emp.id}
                        type="button"
                        onClick={() => toggleEmployee(emp.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${formData.assignedTo?.includes(emp.id) ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'}`}
                      >
                        <Users size={14}/>
                        {emp.name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="md:col-span-2 pt-8 flex gap-4">
                <button type="button" onClick={() => setIsFormModalOpen(false)} className="flex-1 px-8 py-5 border border-slate-200 text-slate-600 font-bold rounded-[1.5rem] hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-[2] px-8 py-5 bg-blue-600 text-white font-black rounded-[1.5rem] hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all">Confirm Sprint</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 no-print">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10 text-center space-y-6">
              <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto">
                <Trash2 size={48} />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Archive Project?</h2>
                <p className="text-slate-500 text-sm leading-relaxed px-4">
                  Permanently remove <span className="font-bold text-slate-800">"{selectedProject.name}"</span>? 
                  This will erase all timeline data and sprint histories.
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50">Wait</button>
                <button onClick={confirmDelete} className="flex-1 px-6 py-4 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 shadow-xl shadow-rose-200">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
