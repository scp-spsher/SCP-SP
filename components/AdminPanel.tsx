import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { ShieldAlert, Check, X, RefreshCw, UserCheck, AlertOctagon } from 'lucide-react';
import { SecurityClearance } from '../types';

interface AdminUser {
  id: string;
  name: string;
  clearance: number;
  is_approved: boolean;
  registered_at: string;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [rlsErrorType, setRlsErrorType] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!isSupabaseConfigured()) {
        setStatusMsg('ОШИБКА: НЕТ СОЕДИНЕНИЯ С БД');
        return;
    }
    
    setIsLoading(true);
    setRlsErrorType(null);
    try {
      const { data, error } = await supabase!
        .from('personnel')
        .select('*')
        .order('registered_at', { ascending: false });

      if (error) {
        console.error("Admin Fetch Error:", JSON.stringify(error, null, 2));
        if (error.code === '42P17') {
           setRlsErrorType('RECURSION');
           setStatusMsg('КРИТИЧЕСКАЯ ОШИБКА RLS (42P17)');
        } else if (error.code === '42501') {
           setRlsErrorType('PERMISSION');
           setStatusMsg('ОШИБКА ДОСТУПА (42501)');
        } else {
           setStatusMsg(`ОШИБКА: ${error.code}`);
        }
      } else {
        setUsers(data || []);
      }
    } catch (e) {
      console.error("Admin Unexpected Error:", e);
      setStatusMsg('СБОЙ СИСТЕМЫ');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    setStatusMsg('ОБРАБОТКА...');
    
    // We use .select() to confirm the row was actually returned (updated)
    const { data, error } = await supabase!
      .from('personnel')
      .update({ is_approved: true })
      .eq('id', userId)
      .select();

    if (error) {
      console.error("Approve Error:", JSON.stringify(error, null, 2));
      setStatusMsg(`ОШИБКА: ${error.message}`);
    } else if (!data || data.length === 0) {
      // If no data returned, RLS likely silently ignored the update because the user doesn't satisfy the USING clause of the policy
      console.error("Approve Error: 0 rows updated. Check RLS Policy.");
      setStatusMsg('ОШИБКА: RLS ЗАБЛОКИРОВАЛ ОБНОВЛЕНИЕ');
      setRlsErrorType('UPDATE_BLOCK');
    } else {
      setStatusMsg('ПОЛЬЗОВАТЕЛЬ ОДОБРЕН');
      // Optimistic Update
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_approved: true } : u));
    }
  };

  const handleUpdateClearance = async (userId: string, newLevel: number) => {
    setStatusMsg('ОБНОВЛЕНИЕ ДОПУСКА...');
    const { data, error } = await supabase!
      .from('personnel')
      .update({ clearance: newLevel })
      .eq('id', userId)
      .select();

    if (error) {
      console.error("Clearance Update Error:", JSON.stringify(error, null, 2));
      setStatusMsg(`ОШИБКА: ${error.message}`);
    } else if (!data || data.length === 0) {
       setStatusMsg('ОШИБКА: RLS ЗАБЛОКИРОВАЛ ОБНОВЛЕНИЕ');
       setRlsErrorType('UPDATE_BLOCK');
    } else {
      setStatusMsg('УРОВЕНЬ ДОПУСКА ОБНОВЛЕН');
      // Optimistic Update
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, clearance: newLevel } : u));
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold tracking-widest text-scp-text flex items-center gap-3">
            <UserCheck className="text-scp-accent" /> УПРАВЛЕНИЕ ПЕРСОНАЛОМ
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
        {rlsErrorType && (
            <div className="p-6 bg-red-900/20 border-b border-red-500/50 flex flex-col items-center justify-center text-center animate-in slide-in-from-top-4">
                <AlertOctagon size={48} className="text-red-500 mb-4" />
                <h3 className="text-red-500 font-bold text-lg mb-2">
                   {rlsErrorType === 'RECURSION' ? 'БЕСКОНЕЧНАЯ РЕКУРСИЯ (CODE 42P17)' : 
                    rlsErrorType === 'PERMISSION' ? 'НЕТ ПРАВ НА ЧТЕНИЕ (CODE 42501)' : 
                    'НЕТ ПРАВ НА ИЗМЕНЕНИЕ (RLS BLOCKED UPDATE)'}
                </h3>
                <p className="text-gray-300 text-sm max-w-lg mb-4">
                    {rlsErrorType === 'RECURSION' 
                       ? 'Ваши политики безопасности (RLS) вызывают бесконечный цикл.' 
                       : rlsErrorType === 'PERMISSION' 
                       ? 'Политики RLS запрещают чтение списка пользователей.'
                       : 'Операция выполнена без ошибок, но данные не изменились. Это значит, что политика RLS для команды UPDATE не позволяет вам изменять эти записи.'}
                </p>
                <div className="bg-black p-4 border border-gray-700 text-left w-full max-w-xl">
                    <p className="text-xs text-gray-500 mb-1">// Решение в SQL Editor Supabase:</p>
                    
                    {rlsErrorType === 'UPDATE_BLOCK' ? (
                         <code className="text-xs text-scp-terminal font-mono block whitespace-pre-wrap">
                            -- Разрешить пользователям обновлять записи (или только админам)
                            CREATE POLICY "Enable update for all" ON personnel FOR UPDATE USING (true);
                        </code>
                    ) : (
                        <code className="text-xs text-scp-terminal font-mono block whitespace-pre-wrap">
                            -- Разрешить чтение всем авторизованным
                            CREATE POLICY "Enable read for authenticated" ON "public"."personnel" FOR SELECT USING (auth.role() = 'authenticated');
                        </code>
                    )}
                </div>
            </div>
        )}

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-black text-xs uppercase text-gray-500 tracking-wider border-b border-gray-800">
                        <th className="p-4">Имя / ID</th>
                        <th className="p-4">Дата регистрации</th>
                        <th className="p-4 text-center">Допуск</th>
                        <th className="p-4 text-center">Статус</th>
                        <th className="p-4 text-right">Действия</th>
                    </tr>
                </thead>
                <tbody className="text-sm font-mono text-gray-300 divide-y divide-gray-800">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-900/50 transition-colors">
                            <td className="p-4">
                                <div className="font-bold text-white">{user.name}</div>
                                <div className="text-xs text-gray-600 font-mono tracking-tighter truncate max-w-[200px]">{user.id}</div>
                            </td>
                            <td className="p-4 text-gray-500 text-xs">
                                {new Date(user.registered_at).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-center">
                                <select 
                                    value={user.clearance}
                                    onChange={(e) => handleUpdateClearance(user.id, Number(e.target.value))}
                                    className="bg-black border border-gray-700 text-xs p-1 text-center focus:border-scp-accent focus:outline-none cursor-pointer"
                                >
                                    <option value={1}>LVL 1</option>
                                    <option value={2}>LVL 2</option>
                                    <option value={3}>LVL 3</option>
                                    <option value={4}>LVL 4</option>
                                    <option value={5}>LVL 5</option>
                                    <option value={6}>OMNI</option>
                                </select>
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
                            <td className="p-4 text-right">
                                {!user.is_approved && (
                                    <button 
                                        onClick={() => handleApprove(user.id)}
                                        className="bg-scp-terminal text-black text-xs font-bold px-3 py-1 hover:bg-green-400 transition-colors flex items-center gap-1 ml-auto"
                                    >
                                        <Check size={12} /> APPROVE
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && !isLoading && !rlsErrorType && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-600 italic">
                                База данных персонала пуста или недоступна.
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
