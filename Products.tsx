
import React, { useState, useMemo } from 'react';
import { Package, Plus, Search, Edit2, Trash2, Printer, Download, Wand2, Loader2, X, Sparkles } from 'lucide-react';
import { useApp } from './AppContext';
import { Product } from './types';

const Products: React.FC = () => {
  const { products, setProducts, addNotification, exportToCSV, editProductImage } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImageEditOpen, setIsImageEditOpen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});

  const filteredProducts = useMemo(() => products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())), [products, searchTerm]);

  const handleAIImageEdit = async () => {
    if (!selectedProduct || !imagePrompt) return;
    setIsAILoading(true);
    try {
      await editProductImage(selectedProduct.id, imagePrompt, selectedProduct.image || "");
      setIsImageEditOpen(false); setImagePrompt('');
    } catch (e) { addNotification("AI Editing failed"); }
    setIsAILoading(false);
  };

  const openForm = (prod?: Product) => {
    if (prod) { setFormData(prod); setSelectedProduct(prod); } 
    else { setFormData({ name: '', sku: '', category: '', purchasePrice: 0, salePrice: 0, stock: 0, lowStockAlert: 5 }); setSelectedProduct(null); }
    setIsFormModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    if (selectedProduct) { setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, ...formData } as Product : p)); addNotification('SKU Updated'); }
    else { setProducts(prev => [{ ...formData, id: Date.now().toString(), averageCost: formData.purchasePrice || 0, history: [] } as Product, ...prev]); addNotification('SKU Created'); }
    setIsFormModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end no-print">
        <div><h1 className="text-2xl font-black text-slate-800">Inventory Management</h1><p className="text-slate-500">Global stock levels and sourcing costs.</p></div>
        <div className="flex gap-3"><button onClick={() => openForm()} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"><Plus size={20}/> New SKU</button></div>
      </div>
      <div className="bg-white rounded-[2.5rem] shadow-sm border overflow-hidden">
        <div className="p-6 bg-slate-50 border-b flex items-center gap-4"><Search size={18} className="text-slate-400"/><input type="text" placeholder="Search SKU..." className="bg-transparent outline-none flex-1 font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b"><tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="px-6 py-5">Product</th><th className="px-6 py-5">Stock</th><th className="px-6 py-5">Price</th><th className="px-6 py-5 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-50">{filteredProducts.map(prod => (
            <tr key={prod.id} className="hover:bg-slate-50 group">
              <td className="px-6 py-4 flex items-center gap-3">{prod.image ? <img src={prod.image} className="w-10 h-10 rounded-xl object-cover" /> : <Package className="text-slate-300"/>}<div><p className="font-bold">{prod.name}</p><p className="text-[10px] uppercase">{prod.sku}</p></div></td>
              <td className="px-6 py-4 font-black">{prod.stock}</td>
              <td className="px-6 py-4 text-indigo-600 font-bold">${prod.salePrice}</td>
              <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => { setSelectedProduct(prod); setIsImageEditOpen(true); }} className="p-2 text-blue-500"><Wand2 size={16}/></button><button onClick={() => openForm(prod)} className="p-2 text-slate-400"><Edit2 size={16}/></button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {isImageEditOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 animate-in zoom-in space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-black">AI Image Studio</h2><button onClick={() => setIsImageEditOpen(false)}><X size={24}/></button></div>
            <textarea rows={3} className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="AI Edit Prompt..." value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} />
            <button onClick={handleAIImageEdit} disabled={isAILoading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black">{isAILoading ? 'Processing...' : 'Enhance Image'}</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Products;
