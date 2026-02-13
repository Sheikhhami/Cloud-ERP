
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Truck, Phone, Mail, MapPin, 
  X, Filter, Download, Printer, ShoppingBag, 
  CreditCard, DollarSign, Activity, Landmark, FileText,
  User, Clock, Receipt, ArrowRightLeft, CreditCard as PaymentIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Vendor, UserRole } from '../types';

const Vendors: React.FC = () => {
  const { vendors, setVendors, addNotification, user, payVendor } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<Partial<Vendor>>({});
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [paymentDesc, setPaymentDesc] = useState('');

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.phone.includes(searchTerm)
    );
  }, [vendors, searchTerm]);

  const openForm = (vend?: Vendor) => {
    if (vend) {
      setFormData(vend);
      setSelectedVendor(vend);
    } else {
      setFormData({
        name: '', phone: '', email: '', address: '', companyName: '',
        ntn: '', bankDetails: '', openingBalance: 0, paymentTerms: 'Net 30'
      });
      setSelectedVendor(null);
    }
    setIsFormModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.companyName) return;

    if (selectedVendor) {
      setVendors(prev => prev.map(v => v.id === selectedVendor.id ? { ...v, ...formData } as Vendor : v));
      addNotification('Vendor Updated');
    } else {
      const newVend: Vendor = {
        ...formData,
        id: `VEN-${Date.now()}`,
        totalPurchases: 0,
        totalPaid: 0,
        remainingPayable: formData.openingBalance || 0,
        createdAt: new Date().toISOString(),
        ledger: formData.openingBalance ? [{
          id: `OB-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'Opening Balance',
          description: 'Initial Balance Account Setup',
          debit: 0,
          credit: formData.openingBalance,
          balance: formData.openingBalance
        }] : []
      } as Vendor;
      setVendors(prev => [newVend, ...prev]);
      addNotification('Vendor Registered');
    }
    setIsFormModalOpen(false);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor || !paymentAmount) return;
    payVendor(selectedVendor.id, parseFloat(paymentAmount), paymentMethod, paymentDesc);
    setIsPaymentModalOpen(false);
    setPaymentAmount('');
    setPaymentDesc('');
    // Refresh selected vendor to show updated ledger
    const updated = vendors.find(v => v.id === selectedVendor.id);
    if(updated) setSelectedVendor(updated);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Supply Chain & Vendors</h1>
          <p className="text-slate-500">Accounts payable and supplier relationship management.</p>
        </div>
        <button 
          onClick={() => openForm()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 no-print"
        >
          <Plus size={18} />
          <span>Register Supplier</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50 no-print">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search suppliers..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportPDF} title="Export to PDF" className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Download size={20}/></button>
            <button onClick={handleExportPDF} title="Print List" className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Printer size={20}/></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Supplier Entity</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Open Balance</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredVendors.map(vend => (
                <tr key={vend.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black uppercase">{vend.companyName.charAt(0)}</div>
                      <div>
                        <button onClick={() => { setSelectedVendor(vend); setIsProfileModalOpen(true); }} className="text-sm font-bold text-slate-800 hover:text-indigo-600">{vend.companyName}</button>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{vend.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500">{vend.phone}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-black ${vend.remainingPayable > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      ${vend.remainingPayable.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right no-print">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setSelectedVendor(vend); setIsPaymentModalOpen(true); }} className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"><PaymentIcon size={16} /></button>
                      <button onClick={() => openForm(vend)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => { setSelectedVendor(vend); setIsDeleteModalOpen(true); }} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile / Ledger Modal */}
      {isProfileModalOpen && selectedVendor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 bg-indigo-900 text-white flex justify-between items-start no-print">
               <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center"><Truck size={40}/></div>
                  <div>
                    <h2 className="text-3xl font-black">{selectedVendor.companyName}</h2>
                    <p className="text-indigo-300 font-bold uppercase text-[10px] tracking-widest mt-1">Vendor Statement & Ledger</p>
                  </div>
               </div>
               <button onClick={() => setIsProfileModalOpen(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-4">
               <div className="p-8 border-r border-slate-100 space-y-8 overflow-y-auto no-print">
                  <div className="space-y-4">
                    <div className="p-6 bg-slate-50 rounded-[2rem] text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payable</p>
                      <p className="text-3xl font-black text-rose-500">${selectedVendor.remainingPayable.toLocaleString()}</p>
                    </div>
                    <button onClick={() => setIsPaymentModalOpen(true)} className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all">
                      <DollarSign size={18}/> Pay Supplier
                    </button>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Business Info</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-700"><Phone size={14} className="text-slate-300"/> {selectedVendor.phone}</div>
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-700"><Mail size={14} className="text-slate-300"/> {selectedVendor.email}</div>
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-700"><MapPin size={14} className="text-slate-300"/> {selectedVendor.address}</div>
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-700"><Landmark size={14} className="text-slate-300"/> {selectedVendor.bankDetails || 'N/A'}</div>
                    </div>
                  </div>
               </div>

               <div className="lg:col-span-3 flex flex-col p-8 bg-slate-50/30 overflow-hidden">
                  <div className="flex justify-between items-center mb-6 no-print">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2"><Receipt size={20} className="text-indigo-600"/> Ledger Statement</h3>
                    <button onClick={handleExportPDF} className="text-xs font-bold text-indigo-600 border-b border-indigo-600 pb-0.5 transition-all">Export PDF Statement</button>
                  </div>
                  
                  <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/30 grid grid-cols-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Date</span>
                       <span className="col-span-2">Description</span>
                       <span className="text-center">Credit (Bills)</span>
                       <span className="text-center">Debit (Paid)</span>
                       <span className="text-right">Balance</span>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                      {selectedVendor.ledger?.map(entry => (
                        <div key={entry.id} className="p-4 grid grid-cols-6 text-sm items-center hover:bg-slate-50 transition-colors">
                           <span className="text-xs text-slate-400 font-bold">{entry.date}</span>
                           <span className="col-span-2 font-bold text-slate-700">
                             <span className={`inline-block w-2 h-2 rounded-full mr-2 ${entry.type === 'Payment' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                             {entry.description}
                           </span>
                           <span className="text-center font-bold text-slate-400">{entry.credit > 0 ? `$${entry.credit}` : '-'}</span>
                           <span className="text-center font-bold text-emerald-600">{entry.debit > 0 ? `$${entry.debit}` : '-'}</span>
                           <span className="text-right font-black text-slate-900">${entry.balance.toLocaleString()}</span>
                        </div>
                      ))}
                      {(!selectedVendor.ledger || selectedVendor.ledger.length === 0) && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 italic">No statement records available.</div>
                      )}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && selectedVendor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 no-print">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Post Payment</h2>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 text-slate-400"><X size={24}/></button>
            </div>
            <form onSubmit={handlePayment} className="p-8 space-y-6">
              <div className="p-4 bg-indigo-50 rounded-2xl flex justify-between items-center">
                 <p className="text-xs font-black text-indigo-400 uppercase">Outstanding</p>
                 <p className="text-xl font-black text-indigo-700">${selectedVendor.remainingPayable.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Payment Amount ($) *</label>
                <input required type="number" step="0.01" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-lg text-center" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Method</label>
                <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                   <option>Bank Transfer</option>
                   <option>Cash</option>
                   <option>Check</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Reference / Note</label>
                <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-semibold" value={paymentDesc} onChange={e => setPaymentDesc(e.target.value)} placeholder="Invoice #, Check # etc." />
              </div>
              <button type="submit" className="w-full py-5 bg-emerald-600 text-white font-black rounded-3xl shadow-xl shadow-emerald-100 transition-all">Submit Payment Record</button>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedVendor ? 'Modify Supplier' : 'New Supplier Registry'}</h2>
              <button onClick={() => setIsFormModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Company Name *</label>
                <input required type="text" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-semibold" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Contact Person *</label>
                <input required type="text" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-semibold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Phone *</label>
                <input required type="tel" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-semibold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email</label>
                <input type="email" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-semibold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">NTN / Tax ID</label>
                <input type="text" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-semibold" value={formData.ntn} onChange={e => setFormData({...formData, ntn: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Opening Balance ($)</label>
                <input type="number" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={formData.openingBalance} onChange={e => setFormData({...formData, openingBalance: Number(e.target.value)})} disabled={!!selectedVendor} />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Bank Account Details</label>
                <input type="text" placeholder="Bank Name, Branch, Account #" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-semibold" value={formData.bankDetails} onChange={e => setFormData({...formData, bankDetails: e.target.value})} />
              </div>
              <div className="col-span-2 pt-6 flex gap-4">
                <button type="button" onClick={() => setIsFormModalOpen(false)} className="flex-1 px-8 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl transition-all">Discard</button>
                <button type="submit" className="flex-1 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-100">Confirm Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
