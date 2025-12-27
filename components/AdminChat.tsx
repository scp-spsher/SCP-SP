import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, Shield, MessageSquare, Lock, ArrowLeft } from 'lucide-react';
import { StoredUser } from '../services/authService';
import { supabase } from '../services/supabaseClient';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  created_at: string;
}

interface AdminChatProps {
  currentUser: StoredUser;
}

const AdminChat: React.FC<AdminChatProps> = ({ currentUser }) => {
  const [contacts, setContacts] = useState<StoredUser[]>([]);
  const [selectedContact, setSelectedContact] = useState<StoredUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [view, setView] = useState<'contacts' | 'chat'>('contacts');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Логика "Тайного Админа"
  const getDisplayLevel = (user: StoredUser) => {
    if (user.id === '36046d5d-dde4-4cf6-a2de-794334b7af5c' && user.clearance === 6) {
      return 4; // Маскировка под полевого агента
    }
    return user.clearance;
  };

  // 1. Загрузка списка контактов из базы
  useEffect(() => {
    const fetchContacts = async () => {
      const isActuallyAdmin = currentUser.clearance >= 5;
      
      let query = supabase.from('personnel').select('*');
      
      // Если вы не админ, вы видите только админов (L5-L6)
      if (!isActuallyAdmin) {
        query = query.gte('clearance', 5);
      }

      const { data, error } = await query.neq('id', currentUser.id);
      if (!error && data) setContacts(data as StoredUser[]);
    };
    fetchContacts();
  }, [currentUser]);

  // 2. Загрузка сообщений и Realtime-подписка
  useEffect(() => {
    if (!selectedContact) return;

    // Сначала грузим историю
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (!error && data) setMessages(data);
    };

    fetchHistory();

    // Подписываемся на новые сообщения
    const channel = supabase
      .channel(`chat_${currentUser.id}_${selectedContact.id}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === selectedContact.id && newMsg.receiver_id === currentUser.id) ||
            (newMsg.sender_id === currentUser.id && newMsg.receiver_id === selectedContact.id)
          ) {
            setMessages(prev => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedContact, currentUser.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContact) return;

    const { error } = await supabase.from('messages').insert([
      {
        sender_id: currentUser.id,
        receiver_id: selectedContact.id,
        text: inputText
      }
    ]);

    if (!error) setInputText('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-scp-panel border border-gray-800 font-mono">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-black/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {view === 'chat' && (
            <button onClick={() => setView('contacts')} className="p-1 hover:text-scp-terminal">
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-xl font-bold tracking-tighter text-scp-text flex items-center gap-2 uppercase">
            <MessageSquare size={20} className="text-scp-accent" />
            {view === 'contacts' ? 'ТЕРМИНАЛ СВЯЗИ' : `СЕССИЯ: ${selectedContact?.name}`}
          </h2>
        </div>
        <div className="text-[10px] text-green-500 flex items-center gap-2 animate-pulse">
          <Lock size={12} /> СОЕДИНЕНИЕ ЗАЩИЩЕНО
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Список контактов */}
        {(view === 'contacts' || window.innerWidth > 768) && (
          <div className={`${view === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-gray-800 bg-black/20 overflow-y-auto`}>
            {contacts.map(contact => (
              <button 
                key={contact.id}
                onClick={() => { setSelectedContact(contact); setView('chat'); }}
                className={`p-4 flex items-center gap-3 hover:bg-white/5 border-b border-gray-800/50 text-left ${selectedContact?.id === contact.id ? 'bg-white/5 border-l-2 border-scp-terminal' : ''}`}
              >
                <div className="w-10 h-10 bg-gray-900 border border-gray-700 flex items-center justify-center">
                  <Shield size={20} className={getDisplayLevel(contact) >= 5 ? 'text-red-600' : 'text-blue-400'} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white uppercase">{contact.name}</div>
                  <div className="text-[10px] text-gray-500">УРОВЕНЬ {getDisplayLevel(contact)} // {contact.role}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Окно чата */}
        {view === 'chat' && (
          <div className="flex-1 flex flex-col bg-black/40">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 border ${msg.sender_id === currentUser.id ? 'border-gray-700 bg-gray-900' : 'border-scp-terminal/30 bg-scp-terminal/5 text-scp-terminal'}`}>
                    <div className="text-[9px] opacity-40 mb-1 flex justify-between gap-4">
                      <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 flex gap-2">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="ВВЕДИТЕ СООБЩЕНИЕ ДЛЯ ПЕРЕДАЧИ..."
                className="flex-1 bg-black border border-gray-700 p-3 text-sm text-scp-terminal focus:outline-none focus:border-scp-terminal"
              />
              <button type="submit" className="bg-scp-terminal text-black px-6 hover:bg-white transition-colors">
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
