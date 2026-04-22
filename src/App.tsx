import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, Send, Plus, Menu, X, History, Copy, Check, LogIn, LogOut } from 'lucide-react';
import { cn } from './lib/utils';

// --- Components ---

interface Message {
  role: string;
  content: string;
}

function ChatMessage({ message }: { message: Message, key?: any }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full mb-8 group",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "max-w-[90%] md:max-w-[80%] p-5 rounded-3xl shadow-2xl relative",
        isUser 
          ? "bg-gradient-to-br from-[var(--color-anime-pink)] to-[var(--color-anime-purple)] text-white rounded-tr-none" 
          : "bg-[#1E1E2E]/80 backdrop-blur-xl border border-white/10 text-white/90 rounded-tl-none"
      )}>
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
            {isUser ? <div className="w-2 h-2 bg-white rounded-full" /> : <div className="w-2 h-2 bg-[var(--color-anime-pink)] rounded-full animate-pulse" />}
            {isUser ? "You" : "Ani Xf AI"}
          </div>
          {!isUser && (
            <button 
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-[var(--color-anime-pink)] transition-all"
              title="Copy to clipboard"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
          )}
        </div>
        <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{message.content}</p>
      </div>
    </motion.div>
  );
}

function Sidebar({ isOpen, setIsOpen, chats, activeChat, onSelectChat, onNewChat, onClearHistory, user, handleLogin, handleLogout }: any) {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        className={cn(
          "fixed inset-y-0 left-0 w-80 bg-[#09090B] border-r border-white/5 z-50 flex flex-col transition-transform duration-500 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-8 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tighter flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-[var(--color-anime-pink)] to-[var(--color-anime-purple)] rounded-2xl rotate-12 flex items-center justify-center text-white shadow-xl shadow-pink-500/20 text-lg">X</div>
            Ani Xf AI
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="px-6 pb-6 mt-4">
          <button 
            onClick={() => { onNewChat(); setIsOpen(false); }}
            className="w-full flex items-center justify-center gap-3 bg-[var(--color-anime-pink)]/10 hover:bg-[var(--color-anime-pink)]/20 text-[var(--color-anime-pink)] p-5 rounded-2xl transition-all border border-[var(--color-anime-pink)]/20 font-black uppercase tracking-widest text-xs"
          >
            <Plus size={20} />
            Yangi Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar space-y-2">
          <div className="flex items-center justify-between mb-4 mt-4">
            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
              <History size={12} /> Tarix
            </div>
            {chats.length > 0 && (
              <button 
                onClick={onClearHistory}
                className="text-[10px] font-black text-red-500/40 hover:text-red-500 uppercase tracking-[0.2em] transition-colors"
                id="clear-history-btn"
              >
                Tozalash
              </button>
            )}
          </div>
          
          <AnimatePresence mode="popLayout">
            {chats.length > 0 ? chats.map((chat: any) => (
              <motion.button
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                key={chat.id}
                onClick={() => { onSelectChat(chat); setIsOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl text-left text-sm transition-all group relative overflow-hidden",
                  activeChat?.id === chat.id 
                    ? "bg-white/5 text-white border border-white/10" 
                    : "text-white/40 hover:bg-white/5 hover:text-white"
                )}
                id={`chat-item-${chat.id}`}
              >
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  activeChat?.id === chat.id ? "bg-[var(--color-anime-pink)] scale-125" : "bg-white/10 group-hover:bg-white/30"
                )} />
                <span className="truncate flex-1 font-medium">{chat.title}</span>
              </motion.button>
            )) : (
              <div className="text-center py-20 text-white/5 italic text-sm font-medium" id="no-chats-msg">
                Suhbatlar bo'sh
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-8 border-t border-white/5">
          {user ? (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5" id="user-profile">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border border-pink-500/30" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-anime-pink)] to-[var(--color-anime-purple)] flex items-center justify-center text-xs font-black text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white uppercase tracking-wider truncate">{user.name}</p>
                <button 
                  onClick={handleLogout}
                  className="text-[10px] text-red-500/60 hover:text-red-500 font-bold uppercase tracking-widest transition-colors flex items-center gap-1 mt-1"
                  id="logout-btn"
                >
                  <LogOut size={10} /> Chiqish
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5 text-xs font-black uppercase tracking-widest"
              id="google-login-btn"
            >
              <LogIn size={16} /> Google orqali kirish
            </button>
          )}
        </div>
      </motion.aside>
    </>
  );
}

function ChatView({ user, handleLogin, handleLogout }: any) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chats from localStorage
  useEffect(() => {
    loadLocalChats();
  }, []);

  const loadLocalChats = () => {
    const savedChats = localStorage.getItem('ani_chats');
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    } else {
      setChats([]);
    }
  };

  const saveChatsToLocal = (updatedChats: any[]) => {
    localStorage.setItem('ani_chats', JSON.stringify(updatedChats));
    setChats(updatedChats);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const startNewChat = () => {
    setActiveChat(null);
    setMessages([]);
  };

  const handleSelectChat = (chat: any) => {
    setActiveChat(chat);
    setMessages(chat.messages || []);
  };

  const sendMessage = async () => {
    if (!input || loading) return;
    const currentInput = input;
    const newMessages = [...messages, { role: "user", content: currentInput }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });
      
      const data = await response.json();
      if (data.choices && data.choices[0]) {
        const assistantMessage = data.choices[0].message;
        const updatedMessages = [...newMessages, assistantMessage];
        setMessages(updatedMessages);

        // Local storage update
        if (!activeChat) {
          const chatTitle = currentInput.slice(0, 30) + (currentInput.length > 30 ? "..." : "");
          const newId = Date.now().toString();
          const newChat = { id: newId, title: chatTitle, messages: updatedMessages, updatedAt: newId };
          const updatedChats = [newChat, ...chats];
          saveChatsToLocal(updatedChats);
          setActiveChat(newChat);
        } else {
          const updatedChats = chats.map(c => 
            c.id === activeChat.id ? { ...c, messages: updatedMessages, updatedAt: Date.now().toString() } : c
          );
          saveChatsToLocal(updatedChats);
        }
      } else {
        setMessages([...newMessages, { role: "assistant", content: "❌ Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring." }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([...newMessages, { role: "assistant", content: "⚠️ Tarmoq xatoligi. API kalitini tekshiring." }]);
    } finally {
      setLoading(false);
    }
  };

  const onClearHistory = () => {
    if (confirm("Haqiqatan ham barcha suhbatlarni o'chirib tashlamoqchimisiz?")) {
      saveChatsToLocal([]);
      startNewChat();
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#050507]" id="chat-container">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        chats={chats}
        activeChat={activeChat}
        onSelectChat={handleSelectChat}
        onNewChat={startNewChat}
        onClearHistory={onClearHistory}
        user={user}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
      
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Header */}
        <header className="px-6 py-5 border-b border-white/5 flex items-center justify-between lg:hidden bg-black/20 backdrop-blur-xl sticky top-0 z-30" id="mobile-header">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white/60 p-2 hover:text-white transition-colors">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[var(--color-anime-pink)] to-[var(--color-anime-purple)] rounded-lg rotate-6 flex items-center justify-center text-white font-black text-xs">X</div>
            <h2 className="text-lg font-black tracking-tighter">Ani Xf</h2>
          </div>
          <div className="w-12"></div>
        </header>

        {/* Welcome Screen */}
        {messages.length === 0 && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto w-full" id="welcome-screen">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 12 }}
              className="w-24 h-24 bg-gradient-to-br from-[var(--color-anime-pink)] to-[var(--color-anime-purple)] rounded-[2rem] flex items-center justify-center text-4xl mb-12 shadow-[0_20px_50px_rgba(255,45,85,0.3)]"
            >
              <Sparkles size={40} className="text-white animate-pulse" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              Yangi <span className="text-gradient">Intellekt</span>
            </h1>
            <p className="text-white/30 max-w-lg leading-loose text-lg font-medium">
              Anime dunyosi va undan tashqaridagi savollaringizga eng tezkor javoblar. {user ? `Hush kelibsiz, ${user.displayName}!` : "Ro'yxatdan o'tish shart emas."}
            </p>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4 lg:px-0">
              {[
                "Bugun qanday anime ko'rishni maslahat berasiz?",
                "Zoro va Sanji: Kim kuchliroq deb o'ylaysiz?",
                "Yaponiyaning eng mashhur joylari haqida gapiring.",
                "Anime chizish sirlarini ochib bering."
              ].map((text, idx) => (
                <button 
                  key={idx}
                  onClick={() => setInput(text)}
                  className="bg-white/5 border border-white/10 p-5 rounded-3xl text-left hover:bg-white/10 hover:border-white/20 transition-all group flex items-center gap-4"
                  id={`suggested-prompt-${idx}`}
                >
                  <div className="p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                    <MessageSquare size={16} className="text-[var(--color-anime-pink)]" />
                  </div>
                  <span className="text-sm text-white/50 group-hover:text-white leading-snug">{text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar" id="chat-feed">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="popLayout">
              {messages.map((m, i) => (
                <ChatMessage key={i} message={m} />
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex justify-start mb-8" id="typing-indicator">
                <div className="bg-[#1E1E2E]/50 backdrop-blur-md border border-white/10 p-5 rounded-3xl rounded-tl-none flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-[var(--color-anime-pink)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-[var(--color-anime-purple)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-[var(--color-anime-pink)] rounded-full animate-bounce" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Fikrlamoqda...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 md:p-12 pb-8 md:pb-10 bg-gradient-to-t from-[#050507] via-[#050507] to-transparent">
          <div className="max-w-4xl mx-auto relative">
            <div className="relative flex items-center bg-[#0D0D15] border border-white/10 rounded-[2rem] p-3 pr-4 shadow-2xl focus-within:border-[var(--color-anime-pink)]/50 transition-all">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Savolingizni yozing..."
                className="flex-1 bg-transparent px-6 py-4 text-white outline-none placeholder:text-white/10 text-lg"
                id="chat-input"
              />
              <button 
                onClick={sendMessage}
                disabled={!input || loading}
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all animate-float",
                  input && !loading 
                    ? "bg-gradient-to-br from-[var(--color-anime-pink)] to-[var(--color-anime-purple)] text-white shadow-lg shadow-pink-500/40 hover:scale-105 active:scale-95" 
                    : "bg-white/5 text-white/10 border border-white/5"
                )}
                id="send-btn"
              >
                <Send size={24} />
              </button>
            </div>
            <p className="text-[10px] text-center text-white/10 mt-6 font-black uppercase tracking-[0.5em] opacity-50">
              Ani Xf Professional AI System
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin is from AI Studio preview or localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const userData = event.data.payload;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Recovery session from local storage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      if (!response.ok) throw new Error('Failed to fetch auth URL');
      const { url } = await response.json();
      
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(
        url,
        'google_login_popup',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (error) {
      console.error('Login error:', error);
      alert('Login jarayonida xatolik yuz berdi');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <div className="h-screen w-full overflow-hidden text-white font-sans selection:bg-[var(--color-anime-pink)] selection:text-white">
        <Routes>
          <Route path="/" element={<ChatView user={user} handleLogin={handleLogin} handleLogout={handleLogout} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}
