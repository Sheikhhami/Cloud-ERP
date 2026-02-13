
import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, X, Minus, BrainCircuit, Search, Map as MapIcon, 
  MessageCircle, ExternalLink, Loader2, Zap, TrendingUp, ShieldCheck
} from 'lucide-react';
import { useApp } from './AppContext';
import { AIChatMessage } from './types';

const AIChatBot: React.FC = () => {
  const { askAI } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mode, setMode] = useState<'chat' | 'search' | 'maps' | 'complex'>('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AIChatMessage[]>([
    { role: 'model', content: 'Welcome to CloudERP Intelligence. How can I assist your operations today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const promptText = customPrompt || input;
    if (!promptText.trim() || isLoading) return;
    setMessages(prev => [...prev, { role: 'user', content: promptText }]);
    setInput('');
    setIsLoading(true);
    const response = await askAI(promptText, mode);
    setMessages(prev => [...prev, response]);
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="fixed bottom-8 right-8 w-20 h-20 bg-indigo-600 text-white rounded-3xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-[100] group shadow-indigo-600/40 no-print">
        <Sparkles className="group-hover:rotate-12 transition-transform" size={28} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-8 right-8 w-[450px] bg-white rounded-[3rem] shadow-2xl border border-slate-200 z-[100] overflow-hidden flex flex-col transition-all duration-500 no-print ${isMinimized ? 'h-24' : 'h-[750px]'}`}>
      <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20"><BrainCircuit size={22}/></div>
          <h3 className="text-sm font-black tracking-tight uppercase tracking-widest">Cognitive Engine</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><Minus size={20}/></button>
          <button onClick={() => setIsOpen(false)} className="p-2 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all border border-rose-500/30"><X size={20}/></button>
        </div>
      </div>
      {!isMinimized && (
        <>
          <div className="bg-slate-50 p-3 flex gap-2 border-b border-slate-100">
            {['chat', 'complex', 'search', 'maps'].map(m => (
              <button key={m} onClick={() => setMode(m as any)} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>{m}</button>
            ))}
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-white">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] p-5 rounded-[2rem] text-sm leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-50 border border-slate-100 text-slate-800'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && <div className="flex justify-start"><Loader2 className="animate-spin text-indigo-600" size={20}/></div>}
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <div className="relative">
              <input type="text" placeholder="Analyze intelligence..." className="w-full pl-6 pr-16 py-5 bg-white border border-slate-200 rounded-[2rem] outline-none font-bold text-sm shadow-inner" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} />
              <button onClick={() => handleSend()} disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 text-white rounded-[1.5rem] disabled:opacity-50"><Send size={20}/></button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default AIChatBot;
