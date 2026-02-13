
import React, { useState, useMemo } from 'react';
import { Search, Plus, ShoppingCart, X } from 'lucide-react';
import { useApp } from './AppContext';

const Purchases: React.FC = () => {
  const { products, vendors, purchases, recordPurchase } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vId, setVId] = useState('');
  const [pId, setPId] = useState('');
  const [qty, setQty] = useState('');
  const [cost, setCost] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault(); if (!vId || !pId || !qty || !cost) return;
    recordPurchase({ date: new Date().toISOString().split('T')[0], vendorId: vId, productId: pId, quantity: Number(qty), unitCost: Number(cost), totalAmount: Number(qty)*Number(cost), paymentStatus: 'Paid' });
    setIsModalOpen(false); setQty(''); setCost('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end"><h1 className="text-2xl font-black">Stock Inwards</h1><button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"><Plus size={18}/> New Inward</button></div>
      <div className="bg-white rounded-[2.5rem] border overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex items-center gap-3"><Search className="text-slate-400"/><input className="flex-1 bg-transparent font-bold" placeholder="Filter arrivals..." value={search} onChange={e => setSearch(e.target.value)}/></div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase"><tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Supplier</th><th className="px-6 py-4">Product</th><th className="px-6 py-4 text-center">Qty</th><th className="px-6 py-4 text-right">Invoice</th></tr></thead>
          <tbody className="divide-y">{purchases.map(p => (
            <tr key={p.id} className="hover:bg-slate-50"><td className="px-6 py-4 text-xs">{p.date}</td><td className="px-6 py-4 font-bold">{vendors.find(v => v.id === p.vendorId)?.companyName}</td><td className="px-6 py-4 text-sm font-medium">{products.find(pr => pr.id === p.productId)?.name}</td><td className="px-6 py-4 text-center font-black text-indigo-600">+{p.quantity}</td><td className="px-6 py-4 text-right font-black">${p.totalAmount}</td></tr>
          ))}</tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] w-full max-w-md p-8 animate-in zoom-in space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-black">Stock Entry</h2><button type="button" onClick={() => setIsModalOpen(false)}><X size={24}/></button></div>
            <select className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={vId} onChange={e => setVId(e.target.value)}><option value="">Supplier...</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.companyName}</option>)}</select>
            <select className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={pId} onChange={e => setPId(e.target.value)}><option value="">SKU...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <div className="grid grid-cols-2 gap-4"><input required type="number" className="p-4 bg-slate-50 border rounded-2xl font-black text-center" placeholder="Qty" value={qty} onChange={e => setQty(e.target.value)}/><input required type="number" className="p-4 bg-slate-50 border rounded-2xl font-black text-center" placeholder="Rate" value={cost} onChange={e => setCost(e.target.value)}/></div>
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black">Post Entry</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default Purchases;
