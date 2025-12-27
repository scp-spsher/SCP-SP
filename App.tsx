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
import AdminChat from './components/AdminChat';
import { authService, StoredUser } from './services/authService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(authService.getSession());
  const [viewedUser, setViewedUser] = useState<StoredUser | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [simulatedClearance, setSimulatedClearance] = useState<number>(0);

  useEffect(() => {
    const initApp = async () => {
      let user = currentUser;
      if (!user) {
        user = await authService.tryRecoverSession();
      }
      if (user) {
        const freshUser = await authService.refreshSession();
        if (!freshUser) {
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
    setViewedUser(null);
    setCurrentPage('dashboard');
    setSimulatedClearance(0);
  };

  const handleProfileUpdate = (updatedUser: StoredUser) => {
    setCurrentUser(updatedUser);
  };

  const handleViewProfile = async (userId: string) => {
      if (currentUser && userId === currentUser.id) {
          setViewedUser(null);
          setCurrentPage('profile');
          return;
      }
      
      const user = await authService.getUserById(userId);
      if (user) {
          setViewedUser(user);
          setCurrentPage('profile');
      }
  };

  const handleNavigate = (page: string) => {
      if (page === 'profile') setViewedUser(null);
      setCurrentPage(page);
  };

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
      case 'profile': return (
        <Profile 
          user={viewedUser || currentUser} 
          currentClearance={viewedUser ? viewedUser.clearance : simulatedClearance} 
          onProfileUpdate={viewedUser ? undefined : handleProfileUpdate} 
          onBack={viewedUser ? () => setViewedUser(null) : undefined}
          isViewingSelf={!viewedUser}
        />
      );
      case 'messages': return <AdminChat currentUser={currentUser} />;
      case 'database': return <Database />;
      case 'comms': return <SecureChat />;
      case 'terminal': return <TerminalComponent />;
      case 'reports': return <Reports user={currentUser} effectiveClearance={simulatedClearance} onViewProfile={handleViewProfile} />;
      case 'admin': return <AdminPanel currentUser={currentUser} onUserUpdate={handleProfileUpdate} onViewProfile={handleViewProfile} />;
      case 'guide': return <Guide />;
      default: return <Dashboard currentClearance={simulatedClearance} />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      onNavigate={handleNavigate} 
      onLogout={handleLogout}
      userClearance={currentUser.clearance} 
      simulatedClearance={simulatedClearance} 
      setSimulatedClearance={setSimulatedClearance}
      userEmail={currentUser.id}
      realEmail={currentUser.email}
      isSuperAdmin={currentUser.isSuperAdmin}
      user={currentUser}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
