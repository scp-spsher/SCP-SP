
import React, { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { 
  ShieldAlert, Check, X, RefreshCw, UserCheck, 
  AlertOctagon, FileText, Save, ArrowLeft, 
  Trash2, Database, User, Shield, EyeOff
} from 'lucide-react';
import { StoredUser, SESSION_KEY } from '../services/authService';
import { SecurityClearance, DEPARTMENTS } from '../types';
import { SCPLogo } from './SCPLogo';

const STORAGE_KEY = 'scp_net_users';
const SECRET_ADMIN_ID = '36046d5d-dde4-4cf6-a2de-794334b7af5c';

interface AdminUser {
  id: string;
  name: string;
  clearance: SecurityClearance;
  is_approved: boolean;
  registered_at: string;
  title?: string;
  department?: string;
  cover_department?: string;
  site?: string;
  avatar_url?: string;
}

interface AdminPanelProps {
  currentUser: StoredUser;
  onUserUpdate: (user: StoredUser) => void;
  onViewProfile: (userId: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onUserUpdate, onViewProfile }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isLocalMode, setIsLocalMode] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<AdminUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [terminatingId, setTerminatingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setStatusMsg('СИНХРОНИЗАЦИЯ...');

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase!
          .from('personnel')
          .select('*')
          .order('registered_at', { ascending: false });

        if (error) throw error;

        const fetchedUsers = (data || []).map(u => ({
          ...u,
          clearance: Number(u.clearance || 0) as SecurityClearance,
          name: String(u.name || 'Сотрудник')
        }));

        setUsers(fetchedUsers);
        setIsLocalMode(false);
        setStatusMsg('МЕЙНФРЕЙМ: ONLINE');
        
        const mappedForLocal = fetchedUsers.map(u => ({
          ...u,
          registeredAt: u.registered_at
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedForLocal));
      } catch (e) {
        console.error("Supabase fetch failed:", e);
        handleLocalFetch();
      }
    } else {
      handleLocalFetch();
    }
    setIsLoading(false);
  }, []);

  const handleLocalFetch = () => {
    setIsLocalMode(true);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed: any[] = JSON.parse(raw);
        setUsers(parsed.map(u => ({
          ...u,
          name: String(u.name || 'Сотрудник'),
          clearance: Number(u.clearance || 0) as SecurityClearance,
          registered_at: u.registeredAt || u.registered_at
        })));
        setStatusMsg('ЛОКАЛЬНЫЙ РЕЕСТР');
      } catch {
        setStatusMsg('ОШИБКА ДАННЫХ');
      }
    } else {
      setUsers([]);
      setStatusMsg('РЕЕСТР ПУСТ');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleTerminateUser = async (targetId: string) => {
    if (targetId === SECRET_ADMIN_ID) {
      setStatusMsg('ОШИБКА: ОБЪЕКТ ЗАЩИЩЕН О5');
      setTerminatingId(null);
      return;
    }

    setIsSaving(true);
    setStatusMsg('ТЕРМИНАЦИЯ...');

    try {
      if (!isLocalMode && isSupabaseConfigured()) {
        const { error } = await supabase!
          .from('personnel')
          .delete()
          .eq('id', targetId);
        
        if (error) throw error;
      }

      setUsers(prev => prev.filter(u => u.id !== targetId));

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: any[] = JSON.parse(raw);
        const filtered = parsed.filter(u => u.id !== targetId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }

      setStatusMsg('ОБЪЕКТ УСТРАНЕН');
      if (selectedUser?.id === targetId) {
        setSelectedUser(null);
        setEditForm(null);
      }
    } catch (e) {
      console.error(e);
      setStatusMsg('СБОЙ СИСТЕМЫ');
    } finally {
      setIsSaving(false);
      setTerminatingId(null);
    }
  };

  const handleQuickApprove = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setStatusMsg('ОДОБРЕНИЕ...');
    try {
      if (!isLocalMode && isSupabaseConfigured()) {
        await supabase!.from('personnel').update({ is_approved: true }).eq('id', userId);
      }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_approved: true } : u));
      
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: any[] = JSON.parse(raw);
        const updated = parsed.map(u => u.id === userId ? { ...u, is_approved: true } : u);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      
      setStatusMsg('ДОСТУП РАЗРЕШЕН');
    } catch {
      setStatusMsg('ОШИБКА');
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm) return;
    setIsSaving(true);
    setStatusMsg('СОХРАНЕНИЕ...');
    
    const sanitizedForm = {
      ...editForm,
      clearance: Number(editForm.clearance) as SecurityClearance,
      // Если не ОВБ, очищаем отдел прикрытия (или ставим равным основному)
      cover_department: editForm.department === 'ОВБ' ? editForm.cover_department : editForm.department
    };

    try {
      if (!isLocalMode && isSupabaseConfigured()) {
        const { error } = await supabase!.from('personnel').update(sanitizedForm).eq('id', editForm.id);
        if (error) throw error;
      }
      
      setUsers(prev => prev.map(u => u.id === editForm.id ? { ...sanitizedForm } : u));
      
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: any[] = JSON.parse(raw);
        const updated = parsed.map(u => u.id === editForm.id ? { ...u, ...sanitizedForm, registeredAt: u.registeredAt || sanitizedForm.registered_at } : u);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }

      setStatusMsg('ОБНОВЛЕНО');
      setSelectedUser(sanitizedForm);

      if (sanitizedForm.id === currentUser.id) {
        const updatedSelf: StoredUser = {
          ...currentUser,
          name: sanitizedForm.name,
          clearance: sanitizedForm.clearance,
          title: sanitizedForm.title,
          department: sanitizedForm.department,
          cover_department: sanitizedForm.cover_department,
          site: sanitizedForm.site,
          is_approved: sanitizedForm.is_approved,
          avatar_url: sanitizedForm.avatar_url || currentUser.avatar_url
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSelf));
        onUserUpdate(updatedSelf);
      }
    } catch (e) {
      console.error(e);
      setStatusMsg('СБОЙ ЗАПИСИ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDossier = (user: AdminUser) => {
    setSelectedUser(user);
    setEditForm({ ...user });
    setTerminatingId(null);
    setStatusMsg(`ПРОСМОТР: ${user.name}`);
  };

  if (selectedUser && editForm) {
    const isSecretAdmin = editForm.id === SECRET_ADMIN_ID;
    const isISD = editForm.department === 'ОВБ';

    return (
      <div className="flex flex-col h-full gap-6 animate-in slide-in-from-right-4 duration-300 font-mono text-scp-text">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <button onClick={() => setSelectedUser(null)} className="flex items-center gap-2 hover:text-white transition-colors py-2 px-4 border border-gray-800 bg-gray-950/50">
            <ArrowLeft size={18} /> НАЗАД К РЕЕСТРУ
          </button>
          <span className="text-xs animate-pulse text-scp-terminal uppercase tracking-widest">{statusMsg}</span>
        </div>
        
        <div className="bg-scp-panel border border-gray-800 p-8 overflow-y-auto shadow-2xl relative">
          <div className="absolute top-10 right-10 opacity-5 pointer-events-none">
              <SCPLogo className="w-48 h-48" />
          </div>

          <div className="max-w-2xl mx-auto space-y-8 relative z-10">
            <div className="flex flex-col md:flex-row gap-8 bg-black/60 p-8 border border-gray-700 shadow-lg">
               <div className="w-32 h-44 bg-gray-900 border border-gray-600 flex items-center justify-center shrink-0 relative">
                 {editForm.avatar_url ? <img src={editForm.avatar_url} className="w-full h-full object-cover grayscale" alt="Personnel" /> : <User size={48} className="text-gray-700" />}
                 <div className="absolute bottom-0 left-0 w-full h-1 bg-scp-terminal/30"></div>
               </div>
               <div className="flex-1 space-y-6">
                 <div>
                   <label className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 block">Идентификатор субъекта</label>
                   <input 
                    className="w-full bg-transparent text-2xl font-black border-b border-gray-800 focus:border-scp-terminal outline-none uppercase tracking-tighter"
                    value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                   />
                   <div className="text-[10px] text-gray-600 mt-1 font-mono">{editForm.id}</div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                   <div>
                     <label className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 block">Допуск в системе</label>
                     <select 
                      className="bg-black border border-gray-700 p-2 w-full text-scp-accent font-black text-lg focus:outline-none"
                      value={Number(editForm.clearance)}
                      onChange={e => setEditForm({...editForm, clearance: Number(e.target.value) as any})}
                     >
                       {[0,1,2,3,4,5,6].map(l => <option key={l} value={l}>УРОВЕНЬ {l}</option>)}
                     </select>
                   </div>
                   <div>
                     <label className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 block">Текущий статус</label>
                     <button 
                      onClick={() => setEditForm({...editForm, is_approved: !editForm.is_approved})}
                      className={`text-[10px] font-black p-2 border-2 w-full transition-colors uppercase tracking-widest ${editForm.is_approved ? 'border-green-600 text-green-500 bg-green-950/10' : 'border-red-900 text-red-500 bg-red-950/10'}`}
                     >
                       {editForm.is_approved ? 'АКТИВЕН' : 'ЗАБЛОКИРОВАН'}
                     </button>
                   </div>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                 <label className="text-[9px] text-gray-500 uppercase tracking-widest">Должность</label>
                 <input placeholder="НЕ УКАЗАНО" className="w-full bg-black border border-gray-800 p-3 text-sm focus:border-scp-terminal outline-none" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] text-gray-500 uppercase tracking-widest">Отдел (РЕАЛЬНЫЙ)</label>
                 <select 
                  className="w-full bg-black border border-gray-800 p-3 text-sm text-white focus:border-scp-terminal outline-none"
                  value={editForm.department || ''}
                  onChange={e => {
                    const dept = e.target.value;
                    setEditForm({
                      ...editForm, 
                      department: dept,
                      cover_department: dept === 'ОВБ' ? (editForm.cover_department || 'Служба Безопасности') : dept
                    });
                  }}
                 >
                   <option value="">НЕ УКАЗАНО</option>
                   {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
              </div>

              {isISD && (
                <div className="space-y-1 md:col-span-2 animate-in fade-in slide-in-from-top-2">
                   <label className="text-[9px] text-yellow-500 uppercase tracking-widest flex items-center gap-2 font-black">
                     <EyeOff size={10} /> Легенда ОВБ (Отдел прикрытия)
                   </label>
                   <select 
                    className="w-full bg-black border border-yellow-900/50 p-3 text-sm text-yellow-500/80 focus:border-yellow-500 outline-none"
                    value={editForm.cover_department || ''}
                    onChange={e => setEditForm({...editForm, cover_department: e.target.value})}
                   >
                     {DEPARTMENTS.filter(d => d !== 'ОВБ').map(d => <option key={d} value={d}>{d}</option>)}
                   </select>
                   <p className="text-[8px] text-gray-600 mt-1 uppercase">Этот отдел будет отображаться всем сотрудникам с допуском ниже 5 уровня.</p>
                </div>
              )}

              <div className="space-y-1 md:col-span-2">
                 <label className="text-[9px] text-gray-500 uppercase tracking-widest">Местоположение (Зона/Сайт)</label>
                 <input placeholder="Зона-19" className="w-full bg-black border border-gray-800 p-3 text-sm focus:border-scp-terminal outline-none" value={editForm.site || ''} onChange={e => setEditForm({...editForm, site: e.target.value})} />
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between pt-8 border-t border-gray-800 gap-4">
              <div className="relative">
                {terminatingId === editForm.id ? (
                  <div className="flex items-center gap-3 bg-red-950/30 border-2 border-red-900 p-3 animate-in slide-in-from-left-2 shadow-lg">
                    <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">ТЕРМИНИРОВАТЬ?</span>
                    <button 
                       onClick={() => handleTerminateUser(editForm.id)} 
                       className="bg-red-600 text-white px-4 py-2 text-[10px] font-bold hover:bg-white hover:text-black transition-all uppercase"
                    >
                       ПОДТВЕРДИТЬ
                    </button>
                    <button onClick={() => setTerminatingId(null)} className="text-gray-500 hover:text-white p-2">
                       <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setTerminatingId(editForm.id)}
                    disabled={isSaving || isSecretAdmin}
                    className="flex items-center gap-2 px-6 py-4 border-2 border-red-900 text-red-500 hover:bg-red-900 hover:text-white transition-all text-xs font-black uppercase tracking-widest disabled:opacity-10"
                  >
                    <Trash2 size={16} /> УДАЛИТЬ ИЗ РЕЕСТРА
                  </button>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                   onClick={() => setSelectedUser(null)}
                   className="px-6 py-4 border border-gray-700 text-gray-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                >
                   ОТМЕНА
                </button>
                <button 
                   onClick={handleSaveProfile}
                   disabled={isSaving}
                   className="flex items-center gap-3 px-10 py-4 bg-scp-terminal text-black font-black hover:bg-white transition-all text-xs uppercase shadow-[0_0_20px_rgba(51,255,51,0.2)]"
                >
                   {isSaving ? <RefreshCw className="animate-spin" size={16}/> : <Save size={16} />} СОХРАНИТЬ ДАННЫЕ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 font-mono">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold tracking-[0.2em] text-scp-text flex items-center gap-4 uppercase">
            <UserCheck className="text-scp-accent" size={28} /> РЕЕСТР ПЕРСОНАЛА
        </h2>
        <div className="flex items-center gap-6">
            <span className="text-[10px] font-mono text-scp-terminal animate-pulse uppercase tracking-widest">{statusMsg}</span>
            <button 
                onClick={fetchUsers} 
                className="p-3 border border-gray-800 hover:bg-gray-900 text-gray-500 hover:text-scp-terminal transition-all"
                disabled={isLoading}
                title="Принудительная синхронизация"
            >
                <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>

      <div className="bg-scp-panel border border-gray-800 flex-1 overflow-hidden flex flex-col shadow-2xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-black/80 text-[10px] uppercase text-gray-500 tracking-widest border-b border-gray-800">
                        <th className="p-5 pl-8">Сотрудник / ID</th>
                        <th className="p-5 hidden md:table-cell">Назначение</th>
                        <th className="p-5 text-center">Уровень</th>
                        <th className="p-5 text-center">Статус</th>
                        <th className="p-5 text-right pr-8">Действия</th>
                    </tr>
                </thead>
                <tbody className="text-sm font-mono text-gray-300 divide-y divide-gray-800/50">
                    {users.map((user) => {
                        const isSecretAdmin = user.id === SECRET_ADMIN_ID;
                        const isCurrentTerminating = terminatingId === user.id;
                        const isISD = user.department === 'ОВБ';

                        return (
                        <tr 
                          key={user.id} 
                          className={`hover:bg-white/5 transition-all group ${isCurrentTerminating ? 'bg-red-950/10' : ''}`}
                        >
                            <td className="p-5 pl-8">
                                <button 
                                    onClick={() => onViewProfile && onViewProfile(user.id)}
                                    className="font-bold text-white hover:text-scp-terminal transition-colors text-left block uppercase tracking-tight flex items-center gap-2"
                                >
                                    {String(user.name)}
                                    {isISD && <Shield size={10} className="text-red-500 animate-pulse" />}
                                </button>
                                <div className="text-[9px] text-gray-600 font-mono mt-1 opacity-60 tracking-tighter">{String(user.id)}</div>
                            </td>
                            <td className="p-5 hidden md:table-cell cursor-pointer" onClick={() => handleOpenDossier(user)}>
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wide">{String(user.title || 'ВНЕ ШТАТА')}</div>
                                <div className="text-[9px] text-gray-600 uppercase mt-1 tracking-widest">
                                  {isISD ? <span className="text-red-900 font-black">ОВБ [MASKED]</span> : String(user.department || 'GEN')} // {String(user.site || 'Z-19')}
                                </div>
                            </td>
                            <td className="p-5 text-center cursor-pointer" onClick={() => handleOpenDossier(user)}>
                                <span className={`inline-block px-3 py-1 border-2 text-[10px] font-black tracking-widest ${Number(user.clearance) >= 5 ? 'border-yellow-600 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'border-gray-800 text-gray-500'}`}>
                                   L-{Number(user.clearance)}
                                </span>
                            </td>
                            <td className="p-5 text-center cursor-pointer" onClick={() => handleOpenDossier(user)}>
                                {user.is_approved ? (
                                    <span className="text-green-500 text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-1">
                                       <Check size={12} /> АКТИВЕН
                                    </span>
                                ) : (
                                    <span className="text-yellow-600 text-[10px] uppercase font-black tracking-widest animate-pulse flex items-center justify-center gap-1">
                                       <AlertOctagon size={12} /> ОЖИДАЕТ
                                    </span>
                                )}
                            </td>
                            <td className="p-5 text-right pr-8">
                                <div className="flex items-center justify-end gap-4">
                                    {isCurrentTerminating ? (
                                      <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                                         <button onClick={() => handleTerminateUser(user.id)} className="bg-red-600 text-white text-[9px] font-bold px-3 py-1 uppercase shadow-md">Да</button>
                                         <button onClick={() => setTerminatingId(null)} className="text-gray-500 hover:text-white p-1 transition-colors"><X size={14}/></button>
                                      </div>
                                    ) : (
                                      <>
                                        {!user.is_approved ? (
                                          <button 
                                              onClick={(e) => handleQuickApprove(e, user.id)}
                                              className="bg-scp-terminal text-black text-[9px] font-black px-4 py-1 hover:bg-white transition-all uppercase tracking-widest shadow-lg shadow-green-900/20"
                                          >
                                              ADMIT
                                          </button>
                                        ) : (
                                           <button onClick={() => handleOpenDossier(user)} className="p-2 text-gray-600 hover:text-scp-terminal transition-all hover:bg-white/10 rounded">
                                                <FileText size={18} />
                                           </button>
                                        )}
                                        {!isSecretAdmin && (
                                           <button 
                                             onClick={(e) => { e.stopPropagation(); setTerminatingId(user.id); }}
                                             className="p-2 text-gray-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 hover:bg-red-950/20 rounded"
                                             title="Удалить из реестра"
                                           >
                                             <Trash2 size={18} />
                                           </button>
                                        )}
                                      </>
                                    )}
                                </div>
                            </td>
                        </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
        {users.length === 0 && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-700 py-24 gap-4 opacity-30">
             <Database size={80} />
             <p className="tracking-[0.5em] text-xs font-black uppercase">Центральный реестр персонала пуст</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
