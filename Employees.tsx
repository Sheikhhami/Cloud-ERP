
import React, { useState, useMemo } from 'react';
import { UserPlus, Search, Edit2, Wallet, CheckCircle2, X } from 'lucide-react';
import { useApp } from './AppContext';
import { Employee, UserRole } from './types';

const Employees: React.FC = () => {
  const { employees, setEmployees, addNotification, paySalary, logAttendance } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [form, setForm] = useState<Partial<Employee>>({});

  const filtered = useMemo(() => employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase())), [employees, search]);

  const openForm = (e?: Employee) => {
    if (e) { setForm(e); setSelected(e); }
    else { setForm({ name: '', email: '', role: UserRole.CASHIER, salary: 0 }); setSelected(null); }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault(); if (!form.name) return;
    if (selected) setEmployees(prev => prev.map(e => e.id === selected.id ? { ...e, ...form } as Employee : e));
    else setEmployees(prev => [{ ...form, id: `EMP-${Date.now()}`, salaryHistory: [], attendanceRecords: [] } as Employee, ...prev]);
    setIsModalOpen(false); addNotification('HR Record Saved');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end"><h1 className="text-2xl font-black">Staffing Solutions</h1><button onClick={() => openForm()} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"><UserPlus size={18}/> Onboard Talent</button></div>
      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex items-center gap-3"><Search size={18} className="text-slate-400"/><input type="text" placeholder="Search staff..." className="bg-transparent outline-none flex-1 font-bold" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b text-[10px] font-black text-slate-400 uppercase"><tr><th className="px-6 py-4">Employee</th><th className="px-6 py-4">Role</th><th className="px-6 py-4 text-center">Daily Attendance</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
          <tbody className="divide-y">{filtered.map(emp => (
            <tr key={emp.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-bold">{emp.name}</td>
              <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase">{emp.role}</span></td>
              <td className="px-6 py-4 text-center"><button onClick={() => logAttendance(emp.id, 'Present')} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase">Mark Present</button></td>
              <td className="px-6 py-4 text-right"><button onClick={() => openForm(emp)} className="p-2 text-slate-300 hover:text-blue-600"><Edit2 size={16}/></button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] w-full max-w-md p-8 animate-in zoom-in space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-black">Employee Record</h2><button type="button" onClick={() => setIsModalOpen(false)}><X size={24}/></button></div>
            <input required type="text" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full Name *" />
            <input required type="number" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={form.salary} onChange={e => setForm({...form, salary: Number(e.target.value)})} placeholder="Base Salary *" />
            <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black">Confirm Profile</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default Employees;
