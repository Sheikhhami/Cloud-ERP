
import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Lock, Globe, Save, Mail } from 'lucide-react';
import { useApp } from './AppContext';

const Settings: React.FC = () => {
  const { user, updateUser } = useApp();
  const [tab, setTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = (e: React.FormEvent) => { e.preventDefault(); updateUser({ name, email }); };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3"><SettingsIcon className="text-blue-600" size={32}/> System Config</h1>
      <div className="bg-white rounded-[2.5rem] shadow-sm border overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        <div className="w-64 bg-slate-50 border-r p-6 space-y-2">
          {['profile', 'security', 'regional'].map(t => <button key={t} onClick={() => setTab(t)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm ${tab === t ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>{t}</button>)}
        </div>
        <div className="flex-1 p-12">
          {tab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Name</label><input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Email</label><input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <button type="submit" className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl flex items-center gap-2"><Save size={18}/> Apply Changes</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default Settings;
