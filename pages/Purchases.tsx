
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, ShoppingCart, Truck, Calendar, DollarSign, X, 
  CheckCircle2, Clock, Filter, ClipboardList, Package, ArrowRight,
  TrendingUp, Calculator, Info, Download, Printer
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Purchases: React.FC = () => {
  const { products, vendors, purchases, recordPurchase } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [vendorId, setVendorId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      const prod = products.find(prod => prod.id === p.productId);
      const vend = vendors.find(v => v.id === p.vendorId);
      return prod?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             vend?.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             p.id.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [purchases, products, vendors, searchTerm]);

  const selectedProductData = useMemo(() => {
    return products.find(p => p.id === productId);
  }, [productId, products]);

  const projectedWAC = useMemo(() => {
    if (!selectedProductData || !quantity || !unitCost) return null;
    const currentStock = selectedProductData.stock;
    const currentWAC = selectedProductData.averageCost || selectedProductData.purchasePrice || 0;
    const newQty = Number(quantity);
    const newRate = Number(unitCost);
    const totalQty = currentStock + newQty;
    if (totalQty === 0) return newRate;
    const wac = ((currentStock * currentWAC) + (newQty * newRate)) / totalQty;
    return Math.round(wac * 100) / 100;
  }, [selectedProductData, quantity, unitCost]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || !productId || !quantity || !unitCost) return;

    recordPurchase({
      date: new Date().toISOString().split('T')[0],
      vendorId,
      productId,
      quantity: Number(quantity),
      unitCost: Number(unitCost),
      totalAmount: Number(quantity) * Number(unitCost),
      paymentStatus: 'Paid'
    });

    setIsModalOpen(false);
    setVendorId('');
    setProductId('');
    setQuantity('');
    setUnitCost('');
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Procurement Ledger</h1>
          <p className="text-slate-500">Manage supply arrivals and track sourcing costs per vendor.</p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <button onClick={handleExportPDF} title="Export PDF" className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm"><Download size={20}/></button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-100 transition-all"
          >
            <Plus size={20} />
            <span>Post Purchase Entry</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50 no-print">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Vendor, Product SKU or Invoice ID..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 transition-all" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">System Integrated</span>
             </div>
             <button onClick={handleExportPDF} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Printer size={20}/></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Entry Date</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Vendor / Supplier</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Purchased Item</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Batch Qty</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Unit Sourcing Rate</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Total Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <ShoppingCart size={48} className="opacity-20"/>
                      <p className="italic font-medium">No purchase transactions recorded in current period.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-xs font-bold text-slate-400">{p.date}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{vendors.find(v => v.id === p.vendorId)?.companyName || 'Deleted Vendor'}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">#{p.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-700">{products.find(prod => prod.id === p.productId)?.name || 'SKU Not Found'}</p>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-black text-indigo-600">+{p.quantity.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-slate-600">${p.unitCost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                       <p className="text-sm font-black text-slate-900">${p.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Inward Stock Entry</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time WAC Recalculation Enabled</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Supplier *</label>
                  <select required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer" value={vendorId} onChange={e => setVendorId(e.target.value)}>
                    <option value="">Choose Supplier...</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.companyName}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Item *</label>
                  <select required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer" value={productId} onChange={e => setProductId(e.target.value)}>
                    <option value="">Choose Product SKU...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arrival Quantity *</label>
                  <input required type="number" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-center text-xl text-indigo-700" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sourcing Unit Rate ($) *</label>
                  <input required type="number" step="0.01" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-center text-xl text-indigo-700" value={unitCost} onChange={e => setUnitCost(e.target.value)} placeholder="0.00" />
                </div>
              </div>

              {/* Impact Preview Section */}
              {selectedProductData && (
                <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator size={16} className="text-indigo-400"/>
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Inventory Impact Preview</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-indigo-50 shadow-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Current Stock / WAC</p>
                      <p className="text-sm font-black text-slate-700">{selectedProductData.stock} Units @ ${selectedProductData.averageCost?.toFixed(2) || selectedProductData.purchasePrice?.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-indigo-50 shadow-sm">
                      <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">Projected WAC After Entry</p>
                      <p className="text-sm font-black text-indigo-700">{projectedWAC ? `$${projectedWAC.toFixed(2)}` : '---'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 p-6 bg-slate-900 rounded-[2rem] flex justify-between items-center text-white">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/10 rounded-xl"><DollarSign size={20}/></div>
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Invoice Value</p>
                 </div>
                 <p className="text-2xl font-black text-indigo-400">${(Number(quantity) * Number(unitCost)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-[0.98]">Confirm Batch Entry</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
