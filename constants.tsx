
import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  CircleDollarSign, 
  Briefcase, 
  FolderKanban,
  ClipboardList,
  Factory,
  Settings as SettingsIcon,
  BarChart3
} from 'lucide-react';
import { Customer, Vendor, Employee, Project, UserRole, Product } from './types';

export const NAV_ITEMS = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
  { name: 'POS', icon: <ShoppingCart size={20} />, path: '/pos' },
  { name: 'Inventory', icon: <Package size={20} />, path: '/products' },
  { name: 'Manufacturing', icon: <Factory size={20} />, path: '/manufacturing' },
  { name: 'Customers', icon: <Users size={20} />, path: '/customers' },
  { name: 'Vendors', icon: <Truck size={20} />, path: '/vendors' },
  { name: 'Finance', icon: <CircleDollarSign size={20} />, path: '/finance' },
  { name: 'Reports', icon: <BarChart3 size={20} />, path: '/reports' },
  { name: 'Employees', icon: <Briefcase size={20} />, path: '/employees' },
  { name: 'Projects', icon: <FolderKanban size={20} />, path: '/projects' },
  { name: 'Settings', icon: <SettingsIcon size={20} />, path: '/settings' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'MacBook Pro M3', sku: 'LAP-001', barcode: '123456789', category: 'Electronics', purchasePrice: 1800, averageCost: 1800, salePrice: 2499, stock: 15, lowStockAlert: 5, history: [] },
  { id: '2', name: 'Wireless Mouse', sku: 'ACC-001', barcode: '987654321', category: 'Accessories', purchasePrice: 15, averageCost: 15, salePrice: 45, stock: 4, lowStockAlert: 10, history: [] },
  { id: '3', name: 'iPhone 15 Pro', sku: 'PHN-001', barcode: '112233445', category: 'Electronics', purchasePrice: 800, averageCost: 800, salePrice: 1099, stock: 25, lowStockAlert: 5, history: [] },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { 
    id: '1', name: 'John Doe', phone: '0300-1234567', email: 'john@example.com', address: '123 Maple St', city: 'Karachi', 
    openingBalance: 0, creditLimit: 50000, paymentTerms: 'Net 30', totalOrders: 5, totalSpent: 12500, paidAmount: 12000, remainingDue: 500, 
    createdAt: new Date().toISOString() 
  },
];

export const INITIAL_VENDORS: Vendor[] = [
  { 
    id: '1', name: 'Global Tech', phone: '021-34567890', email: 'sales@globaltech.com', address: 'Electronic Market', 
    companyName: 'Global Tech Solutions', ntn: '12345-6', bankDetails: 'HBL - 0012345678', paymentTerms: 'Net 30',
    openingBalance: 0, totalPurchases: 50000, totalPaid: 45000, remainingPayable: 5000, 
    createdAt: new Date().toISOString(),
    ledger: []
  },
];

export const INITIAL_EXPENSE_CATEGORIES = [
  { id: '1', name: 'Rent', description: 'Monthly office rent', color: '#3b82f6' },
  { id: '2', name: 'Utilities', description: 'Electricity, Water, Internet', color: '#fbbf24' },
  { id: '3', name: 'Salaries', description: 'Employee wages', color: '#10b981' },
  { id: '4', name: 'Marketing', description: 'Ads and promotions', color: '#ec4899' },
  { id: '5', name: 'Inventory Purchases', description: 'Sourcing expenses', color: '#8b5cf6' },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Sarah Ahmed', email: 'sarah@clouderp.com', role: UserRole.MANAGER, salary: 1500, performance: 5, joiningDate: '2022-01-15', attendanceRecords: [], salaryHistory: [] },
  { id: 'emp-2', name: 'Michael Chen', email: 'michael@clouderp.com', role: UserRole.CASHIER, salary: 800, performance: 4, joiningDate: '2023-05-20', attendanceRecords: [], salaryHistory: [] },
];

export const INITIAL_PROJECTS: Project[] = [
  { 
    id: 'proj-1', 
    name: 'Q4 Marketing Campaign', 
    assignedTo: ['emp-1'], 
    budget: 5000, 
    deadline: '2024-12-31', 
    status: 'In Progress', 
    progress: 45, 
    expenses: 1200 
  },
];
