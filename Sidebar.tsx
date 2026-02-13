
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './constants';
import { LogOut, ChevronRight, Activity } from 'lucide-react';
import { useApp } from './AppContext';

const Sidebar: React.FC = () => {
  const { setUser, user } = useApp();

  return (
    <aside className="w-72 bg-slate-900 text-white flex-shrink-0 flex flex-col h-screen fixed lg:static z-40 transition-all duration-500 no-print border-r border-slate-800 shadow-2xl">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none">CloudERP</h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Enterprise Suite v4.0</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all group ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <div className="flex items-center space-x-4">
              <span className="transition-transform group-hover:scale-110 group-hover:rotate-3">{item.icon}</span>
              <span className="font-bold text-sm tracking-tight">{item.name}</span>
            </div>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
          </NavLink>
        ))}
      </nav>
      <div className="p-6 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur">
        <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-black">{user?.name.charAt(0)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-white truncate">{user?.name}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.role}</p>
          </div>
        </div>
        <button onClick={() => setUser(null)} className="flex items-center space-x-3 px-4 py-3 w-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all font-bold text-sm">
          <LogOut size={18} />
          <span>Terminate Session</span>
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
