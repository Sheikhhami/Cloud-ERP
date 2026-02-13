
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, 
  Wallet, X, Printer, Share2, Package, Smartphone, CheckCircle2, 
  Terminal, User, Tag, ArrowRight, ArrowLeft, RefreshCcw, Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, SaleItem, Sale } from '../types';

const POS: React.FC = () => {
  const { products, setProducts, customers, addNotification, setSales, sales, exportToCSV } = useApp();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentModal, setPaymentModal] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [receiptModal, setReceiptModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.sku.toLowerCase().includes(search.toLowerCase()) ||
                            p.barcode.includes(search);
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCategory]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      addNotification(`Inventory Shortage: ${product.name} is currently out of stock.`);
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, quantity: 1, price: product.salePrice }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax - discount;

  const handleCheckout = (method: string) => {
    const saleId = `INV-${Date.now().toString().slice(-8)}`;
    const newSale: Sale = {
      id: saleId,
      date: new Date().toISOString(),
      customerId: '1',
      items: [...cart],
      subtotal,
      tax,
      discount,
      total,
      paymentMethod: method as any,
      status: 'Completed' as const
    };

    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(item => item.productId === p.id);
      return cartItem ? { ...p, stock: p.stock - cartItem.quantity } : p;
    }));

    setSales(prev => [newSale, ...prev]);
    setLastSale(newSale);
    addNotification(`Transaction ${saleId} verified and recorded.`);
    setCart([]);
    setDiscount(0);
    setPaymentModal(false);
    setReceiptModal(true);
  };

  const handleExportTodaySales = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaysSales = sales.filter(s => s.date.startsWith(today));
    exportToCSV(todaysSales, 'Today_Sales_Report');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-8 animate-in fade-in duration-500 no-print">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Scan Barcode or Search Inventory..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-sm transition-all"
              value={search}
              // Fixed: Cannot find name 'setSearchTerm'. Did you mean 'setSearch'?
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportTodaySales}
              className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all shadow-sm"
              title="Export Today's Sales (CSV)"
            >
              <Download size={20}/>
            </button>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-indigo-600/20' : 'bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 overflow-y-auto pr-2 scrollbar-hide">
          {filteredProducts.map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              className="group bg-white p-5 rounded-[2rem] border border-slate-100 hover:border-indigo-500 hover:shadow-2xl transition-all text-left relative overflow-hidden"
            >
              <div className="aspect-square bg-slate-50 rounded-2xl mb-4 flex items-center justify-center text-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-200 transition-colors overflow-hidden">
                {product.image ? (
                  <img src={product.image} className="w-full h-full object-cover"/>
                ) : (
                  <Package size={48} />
                )}
              </div>
              <h3 className="font-black text-slate-800 line-clamp-1 text-sm">{product.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{product.sku}</p>
              <div className="flex justify-between items-end mt-4">
                <p className="text-xl font-black text-indigo-600">${product.salePrice.toLocaleString()}</p>
                <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${product.stock > 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {product.stock} Units
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart & Checkout Panel */}
      <div className="w-[420px] bg-white border border-slate-200 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-600 rounded-2xl"><Terminal size={20} /></div>
            <div>
              <span className="font-black text-sm uppercase tracking-widest block">Active Terminal</span>
              <span className="text-[10px] font-bold text-indigo-400 uppercase">POS #00124-B</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg shadow-emerald-500/30">Online</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                <ShoppingCart size={48} className="opacity-20" />
              </div>
              <p className="font-black text-[10px] uppercase tracking-[0.2em]">Transaction Queue Empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="flex items-center space-x-4 animate-in slide-in-from-right-4">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-slate-100 shadow-sm">
                  <Package size={24} className="text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-slate-800 truncate">{item.name}</h4>
                  <p className="text-xs font-bold text-indigo-600 mt-1">${item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center bg-slate-100 rounded-2xl p-1.5 border border-slate-200 shadow-inner">
                  <button onClick={() => updateQuantity(item.productId, -1)} className="p-2 text-slate-400 hover:text-indigo-600"><Minus size={14}/></button>
                  <span className="w-10 text-center text-xs font-black text-slate-800">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, 1)} className="p-2 text-slate-400 hover:text-indigo-600"><Plus size={14}/></button>
                </div>
                <button 
                  onClick={() => updateQuantity(item.productId, -item.quantity)}
                  className="p-2 text-slate-200 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-4 rounded-b-[3rem]">
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <span>Subtotal Value</span>
              <span>${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <span>Gov Tax (10%)</span>
              <span>${tax.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-black text-rose-500 uppercase tracking-widest">
              <span>Applied Discount</span>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2">$</span>
                <input 
                  type="number" 
                  className="w-20 bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-right outline-none focus:ring-2 focus:ring-rose-500"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Amount</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">${total.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>
            <button 
              disabled={cart.length === 0}
              onClick={() => setPaymentModal(true)}
              className="px-10 py-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              Checkout <ArrowRight size={20}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
