import React, { useState, useEffect, useRef } from 'react';
import { Send, GraduationCap, Sparkles, AlertCircle, User, Bot } from 'lucide-material-react';

/**
 * StudieBubblan - En pedagogisk AI-lärare byggd för React + Vite.
 * Fix: Hantering av import.meta för att undvika kompileringsfel i vissa miljöer.
 */
const getApiKey = () => {
  try {
    // Försök hämta från Vite miljövariabler
    return import.meta.env.VITE_GEMINI_API_KEY || "";
  } catch (e) {
    // Fallback om import.meta inte är tillgänglig under kompilering
    return "";
  }
};

const apiKey = getApiKey();

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hej! Jag är StudieBubblan, din personliga AI-lärare. Vad vill du utforska eller lära dig mer om idag?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage }] }],
          systemInstruction: { 
            parts: [{ text: "Du är StudieBubblan, en pedagogisk, inspirerande och tålmodig AI-lärare. Förklara svåra koncept på ett enkelt sätt, använd liknelser och uppmuntra studenten. Svara alltid på svenska." }] 
          }
        })
      });

      if (!response.ok) throw new Error('API-fel');
      
      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hoppsan, jag tappade bort tråden. Kan du prova igen?";
      
      setMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Just nu har jag svårt att nå mina server-hjärnor. Kontrollera din API-nyckel i Vercels inställningar!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-transform hover:scale-105">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">StudieBubblan</h1>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-[0.2em]">Din AI-Pedagog</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full text-indigo-600 dark:text-indigo-300 text-xs font-bold">
            <Sparkles size={14} />
            <span>Smart Inlärning</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-8 pb-32">
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-center gap-2 mb-2 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-1.5 rounded-lg ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {msg.role === 'user' ? 'Du' : 'StudieBubblan'}
                </span>
              </div>
              <div className={`max-w-[90%] md:max-w-[80%] rounded-3xl px-6 py-4 shadow-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100 dark:shadow-none' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-none text-slate-800 dark:text-slate-200 shadow-slate-100'
              }`}>
                <p className="whitespace-pre-wrap text-[15px]">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex flex-col items-start animate-pulse">
               <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full mb-2"></div>
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl rounded-tl-none p-4 w-32 h-12"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-transparent p-4 md:p-6 fixed bottom-0 left-0 right-0 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          {!apiKey && (
            <div className="mb-4 flex items-center gap-3 text-amber-700 bg-amber-50 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl text-sm font-medium backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
              <AlertCircle size={20} className="shrink-0" />
              <div>
                <p className="font-bold">API-nyckel saknas</p>
                <p className="text-xs opacity-80">Lägg till VITE_GEMINI_API_KEY i dina Vercel-inställningar.</p>
              </div>
            </div>
          )}
          <form onSubmit={handleSend} className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Vad vill du lära dig om?"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl py-5 pl-6 pr-16 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:text-white transition-all shadow-2xl shadow-indigo-500/5"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 bottom-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all disabled:opacity-50 disabled:scale-90 flex items-center justify-center active:scale-95"
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-center text-[9px] text-slate-400 mt-3 uppercase tracking-[0.3em] font-medium">StudieBubblan v2.0 • AI-driven pedagogik</p>
        </div>
      </footer>
    </div>
  );
}


export default App;

