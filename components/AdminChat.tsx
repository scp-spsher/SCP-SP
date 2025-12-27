
import React, { useState, useEffect, useRef } from 'react';
import { Send, Shield, MessageSquare, Lock, ArrowLeft, Users, RefreshCw } from 'lucide-react';
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
  sender_clearance?: number;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser.clearance >= 5;

  // 1. Инициализация чата
  useEffect(() => {
    if (!isAdmin) {
      // Для сотрудников сразу открываем "чат с администрацией"
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

  // 2. Получение списка активных диалогов (только для админов)
  const fetchActiveConversations = async () => {
    if (!isSupabaseConfigured() || !isAdmin) return;
    setIsLoading(true);
    
    try {
      // Ищем все уникальные ID отправителей, писавших в ADMIN_POOL
      // FIX: Renamed shadowed 'messages' variable and added non-null assertion for supabase
      const { data: conversationData, error } = await supabase!
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', ADMIN_POOL_ID);

      if (error) throw error;

      // FIX: Cast sender_id to string to ensure uniqueSenderIds is correctly typed as string[]
      const uniqueSenderIds = Array.from(new Set(conversationData?.map(m => m.sender_id as string) || []));
      
      // Загружаем профили этих пользователей
      const conversationUsers: StoredUser[] = [];
      for (const id of uniqueSenderIds) {
        const user = await authService.getUserById(id);
        if (user) conversationUsers.push(user);
      }
      
      setActiveConversations(conversationUsers);
    } catch (e) {
      console.error("Error fetching conversations:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Загрузка сообщений и Realtime-подписка
  useEffect(() => {
    if (!selectedContact) return;

    const fetchHistory = async () => {
      // FIX: Added non-null assertion for supabase
      let query = supabase!.from('messages').select('*');
      
      if (!isAdmin) {
        // Сотрудник видит: свои сообщения в пул ИЛИ ответы админов лично ему
        query = query.or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${ADMIN_POOL_ID}),receiver_id.eq.${currentUser.id}`);
      } else {
        // Админ видит: сообщения от этого пользователя в пул ИЛИ свои ответы ему
        query = query.or(`and(sender_id.eq.${selectedContact.id},receiver_id.eq.${ADMIN_POOL_ID}),and(receiver_id.eq.${selectedContact.id},sender_id.eq.${currentUser.id})`);
      }

      const { data, error } = await query.order('created_at', { ascending: true });
      if (!error && data) setMessages(data);
    };

    fetchHistory();

    // FIX: Added non-null assertion for supabase
    const channel = supabase!
      .channel(`chat_realtime_${currentUser.id}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          const newMsg = payload.new as Message;
          
          // Проверка: относится ли это сообщение к текущему открытому чату
          const relevantForStaff = !isAdmin && (
            (newMsg.sender_id === currentUser.id && newMsg.receiver_id === ADMIN_POOL_ID) || 
            (newMsg.receiver_id === currentUser.id)
          );
          
          const relevantForAdmin = isAdmin && selectedContact && (
            (newMsg.sender_id === selectedContact.id && newMsg.receiver_id === ADMIN_POOL_ID) ||
            (newMsg.receiver_id === selectedContact.id && newMsg.sender_id === currentUser.id)
          );

          if (relevantForStaff || relevantForAdmin) {
            setMessages(prev => {
              // Предотвращение дубликатов при вставке своего сообщения
              if (prev.find(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }

          // Если админ в списке контактов и пришло новое сообщение от кого-то еще
          if (isAdmin && view === 'contacts') {
             fetchActiveConversations();
          }
        }
      )
      .subscribe();

    return () => { supabase!.removeChannel(channel); };
  }, [selectedContact, currentUser.id, isAdmin, view]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContact) return;

    const receiverId = !isAdmin ? ADMIN_POOL_ID : selectedContact.id;
    const text = inputText;
    setInputText('');

    // Оптимистичное добавление (чтобы свои сообщения отображались сразу)
    const tempId = 'temp-' + Date.now();
    const optimisticMsg: Message = {
      id: tempId,
      sender_id: currentUser.id,
      receiver_id: receiverId,
      text: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    // FIX: Added non-null assertion for supabase
    const { error } = await supabase!.from('messages').insert([
      {
        sender_id: currentUser.id,
        receiver_id: receiverId,
        text: text
      }
    ]);

    if (error) {
      console.error("Send Error:", error);
      // Удаляем временное сообщение при ошибке
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-scp-panel border border-gray-800 font-mono animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-black/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {isAdmin && view === 'chat' && (
            <button onClick={() => setView('contacts')} className="p-1 hover:text-scp-terminal transition-colors">
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-xl font-bold tracking-widest text-scp-text flex items-center gap-2 uppercase">
            <MessageSquare size={20} className="text-scp-accent" />
            {isAdmin && view === 'contacts' ? 'АКТИВНЫЕ ОБРАЩЕНИЯ' : selectedContact?.name}
          </h2>
        </div>
        <div className="text-[10px] text-green-500 flex items-center gap-2">
          <Lock size={12} className="animate-pulse" /> КАНАЛ ЗАШИФРОВАН
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Панель диалогов (только для админов) */}
        {isAdmin && (view === 'contacts' || window.innerWidth > 768) && (
          <div className={`${view === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-gray-800 bg-black/20 overflow-y-auto`}>
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
               <span className="text-[10px] text-gray-500 uppercase tracking-widest">Список сотрудников</span>
               <button onClick={fetchActiveConversations} className="p-1 hover:text-scp-terminal">
                  <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
               </button>
            </div>
            {activeConversations.length > 0 ? activeConversations.map(contact => (
              <button 
                key={contact.id}
                onClick={() => { setSelectedContact(contact); setView('chat'); }}
                className={`p-4 flex items-center gap-3 hover:bg-white/5 border-b border-gray-800/50 text-left transition-all ${selectedContact?.id === contact.id ? 'bg-white/5 border-l-2 border-scp-terminal' : ''}`}
              >
                <div className="w-10 h-10 bg-gray-900 border border-gray-700 flex items-center justify-center">
                  <Shield size={20} className={contact.clearance >= 5 ? 'text-yellow-500' : 'text-blue-400'} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white uppercase">{contact.name}</div>
                  <div className="text-[10px] text-gray-500">УРОВЕНЬ {contact.clearance} // {contact.title || 'Сотрудник'}</div>
                </div>
              </button>
            )) : (
              <div className="p-8 text-center text-gray-600 text-xs italic uppercase">Нет активных обращений</div>
            )}
          </div>
        )}

        {/* Окно чата */}
        {view === 'chat' && selectedContact && (
          <div className="flex-1 flex flex-col bg-black/40 relative">
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]"></div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center py-4">
                 <span className="text-[9px] text-gray-600 border border-gray-800 px-3 py-1 uppercase tracking-widest">
                    Начало зашифрованной сессии: {selectedContact.name}
                 </span>
              </div>
              
              {messages.map(msg => {
                const isMe = msg.sender_id === currentUser.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 border relative ${isMe ? 'border-gray-700 bg-gray-900 text-gray-300' : 'border-scp-terminal/30 bg-scp-terminal/5 text-scp-terminal'}`}>
                      <div className="text-[9px] opacity-40 mb-1 flex justify-between gap-4 font-mono">
                        <span>{isMe ? 'ВЫ' : (isAdmin ? 'СОТРУДНИК' : 'АДМИНИСТРАЦИЯ')}</span>
                        <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 flex gap-2 bg-black/60 relative z-10">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="ВВЕДИТЕ СООБЩЕНИЕ ДЛЯ ПЕРЕДАЧИ В КОМАНДОВАНИЕ..."
                className="flex-1 bg-black border border-gray-700 p-3 text-sm text-scp-terminal focus:outline-none focus:border-scp-terminal font-mono"
                autoComplete="off"
              />
              <button type="submit" className="bg-scp-terminal text-black px-6 hover:bg-white transition-all">
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
