
import React, { useState, useEffect } from 'react';
import { Bell, Search, User, Menu, X, Globe, Wifi, ShieldCheck, Clock } from 'lucide-react';
import { useApp } from './AppContext';

const Header: React.FC = () => {
  const { user, notifications, removeNotification } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-8 sticky top-0 z-30 no-print shadow-sm">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" size={18} />
          <input type="text" placeholder="Search Intelligence..." className="w-full pl-12 pr-4 py-3 bg-slate-100 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium text-sm shadow-inner" />
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className={`p-3 rounded-2xl relative transition-all ${notifications.length > 0 ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>
            <Bell size={20} />
            {notifications.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-bounce"></span>}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-4 w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="font-black text-sm uppercase tracking-widest text-slate-800">Operational Alerts</span>
                <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black">{notifications.length}</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm font-medium">All systems operational</div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} className="p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-start gap-4 group">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-700 leading-snug">{n}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Just Now</p>
                      </div>
                      <button onClick={() => removeNotification(i)} className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><X size={16}/></button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <button className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all flex items-center gap-3 pr-5">
           <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center font-black text-sm">{user?.name.charAt(0)}</div>
          <span className="text-xs font-black uppercase tracking-widest hidden lg:block">{user?.name.split(' ')[0]}</span>
        </button>
      </div>
    </header>
  );
};
export default Header;
