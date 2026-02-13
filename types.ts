
export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  CASHIER = 'Cashier'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  currency: string;
  country: string;
  measurementUnit: 'Metric' | 'Imperial';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  purchasePrice: number; 
  averageCost: number;  
  salePrice: number;
  stock: number;
  lowStockAlert: number;
  image?: string;
  history: ProductHistory[];
}

export interface ProductHistory {
  date: string;
  type: 'sale' | 'purchase' | 'adjustment' | 'manufacturing_in' | 'manufacturing_out' | 'claim';
  quantity: number;
  price: number;
  vendorId?: string;
  remainingStockAfter: number;
  newAverageCost: number;
  referenceId?: string;
}

export interface PurchaseRecord {
  id: string;
  date: string;
  vendorId: string;
  productId: string;
  quantity: number;
  unitCost: number;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  cnic?: string;
  companyName?: string;
  openingBalance: number;
  creditLimit: number;
  paymentTerms: string;
  totalOrders: number;
  totalSpent: number;
  paidAmount: number;
  remainingDue: number;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  companyName: string;
  ntn?: string;
  bankDetails?: string;
  paymentTerms: string;
  openingBalance: number;
  totalPurchases: number;
  totalPaid: number;
  remainingPayable: number;
  createdAt: string;
  ledger: VendorLedgerEntry[];
}

export interface VendorLedgerEntry {
  id: string;
  date: string;
  type: 'Purchase' | 'Payment' | 'Opening Balance';
  description: string;
  debit: number;  // Amount we paid them
  credit: number; // Amount they billed us
  balance: number; // Running balance
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface Expense {
  id: string;
  date: string;
  categoryId: string;
  amount: number;
  description: string;
}

export interface Sale {
  id: string;
  date: string;
  customerId: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'Bank' | 'Online';
  status: 'Completed' | 'Refunded';
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  salary: number;
  joiningDate: string;
  attendanceRecords: AttendanceRecord[];
  salaryHistory: SalaryPayment[];
  performance: number; // 1-5
}

export interface AttendanceRecord {
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  checkIn?: string;
  checkOut?: string;
}

export interface SalaryPayment {
  id: string;
  date: string;
  month: string;
  amount: number;
  status: 'Paid' | 'Pending';
  paymentMethod: string;
}

export interface Project {
  id: string;
  name: string;
  assignedTo: string[];
  budget: number;
  deadline: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  progress: number;
  expenses: number;
}

export type ManufacturingProcessType = 'Dyeing' | 'Rags' | 'Calendering' | 'Other';

export interface ManufacturingEntry {
  id: string;
  date: string;
  rawProductId: string;
  rawQuantity: number;
  rawUnitCost: number;
  processType: ManufacturingProcessType;
  unitProcessCost: number;
  claimQuantity: number;
  finishedProductId: string; 
  finishedProductName: string;
  finishedQuantity: number;
  finishedUnitCost: number;
  notes: string;
  status: 'Completed';
}

export interface ManufacturingClaim {
  id: string;
  date: string;
  productId: string;
  quantity: number;
  reason: string;
  type: 'Damage' | 'Defect' | 'Shortage';
  status: 'Pending' | 'Resolved';
}

// AI Specific Types
export interface AIChatMessage {
  role: 'user' | 'model';
  content: string;
  sources?: GroundingSource[];
  isThinking?: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
}
