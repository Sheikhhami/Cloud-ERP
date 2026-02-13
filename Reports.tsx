
import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Package, Users, Truck, Download, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from './AppContext';

const Reports: React.FC = () => {
  const { sales, products, expenses, exportToCSV } = useApp();
  const [tab, setTab] = useState('profit');

  const stats = useMemo(() => {
    const revenue = sales.reduce((sum, s) => sum + s.total, 0);
    const exp = expenses.reduce((sum, e) => sum + e.amount, 0);
    return { revenue, exp, net: revenue - exp };
  }, [sales, expenses]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-end"><h1 className="text-3xl font-black text-slate-800">Analytical Intelligence</h1><div className="flex gap-2 bg-white p-1 border rounded-2xl no-print">{['profit', 'inventory', 'customers'].map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${tab === t ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>{t}</button>)}</div></div>
      <div className="flex justify-end gap-3 no-print"><button onClick={() => exportToCSV(sales, 'Sales')} className="flex items-center gap-2 px-6 py-2 border rounded-xl font-bold text-xs"><Download size={16}/> Export Raw</button><button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs"><Printer size={16}/> Save PDF</button></div>
      {tab === 'profit' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                <TrendingUp className="text-emerald-500 mb-4" size={24}/>
                <p className="text-[10px] font-black text-slate-400 uppercase">Gross Revenue</p>
                <p className="text-3xl font-black">${stats.revenue.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
                <BarChart3 className="text-indigo-400 mb-4" size={24}/>
                <p className="text-[10px] font-black text-slate-500 uppercase">Net Intelligence</p>
                <p className="text-3xl font-black text-indigo-400">${stats.net.toLocaleString()}</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                <Package className="text-indigo-500 mb-4" size={24}/>
                <p className="text-[10px] font-black text-slate-400 uppercase">Inventory Value</p>
                <p className="text-3xl font-black">${products.reduce((s,p) => s + (p.stock*p.salePrice), 0).toLocaleString()}</p>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[3rem] border h-96"><h3 className="text-sm font-black mb-8">Sales Velocity</h3><ResponsiveContainer><BarChart data={sales.slice(-7)}><CartesianGrid vertical={false}/><XAxis dataKey="date" tick={{fontSize: 9}}/><YAxis tick={{fontSize: 9}}/><Tooltip/><Bar dataKey="total" fill="#6366f1" radius={[10, 10, 0, 0]}/></BarChart></ResponsiveContainer></div>
        </div>
      )}
    </div>
  );
};
export default Reports;
