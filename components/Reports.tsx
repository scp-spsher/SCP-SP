import React, { useState, useEffect } from 'react';
import { AlertTriangle, Send, FileText, Plus, Shield, Search, Eye, Filter, Trash2, Archive, RefreshCw, Lock } from 'lucide-react';
import { SCPReport, ReportType, SecurityClearance } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { StoredUser, authService } from '../services/authService';

const STORAGE_KEY = 'scp_net_reports_local';

const Reports: React.FC = () => {
  const [reports, setReports] = useState<SCPReport[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedReport, setSelectedReport] = useState<SCPReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(authService.getSession());
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchReports = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      try {
        // SQL Policy на бэкенде сама отфильтрует то, что нам нельзя видеть,
        // но для надежности мы запрашиваем всё доступное.
        const { data, error } = await supabase!
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setReports(data || []);
      } catch (e) {
        loadLocalReports();
      }
    } else {
      loadLocalReports();
    }
    setIsLoading(false);
  };

  const loadLocalReports = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      setReports(JSON.parse(raw));
    }
  };

  useEffect(() => {
    fetchReports();
    // Обновляем данные пользователя при входе на страницу
    const refresh = async () => {
      const fresh = await authService.refreshSession();
      if (fresh) setCurrentUser(fresh);
    };
    refresh();
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    type: 'INCIDENT' as ReportType,
    severity: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    content: '',
    target_id: ''
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);

    const newReport: SCPReport = {
      id: `REP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      author_id: currentUser.id,
      author_name: currentUser.name,
      author_clearance: currentUser.clearance,
      type: formData.type,
      title: formData.title,
      content: formData.content,
      target_id: formData.target_id,
      severity: formData.severity,
      created_at: new Date().toISOString(),
      is_archived: false
    };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase!.from('reports').insert([newReport]);
        if (error) throw error;
      } catch (e) {
        saveLocalReport(newReport);
      }
    } else {
      saveLocalReport(newReport);
    }

    setFormData({ title: '', type: 'INCIDENT', severity: 'LOW', content: '', target_id: '' });
    setView('list');
    fetchReports();
    setIsSubmitting(false);
  };

  const saveLocalReport = (report: SCPReport) => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify([report, ...existing]));
  };

  // ЛОГИКА ДОСТУПА: Пользователь видит отчет, только если его допуск >= допуска автора отчета
  const visibleReports = reports.filter(r => {
    const userLvl = currentUser?.clearance || 1;
    const hasAccess = userLvl >= r.author_clearance;
    
    if (!hasAccess) return false;

    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.author_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
            <FileText className="text-scp-accent" /> Архивы рапортов
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Shield size={12} className="text-scp-terminal" />
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Ваш допуск: Уровень {currentUser?.clearance || 1} // Доступны файлы уровня {currentUser?.clearance || 1} и ниже
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {view !== 'list' && (
            <button 
              onClick={() => setView('list')}
              className="px-4 py-2 border border-gray-700 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase"
            >
              К списку
            </button>
          )}
          <button 
            onClick={() => setView('create')}
            className="flex items-center gap-2 px-4 py-2 bg-scp-accent text-white hover:bg-red-700 transition-colors text-xs font-bold uppercase"
          >
            <Plus size={16} /> Подать рапорт
          </button>
        </div>
      </div>

      {view === 'list' && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="ПОИСК ПО БАЗЕ ДАННЫХ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-scp-panel border border-gray-800 p-3 pl-10 text-sm text-scp-terminal focus:border-scp-terminal focus:outline-none font-mono"
          />
        </div>
      )}

      <div className="bg-scp-panel border border-gray-800 min-h-[500px] relative">
        {view === 'list' && (
          <div className="flex flex-col h-full">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
                <RefreshCw className="animate-spin text-scp-terminal" size={32} />
                <span className="text-xs font-mono">ДЕШИФРОВКА ПОТОКА...</span>
              </div>
            ) : visibleReports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black text-[10px] uppercase text-gray-500 tracking-wider border-b border-gray-800">
                      <th className="p-4 pl-6">Шифр / Тип</th>
                      <th className="p-4">Заголовок</th>
                      <th className="p-4">Составитель</th>
                      <th className="p-4 text-center">Допуск</th>
                      <th className="p-4 text-center">Приоритет</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-mono text-gray-300 divide-y divide-gray-900">
                    {visibleReports.map((report) => (
                      <tr 
                        key={report.id}
                        onClick={() => { setSelectedReport(report); setView('detail'); }}
                        className="hover:bg-gray-900/50 transition-colors cursor-pointer group"
                      >
                        <td className="p-4 pl-6">
                          <div className="text-xs font-bold group-hover:text-scp-terminal">#{report.id}</div>
                          <div className="text-[9px] uppercase tracking-tighter text-blue-400">{getTypeLabel(report.type)}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-gray-200 truncate max-w-[250px]">{report.title}</div>
                          {report.target_id && <div className="text-[10px] text-gray-600">ОБЪЕКТ: {report.target_id}</div>}
                        </td>
                        <td className="p-4 text-xs text-gray-400">
                          {report.author_name}
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-[10px] px-1.5 py-0.5 border border-gray-700 bg-black text-gray-500">L-{report.author_clearance}</span>
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
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-700 grayscale opacity-40">
                <Lock size={48} className="mb-4" />
                <p className="tracking-widest text-xs uppercase">Нет доступных записей для вашего уровня</p>
              </div>
            )}
          </div>
        )}

        {view === 'create' && (
          <div className="p-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-scp-text mb-6 uppercase tracking-widest border-b border-gray-800 pb-2">Формирование нового рапорта</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest">Категория события</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as ReportType})}
                    className="w-full bg-black border border-gray-700 p-3 text-sm text-gray-300 focus:border-scp-terminal focus:outline-none font-mono"
                  >
                    <option value="INCIDENT">Нарушение условий (Incident)</option>
                    <option value="OBSERVATION">Научное наблюдение (Observation)</option>
                    <option value="AUDIT">Проверка безопасности (Audit)</option>
                    <option value="REQUEST">Запрос ресурсов (Request)</option>
                    <option value="SECURITY">Контрразведка (Security)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest">Приоритет обработки</label>
                  <select 
                    value={formData.severity}
                    onChange={(e) => setFormData({...formData, severity: e.target.value as any})}
                    className="w-full bg-black border border-gray-700 p-3 text-sm text-gray-300 focus:border-scp-terminal focus:outline-none font-mono"
                  >
                    <option value="LOW">LOW - Плановый</option>
                    <option value="MEDIUM">MEDIUM - Важный</option>
                    <option value="HIGH">HIGH - Срочный</option>
                    <option value="CRITICAL">CRITICAL - Немедленно</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest">Краткий заголовок</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Прим: Потеря визуального контакта с объектом..."
                  className="w-full bg-black border border-gray-700 p-3 text-sm text-scp-terminal focus:border-scp-terminal focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest">Связанная аномалия (SCP-####)</label>
                <input 
                  type="text" 
                  value={formData.target_id}
                  onChange={(e) => setFormData({...formData, target_id: e.target.value})}
                  placeholder="SCP-001"
                  className="w-full bg-black border border-gray-700 p-3 text-sm text-gray-300 focus:border-scp-terminal focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest">Детальный протокол</label>
                <textarea 
                  required
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Опишите хронологию событий, принятые меры и рекомендации..."
                  className="w-full bg-black border border-gray-700 p-4 text-sm text-gray-300 focus:border-scp-terminal focus:outline-none font-mono leading-relaxed"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-scp-accent hover:bg-red-700 text-white font-bold py-4 flex items-center justify-center gap-2 uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw className="animate-spin" size={18}/> : <><Send size={18} /> Отправить в архив</>}
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
                <div className="text-xs text-gray-500 font-mono">
                  АРХИВНЫЙ КОД: {selectedReport.id} // ШТАМП ВРЕМЕНИ: {new Date(selectedReport.created_at).toLocaleString()}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] text-gray-500 uppercase mb-1">СЕКРЕТНОСТЬ</div>
                <div className="text-2xl font-black text-scp-accent border-2 border-scp-accent px-4 py-1">
                  LVL-{selectedReport.author_clearance}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-800 pb-1">Содержание протокола</h4>
                  <div className="text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-wrap bg-black/40 p-6 border border-gray-800/50 shadow-inner">
                    {selectedReport.content}
                  </div>
                </div>
                
                {selectedReport.target_id && (
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-900/10 flex items-center gap-4">
                    <Shield size={24} className="text-blue-500" />
                    <div>
                      <h4 className="text-[10px] text-blue-400 uppercase font-bold">Объект интереса</h4>
                      <p className="font-mono text-white text-lg">{selectedReport.target_id}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="p-4 border border-gray-800 bg-black/50">
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Сотрудник</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-900 border border-gray-700 flex items-center justify-center">
                      <Eye size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white uppercase">{selectedReport.author_name}</div>
                      <div className="text-[9px] text-gray-500 tracking-tighter">ID: {selectedReport.author_id.substr(0,8)}...</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-800 bg-black/50 space-y-3">
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Верификация</h4>
                  <div className="text-[9px] text-green-500 font-mono flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    ПОДПИСЬ ПОДТВЕРЖДЕНА
                  </div>
                  <button className="w-full flex items-center gap-2 p-2 text-[10px] text-gray-500 hover:text-white hover:bg-gray-800 transition-colors uppercase font-bold">
                    <Archive size={12} /> Печать в PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
