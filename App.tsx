
import React, { useState, useEffect, useCallback } from 'react';
import { SecurityClearance } from './types';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Database from './components/Database';
import TerminalComponent from './components/Terminal';
import Reports from './components/Reports';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import AdminChat from './components/AdminChat';
import GeneralChat from './components/GeneralChat';
import Guide from './components/Guide';
import { authService, StoredUser } from './services/authService';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

const ADMIN_POOL_ID = '00000000-0000-0000-0000-000000000000';
const ARCHIVE_BASE_PATH = '/archive';

const extractScpSlugFromPath = (pathname: string): string | null => {
  const segments = pathname.split('/').filter(Boolean);
  if (!segments.length) return null;
  const candidate = segments[segments.length - 1].toUpperCase();
  return /^SCP-[A-Z0-9-]+$/.test(candidate) ? candidate : null;
};

const pushPathIfChanged = (path: string) => {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
  }
};

const App: React.FC = () => {
  const initialSlugFromPath = typeof window !== 'undefined' ? extractScpSlugFromPath(window.location.pathname) : null;
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(authService.getSession());
  const [viewedUser, setViewedUser] = useState<StoredUser | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialSlugFromPath ? 'database' : 'dashboard');
  const [archiveRouteSlug, setArchiveRouteSlug] = useState<string | null>(initialSlugFromPath);
  const [simulatedClearance, setSimulatedClearance] = useState<number>(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
    setViewedUser(null);
    setCurrentPage('dashboard');
    setArchiveRouteSlug(null);
    setSimulatedClearance(0);
    pushPathIfChanged('/');
  }, []);

  useEffect(() => {
    const initApp = async () => {
      setIsLoadingSession(true);
      
      let user = authService.getSession();
      if (!user) {
        user = await authService.tryRecoverSession();
      }

      if (user) {
        const freshUser = await authService.refreshSession();
        
        if (!freshUser) {
          handleLogout();
        } else {
          setCurrentUser(freshUser);
          setSimulatedClearance(freshUser.isSuperAdmin ? 6 : Number(freshUser.clearance || 0));
        }
      }
      
      setIsLoadingSession(false);
    };
    
    initApp();
  }, [handleLogout]);

  useEffect(() => {
    if (currentUser && isSupabaseConfigured()) {
       setSimulatedClearance(currentUser.isSuperAdmin ? 6 : Number(currentUser.clearance || 0));
       
       const channel = supabase!
         .channel('notifications')
         .on('postgres_changes', 
           { event: 'INSERT', schema: 'public', table: 'messages' }, 
           (payload) => {
             const newMsg = payload.new;
             const myId = String(currentUser.id).toLowerCase();
             const recId = String(newMsg.receiver_id).toLowerCase();
             const senId = String(newMsg.sender_id).toLowerCase();
             
             const isForMe = recId === myId;
             const isForAdminPool = (Number(currentUser.clearance) >= 5 && recId === ADMIN_POOL_ID.toLowerCase());
             
             if ((isForMe || isForAdminPool) && senId !== myId && currentPage !== 'messages') {
               setUnreadCount(prev => prev + 1);
             }
           }
         )
         .subscribe();

       return () => { supabase!.removeChannel(channel); };
    }
  }, [currentUser, currentPage]);

  const handleLogin = (user: StoredUser) => {
    setCurrentUser(user);
    setSimulatedClearance(user.isSuperAdmin ? 6 : Number(user.clearance || 0));
    setCurrentPage(archiveRouteSlug ? 'database' : 'dashboard');
  };

  const handleProfileUpdate = (updatedUser: StoredUser) => {
    setCurrentUser(updatedUser);
  };

  const handleViewProfile = async (userId: string) => {
      if (!userId) return;
      if (currentUser && userId === currentUser.id) {
          setViewedUser(null);
          setCurrentPage('profile');
          return;
      }
      
      const user = await authService.getUserById(userId);
      if (user) {
          setViewedUser(user);
          setCurrentPage('profile');
      } else {
          alert("ОШИБКА: ОБЪЕКТ УДАЛЕН ИЗ РЕЕСТРА");
      }
  };

  const handleNavigate = (page: string) => {
      if (page === 'profile') setViewedUser(null);
      if (page === 'messages') setUnreadCount(0);
      if (page !== 'database') {
        setArchiveRouteSlug(null);
        pushPathIfChanged('/');
      } else if (!archiveRouteSlug) {
        pushPathIfChanged(ARCHIVE_BASE_PATH);
      }
      setCurrentPage(page);
  };

  useEffect(() => {
    const handlePopState = () => {
      const slug = extractScpSlugFromPath(window.location.pathname);
      if (slug) {
        setArchiveRouteSlug(slug);
        setCurrentPage('database');
        return;
      }

      setArchiveRouteSlug(null);
      if (window.location.pathname === ARCHIVE_BASE_PATH) {
        setCurrentPage('database');
      } else {
        setCurrentPage('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleArticleRouteChange = useCallback((slug: string | null) => {
    setArchiveRouteSlug(slug);
    if (slug) {
      pushPathIfChanged(`/${slug}`);
      return;
    }
    pushPathIfChanged(ARCHIVE_BASE_PATH);
  }, []);

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono">
        <div className="w-16 h-16 border-4 border-scp-terminal border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-scp-terminal text-sm tracking-[0.3em] animate-pulse uppercase">
          ПРОВЕРКА СТАТУСА В БАЗЕ ДАННЫХ...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    const safeClearance = Number(simulatedClearance || 0);
    switch (currentPage) {
      case 'dashboard': return <Dashboard currentClearance={safeClearance} currentUser={currentUser} />;
      case 'profile': return (
        <Profile 
          user={viewedUser || currentUser} 
          currentClearance={viewedUser ? Number(viewedUser.clearance) : safeClearance} 
          onProfileUpdate={viewedUser ? undefined : handleProfileUpdate} 
          onBack={viewedUser ? () => setViewedUser(null) : undefined}
          isViewingSelf={!viewedUser}
        />
      );
      case 'messages': return <AdminChat currentUser={currentUser} />;
      case 'general_chat': return <GeneralChat currentUser={currentUser} onViewProfile={handleViewProfile} />;
      case 'guide': return <Guide currentClearance={safeClearance} />;
      case 'database': return (
        <Database
          currentUser={currentUser}
          routeSlug={archiveRouteSlug}
          onArticleRouteChange={handleArticleRouteChange}
        />
      );
      case 'terminal': return <TerminalComponent />;
      case 'reports': return <Reports user={currentUser} effectiveClearance={safeClearance} onViewProfile={handleViewProfile} />;
      case 'admin': return <AdminPanel currentUser={currentUser} onUserUpdate={handleProfileUpdate} onViewProfile={handleViewProfile} />;
      default: return <Dashboard currentClearance={safeClearance} currentUser={currentUser} />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      onNavigate={handleNavigate} 
      onLogout={handleLogout}
      userClearance={Number(currentUser.clearance)} 
      simulatedClearance={Number(simulatedClearance)} 
      setSimulatedClearance={setSimulatedClearance}
      userEmail={String(currentUser.id)}
      realEmail={String(currentUser.email || '')}
      isSuperAdmin={currentUser.isSuperAdmin}
      user={currentUser}
      unreadMessages={unreadCount}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
