
import React, { Component, ReactNode, ErrorInfo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './AppContext';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Dashboard';
import POS from './POS';
import Products from './Products';
import Finance from './Finance';
import Customers from './Customers';
import Vendors from './Vendors';
import Projects from './Projects';
import Employees from './Employees';
import Manufacturing from './Manufacturing';
import Settings from './Settings';
import Reports from './Reports';
import AIChatBot from './AIChatBot';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App Crash Logged:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center p-6 text-center bg-slate-50">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-200 max-w-lg">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Engine Interruption</h1>
            <p className="text-slate-500 mt-3 mb-8">The cloud engine encountered a runtime exception. Your data is safe, but the UI needs a restart.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                Restart Session
              </button>
              <button 
                onClick={() => window.location.href = '/'} 
                className="w-full px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
              >
                Return to Home
              </button>
            </div>
            {this.state.error && (
              <pre className="mt-8 p-4 bg-slate-900 text-rose-400 rounded-xl text-[10px] text-left overflow-auto max-h-32 scrollbar-hide">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md space-y-8 animate-in zoom-in duration-500">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">CloudERP</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Enterprise Access Portal</p>
          </div>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Work Email</label>
              <input type="email" defaultValue="admin@clouderp.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-semibold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Security Key</label>
              <input type="password" defaultValue="password" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-semibold" />
            </div>
            <button className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-95">Initiate Session</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide relative z-10">
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </HashRouter>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
