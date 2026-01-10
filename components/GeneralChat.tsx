
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Users, Shield, Lock, RefreshCw, User, Briefcase, Image as ImageIcon, X, Paperclip } from 'lucide-react';
import { StoredUser, authService } from '../services/authService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface GeneralMessage {
  id: string;
  sender_id: string;
  text: string;
  image_url?: string;
  created_at: string;
}

interface GeneralChatProps {
  currentUser: StoredUser;
  onViewProfile?: (userId: string) => void;
}

const GeneralChat: React.FC<GeneralChatProps> = ({ currentUser, onViewProfile }) => {
  const [messages, setMessages] = useState<GeneralMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [userCache, setUserCache] = useState<Record<string, StoredUser>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef<Record<string, StoredUser>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const getUserData = async (userId: string) => {
    if (cacheRef.current[userId]) return cacheRef.current[userId];
    const u = await authService.getUserById(userId);
    if (u) {
      cacheRef.current[userId] = u;
      setUserCache(prev => ({ ...prev, [userId]: u }));
      return u;
    }
    return null;
  };

  const fetchMessages = async () => {
    if (!isSupabaseConfigured()) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase!
        .from('general_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      
      const msgs = data as GeneralMessage[];
      
      const senderIds = Array.from(new Set(msgs.map(m => m.sender_id)));
      for (const id of senderIds) {
        await getUserData(id);
      }
      
      setMessages(msgs);
      setTimeout(() => scrollToBottom('auto'), 100);
    } catch (e) {
      console.error("Fetch General Chat Error", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    if (!isSupabaseConfigured()) return;

    const channel = supabase!
      .channel('general_chat_room')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'general_messages' }, 
        async (payload) => {
          const newMsg = payload.new as GeneralMessage;
          await getUserData(newMsg.sender_id);
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(() => scrollToBottom(), 50);
        }
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, [scrollToBottom]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("ОШИБКА: ФАЙЛ СЛИШКОМ ВЕЛИК (MAX 5MB)");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `chat-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase!.storage.from('avatars').upload(fileName, file);
      if (error) throw error;
      const { data: publicUrl } = supabase!.storage.from('avatars').getPublicUrl(fileName);
      return publicUrl.publicUrl;
    } catch (e) {
      console.error("Upload error", e);
      return null;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if ((!text && !selectedImage) || !isSupabaseConfigured() || isSending) return;

    setIsSending(true);
    let imageUrl = undefined;

    try {
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) throw new Error("Ошибка загрузки изображения");
      }

      const { error } = await supabase!.from('general_messages').insert([
        {
          sender_id: currentUser.id,
          text: text,
          image_url: imageUrl
        }
      ]);

      if (error) throw error;

      setInputText('');
      setSelectedImage(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Send Message Error", err);
      alert("СБОЙ ПЕРЕДАЧИ ДАННЫХ");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-scp-panel border border-gray-800 font-mono shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-black/60 flex justify-between items-center backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-scp-terminal/50 flex items-center justify-center text-scp-terminal bg-scp-terminal/5">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-widest text-scp-text uppercase">Общий канал персонала</h2>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Зона-19 // Соединение установлено
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={fetchMessages} className="p-2 hover:bg-white/5 text-gray-500 hover:text-scp-terminal transition-all">
             <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
           </button>
           <div className="hidden sm:flex text-[10px] text-green-500 items-center gap-2 border border-green-900/50 px-3 py-1 bg-green-950/20">
             <Lock size={12} className="animate-pulse" /> AES-256 ENCRYPTED
           </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 relative bg-black/20">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]"></div>

        {isLoading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-scp-terminal gap-4">
            <RefreshCw className="animate-spin" size={40} />
            <span className="text-xs uppercase tracking-[0.3em] animate-pulse">Синхронизация потока...</span>
          </div>
        ) : messages.map((msg) => {
          const isMe = msg.sender_id === currentUser.id;
          const sender = userCache[msg.sender_id];
          const clearance = sender?.clearance ?? 0;
          const department = sender?.department ?? 'GEN';
          const name = sender?.name ?? 'Unknown Personnel';

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className="flex items-center gap-2 mb-1 px-1">
                {!isMe && (
                   <button 
                    onClick={() => onViewProfile && onViewProfile(msg.sender_id)}
                    className="text-[9px] font-black text-scp-terminal hover:underline uppercase flex items-center gap-1"
                   >
                     <User size={8} /> {name}
                   </button>
                )}
                <span className="text-[8px] text-gray-600 font-mono">
                  [{department}] // L-{clearance} // {new Date(msg.created_at).toLocaleTimeString()}
                </span>
                {isMe && (
                   <span className="text-[9px] font-black text-blue-500 uppercase ml-1">ВЫ</span>
                )}
              </div>
              
              <div className={`max-w-[75%] p-3 border relative group ${
                isMe 
                  ? 'border-gray-700 bg-gray-900/90 text-gray-200' 
                  : 'border-scp-terminal/30 bg-scp-terminal/5 text-scp-terminal'
              }`}>
                <div className={`absolute top-0 ${isMe ? 'right-0' : 'left-0'} w-1 h-1 bg-current opacity-50`}></div>
                
                {msg.image_url && (
                  <div className="mb-2 relative group/img cursor-zoom-in">
                    <img 
                      src={msg.image_url} 
                      alt="Attached evidence" 
                      className="max-w-full max-h-80 border border-white/10 grayscale hover:grayscale-0 transition-all duration-500"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 text-[8px] px-1 font-bold text-white border border-white/20 opacity-0 group-hover/img:opacity-100 transition-opacity">
                      FILE_ATTACHMENT // SECURE_VIEW
                    </div>
                  </div>
                )}

                {msg.text && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                    {msg.text}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800 bg-black/60 backdrop-blur-md relative z-20">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-4 p-2 bg-white/5 border border-dashed border-gray-700 inline-flex relative animate-in zoom-in-95">
            <img src={imagePreview} className="h-20 grayscale" alt="Preview" />
            <button 
              onClick={() => { setSelectedImage(null); setImagePreview(null); }}
              className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-lg hover:bg-red-500 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
            accept="image/*"
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-4 border border-gray-700 text-gray-500 hover:text-scp-terminal hover:border-scp-terminal transition-all"
            title="Прикрепить изображение"
          >
            <ImageIcon size={20} />
          </button>
          
          <div className="flex-1 relative">
             <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isSending ? "ПЕРЕДАЧА ДАННЫХ..." : "ВВЕДИТЕ СООБЩЕНИЕ..."}
              className="w-full bg-black border border-gray-700 p-4 text-sm text-scp-terminal focus:border-scp-terminal focus:outline-none font-mono placeholder-gray-800 transition-all focus:bg-white/5 disabled:opacity-50"
              autoComplete="off"
              disabled={isSending}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
              <Briefcase size={16} />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={(!inputText.trim() && !selectedImage) || isSending}
            className="bg-scp-terminal text-black px-10 font-black uppercase text-xs tracking-widest hover:bg-white transition-all active:scale-95 disabled:opacity-30 flex items-center gap-2 shadow-[0_0_15px_rgba(51,255,51,0.2)]"
          >
            {isSending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />} 
            <span className="hidden sm:inline">ПЕРЕДАТЬ</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default GeneralChat;
