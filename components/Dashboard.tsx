
import React, { useEffect, useState } from 'react';
import { AlertTriangle, Lock, Radio, Activity, Users, Skull, ClipboardList, Plus, Trash2, RefreshCw, Megaphone, Newspaper, Send, X, ShieldAlert, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { SCPTask, TaskPriority, TaskStatus, DEPARTMENTS, SCPNews } from '../types';
import { StoredUser } from '../services/authService';

interface DashboardProps {
  currentClearance: number;
  currentUser: StoredUser;
}

const statusData = [
  { time: '00:00', level: 98.4 },
  { time: '04:00', level: 98.2 },
  { time: '08:00', level: 98.5 },
  { time: '12:00', level: 99.1 },
  { time: '16:00', level: 98.8 },
  { time: '20:00', level: 98.3 },
];

const incidentData = [
  { time: 'Пн', value: 2 },
  { time: 'Вт', value: 5 },
  { time: 'Ср', value: 1 },
  { time: 'Чт', value: 0 },
  { time: 'Пт', value: 8 },
  { time: 'Сб', value: 3 },
  { time: 'Вс', value: 1 },
];

const Dashboard: React.FC<DashboardProps> = ({ currentClearance, currentUser }) => {
  const [personnelCount, setPersonnelCount] = useState<number | string>(4102);
  const [dbStatus, setDbStatus] = useState<string>('OFFLINE');
  const [tasks, setTasks] = useState<SCPTask[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  
  // News State
  const [news, setNews] = useState<SCPNews[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isPublishingNews, setIsPublishingNews] = useState(false);
  const [newNews, setNewNews] = useState({ title: '', content: '', priority: 'NORMAL' as any });

  // Tasks Create State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    assigned_department: DEPARTMENTS[0], 
    priority: 'MEDIUM' as TaskPriority 
  });

  const isHighLevelView = currentClearance >= 5;
  const isAdminService = currentUser.department === 'Административная служба' || isHighLevelView;

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchDashboardData();
      fetchTasks();
      fetchNews();
    }
  }, [currentClearance, currentUser.id]);

  const fetchDashboardData = async () => {
    try {
      const { count, error } = await supabase!.from('personnel').select('*', { count: 'exact', head: true });
      if (!error) setDbStatus('ONLINE');
      if (count !== null) setPersonnelCount(count > 0 ? count : 4102);
    } catch (e) {
      setDbStatus('АВТОНОМНО');
    }
  };

  const fetchNews = async () => {
    if (!isSupabaseConfigured()) return;
    setIsNewsLoading(true);
    try {
      const { data, error } = await supabase!
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      if (data) setNews(data);
    } catch (e) {
      console.warn("Table 'news' sync failed.");
    } finally {
      setIsNewsLoading(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!isAdminService) return;
    try {
      if (isSupabaseConfigured()) {
        await supabase!.from('news').delete().eq('id', id);
      }
      setNews(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      alert("ОШИБКА УДАЛЕНИЯ");
    }
  };

  const fetchTasks = async () => {
    if (!isSupabaseConfigured()) return;
    setIsTasksLoading(true);
    try {
      let query = supabase!.from('tasks').select('*');
      if (currentUser.department === 'Административная служба') {
          query = query.neq('assigned_department', 'ОВБ');
      } else if (!currentUser.isSuperAdmin && currentClearance < 6) {
          query = query.or(`created_by.eq.${currentUser.id},assigned_department.eq."${currentUser.department}"`);
      }
      const { data } = await query.order('created_at', { ascending: false });
      if (data) setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTasksLoading(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!isAdminService) return;
    try {
      if (isSupabaseConfigured()) {
        await supabase!.from('tasks').delete().eq('id', id);
      }
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      alert("ОШИБКА УДАЛЕНИЯ ЗАДАНИЯ");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.description) return;

    setIsCreatingTask(true);
    try {
      const taskData = {
        title: newTask.title.toUpperCase(),
        description: newTask.description,
        assigned_department: newTask.assigned_department,
        priority: newTask.priority,
        status: 'PENDING',
        created_by: currentUser.id
      };

      if (isSupabaseConfigured()) {
        const { error } = await supabase!.from('tasks').insert([taskData]);
        if (error) throw error;
      }

      setIsTaskModalOpen(false);
      setNewTask({ title: '', description: '', assigned_department: DEPARTMENTS[0], priority: 'MEDIUM' });
      fetchTasks();
    } catch (e) {
      alert("ОШИБКА СОЗДАНИЯ ЗАДАНИЯ");
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handlePublishNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNews.title || !newNews.content) return;
    
    setIsPublishingNews(true);
    try {
      const newsItem = {
        title: newNews.title.toUpperCase(),
        content: newNews.content,
        author_name: currentUser.name,
        author_id: currentUser.id,
        priority: newNews.priority
      };

      if (isSupabaseConfigured()) {
        const { error } = await supabase!.from('news').insert([newsItem]);
        if (error) throw error;
      }

      setIsNewsModalOpen(false);
      setNewNews({ title: '', content: '', priority: 'NORMAL' });
      fetchNews();
    } catch (e: any) {
      alert("ОШИБКА ПУБЛИКАЦИИ: ПРОВЕРЬТЕ НАЛИЧИЕ ТАБЛИЦЫ 'news'");
    } finally {
      setIsPublishingNews(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <h2 className={`text-2xl font-bold tracking-widest ${isHighLevelView ? 'text-yellow-500' : 'text-scp-text'} uppercase`}>
          {isHighLevelView ? 'ГЛАЗ БОГА :: SCPNET DASHBOARD' : 'СТАТУС ЗОНЫ-19'}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 border border-scp-accent/30 bg-scp-accent/5 text-scp-accent rounded">
            <ShieldAlert size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase font-mono">STATUS: SECURE</span>
          </div>
          <div className="text-xs font-bold text-scp-terminal border border-gray-800 px-3 py-1">КАНАЛ: {dbStatus}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-scp-panel border border-gray-800 p-4 relative group hover:border-scp-accent transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30">
            <AlertTriangle size={48} className="text-scp-accent" />
          </div>
          <h3 className="text-gray-500 text-[10px] font-bold tracking-widest mb-1 uppercase">УРОВЕНЬ DEFCON</h3>
          <div className="text-3xl font-bold text-scp-accent">LEVEL 4</div>
          <div className="text-[10px] text-gray-400 mt-2 uppercase font-black">ШТАТНЫЙ РЕЖИМ</div>
        </div>

        <div className="bg-scp-panel border border-gray-800 p-4 relative group">
          <h3 className="text-gray-500 text-[10px] font-bold tracking-widest mb-1 uppercase">ЦЕЛОСТНОСТЬ ЗОНЫ</h3>
          <div className="text-3xl font-bold text-blue-400">98.4%</div>
          <div className="text-[10px] text-gray-400 mt-2 uppercase">Герметизация в норме</div>
        </div>

        <div className="bg-scp-panel border border-gray-800 p-4 relative group">
          <h3 className="text-gray-500 text-[10px] font-bold tracking-widest mb-1 uppercase">ЦЕЛОСТНОСТЬ ПЕРИМЕТРА</h3>
          <div className="text-3xl font-bold text-blue-400">99.8%</div>
          <div className="text-[10px] text-gray-400 mt-2 uppercase">Все сектора герметичны</div>
        </div>

        <div className="bg-scp-panel border border-gray-800 p-4 relative group">
          <h3 className="text-gray-500 text-[10px] font-bold tracking-widest mb-1 uppercase">АКТИВНЫЙ ПЕРСОНАЛ</h3>
          <div className="text-3xl font-bold text-scp-text">{personnelCount}</div>
          <div className="text-[10px] text-gray-400 mt-2 uppercase">Биометрия синхронизирована</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* News Feed - Left Side */}
        <div className="lg:col-span-4 bg-scp-panel border border-gray-800 flex flex-col shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
            <h3 className="text-sm font-bold tracking-widest text-white flex items-center gap-2 uppercase">
              <Megaphone className="text-scp-accent" size={18} /> Лента новостей
            </h3>
            {isAdminService && (
              <button 
                onClick={() => setIsNewsModalOpen(true)}
                className="p-1.5 text-scp-terminal hover:bg-scp-terminal hover:text-black transition-all border border-scp-terminal/30"
                title="Опубликовать сводку"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
          <div className="flex-1 max-h-[500px] overflow-y-auto font-mono divide-y divide-gray-800/30">
            {isNewsLoading ? (
               <div className="p-12 flex justify-center"><RefreshCw className="animate-spin text-gray-600" /></div>
            ) : news.length > 0 ? news.map(item => (
              <div key={item.id} className={`p-4 hover:bg-white/5 transition-colors border-l-2 relative group ${item.priority === 'CRITICAL' ? 'border-red-600 bg-red-950/5' : 'border-transparent'}`}>
                {isAdminService && (
                   <button 
                    onClick={() => handleDeleteNews(item.id)}
                    className="absolute top-2 right-2 p-1 text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                   >
                     <Trash2 size={12} />
                   </button>
                )}
                <div className="flex justify-between items-start mb-1">
                   <span className={`text-[8px] font-black px-1 ${item.priority === 'CRITICAL' ? 'bg-red-600 text-white' : 'text-scp-terminal'}`}>
                     {item.priority}
                   </span>
                   <span className="text-[8px] text-gray-600 italic">
                     {new Date(item.created_at).toLocaleDateString()}
                   </span>
                </div>
                <h4 className="font-black text-xs text-white mb-2 leading-tight uppercase tracking-tight pr-4">{item.title}</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed mb-3">{item.content}</p>
                <div className="text-[8px] text-gray-600 uppercase flex items-center gap-1">
                  <Users size={10} /> Автор: {item.author_name}
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-gray-700 text-[10px] uppercase">Новостей пока нет</div>
            )}
          </div>
        </div>

        {/* Tasks Section - Right Side */}
        <div className="lg:col-span-8 bg-scp-panel border border-gray-800 flex flex-col shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
            <h3 className="text-sm font-bold tracking-widest text-gray-300 flex items-center gap-2 uppercase">
              <ClipboardList className="text-scp-terminal" size={18} /> Задания
            </h3>
            <div className="flex items-center gap-2">
               {isAdminService && (
                 <button 
                  onClick={() => setIsTaskModalOpen(true)}
                  className="p-1.5 text-scp-terminal hover:bg-scp-terminal hover:text-black transition-all border border-scp-terminal/30"
                 >
                   <Plus size={16} />
                 </button>
               )}
               <button onClick={fetchTasks} className="p-1.5 text-gray-500 hover:text-scp-terminal transition-colors">
                 <RefreshCw size={16} className={isTasksLoading ? 'animate-spin' : ''} />
               </button>
            </div>
          </div>
          <div className="flex-1 max-h-[500px] overflow-y-auto divide-y divide-gray-800/50 font-mono">
            {tasks.length > 0 ? tasks.map(task => (
              <div key={task.id} className="p-4 hover:bg-white/5 transition-colors group relative">
                {isAdminService && (
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="absolute top-4 right-4 p-1 text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div className="flex justify-between items-start mb-2 pr-8">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 border text-[9px] font-black ${task.priority === 'CRITICAL' ? 'text-red-500 border-red-500' : 'text-gray-500 border-gray-500'}`}>
                      {task.priority}
                    </span>
                    <h4 className="font-bold text-xs text-white uppercase">{task.title}</h4>
                  </div>
                  <span className="text-[9px] text-gray-600">{task.assigned_department}</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-normal mb-2">{task.description}</p>
                <div className="flex items-center gap-2">
                   <div className={`text-[8px] font-black px-1 ${task.status === 'COMPLETED' ? 'text-green-500 border border-green-500' : 'text-yellow-600 border border-yellow-600'}`}>
                     STATUS: {task.status}
                   </div>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-gray-600 text-[10px] uppercase tracking-widest">Активные задания отсутствуют</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-scp-panel border border-gray-800 p-6">
           <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-6 flex items-center uppercase gap-2">
             <Activity size={16} /> Индексы инцидентов
           </h3>
           <div className="h-48 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={incidentData}>
                 <XAxis dataKey="time" stroke="#444" fontSize={10} tickLine={false} axisLine={false} />
                 <YAxis stroke="#444" fontSize={10} tickLine={false} axisLine={false} />
                 <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '10px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                 <Bar dataKey="value" fill="#d32f2f" radius={[2, 2, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-scp-panel border border-gray-800 p-6">
           <h3 className="text-sm font-bold tracking-widest text-scp-terminal mb-6 flex items-center uppercase gap-2">
             <Radio size={16} /> Стабильность Фонда
           </h3>
           <div className="h-48 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={statusData}>
                 <XAxis dataKey="time" stroke="#33ff33" fontSize={10} tickLine={false} axisLine={false} />
                 <YAxis stroke="#33ff33" domain={[90, 100]} fontSize={10} tickLine={false} axisLine={false} />
                 <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #33ff33', fontSize: '10px' }} />
                 <Line type="monotone" dataKey="level" stroke="#33ff33" strokeWidth={2} dot={{fill: '#33ff33'}} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* PUBLISH NEWS MODAL */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-scp-panel border border-gray-700 w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden">
            <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
              <h3 className="text-xs font-black tracking-widest text-white uppercase font-mono flex items-center gap-2">
                <Newspaper size={16} className="text-scp-terminal" /> Публикация в общий канал
              </h3>
              <button onClick={() => setIsNewsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handlePublishNews} className="p-6 space-y-4 font-mono">
              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 uppercase tracking-widest">Заголовок сводки</label>
                <input 
                  required
                  placeholder="ВВЕДИТЕ ТЕМУ СООБЩЕНИЯ..."
                  className="w-full bg-black border border-gray-800 p-3 text-sm text-scp-terminal focus:border-scp-terminal outline-none uppercase font-black"
                  value={newNews.title}
                  onChange={e => setNewNews({...newNews, title: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 uppercase tracking-widest">Текст публикации</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="ДЕТАЛЬНОЕ СООБЩЕНИЕ ДЛЯ ПЕРСОНАЛА..."
                  className="w-full bg-black border border-gray-800 p-3 text-sm text-gray-300 focus:border-scp-terminal outline-none leading-relaxed"
                  value={newNews.content}
                  onChange={e => setNewNews({...newNews, content: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 uppercase tracking-widest">Приоритет уведомления</label>
                <div className="flex gap-2">
                  {['NORMAL', 'URGENT', 'CRITICAL'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewNews({...newNews, priority: p})}
                      className={`flex-1 py-2 text-[10px] font-black border transition-all ${newNews.priority === p ? 'bg-scp-terminal text-black border-scp-terminal' : 'bg-transparent text-gray-600 border-gray-800 hover:border-gray-600'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsNewsModalOpen(false)}
                  className="flex-1 py-4 border border-gray-700 text-gray-500 text-xs font-black uppercase hover:text-white transition-all"
                >
                  ОТМЕНА
                </button>
                <button 
                  type="submit" 
                  disabled={isPublishingNews}
                  className="flex-1 py-4 bg-scp-terminal text-black text-xs font-black uppercase hover:bg-white transition-all flex items-center justify-center gap-2"
                >
                  {isPublishingNews ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
                  ОПУБЛИКОВАТЬ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-scp-panel border border-gray-700 w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,1)]">
            <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
              <h3 className="text-xs font-black tracking-widest text-white uppercase font-mono flex items-center gap-2">
                <ClipboardList size={16} className="text-scp-terminal" /> Создание задания
              </h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-6 space-y-4 font-mono">
              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 uppercase tracking-widest">Суть задания</label>
                <input 
                  required
                  placeholder="КРАТКОЕ НАЗВАНИЕ..."
                  className="w-full bg-black border border-gray-800 p-3 text-sm text-scp-terminal focus:border-scp-terminal outline-none uppercase font-black"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 uppercase tracking-widest">Детали выполнения</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="ПОШАГОВАЯ ИНСТРУКЦИЯ ИЛИ ОПИСАНИЕ..."
                  className="w-full bg-black border border-gray-800 p-3 text-sm text-gray-300 focus:border-scp-terminal outline-none leading-relaxed"
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest">Отдел</label>
                    <select 
                      className="w-full bg-black border border-gray-800 p-3 text-[10px] text-white outline-none focus:border-scp-terminal"
                      value={newTask.assigned_department}
                      onChange={e => setNewTask({...newTask, assigned_department: e.target.value as any})}
                    >
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest">Приоритет</label>
                    <select 
                      className="w-full bg-black border border-gray-800 p-3 text-[10px] text-white outline-none focus:border-scp-terminal"
                      value={newTask.priority}
                      onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                    >
                      <option value="LOW">Низкий</option>
                      <option value="MEDIUM">Средний</option>
                      <option value="HIGH">Высокий</option>
                      <option value="CRITICAL">Критический</option>
                    </select>
                 </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="flex-1 py-4 border border-gray-700 text-gray-500 text-xs font-black uppercase hover:text-white transition-all"
                >
                  ОТМЕНА
                </button>
                <button 
                  type="submit" 
                  disabled={isCreatingTask}
                  className="flex-1 py-4 bg-scp-terminal text-black text-xs font-black uppercase hover:bg-white transition-all flex items-center justify-center gap-2"
                >
                  {isCreatingTask ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                  ПОСТАВИТЬ ЗАДАЧУ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
