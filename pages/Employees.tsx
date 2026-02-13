
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Briefcase, Star, 
  CheckCircle2, X, Download, Filter, UserPlus, 
  DollarSign, Activity, Calendar, ShieldCheck, Mail,
  Clock, Heart, Award, Wallet, History, ClipboardCheck,
  Printer
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Employee, UserRole, SalaryPayment, AttendanceRecord } from '../types';

const Employees: React.FC = () => {
  const { employees, setEmployees, addNotification, user, paySalary, logAttendance } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({});
  
  // Payroll State
  const [payAmount, setPayAmount] = useState('');
  const [payMonth, setPayMonth] = useState('October 2023');
  const [payMethod, setPayMethod] = useState('Bank Transfer');

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const openForm = (emp?: Employee) => {
    if (emp) {
      setFormData(emp);
      setSelectedEmployee(emp);
    } else {
      setFormData({
        name: '', email: '', role: UserRole.CASHIER,
        salary: 0, performance: 5, joiningDate: new Date().toISOString().split('T')[0]
      });
      setSelectedEmployee(null);
    }
    setIsFormModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    if (selectedEmployee) {
      setEmployees(prev => prev.map(e => e.id === selectedEmployee.id ? { ...e, ...formData } as Employee : e));
      addNotification('Profile Updated');
    } else {
      const newEmp: Employee = {
        ...formData,
        id: `EMP-${Date.now()}`,
        salaryHistory: [],
        attendanceRecords: []
      } as Employee;
      setEmployees(prev => [newEmp, ...prev]);
      addNotification('Staff Hired');
    }
    setIsFormModalOpen(false);
  };

  const handlePaySalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !payAmount) return;
    paySalary(selectedEmployee.id, parseFloat(payAmount), payMonth, payMethod);
    setIsSalaryModalOpen(false);
    setPayAmount('');
    // Refresh
    const updated = employees.find(e => e.id === selectedEmployee.id);
    if(updated) setSelectedEmployee(updated);
  };

  const markPresent = (id: string) => logAttendance(id, 'Present');

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Staff Management</h1>
          <p className="text-slate-500">Payroll, HR lifecycle, and performance monitoring.</p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <button onClick={handleExportPDF} title="Export PDF" className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm"><Download size={20}/></button>
          <button 
            onClick={() => openForm()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            <UserPlus size={20} />
            <span>Onboard Talent</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between gap-4 bg-slate-50/50 no-print">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search staff..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportPDF} title="History Report" className="p-2 text-slate-400 hover:text-blue-600 transition-all"><History size={20}/></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Designation</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Base Salary</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center no-print">Daily Status</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 uppercase">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <button onClick={() => { setSelectedEmployee(emp); setIsProfileModalOpen(true); }} className="text-sm font-bold text-slate-800 hover:text-blue-600">{emp.name}</button>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{emp.email || 'no-email@clouderp.com'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">{emp.role}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-black text-slate-800">${emp.salary.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center no-print">
                    <button onClick={() => markPresent(emp.id)} className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-100 transition-colors flex items-center gap-1 mx-auto">
                      <CheckCircle2 size={12}/> Mark Present
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right no-print">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setSelectedEmployee(emp); setIsSalaryModalOpen(true); }} className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"><Wallet size={16} /></button>
                      <button onClick={() => openForm(emp)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => { setSelectedEmployee(emp); setIsDeleteModalOpen(true); }} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile / Payroll / Attendance Modal */}
      {isProfileModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-start no-print">
               <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center font-black text-3xl uppercase">{selectedEmployee.name.charAt(0)}</div>
                  <div>
                    <h2 className="text-3xl font-black">{selectedEmployee.name}</h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">{selectedEmployee.role} • Employee ID: {selectedEmployee.id}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={handleExportPDF} title="Print Profile" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><Printer size={24}/></button>
                  <button onClick={() => setIsProfileModalOpen(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={24}/></button>
               </div>
            </div>
            
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3">
               {/* Left Panel: Performance & Details */}
               <div className="p-8 border-r border-slate-100 bg-slate-50/30 overflow-y-auto space-y-8 no-print">
                  <div className="space-y-4">
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Staff Performance</h3>
                     <div className="p-6 bg-white rounded-3xl border border-slate-100 text-center space-y-3">
                        <p className="text-5xl font-black text-slate-800">{selectedEmployee.performance}<span className="text-xl text-slate-300">/5</span></p>
                        <div className="flex justify-center gap-1 text-amber-400">
                          {[...Array(5)].map((_, i) => <Award key={i} fill={i < selectedEmployee.performance ? 'currentColor' : 'none'} size={24}/>)}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Top Talent Level</p>
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Profile Details</h3>
                     <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm"><span className="text-slate-400 font-bold">Email</span><span className="text-slate-800 font-black">{selectedEmployee.email}</span></div>
                        <div className="flex items-center justify-between text-sm"><span className="text-slate-400 font-bold">Base Pay</span><span className="text-slate-800 font-black">${selectedEmployee.salary.toLocaleString()}</span></div>
                        <div className="flex items-center justify-between text-sm"><span className="text-slate-400 font-bold">Joined</span><span className="text-slate-800 font-black">{selectedEmployee.joiningDate}</span></div>
                     </div>
                  </div>
               </div>

               {/* Right Panel: Tabs for History */}
               <div className="lg:col-span-2 p-8 flex flex-col overflow-hidden">
                  <div className="flex gap-4 mb-8 no-print">
                     <div className="px-6 py-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600 font-black text-xs uppercase tracking-widest">Payroll History</div>
                     <div className="px-6 py-3 bg-slate-100 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-widest">Attendance Logs</div>
                  </div>
                  
                  <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden flex flex-col">
                     <div className="p-4 bg-slate-50/50 border-b border-slate-100 grid grid-cols-4 text-[10px] font-black text-slate-400 uppercase">
                        <span>Paid Date</span>
                        <span>Salary Month</span>
                        <span className="text-center">Method</span>
                        <span className="text-right">Amount</span>
                     </div>
                     <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                        {selectedEmployee.salaryHistory?.map(sal => (
                          <div key={sal.id} className="p-4 grid grid-cols-4 text-sm font-bold text-slate-700">
                             <span className="text-slate-400">{sal.date}</span>
                             <span>{sal.month}</span>
                             <span className="text-center text-xs text-slate-400">{sal.paymentMethod}</span>
                             <span className="text-right font-black text-emerald-600">${sal.amount.toLocaleString()}</span>
                          </div>
                        ))}
                        {(!selectedEmployee.salaryHistory || selectedEmployee.salaryHistory.length === 0) && (
                          <div className="h-full flex flex-col items-center justify-center text-slate-300 italic py-20">No payroll records yet.</div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Salary Disbursement Modal */}
      {isSalaryModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 no-print">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Disburse Salary</h2>
              <button onClick={() => setIsSalaryModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={handlePaySalary} className="p-8 space-y-6">
              <div className="text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paying To</p>
                 <h3 className="text-xl font-black text-slate-800 mt-1">{selectedEmployee.name}</h3>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Salary Amount ($) *</label>
                <input required type="number" step="0.01" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-lg text-center" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder={selectedEmployee.salary.toString()} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">For Month</label>
                <input required type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={payMonth} onChange={e => setPayMonth(e.target.value)} placeholder="e.g. October 2023" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Method</label>
                <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                   <option>Bank Transfer</option>
                   <option>Cash</option>
                   <option>Check</option>
                </select>
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-100 transition-all transform active:scale-95">Confirm Disbursement</button>
            </form>
          </div>
        </div>
      )}

      {/* Staff Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedEmployee ? 'Modify Staff Profile' : 'Hire Talent'}</h2>
              <button onClick={() => setIsFormModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Name *</label>
                <input required type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-semibold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Professional Email</label>
                <input type="email" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-semibold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Designation Role</label>
                <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                  <option value={UserRole.ADMIN}>Admin</option>
                  <option value={UserRole.MANAGER}>Manager</option>
                  <option value={UserRole.CASHIER}>Cashier</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Monthly Salary ($)</label>
                <input required type="number" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-lg" value={formData.salary} onChange={e => setFormData({...formData, salary: Number(e.target.value)})} />
              </div>
              <div className="col-span-2 pt-6 flex gap-4">
                <button type="button" onClick={() => setIsFormModalOpen(false)} className="flex-1 px-8 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 transition-all">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
