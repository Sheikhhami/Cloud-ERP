
import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, ShoppingCart, Trash2, Plus, Minus, Banknote, CreditCard, 
  Smartphone, Wallet, X, Package, Terminal, ArrowRight, Camera, CheckCircle2 
} from 'lucide-react';
import { useApp } from './AppContext';
import { Product, SaleItem, Sale } from './types';

const POS: React.FC = () => {
  const { products, setProducts, addNotification, setSales, sales } = useApp();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentModal, setPaymentModal] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [receiptModal, setReceiptModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const filteredProducts = useMemo(() => 
    products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase())
    ), [products, search]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return addNotification(`${product.name} is currently out of stock.`);
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { productId: product.id, name: product.name, quantity: 1, price: product.salePrice }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => item.productId === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(i => i.quantity > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal * 1.1 - discount;

  const handleCheckout = (method: string) => {
    const sale: Sale = { 
      id: `INV-${Date.now().toString().slice(-6)}`, 
      date: new Date().toISOString(), 
      customerId: '1', 
      items: [...cart], 
      subtotal, 
      tax: subtotal * 0.1, 
      discount, 
      total, 
      paymentMethod: method as any, 
      status: 'Completed' 
    };
    
    setProducts(prev => prev.map(p => { 
      const ci = cart.find(i => i.productId === p.id); 
      return ci ? { ...p, stock: p.stock - ci.quantity } : p; 
    }));
    
    setSales(prev => [sale, ...prev]);
    setLastSale(sale);
    setCart([]); setDiscount(0); setPaymentModal(false); setReceiptModal(true);
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-8 animate-in fade-in no-print">
      <div className="flex-1 flex flex-col space-y-6">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
            <input 
              type="text" 
              placeholder="Scan Barcode or Search SKU..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none font-bold text-sm focus:ring-4 focus:ring-indigo-500/5 transition-all" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <button onClick={() => setIsScanning(!isScanning)} className={`p-4 rounded-2xl font-black uppercase text-[10px] transition-all shadow-sm ${isScanning ? 'bg-rose-500 text-white shadow-rose-100' : 'bg-white border border-slate-200 text-slate-500'}`}>
            <Camera size={20}/>
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 overflow-y-auto pr-2 scrollbar-hide pb-10">
          {filteredProducts.map(product => (
            <button key={product.id} onClick={() => addToCart(product)} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 hover:border-indigo-500 hover:shadow-xl transition-all text-left group">
              <div className="aspect-square bg-slate-50 rounded-2xl mb-4 flex items-center justify-center text-slate-200 group-hover:bg-indigo-50 transition-colors">
                 {product.image ? <img src={product.image} className="w-full h-full object-cover rounded-2xl"/> : <Package size={48} />}
              </div>
              <h3 className="font-black text-slate-800 line-clamp-1 text-sm">{product.name}</h3>
              <p className="text-xl font-black text-indigo-600 mt-2">${product.salePrice.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{product.stock} in Stock</p>
            </button>
          ))}
        </div>
      </div>

      <div className="w-[420px] bg-white border border-slate-200 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
        <div className="p-8 border-b bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Terminal size={20} className="text-indigo-400"/>
             <span className="font-black text-xs uppercase tracking-widest">Active Terminal #1</span>
          </div>
          <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase">Online</span>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
              <ShoppingCart size={48} className="opacity-10" />
              <p className="font-black text-[10px] uppercase tracking-widest">Cart empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="flex items-center gap-4 animate-in slide-in-from-right-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-slate-800 truncate">{item.name}</h4>
                  <p className="text-xs font-bold text-indigo-600 mt-1">${item.price}</p>
                </div>
                <div className="flex items-center bg-slate-100 rounded-xl p-1 shadow-inner border border-slate-200">
                  <button onClick={() => updateQuantity(item.productId, -1)} className="p-1.5 text-slate-400 hover:text-indigo-600"><Minus size={14}/></button>
                  <span className="w-8 text-center text-xs font-black text-slate-700">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, 1)} className="p-1.5 text-slate-400 hover:text-indigo-600"><Plus size={14}/></button>
                </div>
                <button onClick={() => updateQuantity(item.productId, -item.quantity)} className="p-2 text-slate-200 hover:text-rose-500"><Trash2 size={18}/></button>
              </div>
            ))
          )}
        </div>
        <div className="p-8 bg-slate-50 border-t space-y-5 rounded-b-[3rem]">
          <div className="flex justify-between items-end">
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payable</p>
               <p className="text-4xl font-black text-slate-900 tracking-tighter">${total.toLocaleString()}</p>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Incl. 10% VAT</p>
          </div>
          <button disabled={cart.length === 0} onClick={() => setPaymentModal(true)} className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-3xl font-black uppercase text-sm flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95">
            Commit Sale <ArrowRight size={20}/>
          </button>
        </div>
      </div>

      {paymentModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-2xl font-black text-slate-800">Settlement Method</h2>
                <button onClick={() => setPaymentModal(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={24}/></button>
             </div>
             <div className="p-8 grid grid-cols-2 gap-4">
                {[
                  { id: 'Cash', icon: <Banknote size={24}/> },
                  { id: 'Card', icon: <CreditCard size={24}/> },
                  { id: 'Bank', icon: <Smartphone size={24}/> },
                  { id: 'Online', icon: <Wallet size={24}/> }
                ].map(m => (
                  <button key={m.id} onClick={() => handleCheckout(m.id)} className="p-10 border-2 border-slate-100 rounded-[2.5rem] hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center gap-4 group">
                    <div className="text-slate-300 group-hover:text-indigo-600 transition-colors">{m.icon}</div>
                    <span className="font-black uppercase text-xs tracking-widest text-slate-600 group-hover:text-slate-900">{m.id}</span>
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}

      {receiptModal && lastSale && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 text-center space-y-8 animate-in slide-in-from-bottom-12 duration-500">
             <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={48} />
             </div>
             <div>
                <h2 className="text-3xl font-black text-slate-900">Success!</h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Invoice: {lastSale.id}</p>
             </div>
             <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
                <div className="flex justify-between text-sm font-bold text-slate-600"><span>Paid via</span><span className="text-indigo-600">{lastSale.paymentMethod}</span></div>
                <div className="flex justify-between text-sm font-bold text-slate-600"><span>Total</span><span className="text-slate-900 font-black">${lastSale.total.toLocaleString()}</span></div>
             </div>
             <button onClick={() => setReceiptModal(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all">New Transaction</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default POS;
