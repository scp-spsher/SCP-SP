
import React, { useEffect, useState } from 'react';
import { AlertTriangle, Lock, Radio, Activity, Users, Globe, Skull, WifiOff, ClipboardList, Plus, User, CheckCircle, Clock, Trash2, RefreshCw, EyeOff, Briefcase } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { SCPTask, TaskPriority, TaskStatus, DEPARTMENTS } from '../types';
import { StoredUser } from '../services/authService';

interface DashboardProps {
  currentClearance: number;
  currentUser: StoredUser;
}

const breachData = [
  { name: 'Пн', breaches: 0 },
  { name: 'Вт', breaches: 1 },
  { name: 'Ср', breaches: 0 },
  { name: 'Чт', breaches: 0 },
  { name: 'Пт', breaches: 2 },
  { name: 'Сб', breaches: 0 },
  { name: 'Вс', breaches: 0 },
];

const energyData = [
  { time: '00:00', level: 85 },
  { time: '04:00', level: 82 },
  { time: '08:00', level: 90 },
  { time: '12:00', level: 95 },
  { time: '16:00', level: 88 },
  { time: '20:00', level: 84 },
];

const Dashboard: React.FC<DashboardProps> = ({ currentClearance, currentUser }) => {
  const [personnelCount, setPersonnelCount] = useState<number | string>(4102);
  const [dbStatus, setDbStatus] = useState<string>('OFFLINE');
  const [dbStatusColor, setDbStatusColor] = useState<'green' | 'yellow' | 'red'>('yellow');
  
  // Task State
  const [tasks, setTasks] = useState<SCPTask[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_department: '',
    priority: 'MEDIUM' as TaskPriority
  });

  const isHighLevelView = currentClearance >= 5;
  const canAssignTasks = currentClearance >= 4;

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchDashboardData();
      fetchTasks();
    }
  }, [currentClearance, currentUser.id]);

  const fetchDashboardData = async () => {
    try {
      const { count, error } = await supabase!
        .from('personnel')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        setDbStatus('ОШИБКА БД');
        setDbStatusColor('red');
      } else {
        setDbStatus('ONLINE');
        setDbStatusColor('green');
        if (count !== null) setPersonnelCount(count > 0 ? count : 4);
      }
    } catch (e) {
      setDbStatus('АВТОНОМНО');
      setDbStatusColor('yellow');
    }
  };

  const fetchTasks = async () => {
    setIsTasksLoading(true);
    try {
      // Фильтрация: задания видны только тем, кто их выдал, и тем отделам, кому выдано.
      // Примечание: O5/Админы (уровень 5+) по лору видят всё, но мы строго следуем запросу.
      // Если нужно, чтобы O5 видели всё, можно добавить условие.
      
      let query = supabase!.from('tasks').select('*');
      
      // Если это не супер-админ в режиме OMNI, применяем фильтрацию видимости
      if (!currentUser.isSuperAdmin || currentClearance < 6) {
          query = query.or(`created_by.eq.${currentUser.id},assigned_department.eq."${currentUser.department}"`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase error fetching tasks:", error);
      } else if (data) {
        setTasks(data);
      }
    } catch (e) {
      console.error("Fatal error fetching tasks:", e);
    } finally {
      setIsTasksLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assigned_department) return;

    setIsSubmittingTask(true);
    try {
      const { error } = await supabase!.from('tasks').insert([{
        title: newTask.title,
        description: newTask.description,
        assigned_department: newTask.assigned_department,
        priority: newTask.priority,
        created_by: currentUser.id,
        status: 'PENDING'
      }]);

      if (error) throw error;

      setIsTaskModalOpen(false);
      setNewTask({ title: '', description: '', assigned_department: '', priority: 'MEDIUM' });
      fetchTasks();
    } catch (e) {
      console.error("Create task error:", e);
      alert("ОШИБКА ПРИ СОЗДАНИИ ЗАДАНИЯ");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('ПОДТВЕРДИТЬ УДАЛЕНИЕ?')) return;
    try {
      const { error } = await supabase!.from('tasks').delete().eq('id', id);
      if (error) throw error;
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'CRITICAL': return 'text-red-500 border-red-500 bg-red-950/20 animate-pulse';
      case 'HIGH': return 'text-orange-500 border-orange-500 bg-orange-950/10';
      case 'MEDIUM': return 'text-yellow-500 border-yellow-500 bg-yellow-950/10';
      default: return 'text-blue-400 border-blue-400 bg-blue-950/10';
    }
  };

  const getStatusIcon = (s: TaskStatus) => {
    switch (s) {
      case 'COMPLETED': return <CheckCircle size={14} className="text-green-500" />;
      case 'FAILED': return <Skull size={14} className="text-red-600" />;
      case 'IN_PROGRESS': return <Activity size={14} className="text-blue-400 animate-spin-slow" />;
      default: return <Clock size={14} className="text-gray-500" />;
    }
  };

  const titleColor = isHighLevelView ? 'text-yellow-500' : 'text-scp-text';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <h2 className={`text-2xl font-bold tracking-widest ${titleColor} transition-colors duration-500 uppercase`}>
          {isHighLevelView ? 'ГЛАЗ БОГА :: ТОЛЬКО ДЛЯ O5' : 'СТАТУС ЗОНЫ-19'}
        </h2>
        <div className={`flex items-center gap-2 px-3 py-1 rounded border ${dbStatusColor === 'green' ? 'text-green-500 bg-green-900/10 border-green-900' : 'text-yellow-500 bg-yellow-900/10 border-yellow-900'}`}>
           <div className={`w-2 h-2 rounded-full animate-pulse ${dbStatusColor === 'green' ? 'bg-green-500' : 'bg-red-500'}`}></div>
           <span className="text-xs font-bold tracking-wider uppercase font-mono">КАНАЛ: {dbStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-scp-panel border border-gray-800 p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle size={64} className={isHighLevelView ? "text-yellow-500" : "text-scp-accent"} />
          </div>
          <h3 className="text-gray-500 text-[10px] font-bold tracking-widest mb-1 uppercase">СТАТУС DEFCON</h3>
          <div className={`text-3xl font-bold ${isHighLevelView ? 'text-red-500' : 'text-scp-text'}`}>УРОВЕНЬ 4</div>
          <div className="text-[10px] text-gray-400 mt-2 uppercase tracking-tighter">Все сектора в норме.</div>
        </div>

        <div className="bg-scp-panel border border-gray-800 p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Lock size={64} className={isHighLevelView ? "text-yellow-500" : "text-blue-500"} />
          </div>
          <h3 className="text-gray-500 text-[10px] font-bold tracking-widest mb-1 uppercase">ЦЕЛОСТНОСТЬ ПЕРИМЕТРА</h3>
          <div className={`text-3xl font-bold ${isHighLevelView ? 'text-yellow-500' : 'text-blue-400'}`}>98.4%</div>
          <div className="text-[10px] text-yellow-500 mt-2 uppercase tracking-tighter">Флуктуации в Секторе 7 [Евклид].</div>
        </div>

        <div className="bg-scp-panel border border-gray-800 p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={64} className={isHighLevelView ? "text-yellow-500" : "text-purple-500"} />
          </div>
          <h3 className="text-gray-500 text-[10px] font-bold tracking-widest mb-1 uppercase">ПЕРСОНАЛ НА МЕСТЕ</h3>
          <div className={`text-3xl font-bold ${isHighLevelView ? 'text-yellow-500' : 'text-purple-400'}`}>{personnelCount}</div>
          <div className="text-[10px] text-gray-400 mt-2 uppercase tracking-tighter">{dbStatus === 'ONLINE' ? 'Синхронизация с Мейнфреймом' : 'Локальный реестр'}</div>
        </div>
      </div>

      {/* JOURNAL OF TASKS */}
      <div className="bg-scp-panel border border-gray-800 flex flex-col overflow-hidden shadow-lg">
        <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
          <h3 className="text-sm font-bold tracking-widest text-gray-300 flex items-center gap-2 uppercase">
            <ClipboardList className="text-scp-terminal" size={18} /> ЖУРНАЛ ЗАДАНИЙ
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={fetchTasks}
              className="p-1.5 text-gray-500 hover:text-scp-terminal transition-colors"
              title="Обновить список"
            >
              <RefreshCw size={16} className={isTasksLoading ? 'animate-spin' : ''} />
            </button>
            {canAssignTasks && (
              <button 
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center gap-2 bg-scp-terminal text-black px-3 py-1.5 text-[10px] font-black hover:bg-white transition-all uppercase tracking-widest"
              >
                <Plus size={14} /> Сформировать приказ
              </button>
            )}
          </div>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-800/50 font-mono">
          {isTasksLoading && tasks.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center gap-4 text-scp-terminal">
              <RefreshCw className="animate-spin" size={32} />
              <span className="text-xs uppercase tracking-[0.2em] animate-pulse">Запрос к мейнфрейму...</span>
            </div>
          ) : tasks.length > 0 ? tasks.map(task => {
            const isMine = task.created_by === currentUser.id;
            return (
              <div key={task.id} className="p-4 hover:bg-white/5 transition-colors group relative border-l-2 border-transparent hover:border-scp-terminal/30">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-0.5 border text-[9px] font-black tracking-widest ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </div>
                    <h4 className="font-bold text-sm text-white uppercase tracking-tight">
                        {task.title}
                        {isMine && <span className="ml-2 text-[8px] text-scp-terminal border border-scp-terminal px-1">ВАШ ЗАКАЗ</span>}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      {getStatusIcon(task.status)}
                      <span className="uppercase">{task.status}</span>
                    </div>
                    {canAssignTasks && (task.created_by === currentUser.id || isHighLevelView) && (
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-all p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-3 leading-relaxed border-l border-gray-800 pl-3">
                  {task.description}
                </p>
                <div className="flex justify-between items-center text-[9px] text-gray-600 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Briefcase size={10} />
                    <span>Целевой отдел: <span className="text-scp-terminal font-bold">{task.assigned_department}</span></span>
                  </div>
                  <div>Зарегистрировано: {new Date(task.created_at).toLocaleString()}</div>
                </div>
              </div>
            );
          }) : (
            <div className="p-12 text-center text-gray-600 italic text-xs uppercase tracking-[0.3em]">
              Задания отсутствуют или у вас недостаточно прав для их просмотра.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-scp-panel border border-gray-800 p-6">
           <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-6 flex items-center uppercase">
             <Activity className="mr-2 w-4 h-4" /> ОТЧЕТ ОБ ИНЦИДЕНТАХ (НЕДЕЛЯ)
           </h3>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={breachData}>
                 <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                 <Bar dataKey="breaches" fill={isHighLevelView ? '#eab308' : "#d32f2f"} radius={[2, 2, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-scp-panel border border-gray-800 p-6">
           <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-6 flex items-center uppercase">
             <Radio className="mr-2 w-4 h-4" /> {isHighLevelView ? 'ГЛОБАЛЬНЫЙ ФОН ЮМА' : 'СТАБИЛЬНОСТЬ ЯКОРЕЙ РЕАЛЬНОСТИ'}
           </h3>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={energyData}>
                 <XAxis dataKey="time" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis domain={[0, 100]} stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                 <Line type="monotone" dataKey="level" stroke={isHighLevelView ? '#eab308' : "#33ff33"} strokeWidth={2} dot={{fill: isHighLevelView ? '#eab308' : '#33ff33'}} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* CREATE TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-scp-panel border border-gray-700 w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
              <h3 className="text-sm font-black tracking-widest text-white uppercase font-mono">Формирование приказа фонда</h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <Skull size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-6 space-y-4 font-mono">
              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 uppercase tracking-widest">Объект / Цель</label>
                <input 
                  required
                  placeholder="НАИМЕНОВАНИЕ ОПЕРАЦИИ..."
                  className="w-full bg-black border border-gray-800 p-3 text-sm text-scp-terminal focus:border-scp-terminal outline-none"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 uppercase tracking-widest">Описание задания</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="ПОШАГОВЫЙ ИНСТРУКТАЖ..."
                  className="w-full bg-black border border-gray-800 p-3 text-sm text-gray-300 focus:border-scp-terminal outline-none"
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase tracking-widest">Целевой отдел</label>
                  <select 
                    required
                    className="w-full bg-black border border-gray-800 p-3 text-xs text-scp-terminal outline-none"
                    value={newTask.assigned_department}
                    onChange={e => setNewTask({...newTask, assigned_department: e.target.value})}
                  >
                    <option value="">ВЫБЕРИТЕ ОТДЕЛ</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase tracking-widest">Приоритет</label>
                  <select 
                    className="w-full bg-black border border-gray-800 p-3 text-xs text-scp-terminal outline-none"
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value as TaskPriority})}
                  >
                    <option value="LOW">LOW (БЕЗОПАСНЫЙ)</option>
                    <option value="MEDIUM">MEDIUM (ЕВКЛИД)</option>
                    <option value="HIGH">HIGH (КЕТЕР)</option>
                    <option value="CRITICAL">CRITICAL (ТАУМИЭЛЬ)</option>
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
                  disabled={isSubmittingTask}
                  className="flex-1 py-4 bg-scp-terminal text-black text-xs font-black uppercase hover:bg-white transition-all shadow-[0_0_20px_rgba(51,255,51,0.2)]"
                >
                  {isSubmittingTask ? 'РЕГИСТРАЦИЯ...' : 'УТВЕРДИТЬ'}
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
