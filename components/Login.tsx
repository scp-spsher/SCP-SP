import React, { useState } from 'react';
import { Shield, Lock, User, Key, UserPlus, LogIn, AlertCircle, Mail } from 'lucide-react';
import { authService, StoredUser } from '../services/authService';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface LoginProps {
  onLogin: (user: StoredUser) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [status, setStatus] = useState<string>('ОЖИДАНИЕ ВВОДА...');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    clearance: 1
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setStatus('ОШИБКА: НЕТ УЧЕТНЫХ ДАННЫХ');
      return;
    }

    setIsProcessing(true);
    setStatus(mode === 'login' ? 'ПРОВЕРКА ДАННЫХ...' : 'ОБРАБОТКА РЕГИСТРАЦИИ...');

    // Small artificial delay for effect
    setTimeout(async () => {
      try {
        if (mode === 'register') {
          const result = await authService.register(
            formData.email, 
            formData.name, 
            formData.password, 
            Number(formData.clearance)
          );
          
          setStatus(result.message);
          if (result.success) {
            setTimeout(() => {
              setMode('login');
              setStatus('ПОЖАЛУЙСТА, ВОЙДИТЕ');
              setFormData(prev => ({ ...prev, password: '' })); 
            }, 1000);
          }
        } else {
          const result = await authService.login(formData.email, formData.password);
          if (result.success && result.user) {
            setStatus('БИОМЕТРИЯ ПРИНЯТА. ДОСТУП РАЗРЕШЕН.');
            setTimeout(() => {
              onLogin(result.user!);
            }, 800);
          } else {
            setStatus(result.message);
          }
        }
      } catch (e) {
        setStatus("ФАТАЛЬНАЯ ОШИБКА: СБОЙ СИСТЕМЫ");
      }
      setIsProcessing(false);
    }, 1000);
  };

  const isDbConnected = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-black text-scp-text font-mono flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-80 z-0"></div>
      
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] z-0"></div>

      <div className="relative z-10 w-full max-w-md border border-gray-800 bg-gray-950/90 p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md">
        
        {/* Header */}
        <div className="text-center mb-8 border-b border-gray-800 pb-6 relative">
          
          <div className="mx-auto w-16 h-16 mb-4 text-scp-text border-2 border-scp-text rounded-full flex items-center justify-center animate-pulse-slow">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-[0.3em] mb-1">SCPNET</h1>
          <p className="text-[10px] text-gray-500 tracking-widest">
            ТЕРМИНАЛ ЗАЩИЩЕННОГО ДОСТУПА
            {isDbConnected ? <span className="text-green-500 ml-2">[БД: ONLINE]</span> : <span className="text-yellow-600 ml-2">[ЛОКАЛЬНЫЙ РЕЖИМ]</span>}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex mb-6 border border-gray-800">
          <button
            onClick={() => { setMode('login'); setStatus('ОЖИДАНИЕ ВВОДА...'); }}
            className={`flex-1 py-3 text-xs tracking-widest transition-colors ${
              mode === 'login' ? 'bg-scp-text text-black font-bold' : 'text-gray-500 hover:text-white'
            }`}
          >
            ВХОД
          </button>
          <button
            onClick={() => { setMode('register'); setStatus('НОВАЯ ЗАПИСЬ'); }}
            className={`flex-1 py-3 text-xs tracking-widest transition-colors ${
              mode === 'register' ? 'bg-scp-text text-black font-bold' : 'text-gray-500 hover:text-white'
            }`}
          >
            РЕГИСТРАЦИЯ
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-scp-dim uppercase tracking-widest flex items-center gap-2">
              <Mail size={10} /> Email Адрес
            </label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-black/50 border border-gray-700 p-3 text-scp-terminal focus:border-scp-terminal focus:outline-none transition-colors font-mono tracking-widest placeholder-gray-800"
              placeholder="agent@site19.scp"
              autoComplete="off"
            />
          </div>

          {mode === 'register' && (
             <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] text-scp-dim uppercase tracking-widest flex items-center gap-2">
                <User size={10} /> Полное имя
              </label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-gray-700 p-3 text-gray-300 focus:border-scp-terminal focus:outline-none transition-colors font-mono"
                placeholder="Прим: Д-р Клеф"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] text-scp-dim uppercase tracking-widest flex items-center gap-2">
              <Key size={10} /> Код доступа
            </label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full bg-black/50 border border-gray-700 p-3 text-scp-terminal focus:border-scp-terminal focus:outline-none transition-colors font-mono tracking-widest placeholder-gray-800"
              placeholder="••••••••"
            />
          </div>

          {mode === 'register' && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] text-scp-dim uppercase tracking-widest flex items-center gap-2">
                <Lock size={10} /> Уровень допуска
              </label>
              <select 
                name="clearance"
                value={formData.clearance}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-gray-700 p-3 text-gray-300 focus:border-scp-terminal focus:outline-none transition-colors font-mono cursor-pointer"
              >
                <option value={1}>УРОВЕНЬ 1 (ДСП)</option>
                <option value={2}>УРОВЕНЬ 2 (ОГРАНИЧЕННЫЙ)</option>
                <option value={3}>УРОВЕНЬ 3 (СЕКРЕТНО)</option>
                <option value={4}>УРОВЕНЬ 4 (СОВ. СЕКРЕТНО)</option>
                <option value={5}>УРОВЕНЬ 5 (ТАУМИЭЛЬ)</option>
              </select>
            </div>
          )}

          <div className="pt-4">
             <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-800 to-transparent mb-6"></div>
             
             <button 
              type="submit"
              disabled={isProcessing}
              className={`w-full p-4 border transition-all flex items-center justify-center gap-2 tracking-widest text-sm font-bold ${
                 isProcessing 
                 ? 'border-gray-800 text-gray-600 cursor-wait'
                 : 'border-scp-text hover:bg-scp-text hover:text-black text-scp-text'
              }`}
            >
              {isProcessing ? (
                <span className="animate-pulse">ОБРАБОТКА...</span>
              ) : mode === 'login' ? (
                <><LogIn size={16} /> АВТОРИЗАЦИЯ</>
              ) : (
                <><UserPlus size={16} /> СОЗДАТЬ ЗАПИСЬ</>
              )}
            </button>
          </div>
        </form>

        {/* Status Output */}
        <div className="mt-6 p-3 bg-black border border-gray-800 text-center min-h-[48px] flex items-center justify-center">
          <span className={`text-xs font-bold tracking-wider ${
             status.includes('ОШИБКА') || status.includes('ЗАПРЕЩЕН') ? 'text-scp-accent' : 
             status.includes('РАЗРЕШЕН') || status.includes('СОЗДАНА') || status.includes('ПРИНЯТА') ? 'text-green-500' : 'text-scp-terminal'
          } animate-pulse`}>
            {status}
          </span>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-start gap-2 opacity-50">
          <AlertCircle size={12} className="text-scp-accent shrink-0 mt-0.5" />
          <p className="text-[9px] text-gray-500 uppercase leading-relaxed">
            Этот терминал находится под наблюдением AIAD (Отдел Искусственного Интеллекта). 
            Попытки обхода защиты приведут к развертыванию МОГ.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
