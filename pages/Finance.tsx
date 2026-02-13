
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CircleDollarSign, 
  Tag, 
  X, 
  ChevronRight,
  TrendingDown,
  Calendar,
  DollarSign,
  Filter,
  MoreVertical,
  Download,
  AlertTriangle,
  Printer,
  PieChart as PieChartIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts';
import { useApp } from '../context/AppContext';
import { Expense, ExpenseCategory } from '../types';

const Finance: React.FC = () => {
  const { expenses, setExpenses, expenseCategories, setExpenseCategories, addNotification, exportToCSV } = useApp();
  const [activeTab, setActiveTab] = useState<'expenses' | 'categories'>('expenses');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expAmount, setExpAmount] = useState('');
  const [expCatId, setExpCatId] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expDesc, setExpDesc] = useState('');

  const totalExpenseAmount = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  
  const pieData = useMemo(() => {
    return expenseCategories.map(cat => {
      const amount = expenses
        .filter(e => e.categoryId === cat.id)
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        name: cat.name,
        value: amount,
        color: cat.color || '#6366f1'
      };
    }).filter(d => d.value > 0);
  }, [expenses, expenseCategories]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const cat = expenseCategories.find(c => c.id === e.categoryId);
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (cat?.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, expenseCategories, searchTerm]);

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    if (editingCategory) {
      setExpenseCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, name: catName, description: catDesc } : c));
      addNotification('Expense category updated');
    } else {
      const newCat: ExpenseCategory = {
        id: Date.now().toString(),
        name: catName,
        description: catDesc,
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      };
      setExpenseCategories(prev => [...prev, newCat]);
      addNotification(`Category "${catName}" created`);
    }
    setIsCategoryModalOpen(false);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || !expCatId) return;
    const expenseData: Expense = {
      id: editingExpense?.id || Date.now().toString(),
      amount: parseFloat(expAmount),
      categoryId: expCatId,
      date: expDate,
      description: expDesc
    };
    if (editingExpense) {
      setExpenses(prev => prev.map(ex => ex.id === editingExpense.id ? expenseData : ex));
      addNotification('Expense updated');
    } else {
      setExpenses(prev => [...prev, expenseData]);
      addNotification('Expense recorded');
    }
    setIsExpenseModalOpen(false);
  };

  const handleExportCSV = () => exportToCSV(expenses, 'FinancialLedger');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Financial Hub</h1>
          <p className="text-slate-500">Track company spendings and manage budget categories.</p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <div className="bg-white p-1 rounded-2xl border border-slate-200 flex gap-1 shadow-sm">
            <button 
              onClick={() => window.print()}
              className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
              title="Print to PDF"
            >
              <Printer size={20}/>
            </button>
            <button 
              onClick={handleExportCSV}
              className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
              title="Export CSV (Excel)"
            >
              <Download size={20}/>
            </button>
          </div>
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            <button onClick={() => setActiveTab('expenses')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'expenses' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Ledger</button>
            <button onClick={() => setActiveTab('categories')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'categories' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Classes</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-50 flex items-center justify-between no-print">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Search entries..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button 
                onClick={() => activeTab === 'expenses' ? setIsExpenseModalOpen(true) : setIsCategoryModalOpen(true)}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100"
              >
                <Plus size={18} />
                <span>Add Record</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Memo</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredExpenses.map(expense => (
                    <tr key={expense.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 text-xs font-bold text-slate-400">{expense.date}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase">
                          {expenseCategories.find(c => c.id === expense.categoryId)?.name || 'Class'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{expense.description}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-rose-500">-${expense.amount.toFixed(2)}</span>
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                          <button onClick={() => { setEditingExpense(expense); setExpAmount(expense.amount.toString()); setExpCatId(expense.categoryId); setExpDate(expense.date); setExpDesc(expense.description); setIsExpenseModalOpen(true); }} className="p-1 text-slate-300 hover:text-indigo-600"><Edit2 size={12}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><TrendingDown size={64}/></div>
            <p className="text-xs font-black uppercase tracking-widest text-indigo-200">Total Expenditure</p>
            <h2 className="text-4xl font-black mt-1">${totalExpenseAmount.toLocaleString()}</h2>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
             <div className="flex items-center gap-2">
                <PieChartIcon size={18} className="text-indigo-600"/>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Distribution</h3>
             </div>
             {pieData.length > 0 ? (
               <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ReTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2">
                   {pieData.map((d, i) => (
                     <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase truncate">{d.name}</span>
                     </div>
                   ))}
                </div>
               </>
             ) : (
               <div className="h-64 flex flex-col items-center justify-center text-slate-300 italic text-xs text-center">
                  No expense distribution data available yet.
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{editingExpense ? 'Edit Entry' : 'New Ledger Entry'}</h2>
              <button onClick={() => setIsExpenseModalOpen(false)} className="p-2 text-slate-400"><X size={24}/></button>
            </div>
            <form onSubmit={handleSaveExpense} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Category Class *</label>
                <select required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={expCatId} onChange={e => setExpCatId(e.target.value)}>
                   <option value="">Choose Category...</option>
                   {expenseCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Amount ($) *</label>
                <input required type="number" step="0.01" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-lg" value={expAmount} onChange={e => setExpAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Date</label>
                <input type="date" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={expDate} onChange={e => setExpDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Description / Memo</label>
                <input required type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-semibold" value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="Rent payment, Utility bill etc." />
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Commit to Ledger</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
