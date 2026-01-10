
import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Terminal, 
  MessageSquare, 
  LogOut, 
  Menu,
  Activity,
  FileText,
  UserCircle,
  Eye,
  ChevronDown,
  Users,
  Mail,
  BookOpen,
  MessageCircle
} from 'lucide-react';
import { SCPLogo } from './SCPLogo';

const SECRET_ADMIN_ID = '36046d5d-dde4-4cf6-a2de-794334b7af5c';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  userClearance: number; // Real clearance
  simulatedClearance: number; // The active view level
  setSimulatedClearance: (level: number) => void;
  userEmail?: string; 
  realEmail?: string;
  isSuperAdmin?: boolean;
  user?: any; // To check ID
  unreadMessages?: number;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentPage, 
  onNavigate, 
  onLogout, 
  simulatedClearance,
  setSimulatedClearance,
  isSuperAdmin,
  user,
  unreadMessages = 0
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const displayClearance = useMemo(() => {
    if (user?.id === SECRET_ADMIN_ID && simulatedClearance === 6) {
      return 4;
    }
    return simulatedClearance;
  }, [user, simulatedClearance]);

  const isO5View = simulatedClearance >= 5;

  const navItems = [
    { id: 'dashboard', label: isO5View ? 'ГЛАЗ БОГА' : 'ОБЗОР', icon: isO5View ? Eye : Activity, minClearance: 0 },
    { id: 'profile', label: 'ID КАРТА', icon: UserCircle, minClearance: 0 },
    { id: 'guide', label: 'ДОКУМЕНТАЦИЯ', icon: BookOpen, minClearance: 0 },
    { id: 'general_chat', label: 'ОБЩИЙ КАНАЛ', icon: MessageCircle, minClearance: 1 },
    { id: 'database', label: 'АРХИВ', icon: Database, minClearance: 2 },
    { id: 'reports', label: 'ОТЧЕТЫ', icon: FileText, minClearance: 1 },
    { id: 'terminal', label: 'ТЕРМИНАЛ', icon: Terminal, minClearance: 4 },
    { id: 'admin', label: 'ПЕРСОНАЛ', icon: Users, minClearance: 5 },
    { id: 'messages', label: 'СВЯЗЬ С АДМИНИСТРАЦИЕЙ', icon: Mail, minClearance: 0, showBadge: true },
  ];

  const borderColor = isO5View ? 'border-yellow-900/50' : 'border-gray-800';
  const activeBg = isO5View ? 'bg-yellow-900/20 text-yellow-500 border-yellow-500' : 'bg-gray-900 text-white border-scp-accent';

  const accessibleNavItems = navItems.filter(item => simulatedClearance >= item.minClearance);

  return (
    <div className="flex h-screen bg-scp-dark text-scp-text font-mono overflow-hidden">
      <aside className={`hidden md:flex flex-col w-64 border-r ${borderColor} bg-scp-panel z-10 transition-all duration-500`}>
        <div className={`p-6 border-b ${borderColor} flex flex-col items-center relative`}>
          <div className={`w-20 h-20 mb-3 transition-colors duration-500 ${isO5View ? 'text-yellow-500' : 'text-scp-text'}`}>
             {isO5View ? <Eye size={64} className="animate-pulse-slow mx-auto" /> : <SCPLogo className="w-full h-full" />}
          </div>
          <h1 className={`text-xl font-bold tracking-widest text-center transition-colors duration-500 ${isO5View ? 'text-yellow-500' : ''}`}>
            {isSuperAdmin && displayClearance === 6 ? 'SCPNET [ADMIN]' : (isO5View ? 'SCPNET [O5]' : 'SCPNET')}
          </h1>
          <p className="text-xs text-gray-500 tracking-tighter mt-1 uppercase">
            {isO5View ? 'ГЛОБАЛЬНОЕ НАБЛЮДЕНИЕ' : 'ЗАЩИЩЕННОЕ СОЕДИНЕНИЕ'}
          </p>
        </div>
        
        {isSuperAdmin && (
          <div className="px-4 py-2 border-b border-gray-800 bg-gray-900/50">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Симуляция доступа</div>
            <div className="relative">
              <select 
                value={simulatedClearance}
                onChange={(e) => setSimulatedClearance(Number(e.target.value))}
                className="w-full bg-black border border-gray-700 text-xs text-scp-terminal p-2 appearance-none cursor-pointer focus:outline-none focus:border-scp-text"
              >
                <option value={6}>УРОВЕНЬ 6: OMNI (ADMIN)</option>
                <option value={5}>УРОВЕНЬ 5: ТАУМИЭЛЬ (O5)</option>
                <option value={4}>УРОВЕНЬ 4: СОВ. СЕКРЕТНО</option>
                <option value={3}>УРОВЕНЬ 3: СЕКРЕТНО</option>
                <option value={2}>УРОВЕНЬ 2: ОГРАНИЧЕННЫЙ</option>
                <option value={1}>УРОВЕНЬ 1: ДСП</option>
                <option value={0}>УРОВЕНЬ 0: СТАЖЕР</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-2.5 text-gray-500 pointer-events-none" />
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {accessibleNavItems.map((item) => {
              const hasUnread = item.showBadge && unreadMessages > 0;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center px-6 py-3 text-sm transition-colors duration-200 border-l-4 relative ${
                      currentPage === item.id 
                        ? activeBg
                        : 'border-transparent text-gray-400 hover:bg-gray-900 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} className="mr-3" />
                    {item.label}
                    {hasUnread && (
                      <span className="absolute right-4 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)] border border-black/20">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={`p-4 border-t ${borderColor}`}>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <span>ДОСТУП:</span>
            <span className={`${isO5View ? 'text-yellow-500' : 'text-scp-accent'} font-bold uppercase`}>
              {displayClearance === 6 ? 'OMNI' : `УРОВЕНЬ ${displayClearance}`}
            </span>
          </div>
          <button 
            onClick={onLogout}
            className={`w-full flex items-center justify-center px-4 py-2 border rounded transition-all text-xs ${
              isO5View 
                ? 'border-yellow-900 hover:bg-yellow-900 hover:text-black' 
                : 'border-gray-700 hover:bg-scp-accent hover:border-scp-accent hover:text-white'
            }`}
          >
            <LogOut size={14} className="mr-2" /> ОТКЛЮЧИТЬСЯ
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className={`md:hidden flex items-center justify-between p-4 border-b ${borderColor} bg-scp-panel z-20`}>
          <div className="flex items-center">
            {isO5View ? <Eye size={24} className="mr-2 text-yellow-500" /> : <div className="w-6 h-6 mr-2 text-scp-text"><SCPLogo className="w-full h-full" /></div>}
            <span className={`font-bold tracking-widest ${isO5View ? 'text-yellow-500' : ''}`}>SCPNET</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="relative p-2">
            <Menu size={24} />
            {unreadMessages > 0 && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-black"></span>
            )}
          </button>
        </header>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full h-[calc(100%-4rem)] bg-scp-dark z-30 border-b border-gray-800 p-4">
             <ul className="space-y-2">
            {accessibleNavItems.map((item) => {
               const hasUnread = item.showBadge && unreadMessages > 0;
               return (
                <li key={item.id}>
                  <button
                    onClick={() => { onNavigate(item.id); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-4 py-4 text-sm border-l-2 relative ${currentPage === item.id ? activeBg : 'border-transparent text-gray-400 hover:bg-gray-900'}`}
                  >
                    <item.icon size={18} className="mr-3" />
                    {item.label}
                    {hasUnread && (
                      <span className="ml-auto px-2 py-0.5 bg-red-600 text-white text-[10px] rounded-full font-bold">
                        {unreadMessages}
                      </span>
                    )}
                  </button>
                </li>
               );
            })}
             <li className="pt-4 mt-4 border-t border-gray-800">
               <button onClick={onLogout} className="w-full flex items-center px-4 py-4 text-sm text-red-500 hover:bg-gray-900"><LogOut size={18} className="mr-3" /> ЗАВЕРШИТЬ СЕССИЮ</button>
             </li>
          </ul>
          </div>
        )}

        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
           <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5" 
                style={{backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`, backgroundSize: '40px 40px'}} 
           />
           {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
