
import React, { useState, useMemo } from 'react';
import { Plus, Search, Truck, Phone, X, Edit2 } from 'lucide-react';
import { useApp } from './AppContext';
import { Vendor } from './types';

const Vendors: React.FC = () => {
  const { vendors, setVendors, addNotification } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [form, setForm] = useState<Partial<Vendor>>({});

  const filtered = useMemo(() => vendors.filter(v => v.companyName.toLowerCase().includes(search.toLowerCase())), [vendors, search]);

  const openForm = (v?: Vendor) => {
    if (v) { setForm(v); setSelected(v); }
    else { setForm({ companyName: '', name: '', phone: '', email: '', openingBalance: 0 }); setSelected(null); }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); if (!form.companyName) return;
    if (selected) setVendors(prev => prev.map(v => v.id === selected.id ? { ...v, ...form } as Vendor : v));
    else setVendors(prev => [{ ...form, id: `VEN-${Date.now()}`, totalPurchases: 0, totalPaid: 0, remainingPayable: form.openingBalance || 0, createdAt: new Date().toISOString(), ledger: [] } as Vendor, ...prev]);
    setIsModalOpen(false); addNotification('Supplier Updated');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end"><h1 className="text-2xl font-black">Supply Network</h1><button onClick={() => openForm()} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"><Plus size={18}/> Register Supplier</button></div>
      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex items-center gap-3"><Search size={18} className="text-slate-400"/><input type="text" placeholder="Search suppliers..." className="bg-transparent outline-none flex-1 font-bold" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b text-[10px] font-black text-slate-400 uppercase"><tr><th className="px-6 py-4">Company</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4 text-center">Payable</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
          <tbody className="divide-y">{filtered.map(v => (
            <tr key={v.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-bold">{v.companyName}</td>
              <td className="px-6 py-4 text-xs font-medium text-slate-500">{v.phone}</td>
              <td className="px-6 py-4 text-center font-black text-rose-500">${v.remainingPayable}</td>
              <td className="px-6 py-4 text-right"><button onClick={() => openForm(v)} className="p-2 text-slate-300 hover:text-indigo-600"><Edit2 size={16}/></button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] w-full max-w-md p-8 animate-in zoom-in space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-black">Supplier Entry</h2><button type="button" onClick={() => setIsModalOpen(false)}><X size={24}/></button></div>
            <input required type="text" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} placeholder="Company Name *" />
            <input required type="tel" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone *" />
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black">Confirm Supplier</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default Vendors;
