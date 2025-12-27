import React, { useState, useEffect, useRef } from 'react';
import { Send, Shield, MessageSquare, Lock, ArrowLeft, Users, RefreshCw, AlertCircle } from 'lucide-react';
import { StoredUser, authService } from '../services/authService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const ADMIN_POOL_ID = '00000000-0000-0000-0000-000000000000';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  created_at: string;
  sender_name?: string;
}

interface AdminChatProps {
  currentUser: StoredUser;
}

const AdminChat: React.FC<AdminChatProps> = ({ currentUser }) => {
  const [activeConversations, setActiveConversations] = useState<StoredUser[]>([]);
  const [selectedContact, setSelectedContact] = useState<StoredUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [view, setView] = useState<'contacts' | 'chat'>('contacts');
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser.clearance >= 5;

  // Хелпер для надежного форматирования ошибок Supabase
  const formatError = (error: any): string => {
    if (!error) return "НЕИЗВЕСТНАЯ ОШИБКА";
    if (typeof error === 'string') return error;
    
    // Поля PostgrestError: message, details, hint, code
    const parts = [];
    if (error.message) parts.push(error.message);
    if (error.details) parts.push(error.details);
    if (error.hint) parts.push(error.hint);
    
    if (parts.length > 0) return parts.join(' | ');
    
    try {
      return JSON.stringify(error);
    } catch (e) {
      return String(error);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      setSelectedContact({
        id: ADMIN_POOL_ID,
        name: 'АДМИНИСТРАЦИЯ ФОНДА',
        clearance: 5,
        registeredAt: '',
        password: ''
      });
      setView('chat');
    } else {
      fetchActiveConversations();
    }
  }, [isAdmin]);

  const fetchActiveConversations = async () => {
    if (!isSupabaseConfigured() || !isAdmin) return;
    setIsLoading(true);
    try {
      const { data: conversationData, error } = await supabase!
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', ADMIN_POOL_ID);

      if (error) throw error;

      const uniqueSenderIds: string[] = Array.from(new Set((conversationData || []).map((m: any) => m.sender_id as string)));
      const conversationUsers: StoredUser[] = [];
      for (const id of uniqueSenderIds) {
        const user = await authService.getUserById(id);
        if (user && user.clearance < 5) conversationUsers.push(user);
      }
      setActiveConversations(conversationUsers);
    } catch (e: any) {
      console.error("Fetch Convs Error:", formatError(e));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedContact || !isSupabaseConfigured()) return;

    const fetchHistory = async () => {
      let query = supabase!.from('messages').select('*');
      if (!isAdmin) {
        query = query.or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${ADMIN_POOL_ID}),receiver_id.eq.${currentUser.id}`);
      } else {
        query = query.or(`and(sender_id.eq.${selectedContact.id},receiver_id.eq.${ADMIN_POOL_ID}),receiver_id.eq.${selectedContact.id}`);
      }
      const { data, error } = await query.order('created_at', { ascending: true });
      if (!error && data) setMessages(data);
    };

    fetchHistory();

    const channel = supabase!
      .channel(`chat_sync_${currentUser.id}_${selectedContact.id}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          const newMsg = payload.new as Message;
          
          const relevantForStaff = !isAdmin && (
            (newMsg.sender_id === currentUser.id && newMsg.receiver_id === ADMIN_POOL_ID) || 
            (newMsg.receiver_id === currentUser.id)
          );
          
          const relevantForAdmin = isAdmin && selectedContact && (
            (newMsg.sender_id === selectedContact.id && newMsg.receiver_id === ADMIN_POOL_ID) ||
            (newMsg.receiver_id === selectedContact.id)
          );

          if (relevantForStaff || relevantForAdmin) {
            setMessages(prev => {
              if (prev.find(m => m.id === newMsg.id)) return prev;

              const optimisticMatch = prev.find(m => 
                m.id.startsWith('temp-') && 
                m.text === newMsg.text && 
                m.sender_id === newMsg.sender_id
              );
              
              if (optimisticMatch) {
                return prev.map(m => m.id === optimisticMatch.id ? newMsg : m);
              }

              return [...prev, newMsg];
            });
          }

          if (isAdmin && newMsg.receiver_id === ADMIN_POOL_ID) {
             fetchActiveConversations();
          }
        }
      )
      .subscribe();

    return () => { supabase!.removeChannel(channel); };
  }, [selectedContact, currentUser.id, isAdmin]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !selectedContact || !isSupabaseConfigured()) return;

    setErrorInfo(null);
    const receiverId = !isAdmin ? ADMIN_POOL_ID : selectedContact.id;
    setInputText('');

    const tempId = 'temp-' + Date.now();
    const optimisticMsg: Message = {
      id: tempId,
      sender_id: currentUser.id,
      receiver_id: receiverId,
      text: text,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const { data, error } = await supabase!.from('messages').insert([
        {
          sender_id: currentUser.id,
          receiver_id: receiverId,
          text: text
        }
      ]).select();

      if (error) {
        const errorString = formatError(error);
        const code = error.code ? `[${error.code}] ` : "";
        setErrorInfo(`ОШИБКА: ${code}${errorString.toUpperCase()}`);
        
        // Логируем ошибку как строку JSON для надежности отображения в консоли
        console.error("Detailed DB Error:", JSON.stringify(error, null, 2));
        
        setMessages(prev => prev.filter(m => m.id !== tempId));
      } else if (data && data[0]) {
        setMessages(prev => prev.map(m => m.id === tempId ? data[0] : m));
      }
    } catch (err: any) {
      const criticalMsg = formatError(err);
      setErrorInfo(`КРИТИЧЕСКИЙ СБОЙ: ${criticalMsg.toUpperCase()}`);
      console.error("Critical Send Error:", criticalMsg);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-scp-panel border border-gray-800 font-mono animate-in fade-in duration-500 shadow-2xl">
      <div className="p-4 border-b border-gray-800 bg-black/60 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-3">
          {isAdmin && view === 'chat' && (
            <button onClick={() => setView('contacts')} className="p-2 hover:bg-white/10 text-scp-terminal transition-colors rounded">
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-xl font-bold tracking-widest text-scp-text flex items-center gap-2 uppercase">
            <MessageSquare size={20} className="text-scp-accent" />
            {isAdmin && view === 'contacts' ? 'ОКНО ОБРАБОТКИ ЗАПРОСОВ' : selectedContact?.name}
          </h2>
        </div>
        <div className="flex items-center gap-4">
           {errorInfo && (
             <div className="text-[10px] text-red-500 flex items-center gap-1 animate-pulse border border-red-900/50 px-2 py-1 bg-red-950/20 max-w-[300px] overflow-hidden">
               <AlertCircle size={12} className="shrink-0" /> <span className="truncate">{errorInfo}</span>
             </div>
           )}
           <div className="text-[10px] text-green-500 flex items-center gap-2 border border-green-900/50 px-2 py-1 bg-green-950/20">
             <Lock size={12} className="animate-pulse" /> ШИФРОВАНИЕ: АКТИВНО
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {isAdmin && (view === 'contacts' || window.innerWidth > 768) && (
          <div className={`${view === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-gray-800 bg-black/40 overflow-y-auto`}>
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/60">
               <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2">
                 <Users size={12}/> Входящие запросы
               </span>
               <button onClick={fetchActiveConversations} className="p-1 hover:text-scp-terminal transition-all active:rotate-180">
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
               </button>
            </div>
            {activeConversations.length > 0 ? activeConversations.map(contact => (
              <button 
                key={contact.id}
                onClick={() => { setSelectedContact(contact); setView('chat'); }}
                className={`p-4 flex items-center gap-4 hover:bg-white/5 border-b border-gray-800/50 text-left transition-all relative group ${selectedContact?.id === contact.id ? 'bg-white/5 border-l-4 border-scp-terminal' : ''}`}
              >
                <div className="w-10 h-10 bg-gray-900 border border-gray-700 flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-blue-400" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm font-bold text-white uppercase truncate">{contact.name}</div>
                  <div className="text-[9px] text-gray-500 uppercase">L-{contact.clearance} // {contact.id.slice(0, 8)}...</div>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <ArrowLeft size={14} className="rotate-180 text-scp-terminal" />
                </div>
              </button>
            )) : (
              <div className="p-12 text-center text-gray-700 text-xs italic uppercase tracking-widest">
                Активных запросов нет
              </div>
            )}
          </div>
        )}

        {view === 'chat' && selectedContact && (
          <div className="flex-1 flex flex-col bg-black/30 relative">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px] z-10"></div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
              <div className="text-center py-6">
                 <div className="inline-block px-4 py-1 border border-gray-800 bg-gray-900/40 text-[9px] text-gray-500 uppercase tracking-[0.3em] font-bold">
                    Защищенная линия связи установлена
                 </div>
                 <div className="text-[8px] text-gray-700 mt-2">TIMESTAMP: {new Date().toISOString()}</div>
              </div>
              
              {messages.map((msg, idx) => {
                const isMe = msg.sender_id === currentUser.id;
                let senderLabel = isMe ? 'ВЫ' : (isAdmin ? 'СОТРУДНИК' : 'АДМИНИСТРАЦИЯ');
                const isTemp = msg.id.startsWith('temp-');
                
                return (
                  <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[85%] p-4 border relative ${
                      isMe 
                        ? 'border-gray-700 bg-gray-900/80 text-gray-200' 
                        : 'border-scp-terminal/30 bg-scp-terminal/5 text-scp-terminal'
                    } ${isTemp ? 'opacity-50 border-dashed animate-pulse' : ''}`}>
                      <div className="text-[8px] opacity-40 mb-2 flex justify-between gap-6 font-mono border-b border-white/5 pb-1">
                        <span className="font-bold">{senderLabel}</span>
                        <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap selection:bg-scp-terminal selection:text-black">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} className="h-4" />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 flex gap-2 bg-black/80 relative z-20 backdrop-blur-lg">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="ВВЕДИТЕ СООБЩЕНИЕ ДЛЯ ПЕРЕДАЧИ..."
                className="flex-1 bg-black border border-gray-700 p-4 text-sm text-scp-terminal focus:outline-none focus:border-scp-terminal font-mono placeholder-gray-800"
                autoComplete="off"
              />
              <button 
                type="submit" 
                disabled={!inputText.trim()}
                className="bg-scp-terminal text-black px-8 hover:bg-white transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        )}

        {isAdmin && view === 'contacts' && !selectedContact && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-800 bg-black/40">
             <MessageSquare size={64} className="opacity-10 mb-6" />
             <p className="tracking-[0.4em] text-[10px] uppercase font-bold">Ожидание выбора терминала</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
