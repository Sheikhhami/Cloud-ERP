
import React, { useState, useMemo } from 'react';
import { Scissors, Plus, Hammer, ShieldAlert, X, Calculator } from 'lucide-react';
import { useApp } from './AppContext';
import { ManufacturingProcessType } from './types';

const Manufacturing: React.FC = () => {
  const { products, manufacturingEntries, performManufacturing, addNotification } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rawId, setRawId] = useState('');
  const [rawQty, setRawQty] = useState('');
  const [finishedName, setFinishedName] = useState('');
  const [unitCost, setUnitCost] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = products.find(p => p.id === rawId);
    if (!raw || raw.stock < Number(rawQty)) return addNotification('Insufficient raw material');
    performManufacturing({
      date: new Date().toISOString().split('T')[0],
      rawProductId: rawId, rawQuantity: Number(rawQty), rawUnitCost: raw.averageCost || raw.purchasePrice,
      processType: 'Other', unitProcessCost: Number(unitCost), claimQuantity: 0,
      finishedProductId: `FIN-${Date.now()}`, finishedProductName: finishedName,
      finishedQuantity: Number(rawQty), finishedUnitCost: (raw.averageCost || raw.purchasePrice) + Number(unitCost), notes: ''
    });
    setIsModalOpen(false); addNotification('Batch Processed');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end"><h1 className="text-2xl font-black">Production Floor</h1><button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"><Scissors size={18}/> New Cycle</button></div>
      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <div className="p-6 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Manufacturing Log</div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase"><tr><th className="px-6 py-4">Process</th><th className="px-6 py-4">Finished Good</th><th className="px-6 py-4 text-center">Qty</th><th className="px-6 py-4 text-right">Unit Cost</th></tr></thead>
          <tbody className="divide-y">{manufacturingEntries.map(entry => (
            <tr key={entry.id} className="hover:bg-slate-50">
              <td className="px-6 py-4"><span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase">{entry.processType}</span></td>
              <td className="px-6 py-4 font-bold">{entry.finishedProductName}</td>
              <td className="px-6 py-4 text-center font-black text-emerald-600">+{entry.finishedQuantity}</td>
              <td className="px-6 py-4 text-right font-black">${entry.finishedUnitCost.toFixed(2)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] w-full max-w-md p-8 animate-in zoom-in space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-black">Cycle Parameters</h2><button type="button" onClick={() => setIsModalOpen(false)}><X size={24}/></button></div>
            <select required className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={rawId} onChange={e => setRawId(e.target.value)}><option value="">Material...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stock})</option>)}</select>
            <input required type="number" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={rawQty} onChange={e => setRawQty(e.target.value)} placeholder="Input Qty *" />
            <input required type="text" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={finishedName} onChange={e => setFinishedName(e.target.value)} placeholder="Result SKU Name *" />
            <input required type="number" step="0.01" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={unitCost} onChange={e => setUnitCost(e.target.value)} placeholder="Process Cost/Unit *" />
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black">Start Process</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default Manufacturing;
