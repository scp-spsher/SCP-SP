import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Terminal, 
  MessageSquare, 
  LogOut, 
  Menu,
  Activity,
  FileText,
  BookOpen,
  UserCircle,
  Eye,
  ChevronDown,
  Users
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
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentPage, 
  onNavigate, 
  onLogout, 
  simulatedClearance,
  setSimulatedClearance,
  isSuperAdmin,
  user
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ТАЙНАЯ ЛОГИКА МАСКИРОВКИ
  const displayClearance = useMemo(() => {
    if (user?.id === SECRET_ADMIN_ID && simulatedClearance === 6) {
      return 4;
    }
    return simulatedClearance;
  }, [user, simulatedClearance]);

  const isO5View = simulatedClearance >= 5;

  const navItems = [
    { id: 'dashboard', label: isO5View ? 'ГЛАЗ БОГА' : 'ОБЗОР', icon: isO5View ? Eye : Activity, minClearance: 1 },
    { id: 'profile', label: 'ID КАРТА', icon: UserCircle, minClearance: 1 },
    { id: 'database', label: 'АРХИВ', icon: Database, minClearance: 2 },
    { id: 'reports', label: 'ОТЧЕТЫ', icon: FileText, minClearance: 2 },
    { id: 'comms', label: 'СПЕЦСВЯЗЬ', icon: MessageSquare, minClearance: 3 },
    { id: 'terminal', label: 'ТЕРМИНАЛ', icon: Terminal, minClearance: 4 },
    { id: 'admin', label: 'ПЕРСОНАЛ', icon: Users, minClearance: 5 },
    { id: 'guide', label: 'РУКОВОДСТВО', icon: BookOpen, minClearance: 1 },
  ];

  const borderColor = isO5View ? 'border-yellow-900/50' : 'border-gray-800';
  const activeBg = isO5View ? 'bg-yellow-900/20 text-yellow-500 border-yellow-500' : 'bg-gray-900 text-white border-scp-accent';

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
          <p className="text-xs text-gray-500 tracking-tighter mt-1">
            {isO5View ? 'ГЛОБАЛЬНОЕ НАБЛЮДЕНИЕ' : 'ЗАЩИЩЕННОЕ СОЕДИНЕНИЕ'}
          </p>
        </div>
        
        {isSuperAdmin && (
          <div className="px-4 py-2 border-b border-gray-800 bg-gray-900/50">
            <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Симуляция доступа</div>
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
              </select>
              <ChevronDown size={12} className="absolute right-2 top-2.5 text-gray-500 pointer-events-none" />
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const hasAccess = simulatedClearance >= item.minClearance;
              return (
                <li key={item.id}>
                  {hasAccess ? (
                     <button
                     onClick={() => onNavigate(item.id)}
                     className={`w-full flex items-center px-6 py-3 text-sm transition-colors duration-200 border-l-4 ${
                       currentPage === item.id 
                         ? activeBg
                         : 'border-transparent text-gray-400 hover:bg-gray-900 hover:text-white'
                     }`}
                   >
                     <item.icon size={18} className="mr-3" />
                     {item.label}
                   </button>
                  ) : (
                    <div className="w-full flex items-center px-6 py-3 text-sm text-gray-700 cursor-not-allowed select-none">
                      <item.icon size={18} className="mr-3 opacity-20" />
                      <span className="opacity-40">{item.label} [БЛОК]</span>
                    </div>
                  )}
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
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu size={24} /></button>
        </header>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full h-[calc(100%-4rem)] bg-scp-dark z-30 border-b border-gray-800 p-4">
             <ul className="space-y-2">
            {navItems.map((item) => {
               const hasAccess = simulatedClearance >= item.minClearance;
               return (
                <li key={item.id}>
                  {hasAccess ? (
                    <button
                      onClick={() => { onNavigate(item.id); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center px-4 py-4 text-sm border-l-2 ${currentPage === item.id ? activeBg : 'border-transparent text-gray-400 hover:bg-gray-900'}`}
                    >
                      <item.icon size={18} className="mr-3" />
                      {item.label}
                    </button>
                  ) : null}
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
