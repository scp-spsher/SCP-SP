import React, { useState, useRef, useEffect } from 'react';
import { TerminalLog } from '../types';

const TerminalComponent: React.FC = () => {
  const [history, setHistory] = useState<TerminalLog[]>([
    { id: '1', type: 'output', content: 'SCPNET TERMINAL OS v9.0.4' },
    { id: '2', type: 'output', content: 'Copyright (c) SCP Foundation. All rights reserved.' },
    { id: '3', type: 'output', content: 'Type "help" for command list.' },
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    inputRef.current?.focus();
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    let response: TerminalLog = { id: Date.now().toString(), type: 'output', content: '' };

    switch (trimmed) {
      case 'help':
        response.content = `
ДОСТУПНЫЕ КОМАНДЫ:
  help        - Показать это меню
  clear       - Очистить экран
  status      - Статус системы
  date        - Текущее время сервера
  whoami      - Инфо о пользователе
  ls          - Список директории`;
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'status':
        response.content = 'СИСТЕМА: АКТИВНА\nЦЕЛОСТНОСТЬ: 99%\nМЕМ-АГЕНТЫ: АКТИВНЫ';
        response.type = 'success';
        break;
      case 'date':
        response.content = new Date().toString();
        break;
      case 'whoami':
        response.content = 'ПОЛЬЗОВАТЕЛЬ: [УДАЛЕНО]\nДОПУСК: УРОВЕНЬ [УДАЛЕНО]';
        break;
      case 'ls':
        response.content = 'error.log\nscp_list.txt\ncontainment_protocols.bin\nsecret_party_plans.txt [ЗАШИФРОВАНО]';
        break;
      case '':
        return;
      default:
        response.content = `Команда не найдена: ${trimmed}`;
        response.type = 'error';
    }

    setHistory(prev => [...prev, response]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHistory(prev => [...prev, { id: Date.now().toString(), type: 'input', content: input }]);
    handleCommand(input);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col font-mono text-sm bg-black p-4 border border-gray-800 shadow-[0_0_20px_rgba(0,255,0,0.1)]" onClick={() => inputRef.current?.focus()}>
      <div className="flex-1 overflow-y-auto space-y-1 pb-4 scrollbar-hide">
        {history.map((log) => (
          <div key={log.id} className={`${
            log.type === 'error' ? 'text-red-500' : 
            log.type === 'success' ? 'text-green-400' :
            log.type === 'input' ? 'text-gray-400' : 'text-scp-terminal'
          } whitespace-pre-wrap`}>
            {log.type === 'input' ? '> ' : ''}{log.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center text-scp-terminal border-t border-gray-800 pt-2">
        <span className="mr-2 animate-pulse">{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-scp-terminal font-bold"
          autoFocus
          spellCheck={false}
        />
      </form>
    </div>
  );
};

export default TerminalComponent;
