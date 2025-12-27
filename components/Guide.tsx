import React, { useState } from 'react';
import { 
  BookOpen, 
  Shield, 
  Database, 
  Users, 
  ShieldAlert, 
  Info, 
  Zap, 
  Crosshair, 
  Lock,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { SCPLogo } from './SCPLogo';

type GuideTab = 'general' | 'objects' | 'clearance' | 'personnel' | 'services';

const Guide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GuideTab>('general');

  const menuItems = [
    { id: 'general', label: 'Общая информация', icon: Info },
    { id: 'objects', label: 'Классы объектов', icon: Database },
    { id: 'clearance', label: 'Уровни допуска', icon: Shield },
    { id: 'personnel', label: 'Классы персонала', icon: Users },
    { id: 'services', label: 'Внутренние службы', icon: ClipboardList },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="border-l-4 border-scp-terminal bg-scp-terminal/5 p-6 space-y-4">
              <h3 className="text-xl font-bold text-scp-terminal uppercase tracking-widest flex items-center gap-3">
                <Zap size={20} /> Фонд SCP
              </h3>
              <p className="text-gray-300 leading-relaxed font-sans">
                Фонд SCP — это сверхгосударственная организация, действующая вне юрисдикции правительств. Наша миссия — обнаружение, захват и содержание аномальных объектов, сущностей или явлений, которые представляют угрозу для нормального функционирования человеческого общества.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {[
                { title: 'ОБЕЗОПАСИТЬ', text: 'Фонд берет под контроль аномалии с целью предотвращения их попадания в руки гражданских или враждебных организаций.', color: 'border-blue-500' },
                { title: 'УДЕРЖАТЬ', text: 'Фонд разрабатывает особые условия содержания (ОУС) для нейтрализации или минимизации аномальных эффектов.', color: 'border-yellow-600' },
                { title: 'СОХРАНИТЬ', text: 'Фонд защищает человечество от последствий аномалий и сохраняет сами аномалии до тех пор, пока они не будут изучены.', color: 'border-scp-terminal' },
              ].map((item, i) => (
                <div key={i} className={`p-4 border-t-4 ${item.color} bg-black/40`}>
                  <h4 className="font-bold text-white mb-2 tracking-widest">{item.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="p-6 bg-scp-panel border border-gray-800 mt-6 font-sans">
              <h4 className="text-lg font-bold text-white mb-4">Глобальное присутствие</h4>
              <p className="text-sm text-gray-400 mb-4">
                Фонд оперирует сетью из сотен секретных учреждений (Зон, Сайтов и Биологических лабораторий) по всему земному шару. Каждое учреждение специализируется на определенных типах аномалий или научных исследований.
              </p>
              <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                <div className="flex items-center gap-2"><ChevronRight size={12} className="text-scp-terminal"/> Зона-19 (Самая крупная)</div>
                <div className="flex items-center gap-2"><ChevronRight size={12} className="text-scp-terminal"/> Зона-01 (Штаб О5)</div>
                <div className="flex items-center gap-2"><ChevronRight size={12} className="text-scp-terminal"/> Зона-17 (Социально-активные)</div>
                <div className="flex items-center gap-2"><ChevronRight size={12} className="text-scp-terminal"/> Зона-81 (Подводная)</div>
              </div>
            </div>
          </div>
        );

      case 'objects':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-xl font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-2">Стандартная классификация</h3>
            <div className="space-y-4">
              {[
                { cls: 'Безопасный (Safe)', color: 'text-green-500 border-green-900', desc: 'Объекты, которые достаточно хорошо изучены для надежного содержания. Безопасный класс не означает, что объект не опасен, а лишь то, что его эффекты предсказуемы.' },
                { cls: 'Евклид (Euclid)', color: 'text-yellow-500 border-yellow-900', desc: 'Объекты, свойства которых не изучены до конца, или поведение которых непредсказуемо. Большинство одушевленных объектов по умолчанию классифицируются как Евклид.' },
                { cls: 'Кетер (Keter)', color: 'text-red-500 border-red-900', desc: 'Объекты, представляющие исключительную угрозу и крайне сложные в содержании. Нарушение условий содержания Кетеров часто ведет к глобальным катастрофам.' },
                { cls: 'Таумиэль (Thaumiel)', color: 'text-purple-500 border-purple-900', desc: 'Сверхсекретные аномалии, используемые Фондом для содержания или противодействия другим опасным объектам (обычно Кетеров).' },
                { cls: 'Аполлион (Apollyon)', color: 'text-orange-600 border-orange-900', desc: 'Объекты, которые невозможно содержать современными средствами. Ожидается неминуемый конец света.' },
                { cls: 'Архонт (Archon)', color: 'text-blue-400 border-blue-900', desc: 'Объекты, которые можно содержать, но делать этого не следует, так как это приведет к более катастрофическим последствиям, чем их свобода.' }
              ].map((item, i) => (
                <div key={i} className={`p-4 border-l-4 ${item.color} bg-black/40 group hover:bg-black/60 transition-colors`}>
                  <h4 className={`font-bold ${item.color.split(' ')[0]} mb-1 uppercase tracking-wider`}>{item.cls}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans">{item.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-red-950/20 border border-red-900 flex items-center gap-4">
              <ShieldAlert className="text-red-500 shrink-0" size={32} />
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest font-mono">
                Внимание: Класс объекта характеризует сложность его содержания, а не уровень его опасности.
              </p>
            </div>
          </div>
        );

      case 'clearance':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="overflow-x-auto">
               <table className="w-full border-collapse border border-gray-800 font-sans text-sm">
                 <thead>
                   <tr className="bg-black/60 text-gray-500 uppercase text-[10px] tracking-widest">
                     <th className="p-4 border border-gray-800 text-left">Уровень</th>
                     <th className="p-4 border border-gray-800 text-left">Должность</th>
                     <th className="p-4 border border-gray-800 text-left">Область доступа</th>
                   </tr>
                 </thead>
                 <tbody className="text-gray-300">
                    {[
                      { lvl: '0', title: 'Стажер / Гражданский', access: 'Только общие данные, не связанные с аномалиями.' },
                      { lvl: '1', title: 'Обслуживающий персонал', access: 'Ограниченный доступ к некритичным секторам Зон.' },
                      { lvl: '2', title: 'Исследователь / Агент', access: 'Доступ к данным о Safe и Euclid объектах.' },
                      { lvl: '3', title: 'Ведущий научный сотрудник', access: 'Доступ к данным о Keter объектах и тактическим планам.' },
                      { lvl: '4', title: 'Директор Зоны', access: 'Полный доступ к данным отдельной Зоны и МОГ.' },
                      { lvl: '5', title: 'Смотритель O5', access: 'Глобальный доступ к любой информации Фонда.' }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 border border-gray-800 font-mono font-bold text-scp-terminal">LEVEL {row.lvl}</td>
                        <td className="p-4 border border-gray-800 font-bold">{row.title}</td>
                        <td className="p-4 border border-gray-800 text-xs text-gray-500">{row.access}</td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
             
             <div className="p-6 bg-black border border-gray-800 mt-8">
               <div className="flex items-center gap-3 mb-4 text-scp-accent uppercase font-black text-sm">
                 <Lock size={18} /> Спец-допуски
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="p-3 border border-gray-800">
                    <strong className="text-white block mb-1 uppercase">OMNI</strong>
                    <span className="text-gray-500 italic leading-relaxed">Системный допуск, предоставляющий права администратора SCPNET. Владелец может изменять любые записи в реальном времени.</span>
                  </div>
                  <div className="p-3 border border-gray-800">
                    <strong className="text-white block mb-1 uppercase">Член Комитета по Этике</strong>
                    <span className="text-gray-500 italic leading-relaxed">Право вето на любые эксперименты, даже санкционированные Советом O5. Доступ к журналам дисциплинарных взысканий.</span>
                  </div>
               </div>
             </div>
          </div>
        );

      case 'personnel':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-xl font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-2">Классификация сотрудников</h3>
            <div className="grid grid-cols-1 gap-4 font-sans">
              {[
                { cls: 'Класс A', desc: 'Критически важные сотрудники. Им запрещен любой контакт с аномалиями. При инциденте эвакуируются в первую очередь.' },
                { cls: 'Класс B', desc: 'Оперативный персонал среднего звена. Допускается контакт с аномалиями, прошедшими карантин. Эвакуируются после Класса A.' },
                { cls: 'Класс C', desc: 'Персонал с прямым доступом к большинству аномалий. Включает исследователей и охранников Зон.' },
                { cls: 'Класс D', desc: 'Расходный персонал, используемый для экспериментов и работы с опасными объектами. Набираются из числа заключенных, приговоренных к смерти.' },
                { cls: 'Класс E', desc: 'Временный класс для сотрудников, подвергшихся воздействию аномальных эффектов. Находятся в карантине до обследования.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 border border-gray-800 bg-black/40 items-center">
                  <div className="w-16 h-16 flex items-center justify-center border-2 border-scp-terminal font-black text-xl text-scp-terminal shrink-0">
                    {item.cls.split(' ')[1]}
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider">{item.cls}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Научная Служба', icon: BookOpen, text: 'Отвечает за изучение аномалий и разработку ОУС. Самый крупный департамент Фонда.' },
                { title: 'Служба Безопасности (СБ)', icon: Shield, text: 'Охрана периметра Зон и предотвращение несанкционированного доступа или побега объектов.' },
                { title: 'Мобильные Опергруппы (МОГ)', icon: Crosshair, text: 'Элитные подразделения, специализирующиеся на захвате аномалий в полевых условиях.' },
                { title: 'Комитет по Этике', icon: ShieldAlert, text: 'Надзор за соблюдением моральных норм при проведении экспериментов с персоналом класса D.' },
                { title: 'Отдел Внешних Связей', icon: Users, text: 'Внедрение агентов в правительства, полицию и научные институты для перехвата данных.' },
                { title: 'Инженерная Служба', icon: Zap, text: 'Строительство и поддержание систем жизнеобеспечения и камер содержания.' }
              ].map((service, i) => (
                <div key={i} className="p-6 border border-gray-800 bg-scp-panel hover:border-scp-terminal transition-all group">
                   <div className="flex items-center gap-4 mb-3">
                      <service.icon className="text-scp-terminal group-hover:scale-110 transition-transform" size={24} />
                      <h4 className="font-bold text-white uppercase tracking-widest">{service.title}</h4>
                   </div>
                   <p className="text-xs text-gray-400 font-sans leading-relaxed">{service.text}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-black p-6 border border-gray-800 font-mono text-center">
               <p className="text-[10px] text-gray-600 uppercase tracking-[0.4em] animate-pulse">
                 Координация служб осуществляется через SCPNET Mainframe
               </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full gap-8 animate-in fade-in duration-700">
      {/* Sidebar Navigation inside Guide */}
      <aside className="md:w-64 shrink-0 flex flex-col gap-2">
        <div className="p-4 border border-gray-800 bg-black/60 mb-2">
          <h2 className="text-sm font-black text-scp-text uppercase tracking-[0.2em] mb-1">Архивариус</h2>
          <p className="text-[9px] text-gray-600 font-mono">БАЗА ЗНАНИЙ v9.0.4</p>
        </div>
        
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as GuideTab)}
            className={`flex items-center gap-3 p-4 text-left transition-all border ${
              activeTab === item.id 
                ? 'bg-scp-terminal text-black border-scp-terminal font-bold' 
                : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600 hover:text-white'
            }`}
          >
            <item.icon size={18} />
            <span className="text-xs uppercase tracking-widest font-mono">{item.label}</span>
          </button>
        ))}

        <div className="mt-auto p-4 opacity-20 hidden md:block">
           <SCPLogo className="w-full grayscale" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 bg-scp-panel border border-gray-800 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-800 bg-black/40 flex justify-between items-center">
           <h1 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <BookOpen className="text-scp-terminal" /> {menuItems.find(m => m.id === activeTab)?.label}
           </h1>
           <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
             Доступ: УРОВЕНЬ 1+
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 relative">
           {/* Grid Pattern Background */}
           <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(#333_1px,transparent_1px),linear-gradient(90deg,#333_1px,transparent_1px)] bg-[length:40px_40px]"></div>
           
           <div className="relative z-10 max-w-4xl">
              {renderContent()}
           </div>
        </div>

        <div className="p-4 border-t border-gray-800 bg-black/80 flex justify-between items-center text-[9px] text-gray-600 font-mono uppercase tracking-[0.3em]">
           <span>Комитет по Этике // Отдел безопасности</span>
           <span className="animate-pulse">Запись шифруется...</span>
        </div>
      </div>
    </div>
  );
};

export default Guide;
