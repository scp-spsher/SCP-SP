import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, Send, FileText, Plus, Shield, Search, Eye, Trash2, Archive, RefreshCw, Lock, CheckCircle2, Database, WifiOff, X } from 'lucide-react';
import { SCPReport, ReportType } from '../types';
import { StoredUser } from '../services/authService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const STORAGE_KEY = 'scp_net_reports_local';

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

  // Загрузка локальных данных
  const loadLocalReports = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const localData = JSON.parse(raw);
        setReports(localData);
        setUsingLocalFallback(true);
        return localData;
      }
    } catch (e) {
      console.error("Local load error", e);
    }
    setReports([]);
    return [];
  }, []);

  // Загрузка данных из БД
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
        console.warn("Sync Issue:", e.message);
        setUsingLocalFallback(true);
        loadLocalReports();
      } finally {
        setIsLoading(false);
      }
    } else {
      setUsingLocalFallback(true);
      loadLocalReports();
      setIsLoading(false);
    }
  }, [user, loadLocalReports]);

  useEffect(() => {
    if (!hasInitialFetched.current && user) {
      fetchReports();
      hasInitialFetched.current = true;
    }
  }, [fetchReports, user]);

  const [formData, setFormData] = useState({
    title: '',
    type: 'INCIDENT' as ReportType,
    severity: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    content: '',
    target_id: ''
  });

  const saveToBoth = async (report: SCPReport) => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const updated = [report, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured() && !usingLocalFallback) {
      try {
        const { error } = await supabase!.from('reports').insert([report]);
        if (error) throw error;
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setStatusMessage(null);

    const newReport: SCPReport = {
      id: `REP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      author_id: user.id,
      author_name: user.name,
      author_clearance: user.clearance,
      type: formData.type,
      title: formData.title,
      content: formData.content,
      target_id: formData.target_id,
      severity: formData.severity,
      created_at: new Date().toISOString(),
      is_archived: false
    };

    try {
      const savedToDb = await saveToBoth(newReport);
      setReports(prev => [newReport, ...prev]);
      setStatusMessage({ 
        text: savedToDb ? 'РАПОРТ ПЕРЕДАН В ЦЕНТРАЛЬНЫЙ АРХИВ' : 'РАПОРТ СОХРАНЕН ЛОКАЛЬНО (СБОЙ СЕТИ)', 
        type: 'success' 
      });
      setTimeout(() => {
        setFormData({ title: '', type: 'INCIDENT', severity: 'LOW', content: '', target_id: '' });
        setView('list');
        setStatusMessage(null);
      }, 1500);
    } catch (err: any) {
      setStatusMessage({ text: `СБОЙ ЗАПИСИ: ${err.message}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDeletion = async (reportId: string) => {
    console.log("[TERMINAL] Удаление объекта:", reportId);
    
    // Мгновенно обновляем интерфейс для скорости
    const backupReports = [...reports];
    setReports(prev => prev.filter(r => r.id !== reportId));
    setSelectedReport(null);
    setView('list');
    setIsConfirmingDelete(false);
    setStatusMessage({ text: 'УДАЛЕНИЕ ИЗ БАЗЫ ДАННЫХ...', type: 'success' });

    try {
      let dbError = null;
      
      // 1. Попытка удаления из Supabase
      if (isSupabaseConfigured() && !usingLocalFallback) {
        const { error } = await supabase!
          .from('reports')
          .delete()
          .eq('id', reportId);
        
        if (error) dbError = error;
      }

      if (dbError) {
        // Если ошибка в правах (RLS)
        if (dbError.code === '42501') {
          throw new Error("ОТКАЗАНО В ДОСТУПЕ. НЕДОСТАТОЧНО ПРАВ НА УДАЛЕНИЕ В БД.");
        }
        throw dbError;
      }

      // 2. Очистка локального кэша
      const localRaw = localStorage.getItem(STORAGE_KEY);
      if (localRaw) {
        const local = JSON.parse(localRaw);
        const filtered = local.filter((r: any) => r.id !== reportId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }

      setStatusMessage({ text: 'ОБЪЕКТ УДАЛЕН ИЗ ЦЕНТРАЛЬНОГО РЕЕСТРА', type: 'success' });
      setTimeout(() => setStatusMessage(null), 3000);

    } catch (e: any) {
      console.error("[TERMINAL] Сбой удаления:", e.message);
      // Возвращаем данные, если удаление не удалось
      setReports(backupReports);
      setStatusMessage({ text: `СБОЙ: ${e.message.toUpperCase()}`, type: 'error' });
    }
  };

  // ФИЛЬТРАЦИЯ ПО УРОВНЮ ДОПУСКА
  const visibleReports = reports.filter(r => {
    if (!user) return false;
    
    // 1. Автор всегда видит свой отчет
    if (user.id === r.author_id) return true;
    
    // 2. Если текущий уровень (в т.ч. симуляция) ниже уровня рапорта - скрываем
    if (effectiveClearance < r.author_clearance) return false;
    
    // 3. Поиск
    const query = searchTerm.toLowerCase();
    return r.title.toLowerCase().includes(query) || 
           r.id.toLowerCase().includes(query) ||
           r.author_name.toLowerCase().includes(query);
  });

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return 'text-red-500 border-red-500 bg-red-950/20';
      case 'HIGH': return 'text-orange-500 border-orange-500 bg-orange-950/20';
      case 'MEDIUM': return 'text-yellow-500 border-yellow-500 bg-yellow-950/20';
      default: return 'text-blue-400 border-blue-400 bg-blue-950/20';
    }
  };

  const getTypeLabel = (type: ReportType) => {
    switch (type) {
      case 'INCIDENT': return 'НАРУШЕНИЕ';
      case 'OBSERVATION': return 'НАБЛЮДЕНИЕ';
      case 'AUDIT': return 'АУДИТ ЗОНЫ';
      case 'REQUEST': return 'ЗАПРОС';
      case 'SECURITY': return 'БЕЗОПАСНОСТЬ';
      default: return type;
    }
  };

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
              ОПЕРАТОР: {user.name} // ТЕКУЩИЙ ДОСТУП: L-{effectiveClearance} // {usingLocalFallback ? 'OFFLINE' : 'ONLINE'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {view !== 'list' && (
            <button 
              onClick={() => { setView('list'); setStatusMessage(null); setIsConfirmingDelete(false); }}
              className="px-4 py-2 border border-gray-700 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase"
            >
              К списку
            </button>
          )}
          <button 
            onClick={() => { setView('create'); setStatusMessage(null); setIsConfirmingDelete(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-scp-accent text-white hover:bg-red-700 transition-colors text-xs font-bold uppercase shadow-[0_0_15px_rgba(211,47,47,0.3)]"
          >
            <Plus size={16} /> Новый рапорт
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 border font-mono text-xs flex items-center justify-between animate-in slide-in-from-top-2 z-50 ${
          statusMessage.type === 'success' ? 'bg-green-900/20 border-green-500 text-green-500' : 'bg-red-900/20 border-red-500 text-red-500'
        }`}>
          <div className="flex items-center gap-3">
            {statusMessage.type === 'success' ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>}
            {statusMessage.text}
          </div>
          <button onClick={() => setStatusMessage(null)} className="opacity-50 hover:opacity-100 uppercase font-bold">Закрыть</button>
        </div>
      )}

      <div className="bg-scp-panel border border-gray-800 min-h-[500px] relative overflow-hidden flex flex-col">
        {view === 'list' && (
          <>
            <div className="p-4 border-b border-gray-800 bg-black/30 relative">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="ПОИСК ПО ИДЕНТИФИКАТОРУ, ЗАГОЛОВКУ ИЛИ АВТОРУ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black border border-gray-800 p-3 pl-10 text-sm text-scp-terminal focus:border-scp-terminal focus:outline-none font-mono"
              />
            </div>

            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-4 py-32">
                  <RefreshCw className="animate-spin text-scp-terminal" size={32} />
                  <span className="text-xs font-mono tracking-widest text-gray-500 uppercase">Синхронизация данных...</span>
                </div>
              ) : visibleReports.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase text-gray-500 tracking-wider border-b border-gray-800 bg-black/50">
                      <th className="p-4 pl-6">ID / Тип</th>
                      <th className="p-4">Заголовок</th>
                      <th className="p-4 text-center">Допуск</th>
                      <th className="p-4 text-center">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-mono text-gray-300 divide-y divide-gray-900">
                    {visibleReports.map((report) => (
                      <tr 
                        key={report.id}
                        onClick={() => { setSelectedReport(report); setView('detail'); setIsConfirmingDelete(false); }}
                        className="hover:bg-gray-900/50 transition-colors cursor-pointer group"
                      >
                        <td className="p-4 pl-6">
                          <div className="text-xs font-bold text-gray-400 group-hover:text-scp-terminal transition-colors">#{report.id}</div>
                          <div className="text-[9px] uppercase tracking-tighter text-blue-500">{getTypeLabel(report.type)}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-gray-200 truncate max-w-[280px]">{report.title}</div>
                          <div className="text-[10px] text-gray-600">{report.author_name}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-[10px] px-1.5 py-0.5 border border-gray-700 bg-black text-gray-400">L-{report.author_clearance}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`text-[9px] px-2 py-0.5 border font-bold uppercase ${getSeverityColor(report.severity)}`}>
                            {report.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-gray-700">
                  <Lock size={64} className="mb-4 opacity-20" />
                  <p className="tracking-[0.3em] text-xs uppercase font-bold">Рапортов не найдено</p>
                  <p className="text-[9px] mt-2 opacity-50 uppercase tracking-widest text-center">Убедитесь, что ваш уровень допуска достаточен<br/>для просмотра скрытых записей</p>
                  <button onClick={fetchReports} className="mt-6 text-[10px] border border-gray-800 px-4 py-2 hover:bg-gray-800 uppercase font-bold transition-all">Обновить реестр</button>
                </div>
              )}
            </div>
          </>
        )}

        {view === 'create' && (
          <div className="p-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-scp-text mb-6 uppercase tracking-widest border-b border-gray-800 pb-2 flex items-center gap-2">
              <Plus size={20} className="text-scp-accent" /> Создать протокол
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest">Категория</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as ReportType})}
                    className="w-full bg-black border border-gray-700 p-3 text-sm text-gray-300 focus:border-scp-terminal focus:outline-none font-mono"
                  >
                    <option value="INCIDENT">Нарушение условий</option>
                    <option value="OBSERVATION">Наблюдение</option>
                    <option value="AUDIT">Аудит</option>
                    <option value="REQUEST">Запрос</option>
                    <option value="SECURITY">Безопасность</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest">Приоритет</label>
                  <select 
                    value={formData.severity}
                    onChange={(e) => setFormData({...formData, severity: e.target.value as any})}
                    className="w-full bg-black border border-gray-700 p-3 text-sm text-gray-300 focus:border-scp-terminal focus:outline-none font-mono"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <input 
                required
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Заголовок рапорта..."
                className="w-full bg-black border border-gray-700 p-3 text-sm text-scp-terminal focus:border-scp-terminal focus:outline-none font-mono"
              />

              <input 
                type="text" 
                value={formData.target_id}
                onChange={(e) => setFormData({...formData, target_id: e.target.value})}
                placeholder="Объект (напр. SCP-173)..."
                className="w-full bg-black border border-gray-700 p-3 text-sm text-gray-300 focus:border-scp-terminal focus:outline-none font-mono"
              />

              <textarea 
                required
                rows={8}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Детализированный отчет..."
                className="w-full bg-black border border-gray-700 p-4 text-sm text-gray-300 focus:border-scp-terminal focus:outline-none font-mono leading-relaxed"
              />

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-scp-accent hover:bg-red-700 text-white font-bold py-4 flex items-center justify-center gap-2 uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw className="animate-spin" size={18}/> : <><Send size={18} /> Передать в архив</>}
              </button>
            </form>
          </div>
        )}

        {view === 'detail' && selectedReport && (
          <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
            <div className="border-b-2 border-scp-text pb-6 flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-[10px] font-bold border uppercase ${getSeverityColor(selectedReport.severity)}`}>
                    {selectedReport.severity}
                  </span>
                  <span className="text-blue-400 text-xs font-bold tracking-widest">{getTypeLabel(selectedReport.type)}</span>
                </div>
                <h1 className="text-3xl font-black uppercase text-white leading-tight">{selectedReport.title}</h1>
                <p className="text-xs text-gray-500 font-mono">АВТОР: {selectedReport.author_name} // {new Date(selectedReport.created_at).toLocaleString()}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-black text-scp-accent border-2 border-scp-accent px-4 py-1">
                  LVL-{selectedReport.author_clearance}
                </div>
              </div>
            </div>

            <div className="bg-black/40 p-6 border border-gray-800 font-mono text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {selectedReport.content}
            </div>

            {/* ПАНЕЛЬ УДАЛЕНИЯ */}
            <div className="pt-8 border-t border-gray-800">
              {user && (effectiveClearance >= 5 || user.id === selectedReport.author_id) ? (
                <div className="flex gap-4">
                  {!isConfirmingDelete ? (
                    <button 
                      onClick={() => setIsConfirmingDelete(true)}
                      className="flex items-center gap-2 p-3 text-[10px] text-red-500 hover:bg-red-900/20 transition-all uppercase font-bold border border-red-900/30"
                    >
                      <Trash2 size={14} /> Удалить запись
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3 animate-in slide-in-from-left-2 w-full">
                      <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                        <AlertTriangle size={12} /> Подтвердите необратимую операцию удаления рапорта #{selectedReport.id}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => executeDeletion(selectedReport.id)}
                          className="flex items-center gap-2 p-3 text-[10px] bg-red-600 text-white hover:bg-red-700 transition-colors uppercase font-bold border border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                        >
                          <CheckCircle2 size={14} /> УДАЛИТЬ НАВСЕГДА
                        </button>
                        <button 
                          onClick={() => setIsConfirmingDelete(false)}
                          className="flex items-center gap-2 p-3 text-[10px] text-gray-400 hover:bg-gray-800 transition-colors uppercase font-bold border border-gray-700"
                        >
                          <X size={14} /> ОТМЕНИТЬ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[10px] text-gray-700 font-mono uppercase tracking-widest italic">
                  Вы не являетесь автором данного рапорта. Доступ к управлению записью ограничен.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
