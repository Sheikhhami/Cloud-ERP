
import React, { Component, ReactNode, ErrorInfo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Finance from './pages/Finance';
import Customers from './pages/Customers';
import Vendors from './pages/Vendors';
import Projects from './pages/Projects';
import Employees from './pages/Employees';
import Manufacturing from './pages/Manufacturing';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import AIChatBot from './components/AIChatBot';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Fix: Use imported Component directly with generics to ensure state and props are correctly typed and inherited
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Fix: state is inherited from Component when generic parameters are provided
    this.state = {
      hasError: false
    };
  }

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    // Fix: state is correctly recognized as inherited from Component
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-3xl font-black text-slate-800">Something went wrong.</h1>
          <p className="text-slate-500 mt-2">Please refresh the page or contact support if the issue persists.</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Refresh Now</button>
        </div>
      );
    }

    // Fix: props is correctly recognized as inherited from Component
    return this.props.children;
  }
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">CloudERP</h1>
            <p className="text-slate-500 mt-2">Sign in to your business hub</p>
          </div>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input type="email" defaultValue="admin@clouderp.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
            <input type="password" defaultValue="password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide relative">
          {children}
          <AIChatBot />
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/products" element={<Products />} />
              <Route path="/manufacturing" element={<Manufacturing />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </HashRouter>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
