
import React, { useState, useMemo } from 'react';
import { 
  Package, Plus, Search, Edit2, Trash2, ArrowUpDown, 
  X, Download, Barcode, Hash, Tag, DollarSign,
  History, TrendingUp, CheckCircle2, Image as ImageIcon,
  AlertTriangle, ArrowRightLeft, Printer, Calculator, BarChart3,
  TrendingDown, Info, Truck, UserPlus, ShoppingCart, Sigma, FileText,
  ClipboardList, Calendar, Sparkles, Wand2, Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, UserRole, Vendor, PurchaseRecord } from '../types';

const Products: React.FC = () => {
  const { products, setProducts, addNotification, vendors, recordPurchase, purchases, exportToCSV, editProductImage } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isImageEditOpen, setIsImageEditOpen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});

  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.category)));
    return ['All Categories', ...list];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.barcode.includes(searchTerm);
      const matchesCategory = categoryFilter === 'All Categories' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const handleExport = () => exportToCSV(products, 'MasterInventory');

  const openForm = (prod?: Product) => {
    if (prod) {
      setFormData(prod);
      setSelectedProduct(prod);
    } else {
      setFormData({ name: '', sku: '', barcode: '', category: '', purchasePrice: 0, salePrice: 0, stock: 0, lowStockAlert: 5 });
      setSelectedProduct(null);
    }
    setIsFormModalOpen(true);
  };

  const handleAIImageEdit = async () => {
    if (!selectedProduct || !imagePrompt) return;
    setIsAILoading(true);
    try {
      const defaultImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
      const base64 = selectedProduct.image || defaultImg;
      await editProductImage(selectedProduct.id, imagePrompt, base64);
      setIsImageEditOpen(false);
      setImagePrompt('');
    } catch (e) {
      addNotification("AI Editing failed");
    }
    setIsAILoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;
    if (selectedProduct) {
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, ...formData } as Product : p));
      addNotification('Inventory record updated');
    } else {
      const newProd: Product = { ...formData, id: Date.now().toString(), averageCost: formData.purchasePrice || 0, history: [] } as Product;
      setProducts(prev => [newProd, ...prev]);
      addNotification('New Master SKU registered');
    }
    setIsFormModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Inventory Intelligence</h1>
          <p className="text-slate-500">Manage SKUs, stock levels, and procurement records.</p>
        </div>
        <div className="flex flex-wrap gap-3 no-print">
          <div className="bg-white p-1 rounded-2xl border border-slate-200 flex gap-1 shadow-sm">
            <button 
              onClick={() => window.print()}
              className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
              title="Print to PDF"
            >
              <Printer size={20}/>
            </button>
            <button 
              onClick={handleExport}
              className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
              title="Export CSV (Excel)"
            >
              <Download size={20}/>
            </button>
          </div>
          <button onClick={() => setIsPurchaseModalOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
            <ShoppingCart size={20} />
            <span>Post Purchase Entry</span>
          </button>
          <button onClick={() => openForm()} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all">
            <Plus size={20} />
            <span>Create Master SKU</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/30 no-print">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search by name, SKU, or barcode..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none text-sm font-medium transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 outline-none shadow-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Master Product</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">In Stock</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Avg Cost</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Sale Price</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Inventory Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map(prod => (
                <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {prod.image ? (
                        <img src={prod.image} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm"/>
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400"><Package size={20} /></div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-800">{prod.name}</p>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{prod.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-black ${prod.stock <= prod.lowStockAlert ? 'text-rose-600' : 'text-slate-800'}`}>{prod.stock}</span>
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-sm font-black text-slate-800">${(prod.averageCost || prod.purchasePrice || 0).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">${prod.salePrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <p className="text-sm font-black text-slate-900">${((prod.averageCost || prod.purchasePrice || 0) * prod.stock).toLocaleString()}</p>
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1 no-print">
                        <button onClick={() => { setSelectedProduct(prod); setIsImageEditOpen(true); }} className="p-1.5 text-blue-400 hover:text-blue-600" title="AI Image Edit"><Wand2 size={14}/></button>
                        <button onClick={() => openForm(prod)} className="p-1.5 text-slate-400 hover:text-indigo-600"><Edit2 size={14}/></button>
                        <button onClick={() => { setSelectedProduct(prod); setIsDeleteModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isImageEditOpen && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 no-print">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-blue-50 text-blue-900">
              <div className="flex items-center gap-3">
                <Sparkles size={24}/>
                <h2 className="text-2xl font-black tracking-tight">AI Studio</h2>
              </div>
              <button onClick={() => setIsImageEditOpen(false)} className="p-2 text-blue-400 hover:text-rose-500"><X size={24}/></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden flex items-center justify-center">
                {isAILoading ? <Loader2 className="animate-spin text-blue-600" size={48}/> : <img src={selectedProduct.image || ""} className="w-full h-full object-cover"/>}
              </div>
              <textarea 
                rows={3}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium text-sm focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                placeholder="AI editing prompt..."
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
              />
              <button onClick={handleAIImageEdit} disabled={isAILoading || !imagePrompt.trim()} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                <Wand2 size={20}/> Generate Enhancement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
