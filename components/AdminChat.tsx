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
  
  // Ref-ы для доступа к актуальному состоянию внутри callback-ов Realtime
  const selectedContactRef = useRef<StoredUser | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser.clearance >= 5;

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Синхронизируем Ref с состоянием
  useEffect(() => {
    selectedContactRef.current = selectedContact;
    if (selectedContact) {
      fetchHistory(selectedContact.id);
    }
  }, [selectedContact]);

  // Загрузка списка диалогов (для админа)
  const fetchActiveConversations = async () => {
    if (!isSupabaseConfigured() || !isAdmin) return;
    try {
      const { data, error } = await supabase!
        .from('messages')
        .select('sender_id, created_at')
        .eq('receiver_id', ADMIN_POOL_ID)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ids = Array.from(new Set((data || []).map((m: any) => m.sender_id)));
      const users: StoredUser[] = [];
      for (const id of ids) {
        const u = await authService.getUserById(id as string);
        if (u && u.clearance < 5) users.push(u);
      }
      setActiveConversations(users);
    } catch (e) {
      console.error("Contacts Load Error", e);
    }
  };

  // Загрузка истории конкретного чата
  const fetchHistory = async (contactId: string) => {
    if (!isSupabaseConfigured()) return;
    setIsLoading(true);
    let query = supabase!.from('messages').select('*');
    
    if (!isAdmin) {
      // Логика для сотрудника: мои сообщения в пул или ответы мне
      query = query.or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${ADMIN_POOL_ID}),receiver_id.eq.${currentUser.id}`);
    } else {
      // Логика для админа: сообщения от конкретного сотрудника в пул или ответы ему
      query = query.or(`and(sender_id.eq.${contactId},receiver_id.eq.${ADMIN_POOL_ID}),receiver_id.eq.${contactId}`);
    }

    const { data, error } = await query.order('created_at', { ascending: true });
    if (!error && data) {
      setMessages(data);
      setTimeout(() => scrollToBottom('auto'), 50);
    }
    setIsLoading(false);
  };

  // ЕДИНАЯ ПОДПИСКА REALTIME (на весь жизненный цикл компонента)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    if (!isAdmin) {
      // Если не админ, сразу устанавливаем контакт с "Администрацией"
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

    const channel = supabase!
      .channel('global_secure_comms')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          const newMsg = payload.new as Message;
          const myId = currentUser.id.toLowerCase();
          const poolId = ADMIN_POOL_ID.toLowerCase();
          const senderId = newMsg.sender_id.toLowerCase();
          const receiverId = newMsg.receiver_id.toLowerCase();

          // Получаем текущий открытый контакт из Ref
          const activeContact = selectedContactRef.current;
          const activeContactId = activeContact?.id.toLowerCase();

          let isForCurrentView = false;

          if (!isAdmin) {
            // Для сотрудника: сообщение мне или мое подтверждение
            isForCurrentView = (receiverId === myId) || (senderId === myId && receiverId === poolId);
          } else if (activeContactId) {
            // Для админа: сообщение от текущего открытого контакта или ответ ему
            isForCurrentView = (senderId === activeContactId && receiverId === poolId) || (receiverId === activeContactId);
          }

          if (isForCurrentView) {
            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              
              // Маппинг оптимистичных сообщений
              const tempMatch = prev.find(m => 
                m.id.startsWith('temp-') && 
                m.text === newMsg.text && 
                m.sender_id.toLowerCase() === senderId
              );

              if (tempMatch) {
                return prev.map(m => m.id === tempMatch.id ? newMsg : m);
              }
              return [...prev, newMsg];
            });
            setTimeout(() => scrollToBottom(), 100);
          }

          // Если сообщение пришло в пул, обновляем список диалогов у админов
          if (isAdmin && receiverId === poolId) {
            fetchActiveConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !selectedContactRef.current || !isSupabaseConfigured()) return;

    const targetContact = selectedContactRef.current;
    const receiverId = !isAdmin ? ADMIN_POOL_ID : targetContact.id;
    setInputText('');
    setErrorInfo(null);

    const tempId = 'temp-' + Date.now();
    const optimisticMsg: Message = {
      id: tempId,
      sender_id: currentUser.id,
      receiver_id: receiverId,
      text: text,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(() => scrollToBottom(), 50);

    try {
      const { data, error } = await supabase!.from('messages').insert([
        {
          sender_id: currentUser.id,
          receiver_id: receiverId,
          text: text
        }
      ]).select();

      if (error) {
        setErrorInfo(`СБОЙ ПЕРЕДАЧИ: ${error.message.toUpperCase()}`);
        setMessages(prev => prev.filter(m => m.id !== tempId));
      } else if (data && data[0]) {
        // Заменяем временное сообщение реальным данными из БД
        setMessages(prev => prev.map(m => m.id === tempId ? data[0] : m));
      }
    } catch (err: any) {
      setErrorInfo("ОШИБКА ПОДКЛЮЧЕНИЯ К ТЕРМИНАЛУ");
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-scp-panel border border-gray-800 font-mono animate-in fade-in duration-500 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-black/60 flex justify-between items-center backdrop-blur-md z-30">
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
             <div className="text-[10px] text-red-500 flex items-center gap-1 animate-pulse border border-red-900/50 px-2 py-1 bg-red-950/20 max-w-[200px] overflow-hidden">
               <AlertCircle size={12} className="shrink-0" /> <span className="truncate">{errorInfo}</span>
             </div>
           )}
           <div className="hidden sm:flex text-[10px] text-green-500 items-center gap-2 border border-green-900/50 px-2 py-1 bg-green-950/20">
             <Lock size={12} className="animate-pulse" /> ШИФРОВАНИЕ: АКТИВНО
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Список контактов для админов */}
        {isAdmin && (view === 'contacts' || window.innerWidth > 768) && (
          <div className={`${view === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-gray-800 bg-black/40 overflow-y-auto`}>
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/60 sticky top-0 z-10">
               <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2">
                 <Users size={12}/> Входящие запросы
               </span>
               <button onClick={fetchActiveConversations} className="p-1 hover:text-scp-terminal">
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
              </button>
            )) : (
              <div className="p-12 text-center text-gray-700 text-xs italic uppercase tracking-widest">
                Входящих диалогов не обнаружено
              </div>
            )}
          </div>
        )}

        {/* Окно чата */}
        {selectedContact ? (
          <div className="flex-1 flex flex-col bg-black/30 relative">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px] z-10"></div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth scrollbar-hide">
              <div className="text-center py-4">
                 <div className="inline-block px-4 py-1 border border-gray-800 bg-gray-900/40 text-[9px] text-gray-500 uppercase tracking-[0.3em] font-bold">
                    Линия связи {isAdmin ? 'с сотрудником' : 'с администрацией'} установлена
                 </div>
              </div>
              
              {messages.map((msg, idx) => {
                const isMe = msg.sender_id.toLowerCase() === currentUser.id.toLowerCase();
                let senderLabel = isMe ? 'ВЫ' : (isAdmin ? 'СОТРУДНИК' : 'АДМИНИСТРАЦИЯ');
                const isTemp = msg.id.startsWith('temp-');
                
                return (
                  <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[85%] p-4 border relative ${
                      isMe 
                        ? 'border-gray-700 bg-gray-900/80 text-gray-200' 
                        : 'border-scp-terminal/30 bg-scp-terminal/5 text-scp-terminal'
                    } ${isTemp ? 'opacity-50 border-dashed animate-pulse' : ''}`}>
                      <div className="text-[8px] opacity-40 mb-1 flex justify-between gap-6 font-mono">
                        <span className="font-bold">{senderLabel}</span>
                        <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 flex gap-2 bg-black/80 relative z-20 backdrop-blur-lg">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="ВВЕДИТЕ СООБЩЕНИЕ ДЛЯ ПЕРЕДАЧИ..."
                className="flex-1 bg-black border border-gray-700 p-4 text-sm text-scp-terminal focus:border-scp-terminal focus:outline-none font-mono placeholder-gray-800"
                autoComplete="off"
              />
              <button 
                type="submit" 
                disabled={!inputText.trim()}
                className="bg-scp-terminal text-black px-8 hover:bg-white transition-all active:scale-95 disabled:opacity-30"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-800 bg-black/40">
             <MessageSquare size={64} className="opacity-10 mb-6" />
             <p className="tracking-[0.4em] text-[10px] uppercase font-bold text-center px-4">Выберите активный терминал для установления связи</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
