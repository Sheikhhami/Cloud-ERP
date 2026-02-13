
import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Phone, Mail, X } from 'lucide-react';
import { useApp } from './AppContext';
import { Customer } from './types';

const Customers: React.FC = () => {
  const { customers, setCustomers, addNotification } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [form, setForm] = useState<Partial<Customer>>({});

  const filtered = useMemo(() => customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)), [customers, search]);

  const openForm = (c?: Customer) => {
    if (c) { setForm(c); setSelected(c); }
    else { setForm({ name: '', phone: '', email: '', city: '', creditLimit: 10000 }); setSelected(null); }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); if (!form.name || !form.phone) return;
    if (selected) setCustomers(prev => prev.map(c => c.id === selected.id ? { ...c, ...form } as Customer : c));
    else setCustomers(prev => [{ ...form, id: Date.now().toString(), remainingDue: 0, createdAt: new Date().toISOString() } as Customer, ...prev]);
    setIsModalOpen(false); addNotification('Customer Record Saved');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end"><h1 className="text-2xl font-black">Client Relations</h1><button onClick={() => openForm()} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"><Plus size={18}/> New Client</button></div>
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex items-center gap-3"><Search size={18} className="text-slate-400"/><input type="text" placeholder="Search..." className="bg-transparent outline-none flex-1 font-bold" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b text-[10px] font-black text-slate-400 uppercase"><tr className="tracking-widest"><th className="px-6 py-4">Name</th><th className="px-6 py-4">Phone</th><th className="px-6 py-4">Balance</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
          <tbody className="divide-y">{filtered.map(c => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-bold">{c.name}</td>
              <td className="px-6 py-4 text-xs font-medium text-slate-500">{c.phone}</td>
              <td className="px-6 py-4 font-black text-rose-500">${c.remainingDue}</td>
              <td className="px-6 py-4 text-right"><button onClick={() => openForm(c)} className="p-2 text-slate-300 hover:text-blue-600"><Edit2 size={16}/></button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] w-full max-w-md p-8 animate-in zoom-in space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-black">Client Profile</h2><button type="button" onClick={() => setIsModalOpen(false)}><X size={24}/></button></div>
            <input required type="text" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full Name *" />
            <input required type="tel" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone *" />
            <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black">Confirm</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default Customers;
