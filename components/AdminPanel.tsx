import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { ShieldAlert, Check, X, RefreshCw, UserCheck, AlertOctagon, FileText, Save, ArrowLeft, Trash2, Briefcase, MapPin, Hash, User, Database, Copy, Terminal } from 'lucide-react';
import { StoredUser, SESSION_KEY } from '../services/authService';
// Import SecurityClearance to ensure type safety for user access levels
import { SecurityClearance } from '../types';
import { SCPLogo } from './SCPLogo';

const STORAGE_KEY = 'scp_net_users';
const SECRET_ADMIN_ID = '36046d5d-dde4-4cf6-a2de-794334b7af5c';

interface AdminPanelProps {
  currentUser: StoredUser | null;
  onUserUpdate?: (user: StoredUser) => void;
}

interface AdminUser {
  id: string;
  name: string;
  clearance: SecurityClearance;
  is_approved: boolean;
  registered_at: string;
  title?: string;
  department?: string;
  site?: string;
  avatar_url?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onUserUpdate }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isLocalMode, setIsLocalMode] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<AdminUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setStatusMsg('СИНХРОНИЗАЦИЯ...');

    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase!
                .from('personnel')
                .select('*')
                .order('registered_at', { ascending: false });

            if (error) {
                handleLocalFetch();
                setStatusMsg('РЕЖИМ ОГРАНИЧЕННОЙ ФУНКЦИОНАЛЬНОСТИ');
            } else {
                setUsers(data || []);
                setIsLocalMode(false);
                setStatusMsg('МЕЙНФРЕЙМ: ONLINE');
            }
        } catch (e) {
            handleLocalFetch();
        }
    } else {
        handleLocalFetch();
    }
    
    setIsLoading(false);
  };

  const handleLocalFetch = () => {
      setIsLocalMode(true);
      try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
              const parsed: StoredUser[] = JSON.parse(raw);
              const mapped: AdminUser[] = parsed.map(u => ({
                  id: u.id,
                  name: u.name,
                  clearance: u.clearance,
                  is_approved: u.is_approved || false,
                  registered_at: u.registeredAt,
                  title: u.title,
                  department: u.department,
                  site: u.site,
                  avatar_url: u.avatar_url
              }));
              mapped.sort((a, b) => new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime());
              setUsers(mapped);
              setStatusMsg('ЛОКАЛЬНЫЙ РЕЕСТР');
          } else {
              setUsers([]);
              setStatusMsg('РЕЕСТР ПУСТ');
          }
      } catch (e) {
          setStatusMsg('СБОЙ ПАМЯТИ');
      }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDossier = (user: AdminUser) => {
    setSelectedUser(user);
    setEditForm({ ...user });
    setStatusMsg(`ДОСЬЕ: ${user.name}`);
  };

  const handleCloseDossier = () => {
    setSelectedUser(null);
    setEditForm(null);
    setStatusMsg('');
  };

  const handleFormChange = (field: keyof AdminUser, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  const updateLocalUser = (updatedUser: Partial<AdminUser>, id: string) => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
          const parsed: StoredUser[] = JSON.parse(raw);
          const idx = parsed.findIndex(u => u.id === id);
          if (idx !== -1) {
              parsed[idx] = { 
                  ...parsed[idx], 
                  ...updatedUser as any, 
                  registeredAt: updatedUser.registered_at || parsed[idx].registeredAt 
              };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
              handleLocalFetch();
              return true;
          }
      }
      return false;
  };

  const handleQuickApprove = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation(); 
    setStatusMsg('ОДОБРЕНИЕ...');

    if (!isLocalMode && isSupabaseConfigured()) {
        const { error } = await supabase!
        .from('personnel')
        .update({ is_approved: true })
        .eq('id', userId);

        if (error) {
            updateLocalUser({ is_approved: true }, userId);
            setStatusMsg('ОДОБРЕНО ЛОКАЛЬНО');
        } else {
            setStatusMsg('ПОЛЬЗОВАТЕЛЬ ОДОБРЕН');
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_approved: true } : u));
        }
    } else {
        updateLocalUser({ is_approved: true }, userId);
        setStatusMsg('ОДОБРЕНО (ЛОКАЛЬНО)');
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm || !currentUser) return;
    setIsSaving(true);
    setStatusMsg('СОХРАНЕНИЕ...');

    const updates = {
      name: editForm.name,
      clearance: editForm.clearance,
      title: editForm.title,
      department: editForm.department,
      site: editForm.site,
      is_approved: editForm.is_approved,
      avatar_url: editForm.avatar_url
    };

    try {
        if (!isLocalMode && isSupabaseConfigured()) {
            const { error } = await supabase!
            .from('personnel')
            .update(updates)
            .eq('id', editForm.id);

            if (error) {
                 updateLocalUser(updates, editForm.id);
                 setStatusMsg('СОХРАНЕНО ЛОКАЛЬНО');
            } else {
                setStatusMsg('ДОСЬЕ ОБНОВЛЕНО');
                setUsers(prev => prev.map(u => u.id === editForm.id ? { ...u, ...updates } : u));
            }
        } else {
            updateLocalUser(updates, editForm.id);
            setStatusMsg('ДОСЬЕ ОБНОВЛЕНО (ЛОКАЛЬНО)');
        }

        // КРИТИЧЕСКОЕ ОБНОВЛЕНИЕ: Если редактируем себя - обновляем активную сессию
        if (editForm.id === currentUser.id) {
            const updatedCurrentUser: StoredUser = {
                ...currentUser,
                name: updates.name,
                // Cast clearance to SecurityClearance to ensure type compatibility with StoredUser
                clearance: updates.clearance as SecurityClearance,
                title: updates.title,
                department: updates.department,
                site: updates.site,
                is_approved: updates.is_approved,
                avatar_url: updates.avatar_url || currentUser.avatar_url
            };
            
            // Обновляем localStorage сессии
            localStorage.setItem(SESSION_KEY, JSON.stringify(updatedCurrentUser));
            
            // Уведомляем App через callback
            if (onUserUpdate) {
                onUserUpdate(updatedCurrentUser);
            }
        }

        setSelectedUser({ ...editForm });
    } catch (e) {
        setStatusMsg('ОШИБКА СОХРАНЕНИЯ');
    } finally {
        setIsSaving(false);
    }
  };

  const handleTerminateUser = async () => {
    if (!editForm || !window.confirm('ТЕРМИНИРОВАТЬ СОТРУДНИКА?')) return;
    
    setIsSaving(true);
    setStatusMsg('ТЕРМИНАЦИЯ...');

    if (!isLocalMode && isSupabaseConfigured()) {
        const { error } = await supabase!
        .from('personnel')
        .delete()
        .eq('id', editForm.id);

        if (error) {
            setStatusMsg('ОШИБКА УДАЛЕНИЯ');
        } else {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed: StoredUser[] = JSON.parse(raw);
                const filtered = parsed.filter(u => u.id !== editForm.id);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            }
            setStatusMsg('СОТРУДНИК УСТРАНЕН');
            setUsers(prev => prev.filter(u => u.id !== editForm.id));
            handleCloseDossier();
        }
    } else {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed: StoredUser[] = JSON.parse(raw);
            const filtered = parsed.filter(u => u.id !== editForm.id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            handleLocalFetch();
        }
        setStatusMsg('УСТРАНЕН (ЛОКАЛЬНО)');
        handleCloseDossier();
    }
    setIsSaving(false);
  };

  if (selectedUser && editForm) {
    const isSecretAdmin = editForm.id === SECRET_ADMIN_ID && editForm.clearance === 6;
    const displayClearance = isSecretAdmin ? 4 : editForm.clearance;

    return (
      <div className="flex flex-col h-full gap-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-4">
            <button onClick={handleCloseDossier} className="hover:text-scp-text transition-colors text-gray-500">
               <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold tracking-widest text-scp-text flex items-center gap-3 uppercase">
               ДОСЬЕ: {selectedUser.name}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs font-mono text-scp-terminal animate-pulse">{statusMsg}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-scp-panel border border-gray-800 p-8 relative">
           <div className="absolute top-10 right-10 opacity-5 pointer-events-none">
              <SCPLogo className="w-56 h-56" />
           </div>

           <div className="max-w-3xl mx-auto space-y-8 relative z-10">
              <div className="flex justify-between items-start bg-black/50 p-6 border border-gray-700">
                 <div className="flex items-center gap-4">
                    <div className="w-20 h-24 bg-gray-900 border border-gray-600 flex items-center justify-center overflow-hidden">
                       {editForm.avatar_url ? (
                          <img src={editForm.avatar_url} className="w-full h-full object-cover grayscale" />
                       ) : (
                          <User size={40} className="text-gray-600" />
                       )}
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-white mb-1">{editForm.name}</h3>
                       <div className="text-xs text-gray-500 font-mono mb-2">{editForm.id}</div>
                       <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold border uppercase ${editForm.is_approved ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'}`}>
                             {editForm.is_approved ? 'АКТИВЕН' : 'ОЖИДАЕТ'}
                          </span>
                       </div>
                    </div>
                 </div>
                 <div className="text-right">
                    <label className="text-[10px] text-gray-500 uppercase block mb-1">Допуск</label>
                    <select 
                        value={editForm.clearance}
                        onChange={(e) => handleFormChange('clearance', Number(e.target.value))}
                        className={`bg-black border ${isSecretAdmin ? 'border-scp-terminal text-scp-terminal' : 'border-scp-accent text-scp-accent'} text-xl font-bold p-2 text-right focus:outline-none`}
                    >
                        {isSecretAdmin ? (
                           <option value={6}>L-4 (MASKED)</option>
                        ) : (
                          <>
                            <option value={1}>L-1</option>
                            <option value={2}>L-2</option>
                            <option value={3}>L-3</option>
                            <option value={4}>L-4</option>
                            <option value={5}>L-5</option>
                            <option value={6}>OMNI</option>
                          </>
                        )}
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs uppercase text-gray-500 tracking-wider">Полное Имя</label>
                    <input 
                      type="text" 
                      value={editForm.name} 
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full bg-black border border-gray-700 p-3 text-white focus:border-scp-text focus:outline-none font-mono"
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-xs uppercase text-gray-500 tracking-wider">Должность</label>
                    <input 
                      type="text" 
                      value={editForm.title || ''} 
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      className="w-full bg-black border border-gray-700 p-3 text-white focus:border-scp-text focus:outline-none font-mono"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs uppercase text-gray-500 tracking-wider">Отдел</label>
                    <input 
                      type="text" 
                      value={editForm.department || ''} 
                      onChange={(e) => handleFormChange('department', e.target.value)}
                      className="w-full bg-black border border-gray-700 p-3 text-white focus:border-scp-text focus:outline-none font-mono"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs uppercase text-gray-500 tracking-wider">Местонахождение</label>
                    <input 
                      type="text" 
                      value={editForm.site || ''} 
                      onChange={(e) => handleFormChange('site', e.target.value)}
                      className="w-full bg-black border border-gray-700 p-3 text-white focus:border-scp-text focus:outline-none font-mono"
                    />
                 </div>
              </div>

              <div className="h-px bg-gray-800 w-full my-6"></div>

              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-700 bg-black/30 hover:bg-black/50 transition-colors flex-1">
                       <input 
                          type="checkbox" 
                          checked={editForm.is_approved} 
                          onChange={(e) => handleFormChange('is_approved', e.target.checked)}
                          className="w-5 h-5 accent-green-500"
                       />
                       <span className={`text-sm font-bold ${editForm.is_approved ? 'text-green-500' : 'text-gray-500'}`}>
                          РАЗРЕШИТЬ ДОСТУП В СИСТЕМУ
                       </span>
                    </label>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-8">
                 <button 
                    onClick={handleTerminateUser}
                    disabled={isSaving}
                    className="px-6 py-4 border border-red-900 text-red-500 hover:bg-red-900 hover:text-white transition-all text-xs font-bold uppercase"
                 >
                    Терминировать
                 </button>

                 <div className="flex gap-4">
                    <button 
                       onClick={handleCloseDossier}
                       className="px-6 py-4 border border-gray-700 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase"
                    >
                       Отмена
                    </button>
                    <button 
                       onClick={handleSaveProfile}
                       disabled={isSaving}
                       className="flex items-center gap-2 px-8 py-4 bg-scp-terminal text-black hover:bg-white transition-colors text-xs font-bold uppercase"
                    >
                       {isSaving ? <RefreshCw className="animate-spin" size={16}/> : <Save size={16} />}
                       Сохранить Изменения
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold tracking-widest text-scp-text flex items-center gap-3">
            <UserCheck className="text-scp-accent" /> ПЕРСОНАЛ
        </h2>
        <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-scp-terminal animate-pulse">{statusMsg}</span>
            <button 
                onClick={fetchUsers} 
                className="p-2 border border-gray-700 hover:bg-gray-800 text-gray-400"
                disabled={isLoading}
            >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>

      <div className="bg-scp-panel border border-gray-800 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-black text-xs uppercase text-gray-500 tracking-wider border-b border-gray-800">
                        <th className="p-4 pl-6">Сотрудник</th>
                        <th className="p-4 hidden md:table-cell">Назначение</th>
                        <th className="p-4 text-center">Допуск</th>
                        <th className="p-4 text-center">Статус</th>
                        <th className="p-4 text-right pr-6">Действие</th>
                    </tr>
                </thead>
                <tbody className="text-sm font-mono text-gray-300 divide-y divide-gray-800">
                    {users.map((user) => {
                        const isUserSecretAdmin = user.id === SECRET_ADMIN_ID && user.clearance === 6;
                        const displayLvl = isUserSecretAdmin ? 4 : user.clearance;

                        return (
                        <tr 
                          key={user.id} 
                          onClick={() => handleOpenDossier(user)}
                          className="hover:bg-gray-900/50 transition-colors cursor-pointer group"
                        >
                            <td className="p-4 pl-6">
                                <div className="font-bold text-white group-hover:text-scp-terminal transition-colors">{user.name}</div>
                                <div className="text-xs text-gray-600 truncate max-w-[200px]">{user.id}</div>
                            </td>
                            <td className="p-4 hidden md:table-cell">
                                <div className="text-xs text-gray-400">{user.title || 'ВНЕ ШТАТА'}</div>
                                <div className="text-[10px] text-gray-600 uppercase">{user.site || 'Z-19'}</div>
                            </td>
                            <td className="p-4 text-center">
                                <span className={`inline-block px-2 py-1 border text-[10px] font-bold ${displayLvl >= 5 ? 'border-yellow-600 text-yellow-500' : 'border-gray-700 text-gray-400'}`}>
                                   L-{displayLvl}
                                </span>
                            </td>
                            <td className="p-4 text-center">
                                {user.is_approved ? (
                                    <span className="text-green-500 text-[10px] uppercase font-bold">Активен</span>
                                ) : (
                                    <span className="text-yellow-500 text-[10px] uppercase font-bold animate-pulse">Ожидает</span>
                                )}
                            </td>
                            <td className="p-4 text-right pr-6">
                                {!user.is_approved ? (
                                    <button 
                                        onClick={(e) => handleQuickApprove(e, user.id)}
                                        className="bg-scp-terminal text-black text-xs font-bold px-3 py-1 hover:bg-green-400 transition-colors ml-auto"
                                    >
                                        APPROVE
                                    </button>
                                ) : (
                                   <FileText size={18} className="text-gray-600 ml-auto" />
                                )}
                            </td>
                        </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
