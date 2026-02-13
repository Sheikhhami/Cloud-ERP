
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Edit2, Trash2, User, Phone, Mail, MapPin, 
  X, Filter, Download, Printer, ChevronRight, UserCircle, 
  MessageCircle, CreditCard, DollarSign, Activity, Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer, UserRole } from '../types';

const Customers: React.FC = () => {
  const { customers, setCustomers, addNotification, user, sales } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('All Cities');
  
  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Selection
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({});

  const cities = useMemo(() => {
    const list = Array.from(new Set(customers.map(c => c.city)));
    return ['All Cities', ...list];
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.phone.includes(searchTerm) ||
                            c.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = cityFilter === 'All Cities' || c.city === cityFilter;
      return matchesSearch && matchesCity;
    });
  }, [customers, searchTerm, cityFilter]);

  // Calculated Sales History for the selected customer
  const customerSalesHistory = useMemo(() => {
    if (!selectedCustomer) return [];
    return sales
      .filter(s => s.customerId === selectedCustomer.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedCustomer, sales]);

  const openForm = (cust?: Customer) => {
    if (cust) {
      setFormData(cust);
      setSelectedCustomer(cust);
    } else {
      setFormData({
        name: '', phone: '', email: '', address: '', city: '',
        openingBalance: 0, creditLimit: 20000, paymentTerms: 'Due on Receipt'
      });
      setSelectedCustomer(null);
    }
    setIsFormModalOpen(true);
  };

  const handleDeleteRequest = (cust: Customer) => {
    if (user?.role !== UserRole.ADMIN) {
      addNotification('Access Denied: Only Admins can delete customers.');
      return;
    }
    setSelectedCustomer(cust);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCustomer) {
      setCustomers(prev => prev.filter(c => c.id !== selectedCustomer.id));
      addNotification('Customer Deleted Successfully');
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    // Phone validation check
    const duplicate = customers.find(c => c.phone === formData.phone && c.id !== selectedCustomer?.id);
    if (duplicate) {
      addNotification('Error: A customer with this phone number already exists.');
      return;
    }

    if (selectedCustomer) {
      setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, ...formData } as Customer : c));
      addNotification('Customer Updated Successfully');
    } else {
      const newCust: Customer = {
        ...formData,
        id: Date.now().toString(),
        totalOrders: 0,
        totalSpent: 0,
        paidAmount: 0,
        remainingDue: formData.openingBalance || 0,
        createdAt: new Date().toISOString()
      } as Customer;
      setCustomers(prev => [newCust, ...prev]);
      addNotification('Customer Added Successfully');
    }
    setIsFormModalOpen(false);
  };

  const openProfile = (cust: Customer) => {
    setSelectedCustomer(cust);
    setIsProfileModalOpen(true);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Customer Relationships</h1>
          <p className="text-slate-500">Manage clients, track credits, and view purchase history.</p>
        </div>
        <button 
          onClick={() => openForm()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200 no-print"
        >
          <Plus size={18} />
          <span>New Customer</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50 no-print">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, phone, email..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select 
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none shadow-sm cursor-pointer"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
            <button onClick={handleExportPDF} title="Export to PDF" className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-sm transition-all">
              <Download size={20} />
            </button>
            <button onClick={handleExportPDF} title="Print List" className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-sm transition-all">
              <Printer size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Customer Details</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Balance</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.map(cust => (
                <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <button onClick={() => openProfile(cust)} className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors">{cust.name}</button>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{cust.companyName || 'Individual'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <Phone size={12} className="text-slate-400" />
                        {cust.phone}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <Mail size={12} />
                        {cust.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{cust.city}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`text-sm font-black ${cust.remainingDue > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        ${cust.remainingDue.toLocaleString()}
                      </span>
                      <div className="w-20 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (cust.remainingDue/cust.creditLimit)*100)}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right no-print">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openProfile(cust)} className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"><Activity size={16} /></button>
                      <button onClick={() => openForm(cust)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteRequest(cust)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button onClick={() => setIsFormModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
                <input required type="text" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number *</label>
                <input required type="tel" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input type="email" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Company (Optional)</label>
                <input type="text" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                <input type="text" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Payment Terms</label>
                <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold" value={formData.paymentTerms} onChange={e => setFormData({...formData, paymentTerms: e.target.value})}>
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Opening Balance ($)</label>
                <input type="number" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold" value={formData.openingBalance} onChange={e => setFormData({...formData, openingBalance: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Credit Limit ($)</label>
                <input type="number" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold" value={formData.creditLimit} onChange={e => setFormData({...formData, creditLimit: Number(e.target.value)})} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Address</label>
                <textarea rows={2} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold resize-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="md:col-span-2 pt-4 flex gap-4">
                <button type="button" onClick={() => setIsFormModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50">Discard</button>
                <button type="submit" className="flex-1 px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 no-print">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Remove Customer?</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Permanently delete <span className="font-bold text-slate-800">"{selectedCustomer.name}"</span>? 
                  This will remove their history and ledgers. This action is irreversible.
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 px-6 py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 shadow-xl shadow-rose-200">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Profile Modal */}
      {isProfileModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 border-b border-slate-50 flex justify-between items-start bg-gradient-to-br from-slate-900 to-slate-800 text-white no-print">
              <div className="flex gap-6 items-center">
                <div className="w-24 h-24 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center text-4xl font-black">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-black tracking-tight">{selectedCustomer.name}</h2>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                    <UserCircle size={14}/> {selectedCustomer.companyName || 'Private Customer'}
                  </p>
                  <div className="flex gap-4 pt-2">
                    <button className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all"><MessageCircle size={14}/> WhatsApp</button>
                    <button onClick={handleExportPDF} className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all"><Printer size={14}/> Statement</button>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsProfileModalOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"><X size={24}/></button>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 rounded-3xl space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Purchases</p>
                    <p className="text-2xl font-black text-slate-800">${selectedCustomer.totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-3xl space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remaining Due</p>
                    <p className="text-2xl font-black text-rose-500">${selectedCustomer.remainingDue.toLocaleString()}</p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-3xl space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid to Date</p>
                    <p className="text-2xl font-black text-emerald-500">${selectedCustomer.paidAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-3xl space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Orders</p>
                    <p className="text-2xl font-black text-blue-600">{selectedCustomer.totalOrders}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-black text-slate-800 text-lg flex items-center gap-2"><Activity size={20}/> Sales History</h3>
                  <div className="border border-slate-100 rounded-3xl overflow-hidden">
                    <div className="p-4 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest grid grid-cols-4">
                      <span>Date</span>
                      <span>Invoice ID</span>
                      <span>Payment Method</span>
                      <span className="text-right">Total Amount</span>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto scrollbar-hide">
                      {customerSalesHistory.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 italic">No sales history found for this customer.</div>
                      ) : (
                        customerSalesHistory.map(sale => (
                          <div key={sale.id} className="p-4 grid grid-cols-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            <span className="text-xs">{new Date(sale.date).toLocaleDateString()}</span>
                            <span className="text-blue-600">#{sale.id}</span>
                            <span className="text-slate-400 font-medium">{sale.paymentMethod}</span>
                            <span className="text-right text-slate-800">${sale.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-[2rem] space-y-4">
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Customer Context</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Clock size={16} className="text-slate-400 mt-1"/>
                      <div>
                        <p className="text-xs text-slate-400 font-bold">Payment Terms</p>
                        <p className="text-sm font-bold text-slate-700">{selectedCustomer.paymentTerms}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone size={16} className="text-slate-400 mt-1"/>
                      <div>
                        <p className="text-xs text-slate-400 font-bold">Phone</p>
                        <p className="text-sm font-bold text-slate-700">{selectedCustomer.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail size={16} className="text-slate-400 mt-1"/>
                      <div>
                        <p className="text-xs text-slate-400 font-bold">Email</p>
                        <p className="text-sm font-bold text-slate-700 break-all">{selectedCustomer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-slate-400 mt-1"/>
                      <div>
                        <p className="text-xs text-slate-400 font-bold">Address</p>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed">{selectedCustomer.address}, {selectedCustomer.city}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-blue-600 rounded-[2rem] text-white space-y-4 shadow-xl shadow-blue-100 no-print">
                  <div className="flex items-center gap-2">
                    <CreditCard size={20}/>
                    <h3 className="font-black text-sm uppercase tracking-widest">Credit Limit</h3>
                  </div>
                  <div>
                    <p className="text-3xl font-black">${selectedCustomer.creditLimit.toLocaleString()}</p>
                    <p className="text-xs font-bold text-blue-100 mt-1">Available: ${(selectedCustomer.creditLimit - selectedCustomer.remainingDue).toLocaleString()}</p>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white" style={{ width: `${(selectedCustomer.remainingDue/selectedCustomer.creditLimit)*100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
