
import React, { useState, useMemo } from 'react';
import { Search, Plus, PieChart as PieIcon, X, DollarSign, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from './AppContext';
import { Expense } from './types';

const Finance: React.FC = () => {
  const { expenses, setExpenses, expenseCategories, addNotification } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [catId, setCatId] = useState('');
  const [desc, setDesc] = useState('');

  const total = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const pieData = useMemo(() => expenseCategories.map(cat => ({ name: cat.name, value: expenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0), color: cat.color || '#6366f1' })).filter(d => d.value > 0), [expenses, expenseCategories]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !catId) return;
    setExpenses(prev => [{ id: Date.now().toString(), amount: parseFloat(amount), categoryId: catId, date: new Date().toISOString().split('T')[0], description: desc }, ...prev]);
    addNotification('Expense Recorded'); setIsModalOpen(false); setAmount(''); setDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end"><h1 className="text-2xl font-black">Financial Hub</h1><button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"><Plus size={18}/> New Expense</button></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white rounded-[2rem] border overflow-hidden">
          <div className="p-6 border-b font-black text-xs uppercase tracking-widest text-slate-400">Expense Ledger</div>
          <div className="overflow-x-auto"><table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase"><tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Category</th><th className="px-6 py-4 text-right">Amount</th></tr></thead>
            <tbody>{expenses.map(exp => (
              <tr key={exp.id} className="border-b"><td className="px-6 py-4 text-xs font-bold">{exp.date}</td><td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black uppercase">{expenseCategories.find(c => c.id === exp.categoryId)?.name}</span></td><td className="px-6 py-4 text-right font-black text-rose-500">-${exp.amount}</td></tr>
            ))}</tbody>
          </table></div>
        </div>
        <div className="space-y-6">
          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl">
            <p className="text-[10px] font-black uppercase">Total Spend</p>
            <h2 className="text-4xl font-black mt-2">${total.toLocaleString()}</h2>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border h-80"><h3 className="text-xs font-black text-slate-400 uppercase mb-4">Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">{pieData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] w-full max-w-md p-8 animate-in zoom-in space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-black">Record Spend</h2><button type="button" onClick={() => setIsModalOpen(false)}><X size={24}/></button></div>
            <select required className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={catId} onChange={e => setCatId(e.target.value)}><option value="">Category...</option>{expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <input required type="number" step="0.01" className="w-full p-4 bg-slate-50 border rounded-2xl font-black text-xl text-center" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
            <input type="text" className="w-full p-4 bg-slate-50 border rounded-2xl" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Memo..." />
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black">Commit Record</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default Finance;
