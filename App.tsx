import React, { useState, useEffect } from 'react';
import { SecurityClearance } from './types';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Database from './components/Database';
import SecureChat from './components/SecureChat';
import TerminalComponent from './components/Terminal';
import Reports from './components/Reports';
import Guide from './components/Guide';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import { authService, StoredUser } from './services/authService';

const App: React.FC = () => {
  // Initial state from localStorage (synchronous)
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(authService.getSession());
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // State for Admin Simulation (View As)
  const [simulatedClearance, setSimulatedClearance] = useState<number>(1);

  useEffect(() => {
    const initApp = async () => {
      let user = currentUser;

      // 1. If no local session, try to recover from active Supabase auth
      if (!user) {
        user = await authService.tryRecoverSession();
      }

      // 2. If we have a user, try to refresh their data (e.g. check if still approved)
      if (user) {
        const freshUser = await authService.refreshSession();
        if (!freshUser) {
           // User was explicitly invalidated (deleted or unapproved)
           authService.logout();
           setCurrentUser(null);
        } else {
           setCurrentUser(freshUser);
        }
      } else {
        setCurrentUser(null);
      }
      
      setIsLoadingSession(false);
    };

    initApp();
  }, []);

  useEffect(() => {
    if (currentUser) {
       setSimulatedClearance(currentUser.isSuperAdmin ? 6 : currentUser.clearance);
    }
  }, [currentUser]);

  const handleLogin = (user: StoredUser) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentPage('dashboard');
    setSimulatedClearance(1);
  };

  const handleProfileUpdate = (updatedUser: StoredUser) => {
    setCurrentUser(updatedUser);
  };

  // Loading state while checking/restoring session
  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono">
        <div className="w-16 h-16 border-4 border-scp-terminal border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-scp-terminal text-sm tracking-widest animate-pulse">
          ВОССТАНОВЛЕНИЕ ТЕРМИНАЛЬНОЙ СЕССИИ...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard currentClearance={simulatedClearance} />;
      case 'profile': return <Profile user={currentUser} currentClearance={simulatedClearance} onProfileUpdate={handleProfileUpdate} />;
      case 'database': return <Database />;
      case 'comms': return <SecureChat />;
      case 'terminal': return <TerminalComponent />;
      case 'reports': return <Reports />;
      case 'admin': return <AdminPanel currentUser={currentUser} />;
      case 'guide': return <Guide />;
      default: return <Dashboard currentClearance={simulatedClearance} />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      onNavigate={setCurrentPage} 
      onLogout={handleLogout}
      userClearance={currentUser.clearance} 
      simulatedClearance={simulatedClearance} 
      setSimulatedClearance={setSimulatedClearance}
      userEmail={currentUser.id}
      realEmail={currentUser.email}
      isSuperAdmin={currentUser.isSuperAdmin}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
