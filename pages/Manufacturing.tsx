
import React, { useState, useMemo } from 'react';
import { 
  Factory, Plus, Search, X, Hammer, ShieldAlert, History, ArrowRight,
  TrendingUp, Settings, Layers, Package, Trash2, CheckCircle2, Info,
  Printer, Download, Filter, ClipboardList, PenTool, Scissors, Droplet,
  Calculator, Coins, Target
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ManufacturingProcessType, ManufacturingEntry, ManufacturingClaim } from '../types';

const Manufacturing: React.FC = () => {
  const { 
    products, 
    manufacturingEntries, 
    manufacturingClaims,
    performManufacturing, 
    recordClaim, 
    resolveClaim,
    addNotification 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'production' | 'claims' | 'history'>('production');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  // Production Form State
  const [rawProdId, setRawProdId] = useState('');
  const [rawQty, setRawQty] = useState('');
  const [processType, setProcessType] = useState<ManufacturingProcessType>('Dyeing');
  const [unitProcessCost, setUnitProcessCost] = useState('');
  const [claimQtyInput, setClaimQtyInput] = useState('0');
  const [finishedName, setFinishedName] = useState('');
  const [notes, setNotes] = useState('');

  // Fixed missing state for Manufacturing Claims
  const [claimProdId, setClaimProdId] = useState('');
  const [claimQty, setClaimQty] = useState('');
  const [claimReason, setClaimReason] = useState('');
  const [claimType, setClaimType] = useState<'Damage' | 'Defect' | 'Shortage'>('Damage');

  const selectedRawProduct = useMemo(() => products.find(p => p.id === rawProdId), [rawProdId, products]);

  const productionSummary = useMemo(() => {
    if (!selectedRawProduct || !rawQty) return null;
    const rQty = Number(rawQty);
    const rawUnitPrice = selectedRawProduct.averageCost || selectedRawProduct.purchasePrice || 0;
    const uPCost = Number(unitProcessCost) || 0;
    const cQty = Number(claimQtyInput) || 0;
    
    // Total Processing Cost = Input Quantity * Cost per Unit to process
    const totalProcessingCost = rQty * uPCost;
    const totalRawMaterialCost = rQty * rawUnitPrice;
    
    // Net Value = Raw Material Value + Total Processing Cost
    const totalProductionInvestment = totalRawMaterialCost + totalProcessingCost;
    
    // Net Yield = Input Qty - Claim Qty (Waste)
    const netYield = Math.max(0, rQty - cQty);
    
    // Average Unit Cost for the finished product
    const batchUnitCost = netYield > 0 ? totalProductionInvestment / netYield : (rawUnitPrice + uPCost);

    return { 
      totalRawMaterialCost, 
      totalProcessingCost,
      totalProductionInvestment, 
      netYield, 
      batchUnitCost,
      claimValue: cQty * (rawUnitPrice + uPCost) // Value of material lost
    };
  }, [selectedRawProduct, rawQty, unitProcessCost, claimQtyInput]);

  const handleProductionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRawProduct || !rawQty || !finishedName || !productionSummary) return;

    if (selectedRawProduct.stock < Number(rawQty)) {
      addNotification("Error: Insufficient raw material stock.");
      return;
    }

    performManufacturing({
      date: new Date().toISOString().split('T')[0],
      rawProductId: rawProdId,
      rawQuantity: Number(rawQty),
      rawUnitCost: selectedRawProduct.averageCost || selectedRawProduct.purchasePrice,
      processType,
      unitProcessCost: Number(unitProcessCost) || 0,
      claimQuantity: Number(claimQtyInput) || 0,
      finishedProductId: `FIN-${Date.now()}`,
      finishedProductName: finishedName,
      finishedQuantity: productionSummary.netYield,
      finishedUnitCost: productionSummary.batchUnitCost,
      notes
    });

    setIsEntryModalOpen(false);
    resetProductionForm();
    addNotification(`Manufacturing batch for "${finishedName}" committed to inventory.`);
  };

  const resetProductionForm = () => {
    setRawProdId('');
    setRawQty('');
    setUnitProcessCost('');
    setClaimQtyInput('0');
    setFinishedName('');
    setNotes('');
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimProdId || !claimQty || !claimReason) return;

    const prod = products.find(p => p.id === claimProdId);
    if (!prod || prod.stock < Number(claimQty)) {
      addNotification("Error: Insufficient stock for claim adjustment.");
      return;
    }

    recordClaim({
      date: new Date().toISOString().split('T')[0],
      productId: claimProdId,
      quantity: Number(claimQty),
      reason: claimReason,
      type: claimType
    });

    setIsClaimModalOpen(false);
    setClaimProdId('');
    setClaimQty('');
    setClaimReason('');
  };

  const handleExportPDF = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manufacturing Unit</h1>
          <p className="text-slate-500">Transform raw materials into finished goods with intelligent batch costing.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm no-print">
          <button 
            onClick={() => setActiveTab('production')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'production' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            Processes
          </button>
          <button 
            onClick={() => setActiveTab('claims')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'claims' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            Claims
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            Log
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 no-print">
        <button onClick={() => setIsEntryModalOpen(true)} className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100 transition-all text-left flex items-center justify-between group">
           <div className="flex items-center gap-6">
             <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl group-hover:scale-110 transition-transform"><Scissors size={32}/></div>
             <div>
                <h3 className="text-xl font-black text-slate-800">New Process Entry</h3>
                <p className="text-slate-400 text-sm font-medium">Issue material & start processing.</p>
             </div>
           </div>
           <Plus size={24} className="text-slate-300 group-hover:text-indigo-600 transition-colors"/>
        </button>
        <button onClick={() => setIsClaimModalOpen(true)} className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-rose-100 transition-all text-left flex items-center justify-between group">
           <div className="flex items-center gap-6">
             <div className="p-4 bg-rose-50 text-rose-600 rounded-3xl group-hover:scale-110 transition-transform"><ShieldAlert size={32}/></div>
             <div>
                <h3 className="text-xl font-black text-slate-800">Record Defect Claim</h3>
                <p className="text-slate-400 text-sm font-medium">Deduct stock for damaged or defective items.</p>
             </div>
           </div>
           <Plus size={24} className="text-slate-300 group-hover:text-rose-600 transition-colors"/>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between no-print">
           <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase text-xs tracking-widest">
             {activeTab === 'production' && 'Recent Production Cycles'}
             {activeTab === 'claims' && 'Claims & Defect Log'}
             {activeTab === 'history' && 'Manufacturing Master Ledger'}
           </h2>
           <button onClick={handleExportPDF} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Printer size={20}/></button>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'production' && (
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Process ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Input Material</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Finished Good</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Net Yield</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">BATCH COST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {manufacturingEntries.length === 0 ? (
                  <tr><td colSpan={6} className="py-20 text-center text-slate-300 italic">No production records found.</td></tr>
                ) : (
                  manufacturingEntries.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-xs font-black text-slate-400">#{entry.id.slice(-6)}</p>
                        <p className="text-[10px] font-bold text-slate-300">{entry.date}</p>
                      </td>
                      <td className="px-6 py-4">
                         <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase">{entry.processType}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-700">{products.find(p => p.id === entry.rawProductId)?.name || 'Unknown'}</p>
                        <p className="text-[10px] font-bold text-slate-400">{entry.rawQuantity} Units @ ${entry.rawUnitCost.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-slate-800">{entry.finishedProductName}</p>
                        <p className="text-[10px] font-bold text-slate-400 text-rose-500">Claim Qty: {entry.claimQuantity}</p>
                      </td>
                      <td className="px-6 py-4 text-center font-black text-emerald-600">+{entry.finishedQuantity.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                         <p className="text-sm font-black text-slate-900">${entry.finishedUnitCost.toFixed(2)}</p>
                         <p className="text-[10px] font-bold text-slate-400">Incl. ${entry.unitProcessCost}/unit Process Cost</p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'claims' && (
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Claim ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {manufacturingClaims.length === 0 ? (
                  <tr><td colSpan={7} className="py-20 text-center text-slate-300 italic">No claims recorded.</td></tr>
                ) : (
                  manufacturingClaims.map(claim => (
                    <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-xs font-black text-slate-400">#{claim.id.slice(-6)}</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">{claim.date}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{products.find(p => p.id === claim.productId)?.name || 'Unknown'}</p>
                        <p className="text-[10px] font-black text-rose-500 uppercase">{claim.type}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{claim.reason}</td>
                      <td className="px-6 py-4 text-center font-black text-rose-600">-{claim.quantity}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${claim.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {claim.status === 'Pending' && (
                          <button onClick={() => resolveClaim(claim.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors no-print"><CheckCircle2 size={16}/></button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Production Entry Modal */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-indigo-900 text-white">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Post Production Cycle</h2>
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mt-1">Intelligent Costing & Inventory Integration</p>
              </div>
              <button onClick={() => setIsEntryModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleProductionSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[75vh] overflow-y-auto scrollbar-hide">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Scissors size={14}/> Raw Material Input</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Select Input SKU *</label>
                    <select required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={rawProdId} onChange={e => setRawProdId(e.target.value)}>
                      <option value="">Choose Material...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} (Available: {p.stock})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Input Quantity *</label>
                      <input required type="number" step="0.01" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-lg text-indigo-700" value={rawQty} onChange={e => setRawQty(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Current Material WAC ($)</label>
                      <input disabled type="text" className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl outline-none font-bold text-slate-500" value={selectedRawProduct ? `$${(selectedRawProduct.averageCost || selectedRawProduct.purchasePrice).toFixed(2)}` : '---'} />
                    </div>
                  </div>
                </div>

                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><PenTool size={14}/> Value-Addition Processes</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Process Type</label>
                    <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={processType} onChange={e => setProcessType(e.target.value as any)}>
                      <option value="Dyeing">Dyeing</option>
                      <option value="Rags">Rags</option>
                      <option value="Calendering">Calendering</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Process Cost Per Unit ($) *</label>
                    <input required type="number" step="0.01" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-indigo-700" value={unitProcessCost} onChange={e => setUnitProcessCost(e.target.value)} placeholder="0.00" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Droplet size={14}/> Finished Output & Claims</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Batch Claims / Waste (Qty) *</label>
                    <input required type="number" step="0.01" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-rose-500" value={claimQtyInput} onChange={e => setClaimQtyInput(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Finished Product Name *</label>
                    <input required type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black" value={finishedName} onChange={e => setFinishedName(e.target.value)} placeholder="e.g. Processed Cotton - Red" />
                  </div>
                </div>

                {productionSummary && (
                  <div className="p-6 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100/50 space-y-4 shadow-inner">
                    <div className="flex items-center gap-2">
                       <Calculator size={16} className="text-indigo-600"/>
                       <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">WAC Batch Calculation</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                         <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Process Cost</p>
                         <p className="text-lg font-black text-slate-800">${productionSummary.totalProcessingCost.toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                         <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Material Cost</p>
                         <p className="text-lg font-black text-slate-800">${productionSummary.totalRawMaterialCost.toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                         <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Net Yield Yield</p>
                         <p className="text-lg font-black text-slate-800">{productionSummary.netYield.toFixed(2)} Units</p>
                      </div>
                      <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-100 text-white">
                         <p className="text-[9px] font-black text-indigo-200 uppercase mb-1">Finished Unit Cost</p>
                         <p className="text-lg font-black">${productionSummary.batchUnitCost.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setIsEntryModalOpen(false)} className="flex-1 px-8 py-5 border border-slate-200 text-slate-600 font-bold rounded-2xl transition-all">Discard</button>
                  <button type="submit" className="flex-[2] px-8 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                    <Coins size={18}/> Commit Batch
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Claim Modal (Stock Adjustment for Damages) */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-rose-50 border-rose-100">
              <div>
                <h2 className="text-2xl font-black text-rose-900 tracking-tight">Record Stock Defect</h2>
                <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-1">Direct Stock Deduction</p>
              </div>
              <button onClick={() => setIsClaimModalOpen(false)} className="p-2 text-rose-300 hover:text-rose-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleClaimSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Select SKU *</label>
                <select required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={claimProdId} onChange={e => setClaimProdId(e.target.value)}>
                  <option value="">Choose Product...</option>
                  {products.filter(p => p.stock > 0).map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Defect Qty *</label>
                  <input required type="number" step="0.01" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-rose-500" value={claimQty} onChange={e => setClaimQty(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Defect Category</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={claimType} onChange={e => setClaimType(e.target.value as any)}>
                    <option value="Damage">Physical Damage</option>
                    <option value="Defect">Quality Defect</option>
                    <option value="Shortage">Audit Shortage</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Description / Proof</label>
                <textarea rows={3} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium resize-none shadow-inner" value={claimReason} onChange={e => setClaimReason(e.target.value)} placeholder="Explain the cause of stock deduction..." />
              </div>
              <button type="submit" className="w-full py-5 bg-rose-600 text-white font-black rounded-3xl shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all">Deduct Damaged Stock</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Manufacturing;
