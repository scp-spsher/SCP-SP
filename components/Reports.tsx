import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AlertTriangle, Send, FileText, Plus, Shield, Search, Trash2, RefreshCw, Lock, CheckCircle2, X, ShieldAlert, Crown, Image as ImageIcon, Camera, User } from 'lucide-react';
import { SCPReport, ReportType } from '../types';
import { StoredUser } from '../services/authService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const STORAGE_KEY = 'scp_net_reports_local';
const SECRET_ADMIN_ID = '36046d5d-dde4-4cf6-a2de-794334b7af5c';

interface ReportsProps {
  user: StoredUser;
  effectiveClearance: number; 
  onViewProfile?: (userId: string) => void;
}

const Reports: React.FC<ReportsProps> = ({ user, effectiveClearance, onViewProfile }) => {
  const [reports, setReports] = useState<SCPReport[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedReport, setSelectedReport] = useState<SCPReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{text: string, type: 'error' | 'success'} | null>(null);
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  // Image handling
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadReportImage = async (file: File): Promise<string | null> => {
    if (!isSupabaseConfigured()) return await fileToBase64(file);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `report-${Math.random().toString(36).substr(2, 9)}-${Date.now()}.${fileExt}`;
      
      // Пытаемся загрузить в Supabase, если падает - используем Base64
      const { data, error } = await supabase!.storage.from('avatars').upload(fileName, file);
      if (error) {
        console.warn("Supabase Storage Error, falling back to Base64:", error);
        return await fileToBase64(file);
      }
      
      const { data: publicData } = supabase!.storage.from('avatars').getPublicUrl(fileName);
      return publicData.publicUrl;
    } catch (e) {
      console.warn("Network Error (Failed to fetch), falling back to Base64:", e);
      return await fileToBase64(file);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    const target = e.target as any;
    
    let imageUrl = '';
    if (selectedImage) {
      imageUrl = await uploadReportImage(selectedImage) || '';
    }

    const newReport: SCPReport = {
      id: `REP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      author_id: user.id,
      author_name: user.name,
      author_clearance: user.clearance,
      type: target.type.value as ReportType,
      severity: target.severity.value,
      title: target.title.value,
      content: target.content.value,
      target_id: target.target_id.value || undefined,
      image_url: imageUrl || undefined,
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
      setStatusMessage({ text: 'РАПОРТ ОТПРАВЛЕН В АРХИВ', type: 'success' });
      
      // Reset state
      setSelectedImage(null);
      setImagePreview(null);
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
    return r.title.toLowerCase().includes(query) || r.id.toLowerCase().includes(query) || (r.author_name && r.author_name.toLowerCase().includes(query));
  });

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return 'text-red-500 border-red-500 bg-red-950/20';
      case 'HIGH': return 'text-orange-500 border-orange-500 bg-orange-950/20';
      case 'MEDIUM': return 'text-yellow-500 border-yellow-500 bg-yellow-950/20';
      default: return 'text-blue-400 border-blue-400 bg-blue-950/20';
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
              ОПЕРАТОР: {user.name} // ДОСТУП: L-{userPrivileges.displayLevel}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {view !== 'list' && (
            <button onClick={() => { setView('list'); setStatusMessage(null); }} className="px-4 py-2 border border-gray-700 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase">К списку</button>
          )}
          <button onClick={() => { setView('create'); setStatusMessage(null); }} className="flex items-center gap-2 px-4 py-2 bg-scp-accent text-white hover:bg-red-700 transition-colors text-xs font-bold uppercase">
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
                      <th className="p-4">Автор</th>
                      <th className="p-4 text-center">Уровень</th>
                      <th className="p-4 text-center">Угроза</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-mono text-gray-300 divide-y divide-gray-900">
                    {visibleReports.length > 0 ? visibleReports.map((report) => {
                      const authorLvl = (report.author_id === SECRET_ADMIN_ID && report.author_clearance === 6) ? 4 : report.author_clearance;
                      return (
                        <tr key={report.id} className="hover:bg-gray-900/50 transition-colors group cursor-default">
                          <td className="p-4 pl-6 cursor-pointer" onClick={() => { setSelectedReport(report); setView('detail'); }}>
                            <div className="text-xs font-bold text-gray-400 group-hover:text-scp-terminal">#{report.id}</div>
                            <div className="text-[9px] uppercase tracking-tighter text-blue-500">{report.type}</div>
                          </td>
                          <td className="p-4 cursor-pointer" onClick={() => { setSelectedReport(report); setView('detail'); }}>
                             <div className="font-bold">{report.title}</div>
                             <div className="text-[10px] text-gray-600 truncate max-w-[200px]">{report.target_id ? `ОБЪЕКТ: ${report.target_id}` : 'ОБЪЕКТ НЕ УКАЗАН'}</div>
                          </td>
                          <td className="p-4">
                              <button 
                                onClick={() => onViewProfile && onViewProfile(report.author_id)}
                                className="flex items-center gap-2 hover:text-scp-terminal transition-colors"
                              >
                                 <User size={12} className="text-gray-600" />
                                 <span className="underline decoration-dotted decoration-gray-700 hover:decoration-scp-terminal">{report.author_name || 'Неизвестен'}</span>
                              </button>
                          </td>
                          <td className="p-4 text-center">L-{authorLvl}</td>
                          <td className="p-4 text-center">
                             <span className={`text-[9px] px-2 py-0.5 border font-bold uppercase ${getSeverityColor(report.severity)}`}>
                               {report.severity}
                             </span>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-gray-600 italic">ЗАПИСЕЙ НЕ ОБНАРУЖЕНО</td>
                      </tr>
                    )}
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
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest">Категория</label>
                  <select name="type" className="w-full bg-black border border-gray-700 p-3 text-xs text-scp-terminal font-mono focus:outline-none focus:border-scp-terminal">
                    <option value="INCIDENT">НАРУШЕНИЕ УСЛОВИЙ</option>
                    <option value="OBSERVATION">НАБЛЮДЕНИЕ</option>
                    <option value="AUDIT">АУДИТ</option>
                    <option value="SECURITY">БЕЗОПАСНОСТЬ</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest">Уровень угрозы</label>
                  <select name="severity" className="w-full bg-black border border-gray-700 p-3 text-xs text-scp-terminal font-mono focus:outline-none focus:border-scp-terminal">
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest">Заголовок</label>
                <input name="title" required placeholder="ЗАГОЛОВОК РАПОРТА..." className="w-full bg-black border border-gray-700 p-3 text-sm text-scp-terminal font-mono focus:outline-none focus:border-scp-terminal" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest">Объект (НЕОБЯЗАТЕЛЬНО)</label>
                <input name="target_id" placeholder="SCP-####" className="w-full bg-black border border-gray-700 p-3 text-sm text-gray-400 font-mono focus:outline-none focus:border-scp-terminal" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest">Детали рапорта</label>
                <textarea name="content" required rows={6} placeholder="ПОДРОБНОЕ ОПИСАНИЕ ИНЦИДЕНТА/НАБЛЮДЕНИЯ..." className="w-full bg-black border border-gray-700 p-3 text-sm text-gray-300 font-mono focus:outline-none focus:border-scp-terminal" />
              </div>

              <div className="pt-2">
                <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                {!imagePreview ? (
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-white border border-dashed border-gray-700 p-4 w-full transition-all"
                  >
                    <ImageIcon size={16} /> ПРИКРЕПИТЬ ВИЗУАЛЬНЫЕ ДОКАЗАТЕЛЬСТВА (ФОТО)
                  </button>
                ) : (
                  <div className="relative border border-gray-700 p-2 bg-black">
                    <img src={imagePreview} className="max-h-48 mx-auto grayscale hover:grayscale-0 transition-all" />
                    <button 
                      type="button" 
                      onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full"
                    >
                      <X size={12} />
                    </button>
                    <div className="text-[9px] text-center text-gray-600 mt-2 font-mono uppercase tracking-widest">ПРЕДПРОСМОТР ВЛОЖЕНИЯ</div>
                  </div>
                )}
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-scp-accent hover:bg-red-700 py-4 text-white font-bold uppercase text-xs tracking-widest transition-all">
                {isSubmitting ? 'ПЕРЕДАЧА ДАННЫХ...' : 'ОТПРАВИТЬ РАПОРТ В КОМИТЕТ'}
              </button>
            </form>
          </div>
        )}

        {view === 'detail' && selectedReport && (
          <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="flex justify-between items-start border-b border-gray-800 pb-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 border ${getSeverityColor(selectedReport.severity)}`}>
                    {selectedReport.severity}
                  </span>
                  <span className="text-[10px] text-blue-500 font-mono font-bold">{selectedReport.type}</span>
                </div>
                <h1 className="text-3xl font-black text-white uppercase leading-tight">{selectedReport.title}</h1>
                <div className="text-[10px] text-gray-500 font-mono flex flex-wrap gap-x-4">
                  <span>ID: {selectedReport.id}</span>
                  <button onClick={() => onViewProfile && onViewProfile(selectedReport.author_id)} className="hover:text-scp-terminal underline decoration-dotted">АВТОР: {selectedReport.author_name}</button>
                  <span>{selectedReport.target_id ? `ОБЪЕКТ: ${selectedReport.target_id}` : 'ОБЪЕКТ НЕ УКАЗАН'}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-scp-accent border-2 border-scp-accent px-4 py-1">
                   L-{ (selectedReport.author_id === SECRET_ADMIN_ID && selectedReport.author_clearance === 6) ? 4 : selectedReport.author_clearance }
                </div>
              </div>
            </div>

            <div className="bg-black/50 p-6 border border-gray-800 font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
              {selectedReport.content}
            </div>

            {selectedReport.image_url && (
              <div className="space-y-2">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2">
                   <ImageIcon size={12} /> Визуальное доказательство #01
                </div>
                <div className="p-2 border border-gray-800 bg-black inline-block relative group">
                  <img src={selectedReport.image_url} alt="Evidence" className="max-h-[400px] grayscale hover:grayscale-0 transition-all cursor-crosshair" />
                  <div className="absolute inset-0 border-2 border-scp-accent/20 pointer-events-none"></div>
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[8px] px-1 font-bold">CONFIDENTIAL</div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-gray-800 flex justify-between items-center">
              {((user.id === selectedReport.author_id) || userPrivileges.isAdmin) ? (
                <div className="flex gap-4 items-center">
                  {!isConfirmingDelete ? (
                    <button onClick={() => setIsConfirmingDelete(true)} className="text-red-500 text-[10px] font-bold uppercase flex items-center gap-2 hover:bg-red-950/20 p-2 transition-all border border-transparent hover:border-red-900">
                      <Trash2 size={14}/> Удалить запись
                    </button>
                  ) : (
                    <div className="flex gap-2 items-center bg-red-950/20 p-2 border border-red-900 animate-in slide-in-from-left-2">
                      <span className="text-[10px] text-red-500 font-bold mr-2">ПОДТВЕРЖДАЕТЕ?</span>
                      <button onClick={() => executeDeletion(selectedReport.id)} className="bg-red-600 text-white px-3 py-1 text-[10px] font-bold">УНИЧТОЖИТЬ</button>
                      <button onClick={() => setIsConfirmingDelete(false)} className="text-gray-500 text-[10px] font-bold hover:text-white">ОТМЕНА</button>
                    </div>
                  )}
                </div>
              ) : <div className="text-[9px] text-gray-600 italic uppercase flex items-center gap-2"><Lock size={12}/> Заблокировано для редактирования</div>}
              <div className="text-[9px] text-gray-700 font-mono uppercase tracking-widest">
                РЕГИСТРАЦИЯ: {new Date(selectedReport.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
