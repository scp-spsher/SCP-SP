import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Shield, Search, MessageSquare, Lock, ArrowLeft } from 'lucide-react';
import { StoredUser, authService } from '../services/authService';
import { DirectMessage } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const MSG_STORAGE_KEY = 'scp_net_direct_messages';

interface AdminChatProps {
  currentUser: StoredUser;
}

const AdminChat: React.FC<AdminChatProps> = ({ currentUser }) => {
  const [admins, setAdmins] = useState<StoredUser[]>([]);
  const [selectedContact, setSelectedContact] = useState<StoredUser | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'contacts' | 'chat'>('contacts');
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser.clearance >= 5;

  useEffect(() => {
    const loadAdmins = async () => {
      const allAdmins = await authService.getAdmins();
      setAdmins(allAdmins.filter(a => a.id !== currentUser.id));
    };
    loadAdmins();
  }, [currentUser]);

  useEffect(() => {
    const loadMessages = () => {
      const raw = localStorage.getItem(MSG_STORAGE_KEY);
      const allMsgs: DirectMessage[] = raw ? JSON.parse(raw) : [];
      
      if (selectedContact) {
        const filtered = allMsgs.filter(m => 
          (m.sender_id === currentUser.id && m.receiver_id === selectedContact.id) ||
          (m.sender_id === selectedContact.id && m.receiver_id === currentUser.id)
        );
        setMessages(filtered);
      }
    };
    loadMessages();
  }, [selectedContact, currentUser.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContact) return;

    const newMsg: DirectMessage = {
      id: Date.now().toString(),
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      receiver_id: selectedContact.id,
      text: inputText,
      created_at: new Date().toISOString()
    };

    const raw = localStorage.getItem(MSG_STORAGE_KEY);
    const allMsgs: DirectMessage[] = raw ? JSON.parse(raw) : [];
    allMsgs.push(newMsg);
    localStorage.setItem(MSG_STORAGE_KEY, JSON.stringify(allMsgs));

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
  };

  const selectContact = (contact: StoredUser) => {
    setSelectedContact(contact);
    setView('chat');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-scp-panel border border-gray-800 animate-in fade-in duration-500">
      <div className="p-4 border-b border-gray-800 bg-black/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {view === 'chat' && (
            <button onClick={() => setView('contacts')} className="p-1 hover:text-scp-terminal transition-colors">
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-xl font-bold tracking-widest text-scp-text flex items-center gap-2 uppercase">
            <MessageSquare size={20} className="text-scp-accent" />
            {view === 'contacts' ? 'ПРЯМАЯ СВЯЗЬ' : `СВЯЗЬ С: ${selectedContact?.name}`}
          </h2>
        </div>
        <div className="text-[10px] font-mono text-green-500 flex items-center gap-2">
          <Lock size={12} /> КАНАЛ ЗАШИФРОВАН
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Contacts Sidebar (Desktop) or List (Mobile) */}
        {(view === 'contacts' || window.innerWidth > 768) && (
          <div className={`${view === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-gray-800 bg-black/20 overflow-y-auto`}>
            <div className="p-4 bg-black/40 border-b border-gray-800">
               <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">
                 {isAdmin ? 'Список сотрудников' : 'Доступная администрация'}
               </div>
            </div>
            {admins.length > 0 ? admins.map(admin => (
              <button 
                key={admin.id}
                onClick={() => selectContact(admin)}
                className={`p-4 flex items-center gap-3 hover:bg-gray-900 transition-colors border-b border-gray-800/50 text-left ${selectedContact?.id === admin.id ? 'bg-gray-900 border-l-2 border-scp-terminal' : ''}`}
              >
                <div className="w-10 h-10 bg-gray-800 border border-gray-700 flex items-center justify-center rounded">
                  <Shield size={20} className={admin.clearance >= 5 ? 'text-yellow-500' : 'text-blue-400'} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{admin.name}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Уровень {admin.clearance} // {admin.title}</div>
                </div>
              </button>
            )) : (
              <div className="p-8 text-center text-gray-600 text-xs italic">
                НЕТ ДОСТУПНЫХ КОНТАКТОВ
              </div>
            )}
          </div>
        )}

        {/* Chat Area */}
        {(view === 'chat') && (
          <div className="flex-1 flex flex-col bg-black/30">
            {selectedContact ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 border ${
                        msg.sender_id === currentUser.id 
                          ? 'border-gray-700 bg-gray-900 text-gray-300' 
                          : 'border-scp-terminal/30 bg-scp-terminal/5 text-scp-terminal'
                      }`}>
                        <div className="text-[9px] opacity-50 mb-1 flex justify-between gap-4">
                           <span>{msg.sender_name}</span>
                           <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
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
                    placeholder="Введите сообщение..."
                    className="flex-1 bg-black border border-gray-700 p-3 text-sm text-scp-terminal focus:outline-none focus:border-scp-terminal"
                  />
                  <button type="submit" className="bg-scp-terminal text-black px-4 hover:bg-white transition-colors">
                    <Send size={18} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                 <MessageSquare size={64} className="opacity-10 mb-4" />
                 <p className="tracking-widest text-xs uppercase">Выберите контакт для начала сессии</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
