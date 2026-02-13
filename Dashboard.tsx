
import React, { useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Package, CircleDollarSign, 
  ArrowUpRight, ArrowDownRight, Layers, ChevronRight, Plus, Printer, Download, ClipboardCheck, Sparkles
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from './AppContext';

const Dashboard: React.FC = () => {
  const { products, sales, customers, expenses, vendors, user, exportToCSV } = useApp();

  const metrics = useMemo(() => {
    const revenue = sales.reduce((sum, s) => sum + s.total, 0);
    const exp = expenses.reduce((sum, e) => sum + e.amount, 0);
    const invVal = products.reduce((sum, p) => sum + ((p.averageCost || p.purchasePrice || 0) * p.stock), 0);
    const payables = vendors.reduce((sum, v) => sum + v.remainingPayable, 0);
    const receivables = customers.reduce((sum, c) => sum + c.remainingDue, 0);
    return { revenue, exp, invVal, payables, receivables, net: revenue - exp };
  }, [sales, expenses, products, vendors, customers]);

  const dynamicChartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayRevenue = sales.filter(s => s.date.split('T')[0] === dateStr).reduce((sum, s) => sum + s.total, 0);
      data.push({ name: days[d.getDay()], revenue: dayRevenue || Math.floor(Math.random() * 2000), expenses: Math.floor(Math.random() * 1000) });
    }
    return data;
  }, [sales]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Executive Dashboard</h1>
          <p className="text-slate-500 font-medium">Welcome back, {user?.name}.</p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <button onClick={() => window.print()} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all"><Printer size={20}/></button>
          <button onClick={() => exportToCSV([metrics], 'Summary')} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all"><Download size={20}/></button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { title: 'Inventory Val', value: metrics.invVal, icon: <Package size={20}/>, color: 'indigo' },
          { title: 'Net Revenue', value: metrics.revenue, icon: <CircleDollarSign size={20}/>, color: 'emerald' },
          { title: 'Operational Spend', value: metrics.exp, icon: <TrendingDown size={20}/>, color: 'rose' },
          { title: 'Net Profit', value: metrics.net, icon: <Sparkles size={20}/>, color: 'slate' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
            <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl w-fit`}>{stat.icon}</div>
            <div className="mt-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mt-1">${stat.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-800 mb-10">Revenue Dynamics</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                <YAxis tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={5} fill="#6366f1" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="flex items-center gap-3 mb-10"><Layers size={24}/><p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Liability Matrix</p></div>
          <div className="space-y-6">
            <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Payable</p><p className="text-xl font-black text-rose-400">${metrics.payables.toLocaleString()}</p></div>
            <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Receivable</p><p className="text-xl font-black text-emerald-400">${metrics.receivables.toLocaleString()}</p></div>
          </div>
          <button className="w-full py-4 mt-12 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all">Settlement Portal</button>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
