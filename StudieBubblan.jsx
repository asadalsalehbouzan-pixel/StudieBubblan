import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Target, 
  GraduationCap, 
  Dumbbell, 
  Layers,
  FileText,
  Send,
  UserCircle,
  BrainCircuit,
  RefreshCw,
  PlayCircle,
  X,
  Menu,
  FlaskConical,
  Globe,
  Calculator,
  Lightbulb,
  Info,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  Star,
  Zap,
  Rocket,
  Lock,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Volume2,
  MessageSquare,
  Search
} from 'lucide-react';

const App = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [userLevel, setUserLevel] = useState(null); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [aiSessionData, setAiSessionData] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // AI Chat States
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const apiKey = ""; 

  const subjects = [
    { 
      id: 'matte', 
      name: 'Matematik', 
      color: 'blue', 
      icon: <Calculator size={20} />, 
      chapters: ['Ekvationer', 'Algebra', 'Procent & Bråk', 'Geometri', 'Sannolikhet'],
    },
    { 
      id: 'no', 
      name: 'NO-ämnen', 
      color: 'green', 
      icon: <FlaskConical size={20} />, 
      chapters: ['Atomer', 'Ekosystem', 'Kroppen', 'Krafter', 'Kemi'],
    },
    { id: 'engelska', name: 'Engelska', color: 'purple', icon: <Globe size={20} />, chapters: ['Grammar', 'Vocabulary', 'Culture'] },
    { id: 'svenska', name: 'Svenska', color: 'red', icon: <span className="font-bold text-lg">A</span>, chapters: ['Grammatik', 'Referat'] }
  ];

  const levels = [
    { id: 'grundskola', label: 'Grundskola' },
    { id: 'gymnasiet-1', label: 'Gymnasiet År 1' },
    { id: 'gymnasiet-2', label: 'Gymnasiet År 2' },
    { id: 'gymnasiet-3', label: 'Gymnasiet År 3' }
  ];

  // Scroll logic for chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const generateImage = async (promptText) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: `A professional 3D educational illustration, clean and vibrant, related to: ${promptText}. Cinematic lighting, minimalist style.` }],
          parameters: { sampleCount: 1 }
        })
      });
      const result = await response.json();
      if (result.predictions?.[0]?.bytesBase64Encoded) {
        return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const fetchAiQuestion = async (subject, chapter, level) => {
    const systemPrompt = `Du är en superpedagogisk lärare som förklarar saker så att ett barn kan förstå. 
    Skapa en utmaning för en elev på nivån "${level}" i ämnet ${subject.name} (kapitel: ${chapter}). 
    Använd ett enkelt, inspirerande språk utan krångliga ord.
    Du MÅSTE svara med ett JSON-objekt:
    - title: En kort, spännande rubrik
    - scenario: En vardagsnära beskrivning av problemet
    - question: En tydlig fråga
    - hint: En enkel ledtråd
    - imagePrompt: Engelsk bildbeskrivning.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Skapa en enkel och rolig uppgift." }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { 
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                scenario: { type: "STRING" },
                question: { type: "STRING" },
                hint: { type: "STRING" },
                imagePrompt: { type: "STRING" }
              },
              required: ["title", "scenario", "question", "hint", "imagePrompt"]
            }
          }
        })
      });
      const result = await response.json();
      return JSON.parse(result.candidates[0].content.parts[0].text);
    } catch (e) { return null; }
  };

  const handleAskAi = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    const systemPrompt = `Du är StudieBubblans AI-assistent. Din uppgift är att svara på elevens frågor om skolan, läxor eller specifika ämnen. 
    Håll svaren korta, pedagogiska och inspirerande. Använd Google Search för att verifiera fakta om det behövs. 
    Förklara alltid "varför" på ett enkelt sätt. Om eleven frågar om något utanför skolan, styr vänligt tillbaka samtalet till lärande.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: chatInput }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          tools: [{ "google_search": {} }]
        })
      });
      const result = await response.json();
      const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "Jag kunde inte hitta svar på det just nu, testa att fråga igen!";
      
      setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'ai', text: "Oj, nu blev det något tekniskt fel. Försök igen om en stund!" }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const fetchAiFeedback = async (questionData, answer) => {
    const systemPrompt = `Analysera elevens svar: "${answer}" på frågan "${questionData.question}".
    Svara extremt pedagogiskt och enkelt på svenska. Förklara "varför" på ett sätt som är lätt att fatta.
    Svara i JSON:
    - isCorrect: boolean
    - scoreText: En uppmuntrande hälsning (t.ex. "Snyggt jobbat!" eller "Nästan rätt!")
    - explanation: En superenkel förklaring av lösningen utan svåra termer.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Rätta svaret pedagogiskt." }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { 
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                isCorrect: { type: "BOOLEAN" },
                scoreText: { type: "STRING" },
                explanation: { type: "STRING" }
              },
              required: ["isCorrect", "scoreText", "explanation"]
            }
          }
        })
      });
      const result = await response.json();
      return JSON.parse(result.candidates[0].content.parts[0].text);
    } catch (e) { return null; }
  };

  const startAiSession = async () => {
    setIsGeneratingAi(true);
    setIsSessionActive(true);
    setFeedback(null);
    setUserAnswer("");
    setGeneratedImageUrl(null);
    setAiSessionData(null);

    const data = await fetchAiQuestion(selectedSubject, selectedChapter, userLevel);
    if (data) {
      setAiSessionData(data);
      const img = await generateImage(data.imagePrompt || data.title);
      setGeneratedImageUrl(img);
    }
    setIsGeneratingAi(false);
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    setIsAnalyzing(true);
    const result = await fetchAiFeedback(aiSessionData, userAnswer);
    setFeedback(result);
    setIsAnalyzing(false);
  };

  const getColorClass = (color) => {
    const map = { blue: 'bg-indigo-600', red: 'bg-rose-600', purple: 'bg-purple-600', green: 'bg-emerald-600' };
    return map[color] || 'bg-indigo-600';
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans text-slate-900 bg-slate-50">
      {/* Video Modal (Viktig Info) */}
      {showEasterEgg && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-[40px] overflow-hidden shadow-[0_0_80px_rgba(79,70,229,0.5)] border border-white/10">
            {/* Modal Controls */}
            <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
              <div className="px-4 py-2 bg-indigo-600 text-white rounded-full flex items-center gap-2 text-xs font-black animate-pulse shadow-lg">
                <Volume2 size={16} /> MAX VOLYM AKTIVERAD
              </div>
              <button 
                onClick={() => setShowEasterEgg(false)}
                className="p-3 bg-white/10 hover:bg-rose-600 text-white rounded-2xl transition-all backdrop-blur-xl border border-white/20"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Embedded Rick Roll Video */}
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=1&modestbranding=1&rel=0" 
              title="StudieBubblan Viktig Info" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* AI Chat Panel Overlay */}
      {showChat && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex justify-end animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-6 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-black tracking-tight">AI-Läraren</h3>
                  <p className="text-[10px] font-bold opacity-80 uppercase">Fråga vad som helst</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600">
                    <MessageSquare size={32} />
                  </div>
                  <h4 className="font-black text-xl mb-2">Vad klurar du på?</h4>
                  <p className="text-slate-500 text-sm">"Hur fungerar fotosyntes?" eller "Hjälp mig med ekvationer". Jag finns här för att förklara!</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl font-medium text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-100 text-slate-800 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 p-4 rounded-3xl rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-6 border-t border-slate-100">
              <div className="relative">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                  placeholder="Skriv din fråga här..."
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-600 rounded-2xl py-4 pl-6 pr-14 outline-none transition-all font-medium text-sm"
                />
                <button 
                  onClick={handleAskAi}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="absolute right-2 top-2 bottom-2 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-md"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">StudieBubblan AI – Alltid redo att hjälpa</p>
            </div>
          </div>
        </div>
      )}

      {/* Bakgrundseffekter */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_-20%,#4f46e5,transparent_60%)]"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-200/20 rounded-full blur-[120px]"></div>
      </div>

      {!hasStarted ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
          <div className="relative mb-10">
            <div className="w-32 h-32 md:w-44 md:h-44 bg-indigo-600 rounded-[48px] flex items-center justify-center text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] ring-8 ring-white">
              <GraduationCap size={80} />
            </div>
          </div>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-6 bg-gradient-to-br from-slate-900 to-indigo-700 bg-clip-text text-transparent">StudieBubblan</h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-14 font-medium leading-relaxed">
            Framtidens lärande är här. Enkel AI som förklarar svåra ämnen på ditt sätt.
          </p>
          <button 
            onClick={() => setHasStarted(true)}
            className="group bg-slate-900 text-white px-16 py-8 rounded-[40px] font-black text-2xl shadow-2xl hover:bg-indigo-600 hover:scale-105 transition-all active:scale-95 flex items-center gap-4"
          >
            Starta Nu <Rocket className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      ) : (
        <div className="flex h-screen overflow-hidden">
          {/* Mobil Menyknapp */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-full shadow-2xl"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Sido Meny (Sidebar) */}
          <aside className={`
            fixed inset-y-0 left-0 z-40 transform transition-all duration-500 ease-in-out
            md:relative md:translate-x-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            ${isSidebarCollapsed ? 'w-24' : 'w-80'}
            bg-white border-r border-slate-200 shadow-[20px_0_50px_-20px_rgba(0,0,0,0.05)]
            flex flex-col p-4 md:p-6 h-full
          `}>
            {/* Logo */}
            <div className={`mb-8 transition-all duration-500 ${isSidebarCollapsed ? 'px-0' : 'px-2'}`}>
              <button 
                onClick={() => setHasStarted(false)} 
                className="flex items-center gap-4 group w-full"
              >
                <div className="min-w-[48px] h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
                  <GraduationCap size={24} />
                </div>
                {!isSidebarCollapsed && (
                  <div className="text-left animate-in fade-in slide-in-from-left-2">
                    <h1 className="font-black text-xl tracking-tighter leading-none">StudieBubblan</h1>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Lärare</span>
                  </div>
                )}
              </button>
            </div>

            {/* Navigering */}
            <nav className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {!isSidebarCollapsed && <div className="px-3 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-in fade-in">Huvudmeny</div>}
              
              <div className="relative group">
                <button 
                  onClick={() => {setActiveTab('home'); if(window.innerWidth < 768) setIsSidebarOpen(false);}} 
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-black transition-all ${activeTab === 'home' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <div className={`min-w-[40px] h-10 rounded-xl flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'}`}>
                    <Layers size={20} />
                  </div>
                  {!isSidebarCollapsed && <span className="animate-in fade-in slide-in-from-left-2">Lärohubben</span>}
                </button>
              </div>

              <div className="relative group">
                <button 
                  onClick={() => {setActiveTab('training'); if(window.innerWidth < 768) setIsSidebarOpen(false);}} 
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-black transition-all ${activeTab === 'training' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <div className={`min-w-[40px] h-10 rounded-xl flex items-center justify-center transition-colors ${activeTab === 'training' ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'}`}>
                    <Zap size={20} />
                  </div>
                  {!isSidebarCollapsed && <span className="animate-in fade-in slide-in-from-left-2">AI Träning</span>}
                </button>
              </div>

              {/* NEW SECTION: ASK AI */}
              <div className="relative group">
                <button 
                  onClick={() => {setShowChat(true); if(window.innerWidth < 768) setIsSidebarOpen(false);}} 
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-black transition-all bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100/50 shadow-sm`}
                >
                  <div className={`min-w-[40px] h-10 rounded-xl flex items-center justify-center bg-emerald-600 text-white`}>
                    <MessageSquare size={20} />
                  </div>
                  {!isSidebarCollapsed && <span className="animate-in fade-in slide-in-from-left-2 flex-1 text-left">Fråga AI-Läraren</span>}
                  {!isSidebarCollapsed && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>}
                </button>
              </div>

              {!isSidebarCollapsed && (
                <div className="pt-8 px-3 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-in fade-in">Aktuellt Ämne</div>
              )}
              
              {selectedSubject ? (
                 <div className={`transition-all duration-500 ${isSidebarCollapsed ? 'px-0' : 'p-4 bg-slate-50 rounded-2xl border border-slate-100'}`}>
                    <div className={`flex items-center gap-3 text-slate-900 font-black ${isSidebarCollapsed ? 'justify-center' : 'mb-3'}`}>
                      <div className={`min-w-[32px] h-8 rounded-lg flex items-center justify-center text-white shadow-md ${getColorClass(selectedSubject.color)}`}>
                        {selectedSubject.icon}
                      </div>
                      {!isSidebarCollapsed && <span className="animate-in fade-in truncate">{selectedSubject.name}</span>}
                    </div>
                    {!isSidebarCollapsed && (
                      <div className="text-[11px] font-bold text-slate-500 flex items-center gap-2 animate-in fade-in truncate">
                         <Target size={12} /> {selectedChapter || 'Välj kapitel'}
                      </div>
                    )}
                 </div>
              ) : (
                !isSidebarCollapsed && (
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center animate-in fade-in">
                    <p className="text-xs font-bold text-slate-400">Inget ämne valt</p>
                  </div>
                )
              )}
            </nav>

            {/* Footer */}
            <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
              <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden md:flex w-full items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all group"
              >
                <div className="min-w-[32px] h-8 flex items-center justify-center">
                  {isSidebarCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
                </div>
                {!isSidebarCollapsed && <span className="text-xs font-black uppercase tracking-tighter">Fäll ihop</span>}
              </button>

              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-2'}`}>
                <button 
                  onClick={() => setShowEasterEgg(true)}
                  className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group"
                >
                  <div className="min-w-[32px] h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50">
                    <Info size={16} className="text-indigo-500 animate-pulse" />
                  </div>
                  {!isSidebarCollapsed && <span className="text-xs font-bold uppercase tracking-tighter animate-in fade-in">Viktig info</span>}
                </button>
              </div>
            </div>
          </aside>

          {/* Huvudinnehåll */}
          <main className="flex-1 p-6 md:p-12 overflow-y-auto w-full transition-all bg-slate-50/50">
            {!selectedSubject ? (
              <div className="min-h-full flex flex-col items-center justify-center max-w-6xl mx-auto py-12">
                 <div className="text-center mb-16 animate-in slide-in-from-bottom-4 duration-700">
                   <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">Välj din väg idag</h2>
                   <p className="text-slate-500 text-lg md:text-xl font-medium">Klicka på ett ämne för att börja öva med AI</p>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full animate-in fade-in zoom-in-95 duration-1000">
                  {subjects.map(s => (
                    <button 
                      key={s.id} 
                      onClick={() => { setSelectedSubject(s); setSelectedChapter(s.chapters[0]); }} 
                      className="group bg-white p-10 rounded-[48px] flex flex-col items-center gap-6 border border-slate-200 hover:border-indigo-600 hover:translate-y-[-8px] transition-all hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] active:scale-95"
                    >
                      <div className={`w-24 h-24 rounded-[36px] flex items-center justify-center text-white ${getColorClass(s.color)} shadow-xl group-hover:scale-110 transition-transform`}>
                        {React.cloneElement(s.icon, { size: 36 })}
                      </div>
                      <span className="font-black text-2xl tracking-tight">{s.name}</span>
                      <div className="px-4 py-2 bg-slate-50 rounded-full text-[10px] font-black uppercase text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        Utforska nu
                      </div>
                    </button>
                  ))}
                </div>

                {/* Snabb-hjälp i mitten vid start */}
                <div className="mt-20 p-12 bg-indigo-600 text-white rounded-[56px] shadow-2xl relative overflow-hidden group max-w-4xl w-full mx-auto">
                   <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform"><MessageSquare size={160} /></div>
                   <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                      <div className="flex-1">
                        <h3 className="text-4xl font-black mb-4 tracking-tight leading-tight">Har du en specifik fråga?</h3>
                        <p className="text-indigo-100 text-lg font-medium mb-8">Vår AI-Lärare kan hjälpa dig med läxor, svåra begrepp eller bara förklara hur världen fungerar.</p>
                        <button 
                          onClick={() => setShowChat(true)}
                          className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center gap-3"
                        >
                          <Sparkles size={18} /> Fråga AI-Läraren nu
                        </button>
                      </div>
                      <div className="w-full md:w-1/3 bg-white/10 backdrop-blur-md p-6 rounded-[32px] border border-white/20">
                         <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-widest text-indigo-200">
                           <Search size={14} /> Populära frågor
                         </div>
                         <div className="space-y-2">
                            {['Hur fungerar en atom?', 'Vad är algebra?', 'Tips för glosor?'].map(q => (
                              <button 
                                key={q}
                                onClick={() => { setChatInput(q); setShowChat(true); }}
                                className="w-full text-left p-3 hover:bg-white/10 rounded-xl text-xs font-bold transition-colors border border-transparent hover:border-white/20"
                              >
                                {q}
                              </button>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in max-w-7xl mx-auto pb-12">
                {/* Header med nivåval */}
                <div className="bg-white rounded-[32px] p-6 flex flex-col xl:flex-row justify-between items-center gap-6 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white ${getColorClass(selectedSubject.color)} shadow-lg`}>
                      {React.cloneElement(selectedSubject.icon, { size: 28 })}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">{selectedSubject.name}</h2>
                      <button 
                        onClick={() => setSelectedSubject(null)} 
                        className="flex items-center gap-1 text-[11px] font-black uppercase text-indigo-600 hover:underline mt-1"
                      >
                        <ChevronLeft size={12} /> Byt ämne
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center bg-slate-100/50 p-2 rounded-3xl gap-2 border border-slate-200/50">
                    {levels.map(lvl => (
                      <button 
                        key={lvl.id} 
                        onClick={() => setUserLevel(lvl.id)} 
                        className={`px-6 py-3 rounded-2xl font-black text-xs transition-all ${userLevel === lvl.id ? 'bg-white text-indigo-600 shadow-md scale-105 ring-1 ring-black/5' : 'text-slate-400 hover:bg-white/50 hover:text-slate-600'}`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeTab === 'home' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {selectedSubject.chapters.map((chap, idx) => (
                      <div 
                        key={chap} 
                        style={{ animationDelay: `${idx * 50}ms` }}
                        className="group bg-white p-8 rounded-[40px] hover:shadow-xl transition-all flex flex-col border border-slate-200 hover:border-indigo-600 animate-in slide-in-from-bottom-2"
                      >
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl mb-6 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                           <BookOpen size={20} />
                        </div>
                        <h4 className="text-xl font-black mb-6 leading-tight">{chap}</h4>
                        <button 
                          onClick={() => {setSelectedChapter(chap); setActiveTab('training');}} 
                          className="w-full mt-auto py-4 bg-slate-900 text-white rounded-[24px] font-black text-xs flex items-center justify-center gap-2 group-hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                        >
                          Starta övning <ArrowRight size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full">
                    {!isSessionActive ? (
                      <div className="bg-white rounded-[56px] p-16 text-center shadow-xl border border-slate-200 max-w-3xl mx-auto mt-12 animate-in zoom-in-95">
                        <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 animate-pulse"><BrainCircuit size={48} /></div>
                        <h2 className="text-4xl font-black mb-4 tracking-tight">Redo för utmaningen?</h2>
                        <p className="text-slate-500 mb-12 text-lg font-medium leading-relaxed">Vi bygger en unik uppgift i <span className="text-indigo-600 font-black">{selectedChapter}</span> baserat på din kunskapsnivå.</p>
                        <button 
                          onClick={startAiSession} 
                          disabled={!userLevel} 
                          className="bg-slate-900 text-white px-12 py-6 rounded-[32px] font-black text-xl hover:bg-indigo-600 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] flex items-center gap-4 mx-auto transition-all disabled:opacity-30 disabled:hover:bg-slate-900"
                        >
                          <Sparkles size={24} /> Skapa Uppgift
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                        {isGeneratingAi ? (
                          <div className="xl:col-span-12 py-40 text-center bg-white rounded-[56px] border border-slate-200 shadow-sm animate-in fade-in">
                            <div className="relative inline-block mb-10">
                              <RefreshCw className="animate-spin text-indigo-600" size={64} />
                              <div className="absolute inset-0 bg-indigo-600/10 blur-xl rounded-full"></div>
                            </div>
                            <p className="font-black text-3xl text-slate-800 tracking-tight">Magin händer... AI:n förbereder din lektion.</p>
                          </div>
                        ) : (
                          <>
                            <div className="xl:col-span-8 space-y-6">
                              <div className="bg-white rounded-[56px] shadow-sm overflow-hidden border border-slate-200 animate-in slide-in-from-left-4 duration-500">
                                {generatedImageUrl && (
                                  <div className="w-full h-[450px] overflow-hidden relative">
                                    <img src={generatedImageUrl} alt="Uppgiftsbild" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                                  </div>
                                )}
                                <div className="p-12">
                                  {aiSessionData ? (
                                    <>
                                      <div className="flex items-center gap-3 mb-4">
                                        <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">Aktiv Uppgift</div>
                                        <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedChapter}</div>
                                      </div>
                                      <h3 className="text-4xl font-black mb-6 tracking-tight leading-tight">{aiSessionData.title}</h3>
                                      <p className="text-slate-600 text-xl mb-10 leading-relaxed font-medium bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                                        {aiSessionData.scenario}
                                      </p>
                                      <div className="bg-slate-900 text-white p-12 rounded-[48px] shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Target size={120} /></div>
                                        <p className="text-2xl font-black leading-snug relative z-10">{aiSessionData.question}</p>
                                      </div>
                                    </>
                                  ) : (
                                    <p className="text-rose-500 font-bold">Något gick snett. Försök igen!</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="xl:col-span-4 space-y-6 sticky top-8 animate-in slide-in-from-right-4 duration-500">
                              {!feedback ? (
                                <div className="bg-white p-10 rounded-[56px] shadow-sm space-y-8 border border-slate-200">
                                  <div className="flex justify-between items-center">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Ditt Svar</label>
                                    <button 
                                      onClick={() => setShowChat(true)}
                                      className="flex items-center gap-2 text-indigo-600 font-black text-xs bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100"
                                    >
                                      <Sparkles size={14} /> Be om förklaring
                                    </button>
                                  </div>
                                  <textarea 
                                    className="w-full h-80 p-8 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[40px] text-xl font-medium outline-none resize-none shadow-inner transition-all placeholder:text-slate-300"
                                    placeholder="Skriv hur du tänker här..."
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                  />
                                  <button 
                                    onClick={submitAnswer} 
                                    disabled={isAnalyzing || !userAnswer.trim()} 
                                    className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black text-xl flex items-center justify-center gap-4 hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95 transition-all disabled:opacity-30"
                                  >
                                    {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Send size={24} />} Kontrollera Svar
                                  </button>
                                </div>
                              ) : (
                                <div className={`p-12 rounded-[56px] shadow-2xl animate-in zoom-in-95 duration-500 ${feedback.isCorrect ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-slate-900 text-white border-b-8 border-indigo-600 shadow-indigo-100'}`}>
                                  <div className="flex items-center gap-6 mb-8">
                                    <div className="w-20 h-20 rounded-[32px] bg-white/20 flex items-center justify-center shadow-inner">
                                      {feedback.isCorrect ? <CheckCircle2 size={40} /> : <HelpCircle size={40} />}
                                    </div>
                                    <h4 className="font-black text-3xl tracking-tight leading-none">{feedback.scoreText}</h4>
                                  </div>
                                  <div className="bg-white/10 p-8 rounded-[40px] mb-10 border border-white/10 backdrop-blur-md">
                                    <p className="text-xl font-medium leading-relaxed">{feedback.explanation}</p>
                                  </div>
                                  <button 
                                    onClick={startAiSession} 
                                    className="w-full py-6 bg-white text-slate-900 rounded-[32px] font-black text-xl flex items-center justify-center gap-4 hover:scale-105 shadow-2xl transition-all active:scale-95"
                                  >
                                    <Sparkles size={24} className="text-indigo-600" /> Ny Utmaning
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      )}

      {/* Custom Styles for Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default App;