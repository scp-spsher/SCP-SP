import React, { useEffect, useState } from 'react';
import { AlertTriangle, Lock, Radio, Activity, Users, Globe, Skull } from 'lucide-react';
import { Recharts, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface DashboardProps {
  currentClearance: number;
}

// Mock Data
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

const Dashboard: React.FC<DashboardProps> = ({ currentClearance }) => {
  const [personnelCount, setPersonnelCount] = useState<number | string>(4102);
  const [dbStatus, setDbStatus] = useState<string>('OFFLINE');
  const [dbStatusColor, setDbStatusColor] = useState<'green' | 'yellow' | 'red'>('yellow');
  
  // View Logic based on simulated clearance
  const isHighLevelView = currentClearance >= 5;

  useEffect(() => {
    if (isSupabaseConfigured()) {
      setDbStatus('ONLINE');
      setDbStatusColor('green');
      
      // Fetch real count from DB
      const fetchCount = async () => {
        try {
          const { count, error } = await supabase!
            .from('personnel')
            .select('*', { count: 'exact', head: true });
          
          if (error) {
             console.error("Dashboard DB Error:", JSON.stringify(error, null, 2));
             if (error.code === '42P01') {
               setDbStatus('НЕТ ТАБЛИЦЫ');
               setDbStatusColor('red');
             } else if (error.code === '42P17') {
                setDbStatus('ОШИБКА RLS');
                setDbStatusColor('red');
                setPersonnelCount('ERR');
             } else if (error.code === '42501') {
                setDbStatus('НЕТ ДОСТУПА');
                setDbStatusColor('red');
                setPersonnelCount('N/A');
             } else {
               setDbStatus('ОШИБКА');
               setDbStatusColor('red');
             }
          } else if (count !== null) {
            setPersonnelCount(count > 0 ? count : 4);
          }
        } catch (e) {
          console.error("Dashboard Fetch Error:", e);
          setDbStatus('СБОЙ');
          setDbStatusColor('red');
        }
      };
      fetchCount();
    }
  }, []);

  const getStatusClasses = () => {
    switch (dbStatusColor) {
      case 'green': return isHighLevelView ? 'text-yellow-500 bg-yellow-900/20 border-yellow-900' : 'text-green-500 bg-green-900/20 border-green-900';
      case 'red': return 'text-red-500 bg-red-900/20 border-red-900';
      default: return 'text-yellow-500 bg-yellow-900/20 border-yellow-900';
    }
  };

  const titleColor = isHighLevelView ? 'text-yellow-500' : 'text-scp-text';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <h2 className={`text-2xl font-bold tracking-widest ${titleColor} transition-colors duration-500`}>
          {isHighLevelView ? 'ГЛАЗ БОГА :: ТОЛЬКО ДЛЯ O5' : 'СТАТУС ЗОНЫ-19'}
        </h2>
        <div className={`flex items-center gap-2 px-3 py-1 rounded border ${getStatusClasses()}`}>
           <div className={`w-2 h-2 rounded-full animate-pulse ${dbStatusColor === 'green' ? 'bg-green-500' : 'bg-red-500'}`}></div>
           <span className="text-xs font-bold tracking-wider">БАЗА ДАННЫХ {dbStatus}</span>
        </div>
      </div>

      {/* Top Alerts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-scp-panel border border-gray-800 p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            {isHighLevelView ? <Globe size={64} className="text-yellow-500" /> : <AlertTriangle size={64} className="text-scp-accent" />}
          </div>
          <h3 className="text-gray-500 text-xs font-bold tracking-widest mb-1">
             {isHighLevelView ? 'ГЛОБАЛЬНАЯ УГРОЗА' : 'СТАТУС DEFCON'}
          </h3>
          <div className={`text-3xl font-bold ${isHighLevelView ? 'text-red-500' : 'text-scp-text'}`}>
            {isHighLevelView ? 'КРИТИЧЕСКИЙ' : 'УРОВЕНЬ 4'}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {isHighLevelView ? '3 Массовых нарушения условий содержания' : 'Все сектора в норме.'}
          </div>
        </div>

        <div className="bg-scp-panel border border-gray-800 p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            {isHighLevelView ? <Skull size={64} className="text-red-500" /> : <Lock size={64} className="text-blue-500" />}
          </div>
          <h3 className="text-gray-500 text-xs font-bold tracking-widest mb-1">
            {isHighLevelView ? 'ОРДЕРЫ НА УСТРАНЕНИЕ' : 'ЦЕЛОСТНОСТЬ ПЕРИМЕТРА'}
          </h3>
          <div className="text-3xl font-bold text-blue-400">
            {isHighLevelView ? '12 В ОЖИДАНИИ' : '98.4%'}
          </div>
          <div className="text-xs text-yellow-500 mt-2">
             {isHighLevelView ? 'Требуется подтверждение О5' : 'Флуктуации в Секторе 7 [Евклид].'}
          </div>
        </div>

        <div className="bg-scp-panel border border-gray-800 p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={64} className="text-purple-500" />
          </div>
          <h3 className="text-gray-500 text-xs font-bold tracking-widest mb-1">
            {isHighLevelView ? 'АКТИВЫ ФОНДА' : 'ПЕРСОНАЛ НА МЕСТЕ'}
          </h3>
          <div className="text-3xl font-bold text-purple-400">
            {isHighLevelView ? '342,891' : personnelCount}
          </div>
          <div className="text-xs text-gray-400 mt-2">
             {dbStatus === 'ONLINE' ? 'Синхронизация с Мейнфреймом' : 'Локальные данные'}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breach History */}
        <div className="bg-scp-panel border border-gray-800 p-6">
           <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-6 flex items-center">
             <Activity className="mr-2 w-4 h-4" /> ОТЧЕТ ОБ ИНЦИДЕНТАХ (НЕДЕЛЯ)
           </h3>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={breachData}>
                 <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                 />
                 <Bar dataKey="breaches" fill={isHighLevelView ? '#eab308' : "#d32f2f"} radius={[2, 2, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Hume Levels / Energy */}
        <div className="bg-scp-panel border border-gray-800 p-6">
           <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-6 flex items-center">
             <Radio className="mr-2 w-4 h-4" /> {isHighLevelView ? 'ГЛОБАЛЬНЫЙ ФОН ЮМА' : 'СТАБИЛЬНОСТЬ ЯКОРЕЙ РЕАЛЬНОСТИ'}
           </h3>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={energyData}>
                 <XAxis dataKey="time" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis domain={[0, 100]} stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }}
                 />
                 <Line type="monotone" dataKey="level" stroke={isHighLevelView ? '#eab308' : "#33ff33"} strokeWidth={2} dot={{fill: isHighLevelView ? '#eab308' : '#33ff33'}} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-scp-panel border border-gray-800">
        <div className="p-4 border-b border-gray-800 bg-gray-900/50">
          <h3 className="text-sm font-bold tracking-widest text-gray-300">ПОСЛЕДНИЕ СИСТЕМНЫЕ ЛОГИ</h3>
        </div>
        <div className="divide-y divide-gray-800">
          {[
            { time: '14:02:11', type: isHighLevelView ? 'ГЛОБАЛ' : 'ИНФО', msg: isHighLevelView ? 'Оперативники ГОК замечены в Секторе-4 [Каир]' : 'Техобслуживание Сектора 4 завершено.', color: 'text-blue-400' },
            { time: '13:45:22', type: 'ВНИМ', msg: isHighLevelView ? 'Требуется голос Совета О5-7: Предложение 112' : 'Попытка несанкционированного доступа: Терминал 44-B.', color: 'text-yellow-500' },
            { time: '12:10:05', type: 'ИНФО', msg: 'Обновление меню кафетерия: День пиццы отменен.', color: 'text-gray-500' },
            { time: '11:00:00', type: 'КРИТ', msg: 'SCP-682: Уровень кислоты ниже 80%. Инициирована дозаправка.', color: 'text-red-500' },
          ].map((log, i) => (
            <div key={i} className="p-3 flex items-start text-sm hover:bg-gray-900/30 transition-colors">
              <span className="font-mono text-gray-500 mr-4 text-xs mt-0.5">{log.time}</span>
              <span className={`font-bold font-mono text-xs mr-4 w-12 ${log.color}`}>{log.type}</span>
              <span className="text-gray-300 font-mono">{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
