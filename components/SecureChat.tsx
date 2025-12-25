import React, { useState, useRef, useEffect } from 'react';
import { Send, Cpu, User } from 'lucide-react';
import { commandChatStream } from '../services/geminiService';

const SecureChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: 'КОМАНДНЫЙ ИНТЕРФЕЙС АКТИВЕН. НАЗОВИТЕ СВОЕ ОБОЗНАЧЕНИЕ И ЦЕЛЬ ЗАПРОСА.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      // Prepare history for Gemini
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const stream = commandChatStream(history, userMsg);
      
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]); // Placeholder

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
           const newArr = [...prev];
           newArr[newArr.length - 1].text = fullResponse;
           return newArr;
        });
      }
    } catch (error) {
       setMessages(prev => [...prev, { role: 'model', text: 'ОШИБКА: СОЕДИНЕНИЕ С МЕЙНФРЕЙМОМ ПРЕРВАНО.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
        <h2 className="text-2xl font-bold tracking-widest text-scp-text flex items-center gap-3">
          <Cpu className="text-scp-terminal" /> КАНАЛ КОМАНДОВАНИЯ
        </h2>
        <div className="text-xs font-mono text-green-500 animate-pulse">ШИФРОВАНИЕ: AES-256</div>
      </div>

      <div className="flex-1 overflow-y-auto bg-black border border-gray-800 p-4 space-y-4 font-mono mb-4 relative">
         {/* Background Scanline */}
         <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]"></div>

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 border ${
              msg.role === 'user' 
                ? 'border-gray-600 bg-gray-900 text-gray-200' 
                : 'border-scp-terminal text-scp-terminal bg-green-900/10'
            }`}>
              <div className="flex items-center gap-2 mb-1 text-[10px] opacity-70 uppercase tracking-wider border-b border-gray-700/50 pb-1">
                {msg.role === 'user' ? <User size={10} /> : <Cpu size={10} />}
                {msg.role === 'user' ? 'ПОЛЕВОЙ АГЕНТ' : 'ИИ КОМАНДОВАНИЯ'}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="p-3 border border-scp-terminal text-scp-terminal bg-green-900/10 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-scp-terminal rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-scp-terminal rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-scp-terminal rounded-full animate-bounce delay-150"></span>
             </div>
           </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ПЕРЕДАЧА СООБЩЕНИЯ..."
          className="flex-1 bg-black border border-gray-700 p-4 text-scp-terminal focus:border-scp-terminal focus:outline-none font-mono tracking-wider"
          autoFocus
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isTyping}
          className="bg-gray-800 hover:bg-scp-terminal hover:text-black px-6 border border-gray-700 transition-colors disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default SecureChat;
