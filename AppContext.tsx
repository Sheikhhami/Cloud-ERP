
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  Product, Customer, Sale, Expense, ExpenseCategory, 
  Employee, Project, User, UserRole, Vendor, 
  PurchaseRecord, AIChatMessage, GroundingSource,
  AttendanceRecord, ManufacturingEntry, ManufacturingClaim
} from './types';
import { 
  INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_EXPENSE_CATEGORIES, 
  INITIAL_VENDORS, INITIAL_EMPLOYEES, INITIAL_PROJECTS 
} from './constants';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  vendors: Vendor[];
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  purchases: PurchaseRecord[];
  setPurchases: React.Dispatch<React.SetStateAction<PurchaseRecord[]>>;
  expenseCategories: ExpenseCategory[];
  setExpenseCategories: React.Dispatch<React.SetStateAction<ExpenseCategory[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  manufacturingEntries: ManufacturingEntry[];
  setManufacturingEntries: React.Dispatch<React.SetStateAction<ManufacturingEntry[]>>;
  manufacturingClaims: ManufacturingClaim[];
  setManufacturingClaims: React.Dispatch<React.SetStateAction<ManufacturingClaim[]>>;
  notifications: string[];
  addNotification: (message: string) => void;
  removeNotification: (index: number) => void;
  recordPurchase: (purchase: Omit<PurchaseRecord, 'id'>) => void;
  payVendor: (vendorId: string, amount: number, method: string, description: string) => void;
  paySalary: (employeeId: string, amount: number, month: string, method: string) => void;
  logAttendance: (employeeId: string, status: AttendanceRecord['status']) => void;
  performManufacturing: (entry: Omit<ManufacturingEntry, 'id' | 'status'>) => void;
  recordClaim: (claim: Omit<ManufacturingClaim, 'id' | 'status'>) => void;
  resolveClaim: (claimId: string) => void;
  updateUser: (data: Partial<User>) => void;
  exportToCSV: (data: any[], filename: string) => void;
  askAI: (prompt: string, mode: 'chat' | 'search' | 'maps' | 'complex') => Promise<AIChatMessage>;
  editProductImage: (productId: string, prompt: string, base64Image: string) => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const load = (key: string, defaultValue: any) => {
  const saved = localStorage.getItem(key);
  try {
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const DEFAULT_USER: User = { 
  id: '1', 
  name: 'Admin User', 
  email: 'admin@clouderp.com', 
  role: UserRole.ADMIN,
  currency: 'USD',
  country: 'United States',
  measurementUnit: 'Metric'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(load('erp_user', DEFAULT_USER));
  const [products, setProducts] = useState<Product[]>(load('erp_products', INITIAL_PRODUCTS));
  const [customers, setCustomers] = useState<Customer[]>(load('erp_customers', INITIAL_CUSTOMERS));
  const [vendors, setVendors] = useState<Vendor[]>(load('erp_vendors', INITIAL_VENDORS));
  const [sales, setSales] = useState<Sale[]>(load('erp_sales', []));
  const [expenses, setExpenses] = useState<Expense[]>(load('erp_expenses', []));
  const [purchases, setPurchases] = useState<PurchaseRecord[]>(load('erp_purchases', []));
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(load('erp_categories', INITIAL_EXPENSE_CATEGORIES));
  const [employees, setEmployees] = useState<Employee[]>(load('erp_employees', INITIAL_EMPLOYEES));
  const [projects, setProjects] = useState<Project[]>(load('erp_projects', INITIAL_PROJECTS));
  const [manufacturingEntries, setManufacturingEntries] = useState<ManufacturingEntry[]>(load('erp_manufacturing', []));
  const [manufacturingClaims, setManufacturingClaims] = useState<ManufacturingClaim[]>(load('erp_claims', []));
  const [notifications, setNotifications] = useState<string[]>([]);

  const addNotification = useCallback((message: string) => {
    setNotifications(prev => [message, ...prev].slice(0, 5));
    setTimeout(() => setNotifications(prev => prev.filter(n => n !== message)), 5000);
  }, []);

  const removeNotification = (index: number) => setNotifications(prev => prev.filter((_, i) => i !== index));

  const updateUser = useCallback((data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
    addNotification('Settings updated');
  }, [addNotification]);

  const exportToCSV = useCallback((data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj)
        .map(val => (typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val))
        .join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('CSV Export Complete');
  }, [addNotification]);

  const askAI = async (prompt: string, mode: 'chat' | 'search' | 'maps' | 'complex'): Promise<AIChatMessage> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return { role: 'model', content: 'Configuration Error: API Key not found in Netlify environment variables.' };
    }

    const ai = new GoogleGenAI({ apiKey });
    let model = 'gemini-3-flash-preview'; 
    let config: any = {};

    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStockCount = products.filter(p => p.stock <= p.lowStockAlert).length;
    
    const contextSnapshot = `
      Business Context Snapshot:
      - Total Revenue: ${totalRevenue}
      - Total Operational Expenses: ${totalExpenses}
      - Net Profit: ${totalRevenue - totalExpenses}
      - Current Inventory Count: ${totalStock}
      - Products low on stock: ${lowStockCount}
      - Active Employees: ${employees.length}
      - Active Projects: ${projects.length}
      - Total Vendors: ${vendors.length}
    `;

    const systemInstruction = `You are CloudERP Intelligence, a senior business consultant. ${contextSnapshot}. Help the user manage their enterprise by providing data-driven insights. Be professional, concise, and focused on operational efficiency.`;

    if (mode === 'complex') {
      model = 'gemini-3-pro-preview';
      config = { systemInstruction, thinkingConfig: { thinkingBudget: 32768 } };
    } else if (mode === 'search') {
      model = 'gemini-3-flash-preview';
      config = { systemInstruction, tools: [{ googleSearch: {} }] };
    } else if (mode === 'maps') {
      model = 'gemini-2.5-flash';
      config = { systemInstruction, tools: [{ googleMaps: {} }], toolConfig: { retrievalConfig: { latLng: { latitude: 40.7128, longitude: -74.0060 } } } };
    } else {
      config = { systemInstruction };
    }

    try {
      const response = await ai.models.generateContent({ model, contents: prompt, config });
      const sources: GroundingSource[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      chunks.forEach((chunk: any) => {
        if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        if (chunk.maps) sources.push({ title: chunk.maps.title || 'Location', uri: chunk.maps.uri });
      });

      return {
        role: 'model',
        content: response.text || 'I encountered an issue processing your request.',
        sources: sources.length > 0 ? sources : undefined
      };
    } catch (error) {
      console.error('AI Error:', error);
      return { role: 'model', content: 'System Error: Failed to reach the AI engine. Please check your API key settings.' };
    }
  };

  const editProductImage = async (productId: string, prompt: string, base64Image: string): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } }, { text: prompt }] }
    });

    let newUrl = '';
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) newUrl = `data:image/png;base64,${part.inlineData.data}`;
    }
    
    if (newUrl) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, image: newUrl } : p));
      addNotification('Product image updated via AI');
    }
    return newUrl;
  };

  const recordPurchase = useCallback((data: Omit<PurchaseRecord, 'id'>) => {
    const purchaseId = `PUR-${Date.now()}`;
    setPurchases(prev => [{ ...data, id: purchaseId }, ...prev]);
    setProducts(prev => prev.map(p => {
      if (p.id === data.productId) {
        const totalStock = p.stock + data.quantity;
        const currentAvgCost = p.averageCost || p.purchasePrice || 0;
        const totalCostBasis = (p.stock * currentAvgCost) + (data.quantity * data.unitCost);
        const newAvgCost = totalCostBasis / totalStock;
        return { ...p, stock: totalStock, averageCost: Math.round(newAvgCost * 100) / 100 };
      }
      return p;
    }));
  }, []);

  const payVendor = useCallback((vendorId: string, amount: number, method: string, description: string) => {
    setVendors(prev => prev.map(v => {
      if (v.id === vendorId) {
        const newEntry = {
          id: `PAY-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'Payment' as const,
          description,
          debit: amount,
          credit: 0,
          balance: v.remainingPayable - amount
        };
        return { ...v, remainingPayable: v.remainingPayable - amount, totalPaid: v.totalPaid + amount, ledger: [...v.ledger, newEntry] };
      }
      return v;
    }));
  }, []);

  const paySalary = useCallback((employeeId: string, amount: number, month: string, method: string) => {
    setEmployees(prev => prev.map(e => e.id === employeeId ? { ...e, salaryHistory: [{ id: `SAL-${Date.now()}`, date: new Date().toISOString(), month, amount, status: 'Paid', paymentMethod: method }, ...e.salaryHistory] } : e));
    setExpenses(prev => [...prev, { id: `EXP-SAL-${Date.now()}`, date: new Date().toISOString().split('T')[0], categoryId: '3', amount, description: `Salary Payment - ${month}` }]);
  }, []);

  const logAttendance = useCallback((employeeId: string, status: AttendanceRecord['status']) => {
    setEmployees(prev => prev.map(e => e.id === employeeId ? { ...e, attendanceRecords: [{ date: new Date().toISOString().split('T')[0], status }, ...e.attendanceRecords] } : e));
  }, []);

  const performManufacturing = useCallback((entry: any) => {
    const id = `MFG-${Date.now()}`;
    setManufacturingEntries(prev => [...prev, { ...entry, id, status: 'Completed' }]);
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === entry.rawProductId) return { ...p, stock: p.stock - entry.rawQuantity };
        return p;
      });
      const existingFinished = updated.find(p => p.name === entry.finishedProductName);
      if (existingFinished) {
        return updated.map(p => {
          if (p.id === existingFinished.id) {
            const totalStock = p.stock + entry.finishedQuantity;
            const currentAvgCost = p.averageCost || p.purchasePrice || 0;
            const totalCostBasis = (p.stock * currentAvgCost) + (entry.finishedQuantity * entry.finishedUnitCost);
            const newAvgCost = totalCostBasis / totalStock;
            return { ...p, stock: totalStock, averageCost: Math.round(newAvgCost * 100) / 100 };
          }
          return p;
        });
      } else {
        const newProd: Product = {
          id: entry.finishedProductId, name: entry.finishedProductName, sku: `MFG-${entry.finishedProductName.slice(0,3).toUpperCase()}`,
          barcode: `MFG-${Date.now()}`, category: 'Manufacturing Output', purchasePrice: entry.finishedUnitCost,
          averageCost: entry.finishedUnitCost, salePrice: Math.round(entry.finishedUnitCost * 1.5 * 100) / 100,
          stock: entry.finishedQuantity, lowStockAlert: 5, history: []
        };
        return [newProd, ...updated];
      }
    });
  }, []);

  const recordClaim = useCallback((claim: any) => {
    const id = `CLM-${Date.now()}`;
    setManufacturingClaims(prev => [...prev, { ...claim, id, status: 'Pending' }]);
    setProducts(prev => prev.map(p => {
      if (p.id === claim.productId) return { ...p, stock: p.stock - claim.quantity };
      return p;
    }));
  }, []);

  const resolveClaim = useCallback((claimId: string) => {
    setManufacturingClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: 'Resolved' } : c));
    addNotification('Claim resolved and archived.');
  }, [addNotification]);

  useEffect(() => localStorage.setItem('erp_user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('erp_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('erp_customers', JSON.stringify(customers)), [customers]);
  useEffect(() => localStorage.setItem('erp_vendors', JSON.stringify(vendors)), [vendors]);
  useEffect(() => localStorage.setItem('erp_sales', JSON.stringify(sales)), [sales]);
  useEffect(() => localStorage.setItem('erp_expenses', JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem('erp_purchases', JSON.stringify(purchases)), [purchases]);
  useEffect(() => localStorage.setItem('erp_manufacturing', JSON.stringify(manufacturingEntries)), [manufacturingEntries]);
  useEffect(() => localStorage.setItem('erp_claims', JSON.stringify(manufacturingClaims)), [manufacturingClaims]);

  return (
    <AppContext.Provider value={{
      user, setUser, products, setProducts, customers, setCustomers,
      vendors, setVendors, sales, setSales, expenses, setExpenses,
      purchases, setPurchases, expenseCategories, setExpenseCategories,
      employees, setEmployees, projects, setProjects,
      manufacturingEntries, setManufacturingEntries, manufacturingClaims, setManufacturingClaims,
      notifications, addNotification, removeNotification, recordPurchase, payVendor, paySalary, logAttendance,
      performManufacturing, recordClaim, resolveClaim, updateUser, exportToCSV, askAI, editProductImage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
