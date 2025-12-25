import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { ShieldAlert, Check, X, RefreshCw, UserCheck, AlertOctagon, FileText, Save, ArrowLeft, Trash2, Briefcase, MapPin, Hash, User, Database, Copy, Terminal } from 'lucide-react';
import { StoredUser } from '../services/authService';

const STORAGE_KEY = 'scp_net_users';

interface AdminPanelProps {
  currentUser: StoredUser | null;
}

interface AdminUser {
  id: string;
  name: string;
  clearance: number;
  is_approved: boolean;
  registered_at: string;
  title?: string;
  department?: string;
  site?: string;
  avatar_url?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [rlsErrorType, setRlsErrorType] = useState<boolean>(false);
  const [isLocalMode, setIsLocalMode] = useState(false);
  
  // State for Detail View
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<AdminUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setRlsErrorType(false);
    setStatusMsg('СИНХРОНИЗАЦИЯ...');

    // 1. Try Remote Fetch
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase!
                .from('personnel')
                .select('*')
                .order('registered_at', { ascending: false });

            if (error) {
                console.error("Admin Fetch Error (Remote):", error);
                // Fallback to local if permission denied or error
                handleLocalFetch();
                if (error.code === '42501' || error.code === '42P17') {
                   setStatusMsg('РЕЖИМ ОГРАНИЧЕННОЙ ФУНКЦИОНАЛЬНОСТИ (ЛОКАЛЬНО)');
                }
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
              // Map StoredUser to AdminUser format
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
              // Sort by date desc
              mapped.sort((a, b) => new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime());
              setUsers(mapped);
              setStatusMsg('ЛОКАЛЬНЫЙ РЕЕСТР ЗАГРУЖЕН');
          } else {
              setUsers([]);
              setStatusMsg('ЛОКАЛЬНЫЙ РЕЕСТР ПУСТ');
          }
      } catch (e) {
          setStatusMsg('КРИТИЧЕСКИЙ СБОЙ ПАМЯТИ');
      }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // -- ACTIONS --

  const handleOpenDossier = (user: AdminUser) => {
    setSelectedUser(user);
    setEditForm({ ...user }); // Clone for editing
    setStatusMsg(`ДОСЬЕ ОТКРЫТО: ${user.name}`);
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
              // Merge updates
              parsed[idx] = { 
                  ...parsed[idx], 
                  ...updatedUser as any, 
                  // Handle mapping back specific fields if needed
                  registeredAt: updatedUser.registered_at || parsed[idx].registeredAt 
              };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
              handleLocalFetch(); // Refresh UI
              return true;
          }
      }
      return false;
  };

  const handleQuickApprove = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation(); 
    setStatusMsg('АВТОРИЗАЦИЯ...');
    setRlsErrorType(false);

    if (!isLocalMode && isSupabaseConfigured()) {
        const { data, error } = await supabase!
        .from('personnel')
        .update({ is_approved: true })
        .eq('id', userId)
        .select();

        if (error) {
            console.error("Remote Approve Error:", error);
            const localSuccess = updateLocalUser({ is_approved: true }, userId);
            
            if (localSuccess) {
                 setStatusMsg('ПОДТВЕРЖДЕНО ЛОКАЛЬНО (СБОЙ СИНХРОНИЗАЦИИ)');
            } else {
                 handleError(error);
            }
        } else {
            setStatusMsg('ПОЛЬЗОВАТЕЛЬ ОДОБРЕН');
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_approved: true } : u));
        }
    } else {
        // Local Mode
        updateLocalUser({ is_approved: true }, userId);
        setStatusMsg('ПОЛЬЗОВАТЕЛЬ ОДОБРЕН (ЛОКАЛЬНО)');
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm) return;
    setIsSaving(true);
    setStatusMsg('СОХРАНЕНИЕ...');
    setRlsErrorType(false);

    const updates = {
      name: editForm.name,
      clearance: editForm.clearance,
      title: editForm.title,
      department: editForm.department,
      site: editForm.site,
      is_approved: editForm.is_approved
    };

    if (!isLocalMode && isSupabaseConfigured()) {
        const { data, error } = await supabase!
        .from('personnel')
        .update(updates)
        .eq('id', editForm.id)
        .select();

        if (error) {
             const localSuccess = updateLocalUser(updates, editForm.id);
             if (localSuccess) {
                 setStatusMsg('СОХРАНЕНО ЛОКАЛЬНО (СБОЙ СИНХРОНИЗАЦИИ)');
                 setSelectedUser({ ...editForm });
             } else {
                 handleError(error);
             }
        } else {
            setStatusMsg('ДОСЬЕ ОБНОВЛЕНО');
            setUsers(prev => prev.map(u => u.id === editForm.id ? { ...u, ...updates } : u));
            setSelectedUser({ ...editForm });
        }
    } else {
        updateLocalUser(updates, editForm.id);
        setStatusMsg('ДОСЬЕ ОБНОВЛЕНО (ЛОКАЛЬНО)');
        setSelectedUser({ ...editForm });
    }
    setIsSaving(false);
  };

  const handleTerminateUser = async () => {
    if (!editForm || !window.confirm('ВНИМАНИЕ: ЭТО ДЕЙСТВИЕ НЕОБРАТИМО. ТЕРМИНИРОВАТЬ СОТРУДНИКА?')) return;
    
    setIsSaving(true);
    setStatusMsg('ТЕРМИНАЦИЯ...');
    setRlsErrorType(false);

    if (!isLocalMode && isSupabaseConfigured()) {
        const { error } = await supabase!
        .from('personnel')
        .delete()
        .eq('id', editForm.id);

        if (error) {
            handleError(error);
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
        setStatusMsg('СОТРУДНИК УСТРАНЕН (ЛОКАЛЬНО)');
        handleCloseDossier();
    }
    setIsSaving(false);
  };

  const handleError = (error: any) => {
      console.error("Operation Error:", error);
      if (error?.code === '42P17' || error?.code === '42501') {
         setStatusMsg('ОШИБКА: RLS БЛОКИРОВКА (НЕТ ПРАВ)');
         setRlsErrorType(true);
      } else {
         setStatusMsg(`ОШИБКА: ${error.message || 'СБОЙ'}`);
      }
  };

  const copySqlToClipboard = () => {
    const sql = `CREATE POLICY "Level 5+ Update Personnel" ON personnel FOR UPDATE TO authenticated USING ((SELECT clearance FROM personnel WHERE id = auth.uid()) >= 5);`;
    navigator.clipboard.writeText(sql);
    alert('SQL скопирован в буфер обмена. Выполните его в Supabase SQL Editor.');
  };

  // -- RENDER HELPERS --

  if (selectedUser && editForm) {
    return (
      <div className="flex flex-col h-full gap-6 animate-in slide-in-from-right-4 duration-300">
        {/* HEADER */}
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
             {isLocalMode && <span className="text-[10px] bg-yellow-900/20 text-yellow-500 border border-yellow-900 px-2 py-1">LOCAL MODE</span>}
             <span className="text-xs font-mono text-scp-terminal animate-pulse">{statusMsg}</span>
          </div>
        </div>

        {/* RLS ERROR BLOCK */}
        {rlsErrorType && (
            <div className="bg-red-900/20 border border-red-500 p-4 mb-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-red-500 font-bold uppercase text-sm">
                    <AlertOctagon size={16} /> Ошибка прав доступа (RLS Policy)
                </div>
                <p className="text-xs text-gray-400">
                    База данных отклонила запрос. Ваш уровень допуска в приложении (5) не подтвержден политикой безопасности БД.
                </p>
                <div className="bg-black p-3 border border-gray-700 font-mono text-[10px] text-scp-terminal relative group">
                    <code className="block whitespace-pre-wrap">
                        CREATE POLICY "Level 5+ Update Personnel" ON personnel FOR UPDATE TO authenticated USING ((SELECT clearance FROM personnel WHERE id = auth.uid()) &gt;= 5);
                    </code>
                    <button 
                        onClick={copySqlToClipboard}
                        className="absolute top-2 right-2 bg-gray-800 hover:bg-white hover:text-black p-1 transition-colors"
                        title="Скопировать SQL"
                    >
                        <Copy size={12} />
                    </button>
                </div>
            </div>
        )}

        {/* DOSSIER FORM */}
        <div className="flex-1 overflow-y-auto bg-scp-panel border border-gray-800 p-8 relative">
           {/* Watermark */}
           <div className="absolute top-10 right-10 opacity-5 pointer-events-none">
              <ShieldAlert size={200} />
           </div>

           <div className="max-w-3xl mx-auto space-y-8 relative z-10">
              
              {/* STATUS HEADER */}
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
                    <label className="text-[10px] text-gray-500 uppercase block mb-1">Уровень Допуска</label>
                    <select 
                        value={editForm.clearance}
                        onChange={(e) => handleFormChange('clearance', Number(e.target.value))}
                        className="bg-black border border-scp-accent text-scp-accent text-xl font-bold p-2 text-right focus:outline-none cursor-pointer"
                    >
                        <option value={1}>УРОВЕНЬ 1</option>
                        <option value={2}>УРОВЕНЬ 2</option>
                        <option value={3}>УРОВЕНЬ 3</option>
                        <option value={4}>УРОВЕНЬ 4</option>
                        <option value={5}>УРОВЕНЬ 5</option>
                        <option value={6}>OMNI</option>
                    </select>
                 </div>
              </div>

              {/* MAIN FIELDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs uppercase text-gray-500 tracking-wider flex items-center gap-2">
                       <User size={12} /> Полное Имя
                    </label>
                    <input 
                      type="text" 
                      value={editForm.name} 
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full bg-black border border-gray-700 p-3 text-white focus:border-scp-text focus:outline-none font-mono"
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-xs uppercase text-gray-500 tracking-wider flex items-center gap-2">
                       <Briefcase size={12} /> Должность / Звание
                    </label>
                    <input 
                      type="text" 
                      value={editForm.title || ''} 
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      placeholder="напр. Старший Исследователь"
                      className="w-full bg-black border border-gray-700 p-3 text-white focus:border-scp-text focus:outline-none font-mono"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs uppercase text-gray-500 tracking-wider flex items-center gap-2">
                       <Hash size={12} /> Отдел
                    </label>
                    <input 
                      type="text" 
                      value={editForm.department || ''} 
                      onChange={(e) => handleFormChange('department', e.target.value)}
                      placeholder="напр. Отдел Меметики"
                      className="w-full bg-black border border-gray-700 p-3 text-white focus:border-scp-text focus:outline-none font-mono"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs uppercase text-gray-500 tracking-wider flex items-center gap-2">
                       <MapPin size={12} /> Местонахождение
                    </label>
                    <input 
                      type="text" 
                      value={editForm.site || ''} 
                      onChange={(e) => handleFormChange('site', e.target.value)}
                      placeholder="напр. Зона-19"
                      className="w-full bg-black border border-gray-700 p-3 text-white focus:border-scp-text focus:outline-none font-mono"
                    />
                 </div>
              </div>

              <div className="h-px bg-gray-800 w-full my-6"></div>

              {/* ADMINISTRATIVE ACTIONS */}
              <div className="space-y-4">
                 <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Административные Действия</h4>
                 <div className="flex items-center gap-4">
                    <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-700 bg-black/30 hover:bg-black/50 transition-colors flex-1">
                       <input 
                          type="checkbox" 
                          checked={editForm.is_approved} 
                          onChange={(e) => handleFormChange('is_approved', e.target.checked)}
                          className="w-5 h-5 accent-green-500"
                       />
                       <span className={`text-sm font-bold ${editForm.is_approved ? 'text-green-500' : 'text-gray-500'}`}>
                          СТАТУС: {editForm.is_approved ? 'АКТИВЕН' : 'ОЖИДАЕТ ПОДТВЕРЖДЕНИЯ'}
                       </span>
                    </label>
                 </div>
              </div>

              {/* FOOTER BUTTONS */}
              <div className="flex items-center justify-between pt-8">
                 <button 
                    onClick={handleTerminateUser}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-4 bg-red-900/10 border border-red-900 text-red-500 hover:bg-red-900 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
                 >
                    <Trash2 size={16} /> Терминировать
                 </button>

                 <div className="flex gap-4">
                    <button 
                       onClick={handleCloseDossier}
                       className="px-6 py-4 border border-gray-700 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                       Отмена
                    </button>
                    <button 
                       onClick={handleSaveProfile}
                       disabled={isSaving}
                       className="flex items-center gap-2 px-8 py-4 bg-scp-terminal text-black hover:bg-white transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                       {isSaving ? <RefreshCw className="animate-spin" size={16}/> : <Save size={16} />}
                       Сохранить Досье
                    </button>
                 </div>
              </div>

           </div>
        </div>
      </div>
    );
  }

  // DEFAULT LIST VIEW
  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold tracking-widest text-scp-text flex items-center gap-3">
            <UserCheck className="text-scp-accent" /> УПРАВЛЕНИЕ ПЕРСОНАЛОМ
        </h2>
        <div className="flex items-center gap-4">
            {isLocalMode ? (
                <div className="flex items-center gap-2 px-2 py-1 bg-yellow-900/20 border border-yellow-800 rounded">
                    <Database size={12} className="text-yellow-500" />
                    <span className="text-[10px] text-yellow-500 font-bold">ОФФЛАЙН РЕЖИМ</span>
                </div>
            ) : (
                <div className="flex items-center gap-2 px-2 py-1 bg-green-900/20 border border-green-800 rounded">
                    <Database size={12} className="text-green-500" />
                    <span className="text-[10px] text-green-500 font-bold">БД ПОДКЛЮЧЕНА</span>
                </div>
            )}
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
        {rlsErrorType && (
            <div className="p-4 bg-red-900/20 border-b border-red-500/50 flex flex-col items-center justify-center text-center animate-in slide-in-from-top-4">
                <div className="flex items-center gap-2 text-red-500 font-bold uppercase text-sm mb-2">
                    <AlertOctagon size={16} /> Блокировка безопасности (RLS Policy)
                </div>
                <p className="text-gray-300 text-xs max-w-lg mb-3">
                   Требуется обновление политик базы данных для разрешения редактирования сотрудникам 5 уровня.
                </p>
                <div className="bg-black p-3 border border-gray-700 font-mono text-[10px] text-scp-terminal relative w-full max-w-xl text-left">
                    <div className="absolute -top-3 left-2 bg-gray-900 text-gray-400 px-1 text-[9px] uppercase">SQL Fix</div>
                    <code className="block whitespace-pre-wrap">
                        CREATE POLICY "Level 5+ Update Personnel" ON personnel FOR UPDATE TO authenticated USING ((SELECT clearance FROM personnel WHERE id = auth.uid()) &gt;= 5);
                    </code>
                    <button 
                        onClick={copySqlToClipboard}
                        className="absolute top-2 right-2 bg-gray-800 hover:bg-white hover:text-black p-1 transition-colors rounded"
                        title="Скопировать"
                    >
                        <Copy size={12} />
                    </button>
                </div>
            </div>
        )}

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-black text-xs uppercase text-gray-500 tracking-wider border-b border-gray-800">
                        <th className="p-4 pl-6">Сотрудник</th>
                        <th className="p-4 hidden md:table-cell">Назначение</th>
                        <th className="p-4 text-center">Допуск</th>
                        <th className="p-4 text-center">Статус</th>
                        <th className="p-4 text-right pr-6">Действия</th>
                    </tr>
                </thead>
                <tbody className="text-sm font-mono text-gray-300 divide-y divide-gray-800">
                    {users.map((user) => (
                        <tr 
                          key={user.id} 
                          onClick={() => handleOpenDossier(user)}
                          className="hover:bg-gray-900/50 transition-colors cursor-pointer group"
                        >
                            <td className="p-4 pl-6">
                                <div className="font-bold text-white group-hover:text-scp-terminal transition-colors">{user.name}</div>
                                <div className="text-xs text-gray-600 font-mono tracking-tighter truncate max-w-[200px]">{user.id}</div>
                            </td>
                            <td className="p-4 hidden md:table-cell">
                                <div className="text-xs text-gray-400">{user.title || 'Не назначено'}</div>
                                <div className="text-[10px] text-gray-600 uppercase">{user.site || 'Неизвестно'}</div>
                            </td>
                            <td className="p-4 text-center">
                                <span className={`inline-block px-2 py-1 border text-[10px] font-bold ${user.clearance >= 5 ? 'border-yellow-600 text-yellow-500' : 'border-gray-700 text-gray-400'}`}>
                                   LVL {user.clearance}
                                </span>
                            </td>
                            <td className="p-4 text-center">
                                {user.is_approved ? (
                                    <span className="inline-flex items-center px-2 py-1 bg-green-900/20 text-green-500 text-[10px] uppercase font-bold border border-green-900">
                                        Активен
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-1 bg-yellow-900/20 text-yellow-500 text-[10px] uppercase font-bold border border-yellow-900 animate-pulse">
                                        Ожидает
                                    </span>
                                )}
                            </td>
                            <td className="p-4 text-right pr-6">
                                {!user.is_approved ? (
                                    <button 
                                        onClick={(e) => handleQuickApprove(e, user.id)}
                                        className="bg-scp-terminal text-black text-xs font-bold px-3 py-1 hover:bg-green-400 transition-colors flex items-center gap-1 ml-auto"
                                    >
                                        <Check size={12} /> APPROVE
                                    </button>
                                ) : (
                                   <button className="text-gray-600 hover:text-white transition-colors">
                                      <FileText size={18} />
                                   </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && !isLoading && !rlsErrorType && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-600 italic">
                                Реестр персонала пуст.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
