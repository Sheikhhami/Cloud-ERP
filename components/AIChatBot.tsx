
import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, X, Minus, BrainCircuit, Search, Map as MapIcon, 
  MessageCircle, ExternalLink, Loader2, Maximize2, Terminal, 
  Lightbulb, Zap, TrendingUp, ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AIChatMessage } from '../types';

const AIChatBot: React.FC = () => {
  const { askAI } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mode, setMode] = useState<'chat' | 'search' | 'maps' | 'complex'>('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AIChatMessage[]>([
    { role: 'model', content: 'Welcome to CloudERP Intelligence. I can analyze your ledgers, find market trends, or pinpoint logistics nodes. What is on your mind?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Close with Esc key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const promptText = customPrompt || input;
    if (!promptText.trim() || isLoading) return;
    
    const userMsg: AIChatMessage = { role: 'user', content: promptText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await askAI(promptText, mode);
    setMessages(prev => [...prev, response]);
    setIsLoading(false);
  };

  const quickActions = [
    { label: 'Analyze Profit', icon: <TrendingUp size={12}/> },
    { label: 'Market Search', icon: <Search size={12}/> },
    { label: 'Audit Security', icon: <ShieldCheck size={12}/> }
  ];

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-20 h-20 bg-indigo-600 text-white rounded-3xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-[100] group shadow-indigo-600/40 no-print"
        title="Open AI Assistant"
      >
        <Sparkles className="group-hover:rotate-12 transition-transform" size={28} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-8 right-8 w-[450px] bg-white rounded-[3rem] shadow-2xl border border-slate-200 z-[100] overflow-hidden flex flex-col transition-all duration-500 animate-in slide-in-from-bottom-12 no-print ${isMinimized ? 'h-24' : 'h-[750px]'}`}>
      <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20"><BrainCircuit size={22}/></div>
          <div>
            <h3 className="text-sm font-black tracking-tight uppercase tracking-widest">Cognitive Engine</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
              <p className="text-[9px] text-indigo-300 font-black uppercase tracking-widest">{mode} Active</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><Minus size={20}/></button>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-2 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all border border-rose-500/30"
            title="Close Assistant (Esc)"
          >
            <X size={20}/>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="bg-slate-50 p-3 flex gap-2 border-b border-slate-100">
            {[
              { id: 'chat', icon: <MessageCircle size={16}/>, label: 'Fast' },
              { id: 'complex', icon: <Zap size={16}/>, label: 'Think' },
              { id: 'search', icon: <Search size={16}/>, label: 'Search' },
              { id: 'maps', icon: <MapIcon size={16}/>, label: 'Maps' }
            ].map(m => (
              <button 
                key={m.id}
                onClick={() => setMode(m.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m.id ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-white">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] p-5 rounded-[2rem] text-sm leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-xl shadow-indigo-600/10' : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none'}`}>
                  {m.content}
                  {m.sources && (
                    <div className="mt-5 pt-5 border-t border-slate-200 space-y-3">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Context Sources</p>
                      <div className="grid grid-cols-1 gap-2">
                        {m.sources.map((s, idx) => (
                          <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all group">
                            <span className="text-[11px] font-bold text-slate-600 truncate mr-4">{s.title}</span>
                            <ExternalLink size={12} className="text-slate-300 group-hover:text-indigo-600 transition-colors flex-shrink-0"/>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-900 text-indigo-400 p-6 rounded-[2rem] rounded-tl-none shadow-2xl flex items-center gap-4">
                  <Loader2 className="animate-spin" size={20}/>
                  <span className="text-xs font-black uppercase tracking-widest">
                    {mode === 'complex' ? 'Thinking Deeply (Budget: 32K Tokens)...' : 'Processing Request...'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {quickActions.map((action, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSend(`Can you ${action.label.toLowerCase()}?`)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-indigo-600 hover:text-indigo-600 transition-all whitespace-nowrap shadow-sm"
                >
                  {action.icon} {action.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <input 
                type="text"
                placeholder="Analyze intelligence..."
                className="w-full pl-6 pr-16 py-5 bg-white border border-slate-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-sm transition-all shadow-inner"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={() => handleSend()}
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 text-white rounded-[1.5rem] hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                <Send size={20}/>
              </button>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full py-2 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:text-rose-600 transition-colors"
            >
              End Session & Close Assistant
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChatBot;
