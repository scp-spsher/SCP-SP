import React, { useState } from 'react';
import { BookOpen, Shield, Info, Lock, ChevronRight, Scale, Users, ShieldAlert, Box, AlertOctagon, HelpCircle, Archive, Activity, FileText, AlertTriangle, Truck, Zap, ClipboardList, Gavel, MapPin, Eye, Search, CheckCircle2 } from 'lucide-react';
import { SCPLogo } from './SCPLogo';

interface GuideProps {
  currentClearance: number;
}

const Guide: React.FC<GuideProps> = ({ currentClearance }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'objects' | 'clearance'>('general');

  const isL2Plus = currentClearance >= 2;

  const renderGeneralInfo = () => {
    if (!isL2Plus) {
      return (
        <div className="animate-in fade-in duration-700">
          <div className="max-w-4xl mx-auto bg-scp-panel border border-gray-800 p-8 md:p-12 shadow-xl relative overflow-hidden">
            <header className="border-b border-gray-700 pb-6 mb-8">
              <h1 className="text-3xl font-bold text-white uppercase tracking-tight mb-2 font-mono">Общая информация</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">Корпоративный регламент // Редакция 4.1</p>
            </header>
            <article className="space-y-6 text-gray-400 font-sans leading-relaxed text-base">
              <p>На протяжении истории человечества встречались явления, выходящие за рамки обычных представлений. Существуют специализированные структуры, чья задача — предотвращать угрозы, обеспечивая стабильность общества.</p>
              <section className="pt-6">
                <h2 className="text-xl font-bold text-white uppercase mb-4 flex items-center gap-2 font-mono"><Shield size={20} className="text-blue-500" /> Наша цель</h2>
                <p>Обеспечивать безопасность общества и поддерживать нормальное функционирование повседневной жизни.</p>
              </section>
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                <div className="p-4 border border-gray-800 bg-black/40">
                  <h3 className="font-bold text-white uppercase mb-2 text-sm font-mono">Защищать</h3>
                  <p className="text-xs leading-relaxed">Предотвращать несанкционированный доступ к потенциально опасным объектам.</p>
                </div>
                <div className="p-4 border border-gray-800 bg-black/40">
                  <h3 className="font-bold text-white uppercase mb-2 text-sm font-mono">Ограничивать</h3>
                  <p className="text-xs leading-relaxed">Локализовывать и контролировать воздействие угроз.</p>
                </div>
                <div className="p-4 border border-gray-800 bg-black/40">
                  <h3 className="font-bold text-white uppercase mb-2 text-sm font-mono">Сохранять</h3>
                  <p className="text-xs leading-relaxed">Аккумулировать знания для разработки мер по нейтрализации факторов риска.</p>
                </div>
              </section>
            </article>
          </div>
        </div>
      );
    }
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="max-w-4xl mx-auto bg-white/5 border border-gray-800 p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <header className="border-b-2 border-scp-text pb-8 mb-10 text-center relative z-10">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 font-serif">О Фонде SCP</h1>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 uppercase tracking-widest font-mono">
               <span>Архивный файл: ADM-01-RU</span>
               <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
               <span>Статус: Рассекречено для L-2+</span>
            </div>
          </header>
          <article className="space-y-8 text-gray-300 font-serif leading-relaxed text-lg relative z-10">
            <p className="italic">Человечество больше не будет прятаться в страхе. Никто другой не защитит нас, мы должны сами постоять за себя.</p>
            <p>Пока всё остальное человечество живёт при свете дня, мы должны оставаться во тьме ночи, чтобы сражаться с ней, сдерживать её и скрывать её от глаз общественности.</p>
            <div className="py-12 flex flex-col items-center border-y border-gray-800 my-10">
               <div className="w-32 h-32 mb-4 opacity-80"><SCPLogo className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700" /></div>
               <p className="text-xl font-black uppercase tracking-widest text-white italic text-center">Наша миссия – Обезопасить, Удержать, Сохранить.</p>
            </div>
          </article>
        </div>
      </div>
    );
  };

  const renderObjectClasses = () => {
    // УРОВЕНЬ 0
    if (currentClearance === 0) {
      return (
        <div className="animate-in fade-in duration-700">
          <div className="max-w-4xl mx-auto bg-scp-panel border border-gray-800 p-8 md:p-12 shadow-xl relative overflow-hidden">
            <header className="border-b border-gray-700 pb-6 mb-8">
              <h1 className="text-3xl font-bold text-white uppercase tracking-tight mb-2 font-mono">Классы объектов</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">Версия для общего пользования — Уровень допуска 0</p>
            </header>
            <article className="space-y-8 text-gray-400 font-sans leading-relaxed text-base">
              <section className="bg-black/40 border-l-4 border-scp-terminal p-6 space-y-4">
                <h2 className="text-xl font-bold text-white uppercase font-mono">Условная модель оценки — «правило контейнера»</h2>
                <ul className="space-y-4 text-sm font-mono">
                  <li className="flex gap-3"><span className="text-green-500 font-black">●</span><span>Если объект легко изолируется — это низкий уровень риска.</span></li>
                  <li className="flex gap-3"><span className="text-yellow-500 font-black">●</span><span>Если результат изоляции трудно предсказать — это средний уровень риска.</span></li>
                  <li className="flex gap-3"><span className="text-red-500 font-black">●</span><span>Если объект активно противится контролю — это высокий уровень риска.</span></li>
                </ul>
              </section>
            </article>
          </div>
        </div>
      );
    }

    // УРОВЕНЬ 1
    if (currentClearance === 1) {
      return (
        <div className="animate-in fade-in duration-700">
          <div className="max-w-4xl mx-auto bg-scp-panel border border-gray-800 p-8 md:p-12 shadow-xl relative overflow-hidden">
            <header className="border-b border-gray-700 pb-6 mb-8">
              <h1 className="text-3xl font-bold text-white uppercase tracking-tight mb-2 font-mono">Классы объектов</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">Служебная версия — Уровень допуска 1</p>
            </header>
            <article className="space-y-8 text-gray-400 font-sans leading-relaxed text-base">
              <section className="bg-black/40 border-l-4 border-scp-terminal p-6 space-y-4 shadow-inner">
                <h2 className="text-xl font-bold text-white uppercase font-mono flex items-center gap-2"><Box size={20} className="text-scp-terminal" /> Правило «коробки»</h2>
                <ul className="space-y-6 text-sm">
                  <li className="flex gap-4 items-start"><div className="w-8 h-8 rounded bg-green-900/30 border border-green-500 flex items-center justify-center shrink-0 font-bold text-green-500">S</div><div><p className="text-green-500 font-bold uppercase text-xs mb-1">Безопасный</p><p className="text-xs leading-relaxed">Объект можно поместить в контейнер и оставить без последствий.</p></div></li>
                  <li className="flex gap-4 items-start"><div className="w-8 h-8 rounded bg-yellow-900/30 border border-yellow-500 flex items-center justify-center shrink-0 font-bold text-yellow-500">E</div><div><p className="text-yellow-500 font-bold uppercase text-xs mb-1">Евклид</p><p className="text-xs leading-relaxed">Изоляция возможна, но результат непредсказуем.</p></div></li>
                  <li className="flex gap-4 items-start"><div className="w-8 h-8 rounded bg-red-900/30 border border-red-500 flex items-center justify-center shrink-0 font-bold text-red-500">K</div><div><p className="text-red-500 font-bold uppercase text-xs mb-1">Кетер</p><p className="text-xs leading-relaxed">Объект активно сопротивляется или легко выходит из изоляции.</p></div></li>
                </ul>
              </section>
            </article>
          </div>
        </div>
      );
    }

    // УРОВЕНЬ 2
    if (currentClearance === 2) {
      return (
        <div className="animate-in fade-in duration-700">
          <div className="max-w-4xl mx-auto bg-scp-panel border border-gray-800 p-8 md:p-12 shadow-xl relative overflow-hidden">
            <header className="border-b border-gray-700 pb-6 mb-8 flex justify-between items-end">
              <div><h1 className="text-3xl font-bold text-white uppercase tracking-tight mb-2 font-mono">Классы объектов</h1><p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">Рабочая документация — L2</p></div>
              <div className="text-scp-accent border border-scp-accent px-2 py-1 text-[8px] font-bold uppercase mb-2">Confidential</div>
            </header>
            <article className="space-y-10 text-gray-400 font-sans leading-relaxed text-base">
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase font-mono flex items-center gap-2 border-b border-gray-800 pb-2">Краткое введение</h2>
                <p className="text-sm">Эта версия даёт полноценное рабочее представление о системе классов и обязанностях персонала, имеющего прямой доступ к аномалиям.</p>
              </section>
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-white uppercase font-mono flex items-center gap-2"><Box size={20} className="text-scp-terminal" /> Оперативная эвристика — «Правило коробки»</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-black/40 p-4 border-l-4 border-green-500 flex gap-4"><div className="font-bold text-green-500 w-12 shrink-0">SAFE</div><div className="text-xs">Поместили в контейнер и оставили — никаких проявлений. Содержание стандартное.</div></div>
                  <div className="bg-black/40 p-4 border-l-4 border-yellow-500 flex gap-4"><div className="font-bold text-yellow-500 w-12 shrink-0">EUCLID</div><div className="text-xs">Поместили в контейнер — поведение непредсказуемо. Требуется усиленный мониторинг.</div></div>
                  <div className="bg-black/40 p-4 border-l-4 border-red-500 flex gap-4"><div className="font-bold text-red-500 w-12 shrink-0">KETER</div><div className="text-xs">Объект активно выходит/разрушает условия содержания. Содержание ресурсоёмко.</div></div>
                  <div className="bg-black/40 p-4 border-l-4 border-purple-500 flex gap-4"><div className="font-bold text-purple-500 w-12 shrink-0">SPEC</div><div className="text-xs">Объект сам по себе представляет среду или контейнер для других объектов.</div></div>
                </div>
              </section>
              <section className="space-y-4"><h2 className="text-xl font-bold text-white uppercase font-mono border-b border-gray-800 pb-2">Определения классов</h2><div className="space-y-3 text-sm">
                <p><b className="text-green-500 uppercase">Безопасный</b> — объекты, надёжно и просто поддающиеся содержанию.</p>
                <p><b className="text-yellow-500 uppercase">Евклид</b> — объекты с частичной предсказуемостью; требуются модификации протоколов.</p>
                <p><b className="text-red-500 uppercase">Кетер</b> — объекты, для которых длительное сдерживание сложно или затратно.</p>
                <p><b className="text-gray-300 uppercase">Вторичные классы</b> (Аполлион, Архонт) — применяются для описания особых сценариев.</p>
              </div></section>
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4"><h3 className="text-white font-bold uppercase font-mono flex items-center gap-2"><Check size={16} className="text-green-500" /> Сотрудник L2 МОЖЕТ</h3>
                  <ul className="list-disc pl-5 text-xs space-y-2"><li>Доступ к базовым досье и ОУС в своей зоне.</li><li>Участие в работах по содержанию и наблюдению.</li><li>Ведение официальной документации и логов.</li></ul>
                </div>
                <div className="space-y-4"><h3 className="text-white font-bold uppercase font-mono flex items-center gap-2"><X size={16} className="text-red-500" /> Сотрудник L2 НЕ МОЖЕТ</h3>
                  <ul className="list-disc pl-5 text-xs space-y-2"><li>Самовольно инициировать эксперименты.</li><li>Доступ к полным архивам особых категорий.</li><li>Вмешиваться в решения о списании объектов.</li></ul>
                </div>
              </section>
            </article>
          </div>
        </div>
      );
    }

    // УРОВЕНЬ 3
    if (currentClearance >= 3) {
      return (
        <div className="animate-in fade-in duration-700">
          <div className="max-w-4xl mx-auto bg-scp-panel border border-gray-800 p-8 md:p-12 shadow-xl relative overflow-hidden">
            <header className="border-b border-gray-700 pb-6 mb-8 flex justify-between items-end">
              <div><h1 className="text-3xl font-bold text-white uppercase tracking-tight mb-2 font-mono">Классы объектов</h1><p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">Справочник старшего персонала — L3</p></div>
              <div className="text-scp-terminal border border-scp-terminal px-2 py-1 text-[8px] font-bold uppercase mb-2">Internal Use // L3</div>
            </header>

            <article className="space-y-10 text-gray-400 font-sans leading-relaxed text-base">
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase font-mono flex items-center gap-2 border-b border-gray-800 pb-2"><Info size={20} className="text-blue-400" /> Краткое назначение документа</h2>
                <p className="text-sm">Рабочий справочник для старших научных сотрудников, руководителей проектов и офицеров МОГ. Документ содержит детальные указания по оценке происхождения, изъятию и формированию ОУС.</p>
              </section>

              <section className="bg-black/40 border border-gray-800 p-6 space-y-4">
                <h2 className="text-xl font-bold text-white uppercase font-mono flex items-center gap-2"><Eye size={20} className="text-scp-terminal" /> Короткий конспект</h2>
                <p className="text-xs italic">Цель классификации — оценка сложности содержания и потребности в ресурсах. Класс не является прямым показателем опасности.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono">
                  <div className="p-2 border border-gray-800 bg-green-950/10">● SAFE: Стабилен.</div>
                  <div className="p-2 border border-gray-800 bg-yellow-950/10">● EUCLID: Непредсказуем.</div>
                  <div className="p-2 border border-gray-800 bg-red-950/10">● KETER: Ресурсоёмок.</div>
                  <div className="p-2 border border-gray-800 bg-purple-950/10">● SPEC: Среда/Система.</div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase font-mono border-b border-gray-800 pb-2"><MapPin size={20} className="text-blue-400" /> Методология оценки и сбор данных</h2>
                <h3 className="text-white font-bold text-sm uppercase">Что фиксируется при изъятии</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs list-disc pl-5">
                  <li>Локация: географические координаты и контекст территории.</li>
                  <li>Условия: триггеры, сопутствующие аномалии, свидетели.</li>
                  <li>Процедура: меры локализации, использованное оборудование.</li>
                  <li>Доказательства: телеметрия, фотоматериалы, биообразцы.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase font-mono border-b border-gray-800 pb-2"><Shield size={20} className="text-blue-400" /> Формирование и согласование ОУС</h2>
                <div className="space-y-4 text-xs">
                  <p>ОУС (Special Containment Procedures) должны включать:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-black/40 border border-gray-800">Физические и технические параметры среды.</div>
                    <div className="p-3 bg-black/40 border border-gray-800">Регламент ротации личного состава и охраны.</div>
                    <div className="p-3 bg-black/40 border border-gray-800">План действий при сбоях и точки эвакуации.</div>
                    <div className="p-3 bg-black/40 border border-gray-800">Порядок утверждения экспериментальных протоколов.</div>
                  </div>
                  <p className="italic text-gray-500">Ответственность: первоначальный пересмотр ОУС — в течение 30 дней, далее — ежегодно.</p>
                </div>
              </section>

              <section className="space-y-4 bg-blue-900/10 border border-blue-900/30 p-6">
                <h2 className="text-xl font-bold text-white uppercase font-mono flex items-center gap-2"><Zap size={20} className="text-blue-400" /> Проведение экспериментов и исследования</h2>
                <p className="text-xs">Любой эксперимент требует заявки (Experiment Request Form) с гипотезой, оценкой рисков и критериями остановки. При задействовании живых субъектов обязательна оценка Комитетом по этике.</p>
                <div className="flex gap-4 mt-4">
                  <div className="flex-1 border border-gray-800 p-2 text-[10px]"><span className="text-blue-400 font-bold block mb-1">ПРОВЕРКА</span>Калибровка оборудования и симуляция аварийных сценариев.</div>
                  <div className="flex-1 border border-gray-800 p-2 text-[10px]"><span className="text-blue-400 font-bold block mb-1">МОНИТОРИНГ</span>Непрерывная регистрация телеметрии и видеофиксация.</div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase font-mono border-b border-gray-800 pb-2"><Truck size={20} className="text-gray-400" /> Содержание и транспортировка</h2>
                <p className="text-xs">Использовать утверждённые контейнеры. Все перемещения — по согласованному маршруту с сопровождением СБ. При смене условий содержания — немедленное уведомление руководства.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase font-mono border-b border-gray-800 pb-2"><AlertOctagon size={20} className="text-red-500" /> Инцидент-менеджмент и эскалация</h2>
                <div className="space-y-2 text-xs">
                  <p><b className="text-white uppercase">Немедленные действия:</b> обеспечить безопасность, изолировать зону, оповестить руководителя Зоны по защищённым каналам.</p>
                  <p><b className="text-white uppercase">Роли уровня 3:</b> контроль исполнения первичных шагов реагирования, координация сбора улик и формирование рекомендаций по ресурсам.</p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase font-mono border-b border-gray-800 pb-2"><Gavel size={20} className="text-purple-400" /> Этические и кадровые требования</h2>
                <p className="text-xs">Решения о списании объектов проходят многоступенчатую проверку. Подготовку материалов осуществляет персонал уровня 3. Несоблюдение процедур ведёт к отстранению и расследованию.</p>
              </section>

              <div className="bg-black border border-gray-800 p-4">
                <h2 className="text-sm font-bold text-white uppercase mb-4 text-center">Сводная таблица ориентиров</h2>
                <table className="w-full text-[9px] uppercase font-mono text-left border-collapse">
                  <thead><tr className="border-b border-gray-700 text-gray-500">
                    <th className="p-2">Класс</th><th className="p-2">Суть</th><th className="p-2">Типовые требования</th><th className="p-2">Доступ</th>
                  </tr></thead>
                  <tbody>
                    <tr className="border-b border-gray-800/50">
                      <td className="p-2 text-green-500">Безопасный</td><td className="p-2">Стабилен</td><td className="p-2">Стандартные процедуры</td><td className="p-2">0–2</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="p-2 text-yellow-500">Евклид</td><td className="p-2">Непредсказуем</td><td className="p-2">Усиленный мониторинг</td><td className="p-2">1–3</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="p-2 text-red-500">Кетер</td><td className="p-2">Сложное удержание</td><td className="p-2">Ресурсоёмкие меры</td><td className="p-2">2–3+</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-purple-500">Спец.категории</td><td className="p-2">Система/Риск</td><td className="p-2">Ограниченный доступ</td><td className="p-2">3–5</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <footer className="pt-8 border-t border-gray-800 flex justify-between items-center opacity-40">
                <div className="text-[9px] font-mono uppercase tracking-widest">SCPNET SECURE DOC // ADM-L3-REFS</div>
                <div className="w-8 h-8"><SCPLogo /></div>
              </footer>
            </article>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderClearanceTable = () => {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-20 select-none">
         <Lock size={64} className="mb-4" />
         <p className="text-xl font-black uppercase tracking-[0.5em]">Доступ заблокирован</p>
         <p className="text-xs mt-2 uppercase">Раздел находится на стадии формирования</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold tracking-widest text-scp-text uppercase flex items-center gap-3">
          <BookOpen className="text-scp-terminal" /> Архив Документации
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
        <aside className="lg:col-span-3 space-y-2">
          <div className="p-4 border border-gray-800 bg-scp-panel mb-4">
             <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Раздел</p>
             <h3 className="text-sm font-black text-white uppercase font-mono">Основные сведения</h3>
          </div>
          <button onClick={() => setActiveTab('general')} className={`w-full flex items-center justify-between p-4 border transition-all ${activeTab === 'general' ? 'bg-scp-terminal text-black border-scp-terminal font-bold' : 'bg-transparent text-gray-500 border-gray-800 hover:text-white hover:border-gray-600'}`}>
            <div className="flex items-center gap-3"><Info size={16} /><span className="text-xs uppercase tracking-widest font-mono">Общая информация</span></div><ChevronRight size={14} />
          </button>
          <button onClick={() => setActiveTab('objects')} className={`w-full flex items-center justify-between p-4 border transition-all ${activeTab === 'objects' ? 'bg-scp-terminal text-black border-scp-terminal font-bold' : 'bg-transparent text-gray-500 border-gray-800 hover:text-white hover:border-gray-600'}`}>
            <div className="flex items-center gap-3"><Box size={16} /><span className="text-xs uppercase tracking-widest font-mono">Классы объектов</span></div><ChevronRight size={14} />
          </button>
          <button className="w-full flex items-center justify-between p-4 border border-gray-800 text-gray-700 cursor-not-allowed opacity-50" disabled>
            <div className="flex items-center gap-3"><Scale size={16} /><span className="text-xs font-bold uppercase tracking-widest font-mono">Комитет по этике</span></div><Lock size={14} />
          </button>
        </aside>
        <div className="lg:col-span-9 overflow-y-auto pr-2 scrollbar-hide">
          {activeTab === 'general' && renderGeneralInfo()}
          {activeTab === 'objects' && renderObjectClasses()}
          {activeTab === 'clearance' && renderClearanceTable()}
        </div>
      </div>
    </div>
  );
};

const Check = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const X = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default Guide;
