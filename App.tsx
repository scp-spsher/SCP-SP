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
  // Initialize state based on active session in localStorage
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(authService.getSession());
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // State for Admin Simulation (View As)
  // Defaults to 6 (Omni) for SuperAdmin, or user's actual clearance
  const [simulatedClearance, setSimulatedClearance] = useState<number>(1);

  // Sync user data with backend/storage on load
  useEffect(() => {
    const syncSession = async () => {
      if (currentUser) {
        const freshUser = await authService.refreshSession();
        if (!freshUser) {
           // User deleted or unapproved
           authService.logout();
           setCurrentUser(null);
        } else {
           // User data possibly updated
           setCurrentUser(freshUser);
        }
      }
    };
    syncSession();
  }, []); // Run once on mount

  useEffect(() => {
    if (currentUser) {
       // If super admin, default to 6, otherwise use actual clearance
       // Only update simulated clearance if it matches the previous reality (prevent overriding manual changes if we added that feature later)
       // For now, simple logic:
       setSimulatedClearance(currentUser.isSuperAdmin ? 6 : currentUser.clearance);
    }
  }, [currentUser]);

  const isAuthenticated = !!currentUser;

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

  if (!isAuthenticated) {
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
      userClearance={currentUser.clearance} // Real Clearance (for reference)
      simulatedClearance={simulatedClearance} // View As Clearance
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
