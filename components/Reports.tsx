import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AlertTriangle, Send, FileText, Plus, Shield, Search, Trash2, RefreshCw, Lock, CheckCircle2, X, ShieldAlert, Crown } from 'lucide-react';
import { SCPReport, ReportType } from '../types';
import { StoredUser } from '../services/authService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const STORAGE_KEY = 'scp_net_reports_local';
const SECRET_ADMIN_ID = '36046d5d-dde4-4cf6-a2de-794334b7af5c';

interface ReportsProps {
  user: StoredUser;
  effectiveClearance: number; 
}

const Reports: React.FC<ReportsProps> = ({ user, effectiveClearance }) => {
  const [reports, setReports] = useState<SCPReport[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedReport, setSelectedReport] = useState<SCPReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{text: string, type: 'error' | 'success'} | null>(null);
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  const hasInitialFetched = useRef(false);

  const userPrivileges = useMemo(() => {
    const currentLevel = typeof effectiveClearance === 'number' ? effectiveClearance : (Number(effectiveClearance) || 1);
    const accountLevel = typeof user?.clearance === 'number' ? user.clearance : (Number(user?.clearance) || 1);
    
    const realLevel = Math.max(currentLevel, accountLevel);
    const isActuallyAdmin = realLevel >= 5 || user?.isSuperAdmin === true;
    const isActuallyOmni = realLevel === 6 || user?.isSuperAdmin === true;

    // ТАЙНАЯ ЛОГИКА МАСКИРОВКИ
    const displayLevel = (user?.id === SECRET_ADMIN_ID && realLevel === 6) ? 4 : realLevel;
    
    return {
      isAdmin: isActuallyAdmin,
      isOmni: isActuallyOmni,
      level: realLevel,
      displayLevel: displayLevel
    };
  }, [effectiveClearance, user]);

  const fetchReports = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setStatusMessage(null);
    
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase!
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setReports(data || []);
        setUsingLocalFallback(false);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data || []));
      } catch (e: any) {
        setUsingLocalFallback(true);
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setReports(JSON.parse(raw));
      } finally {
        setIsLoading(false);
      }
    } else {
      setUsingLocalFallback(true);
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setReports(JSON.parse(raw));
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!hasInitialFetched.current && user) {
      fetchReports();
      hasInitialFetched.current = true;
    }
  }, [fetchReports, user]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    const target = e.target as any;
    
    const newReport: SCPReport = {
      id: `REP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      author_id: user.id,
      author_name: user.name,
      author_clearance: user.clearance,
      type: target.type.value as ReportType,
      severity: target.severity.value,
      title: target.title.value,
      content: target.content.value,
      created_at: new Date().toISOString(),
      is_archived: false
    };

    try {
      if (isSupabaseConfigured() && !usingLocalFallback) {
        const { error } = await supabase!.from('reports').insert([newReport]);
        if (error) throw error;
      }
      const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newReport, ...local]));
      setReports(prev => [newReport, ...prev]);
      setStatusMessage({ text: 'РАПОРТ ОТПРАВЛЕН', type: 'success' });
      setTimeout(() => setView('list'), 1000);
    } catch (err: any) {
      setStatusMessage({ text: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDeletion = async (reportId: string) => {
    try {
      if (isSupabaseConfigured() && !usingLocalFallback) {
        const { data, error } = await supabase!.from('reports').delete().eq('id', reportId).select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error("SECURITY_VIOLATION: ОТКАЗ СЕРВЕРА");
      }
      setReports(prev => prev.filter(r => r.id !== reportId));
      const localRaw = localStorage.getItem(STORAGE_KEY);
      if (localRaw) {
        const local = JSON.parse(localRaw);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(local.filter((r: any) => r.id !== reportId)));
      }
      setSelectedReport(null);
      setView('list');
      setStatusMessage({ text: 'ЗАПИСЬ ТЕРМИНИРОВАНА', type: 'success' });
    } catch (e: any) {
      setStatusMessage({ text: e.message.toUpperCase(), type: 'error' });
    } finally {
      setIsConfirmingDelete(false);
    }
  };

  const visibleReports = reports.filter(r => {
    if (user.id === r.author_id) return true;
    if (userPrivileges.isOmni) return true;
    if (userPrivileges.level < r.author_clearance) return false;
    const query = searchTerm.toLowerCase();
    return r.title.toLowerCase().includes(query) || r.id.toLowerCase().includes(query);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-widest text-scp-text flex items-center gap-3 uppercase">
            <FileText className="text-scp-accent" /> Система отчетности
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Shield size={12} className="text-scp-terminal" />
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              ОПЕРАТОР: {user.name} // ДОСТУП: L-{userPrivileges.displayLevel}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {view !== 'list' && (
            <button onClick={() => setView('list')} className="px-4 py-2 border border-gray-700 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase">К списку</button>
          )}
          <button onClick={() => setView('create')} className="flex items-center gap-2 px-4 py-2 bg-scp-accent text-white hover:bg-red-700 transition-colors text-xs font-bold uppercase">
            <Plus size={16} /> Новый рапорт
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 border font-mono text-xs flex items-center justify-between ${statusMessage.type === 'success' ? 'bg-green-900/20 border-green-500 text-green-500' : 'bg-red-900/20 border-red-500 text-red-500'}`}>
          <div className="flex items-center gap-3">
            {statusMessage.type === 'success' ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>}
            {statusMessage.text}
          </div>
          <button onClick={() => setStatusMessage(null)} className="opacity-50 hover:opacity-100 uppercase font-bold">Закрыть</button>
        </div>
      )}

      <div className="bg-scp-panel border border-gray-800 min-h-[500px] flex flex-col relative overflow-hidden">
        {view === 'list' && (
          <>
            <div className="p-4 border-b border-gray-800 bg-black/30 relative">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="ПОИСК..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black border border-gray-800 p-3 pl-10 text-sm text-scp-terminal focus:border-scp-terminal focus:outline-none font-mono"
              />
            </div>
            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-32"><RefreshCw className="animate-spin text-scp-terminal" size={32} /></div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase text-gray-500 border-b border-gray-800 bg-black/50">
                      <th className="p-4 pl-6">ID / Тип</th>
                      <th className="p-4">Заголовок</th>
                      <th className="p-4 text-center">Допуск</th>
                      <th className="p-4 text-center">Угроза</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-mono text-gray-300 divide-y divide-gray-900">
                    {visibleReports.map((report) => (
                      <tr key={report.id} onClick={() => { setSelectedReport(report); setView('detail'); }} className="hover:bg-gray-900/50 transition-colors cursor-pointer">
                        <td className="p-4 pl-6">
                          <div className="text-xs font-bold text-gray-400">#{report.id}</div>
                        </td>
                        <td className="p-4">{report.title}</td>
                        <td className="p-4 text-center">L-{report.author_clearance}</td>
                        <td className="p-4 text-center">{report.severity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {view === 'create' && (
          <div className="p-8 max-w-3xl mx-auto w-full">
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <select name="type" className="bg-black border border-gray-700 p-3 text-xs text-scp-terminal font-mono">
                  <option value="INCIDENT">НАРУШЕНИЕ</option>
                  <option value="OBSERVATION">НАБЛЮДЕНИЕ</option>
                </select>
                <select name="severity" className="bg-black border border-gray-700 p-3 text-xs text-scp-terminal font-mono">
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
              <input name="title" required placeholder="ЗАГОЛОВОК..." className="w-full bg-black border border-gray-700 p-3 text-sm text-scp-terminal font-mono" />
              <textarea name="content" required rows={6} placeholder="ДЕТАЛИ..." className="w-full bg-black border border-gray-700 p-3 text-sm text-scp-terminal font-mono" />
              <button type="submit" disabled={isSubmitting} className="w-full bg-scp-accent py-4 text-white font-bold uppercase text-xs">
                {isSubmitting ? 'ОТПРАВКА...' : 'ОТПРАВИТЬ'}
              </button>
            </form>
          </div>
        )}

        {view === 'detail' && selectedReport && (
          <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="flex justify-between items-start border-b border-gray-800 pb-4">
              <div>
                <h1 className="text-2xl font-black text-white uppercase">{selectedReport.title}</h1>
                <p className="text-[10px] text-gray-500 font-mono">ID: {selectedReport.id} // АВТОР: {selectedReport.author_name}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-scp-accent">
                   L-{selectedReport.author_id === SECRET_ADMIN_ID && userPrivileges.isOmni ? userPrivileges.displayLevel : selectedReport.author_clearance}
                </div>
              </div>
            </div>
            <div className="bg-black/50 p-6 border border-gray-800 font-mono text-sm text-gray-300 whitespace-pre-wrap">{selectedReport.content}</div>
            <div className="pt-6 border-t border-gray-800 flex justify-between items-center">
              {((user.id === selectedReport.author_id) || userPrivileges.isAdmin) ? (
                <div className="flex gap-4 items-center">
                  {!isConfirmingDelete ? (
                    <button onClick={() => setIsConfirmingDelete(true)} className="text-red-500 text-[10px] font-bold uppercase flex items-center gap-2"><Trash2 size={14}/> Удалить</button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => executeDeletion(selectedReport.id)} className="bg-red-600 text-white px-3 py-1 text-[10px] font-bold">ДА</button>
                      <button onClick={() => setIsConfirmingDelete(false)} className="text-gray-500 text-[10px] font-bold">НЕТ</button>
                    </div>
                  )}
                </div>
              ) : <div className="text-[9px] text-gray-600 italic uppercase"><Lock size={12}/> Заблокировано</div>}
              <div className="text-[9px] text-gray-700 font-mono">DATE: {new Date(selectedReport.created_at).toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
