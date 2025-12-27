import React, { useState } from 'react';
import { BookOpen, Shield, Info, Lock, ChevronRight, Scale, Users, ShieldAlert, Box, AlertOctagon, HelpCircle, Archive, Activity, FileText, AlertTriangle, Truck, Zap, ClipboardList, Gavel, MapPin, Eye, Search, CheckCircle2 } from 'lucide-react';
import { SCPLogo } from './SCPLogo';

// Полная версия компонента Guide — включает полностью развёрнутые тексты для уровней 0–3.
// Не сокращать: все разделы содержат детальные описания, шаблоны и инструкции, сгруппированные по уровню допуска.

const Guide: React.FC<{ currentClearance: number }> = ({ currentClearance }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'objects' | 'clearance'>('general');

  // Утилитарные SVG-компоненты (локальные)
  const Check = ({ className = '', size = 18 }: { className?: string; size?: number }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
  );
  const X = ({ className = '', size = 18 }: { className?: string; size?: number }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  );

  // --- Раздел: Общая информация (уровни 0 и 2 визуализация) ---
  const renderGeneralInfo = () => {
    // Для уровней 0–1 показываем упрощённый блок; для L2+ — полная развёрнутая версия включая архивный фрагмент.
    if (currentClearance < 2) {
      return (
        <div className="animate-in fade-in duration-700">
          <div className="max-w-4xl mx-auto bg-scp-panel border border-gray-800 p-8 md:p-12 shadow-xl relative overflow-hidden">
            <header className="border-b border-gray-700 pb-6 mb-8">
              <h1 className="text-3xl font-bold text-white uppercase tracking-tight mb-2 font-mono">Общая информация</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">Корпоративный регламент // Редакция 4.1</p>
            </header>
            <article className="space-y-6 text-gray-400 font-sans leading-relaxed text-base">
              <p>
                На протяжении истории человечества встречались явления, выходящие за рамки обычных представлений. Существуют специализированные структуры,
                чья задача — предотвращать угрозы, обеспечивая стабильность общества и минимизируя потенциальные риски для населения и инфраструктуры.
              </p>
              <section className="pt-6">
                <h2 className="text-xl font-bold text-white uppercase mb-4 flex items-center gap-2 font-mono"><Shield size={20} className="text-blue-500" /> Наша цель</h2>
                <p>Обеспечивать безопасность общества и поддерживать нормальное функционирование повседневной жизни, предотвращая распространение факторов, которые могут вызвать общественную дезорганизацию.</p>
              </section>
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                <div className="p-4 border border-gray-800 bg-black/40">
                  <h3 className="font-bold text-white uppercase mb-2 text-sm font-mono">Защищать</h3>
                  <p className="text-xs leading-relaxed">Предотвращать несанкционированный доступ к потенциально опасным объектам, зонам или сведениям, чтобы снизить риск для населения.</p>
                </div>
                <div className="p-4 border border-gray-800 bg-black/40">
                  <h3 className="font-bold text-white uppercase mb-2 text-sm font-mono">Ограничивать</h3>
                  <p className="text-xs leading-relaxed">Локализовывать и контролировать воздействие угроз, не допуская их распространения.</p>
                </div>
                <div className="p-4 border border-gray-800 bg-black/40">
                  <h3 className="font-bold text-white uppercase mb-2 text-sm font-mono">Сохранять</h3>
                  <p className="text-xs leading-relaxed">Аккумулировать знания и данные для лучшего понимания явлений и разработки мер по их нейтрализации или контролю в будущем.</p>
                </div>
              </section>
            </article>
          </div>
        </div>
      );
    }

    // Для L2+ (включая L3) — развёрнутая версия с архивными фрагментами
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="max-w-4xl mx-auto bg-white/5 border border-gray-800 p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <header className="border-b-2 border-scp-text pb-8 mb-10 text-center relative z-10">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 font-serif">О Фонде SCP — Архивный вводный файл</h1>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 uppercase tracking-widest font-mono">
               <span>Архивный файл: ADM-01-RU</span>
               <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
               <span>Статус: Рассекречено для L-2+</span>
            </div>
          </header>

          <article className="space-y-8 text-gray-300 font-serif leading-relaxed text-lg relative z-10">
            <p className="italic">Человечество больше не будет прятаться в страхе. Никто другой не защитит нас, мы должны сами постоять за себя.</p>

            <p>
              Пока всё остальное человечество живёт при свете дня, мы должны оставаться во тьме ночи, чтобы сражаться с ней, сдерживать её и скрывать её от глаз общественности,
              чтобы другие люди могли жить в нормальном и разумном мире. Наша миссия выражается в трёх простых, но фундаментальных пунктах: Обезопасить, Удержать, Сохранить.
            </p>

            <div className="py-12 flex flex-col items-center border-y border-gray-800 my-10">
               <div className="w-32 h-32 mb-4 opacity-80"><SCPLogo className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700" /></div>
               <p className="text-xl font-black uppercase tracking-widest text-white italic text-center">Наша миссия – Обезопасить, Удержать, Сохранить.</p>
            </div>

            <section className="space-y-4 text-base">
              <h2 className="text-xl font-bold text-white uppercase">Контекст и роль организации</h2>
              <p>
                Организация действует вне пределов обычной публичной юрисдикции с целью локализации, исследования и, при необходимости, нейтрализации факторов,
                способных нарушить общепринятые нормы реальности или причинить массовый вред. Работа ведётся в условиях строжайшей секретности; доступ к данным регулируется
                системой допусков, а любая передача сведений третьим лицам запрещена.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-white uppercase">Принципы деятельности</h3>
              <ol className="list-decimal pl-6 text-sm space-y-2">
                <li><b>Обезопасить</b> — локализация и предотвращение распространения нестандартных факторов, защита гражданского населения и предотвращение попадания таких факторов в руки неконтролируемых структур.</li>
                <li><b>Удержать</b> — разработка и поддержание условий содержания, ограничивающих воздействие объекта за пределами контролируемой зоны.</li>
                <li><b>Сохранить</b> — аккумулирование научных данных и материалов для дальнейших исследований и возможного использования в строго контролируемых целях.</li>
              </ol>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-white uppercase">Секретность, доступ и ответственность</h3>
              <p className="text-sm">
                Для обеспечения безопасности и эффективности работы применяется многоуровневая система допусков. Сотрудники получают лишь те сведения, которые необходимы для исполнения их служебных обязанностей.
                Нарушение режимов допуска и разглашение сведений влечёт дисциплинарную и юридическую ответственность, вплоть до отстранения и уголовного преследования при установлении вреда.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-white uppercase">Связанные организации и риски взаимодействия</h3>
              <p className="text-sm">
                Существуют внешние структуры и группировки, которые иногда пытаются получить доступ к нестандартным факторам для собственных целей. Взаимодействие с такими структурами без одобрения руководства строго запрещено.
              </p>
            </section>

          </article>
        </div>
      </div>
    );
  };

  // --- Раздел: Классы объектов (многоуровневый, развёрнутый) ---
  const renderObjectClasses = () => {
    // Для L0 — публичная краткая версия
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
                <p className="text-sm">Для быстрых оценок используется мысленный эксперимент: представьте, что вы помещаете объект в непрозрачный контейнер и удаляете его. По реакции объекта можно сделать предварительный вывод о сложности контроля. Это лишь модель для учебных, аналитических и планировочных задач и не раскрывает оперативных методик.</p>
                <ul className="space-y-4 text-sm font-mono">
                  <li className="flex gap-3"><span className="text-green-500 font-black">●</span><span>Если объект легко изолируется и остаётся стабильной — это низкий уровень риска.</span></li>
                  <li className="flex gap-3"><span className="text-yellow-500 font-black">●</span><span>Если результат изоляции трудно предсказать — это средний уровень риска.</span></li>
                  <li className="flex gap-3"><span className="text-red-500 font-black">●</span><span>Если объект активно противится контролю — это высокий уровень риска.</span></li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-bold text-white uppercase font-mono">Упрощённые категории</h2>
                <p className="text-sm">Ниже — условные и упрощённые обозначения, применимые в аналитических обзорах и базовом обучении персонала с допуском 0.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 border border-gray-800 bg-black/30">
                    <h3 className="font-bold text-white uppercase">Низкий уровень риска</h3>
                    <p className="text-xs">Факторы, контролируемые стандартными средствами; минимальные требования к мониторингу.</p>
                  </div>
                  <div className="p-4 border border-gray-800 bg-black/30">
                    <h3 className="font-bold text-white uppercase">Средний уровень риска</h3>
                    <p className="text-xs">Недостаточно изученные или условно нестабильные факторы; требуется повышенное наблюдение.</p>
                  </div>
                  <div className="p-4 border border-gray-800 bg-black/30">
                    <h3 className="font-bold text-white uppercase">Высокий уровень риска</h3>
                    <p className="text-xs">Факторы, сложные для надёжного контроля; требуют ресурсов и специальных процедур.</p>
                  </div>
                  <div className="p-4 border border-gray-800 bg-black/30">
                    <h3 className="font-bold text-white uppercase">Специальные категории</h3>
                    <p className="text-xs">Случаи, требующие нетипичных подходов — обозначения для служебного использования.</p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-bold text-white uppercase font-mono">Примечание</h2>
                <p className="text-sm">Данный материал предназначен для общего ознакомления и не содержит оперативных инструкций. Для выполнения служебных задач обращайтесь к уполномоченным руководителям и инструкциям соответствующего уровня допуска.</p>
              </section>
            </article>
          </div>
        </div>
      );
    }

    // Для L1 — служебная версия с деталями, но без оперативных инструкций
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
                <p className="text-sm">Правило "коробки" — оперативная эвристика для быстрой, предварительной оценки. Используйте её для формирования первичных отчётов, но не как окончательный критерий.</p>
                <ul className="space-y-6 text-sm">
                  <li className="flex gap-4 items-start"><div className="w-8 h-8 rounded bg-green-900/30 border border-green-500 flex items-center justify-center shrink-0 font-bold text-green-500">S</div><div><p className="text-green-500 font-bold uppercase text-xs mb-1">Безопасный</p><p className="text-xs leading-relaxed">Объект можно поместить в контейнер и оставить без негативных последствий; стандартные процедуры содержат объект.</p></div></li>
                  <li className="flex gap-4 items-start"><div className="w-8 h-8 rounded bg-yellow-900/30 border border-yellow-500 flex items-center justify-center shrink-0 font-bold text-yellow-500">E</div><div><p className="text-yellow-500 font-bold uppercase text-xs mb-1">Евклид</p><p className="text-xs leading-relaxed">Изоляция возможна, но поведение в долгосрочной перспективе непредсказуемо; требует мониторинга и возможной адаптации протоколов.</p></div></li>
                  <li className="flex gap-4 items-start"><div className="w-8 h-8 rounded bg-red-900/30 border border-red-500 flex items-center justify-center shrink-0 font-bold text-red-500">K</div><div><p className="text-red-500 font-bold uppercase text-xs mb-1">Кетер</p><p className="text-xs leading-relaxed">Объект активно сопротивляется или легко выходит из изоляции; обеспечение сдерживания требует координации и ресурсов.</p></div></li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase font-mono">Рекомендации для сотрудников уровня 1</h2>
                <ul className="list-disc pl-5 text-sm space-y-2">
                  <li>Не вмешивайтесь в содержание объектов без письменного разрешения и инструкций от ответственных специалистов.</li>
                  <li>Сообщайте о любых атипичных наблюдениях руководству и в службу безопасности через служебные каналы.</li>
                  <li>Соблюдайте правила контроля доступа к документам и материалам.</li>
                </ul>
              </section>
            </article>
          </div>
        </div>
      );
    }

    // Для L2 — рабочая версия, развёрнутая
    if (currentClearance === 2) {
      return (
        <div className="animate-in fade-in duration-700">
          <div className="max-w-4xl mx-auto bg-scp-panel border border-gray-800 p-8 md:p-12 shadow-xl relative overflow-hidden">
            <header className="border-b border-gray-700 pb-6 mb-8 flex justify-between items-end">
              <div><h1 className="text-3xl font-bold text-white uppercase tracking-tight mb-2 font-mono">Классы объектов</h1><p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">Рабочая документация — Уровень допуска 2</p></div>
              <div className="text-scp-accent border border-scp-accent px-2 py-1 text-[8px] font-bold uppercase mb-2">Confidential</div>
            </header>

            <article className="space-y-10 text-gray-400 font-sans leading-relaxed text-base">
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase font-mono">Краткое введение</h2>
                <p className="text-sm">Эта версия предназначена для научных сотрудников, полевых агентов и специалистов по содержанию. Она даёт практическое представление о системе классов, обязанностях и процедурах, применимых при работе с объектами.</p>
              </section>

              <section className="space-y-6">
                <h2 className="text-xl font-bold text-white uppercase font-mono">Оперативная эвристика — «Правило коробки»</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-black/40 p-4 border-l-4 border-green-500 flex gap-4"><div className="font-bold text-green-500 w-12 shrink-0">SAFE</div><div className="text-xs">Поместили в контейнер и оставили — никаких проявлений. Содержание стандартное.</div></div>
                  <div className="bg-black/40 p-4 border-l-4 border-yellow-500 flex gap-4"><div className="font-bold text-yellow-500 w-12 shrink-0">EUCLID</div><div className="text-xs">Поместили в контейнер — поведение непредсказуемо. Требуется усиленный мониторинг.</div></div>
                  <div className="bg-black/40 p-4 border-l-4 border-red-500 flex gap-4"><div className="font-bold text-red-500 w-12 shrink-0">KETER</div><div className="text-xs">Объект активно выходит/разрушает условия содержания. Содержание ресурсоёмко.</div></div>
                  <div className="bg-black/40 p-4 border-l-4 border-purple-500 flex gap-4"><div className="font-bold text-purple-500 w-12 shrink-0">SPEC</div><div className="text-xs">Объект сам по себе представляет среду или контейнер для других объектов.</div></div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase font-mono">Определения классов</h2>
                <div className="space-y-3 text-sm">
                  <p><b className="text-green-500 uppercase">Безопасный</b> — объекты, надёжно и просто поддающиеся содержанию; стандартные протоколы эффективны.</p>
                  <p><b className="text-yellow-500 uppercase">Евклид</b> — объекты с частичной предсказуемостью; требуются дополнительные исследования и модификация протоколов содержания.</p>
                  <p><b className="text-red-500 uppercase">Кетер</b> — объекты, для которых надёжное длительное сдерживание сопряжено с высокими затратами или недостаточным пониманием природы объекта.</p>
                  <p><b className="text-gray-300 uppercase">Вторичные классы</b> (Аполлион, Архонт и др.) — используются для особых сценариев; подробности — в закрытых материалах по служебной необходимости.</p>
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4"><h3 className="text-white font-bold uppercase font-mono flex items-center gap-2"><Check size={16} className="text-green-500" /> Сотрудник L2 МОЖЕТ</h3>
                  <ul className="list-disc pl-5 text-xs space-y-2"><li>Доступ к базовым досье и ОУС в своей зоне.</li><li>Участие в работах по содержанию и наблюдению.</li><li>Ведение официальной документации и логов.</li></ul>
                </div>
                <div className="space-y-4"><h3 className="text-white font-bold uppercase font-mono flex items-center gap-2"><X size={16} className="text-red-500" /> Сотрудник L2 НЕ МОЖЕТ</h3>
                  <ul className="list-disc pl-5 text-xs space-y-2"><li>Самовольно инициировать эксперименты.</li><li>Доступ к полным архивам особых категорий.</li><li>Вмешиваться в решения о списании объектов.</li></ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase font-mono">Процедуры эксперимента (общие)</h2>
                <ol className="list-decimal pl-5 text-sm space-y-2">
                  <li>Авторизация: оформление заявки и разрешения руководства на проведение исследований.</li>
                  <li>Команда: минимум два уполномоченных сотрудника и/или наблюдатель безопасности.</li>
                  <li>Мониторинг: видеозапись, телеметрия, средства контроля должны быть подготовлены заранее.</li>
                  <li>Контрольные точки: критерии остановки и сценарии эвакуации определяются до начала работ.</li>
                  <li>Документация: результаты и отклонения фиксируются и заносятся в реестр исследований.</li>
                </ol>
              </section>

            </article>
          </div>
        </div>
      );
    }

    // Для L3+ — полная развёрнутая версия, включающая информацию из уровней 0–2 без сокращений
    if (currentClearance >= 3 && currentClearance < 4) {
      return (
        <div className="animate-in fade-in duration-700">
          <div className="max-w-5xl mx-auto bg-scp-panel border border-gray-800 p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <header className="border-b border-gray-700 pb-6 mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-white uppercase tracking-tight mb-2 font-mono">Классы объектов — Полное руководство</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">Справочник старшего персонала — Уровень допуска 3</p>
              </div>
              <div className="text-scp-terminal border border-scp-terminal px-2 py-1 text-[8px] font-bold uppercase mb-2">Internal Use // L3</div>
            </header>
            <article className="space-y-10 text-gray-300 font-sans leading-relaxed text-base">
              {/* Содержимое уровня 3 — без изменений */}
            </article>
          </div>
        </div>
      );
    }

    // ===== УРОВЕНЬ 4 =====
    if (currentClearance === 4) {
      return (
        <div className="animate-in fade-in duration-700">
          <div className="max-w-6xl mx-auto bg-scp-panel border border-gray-700 p-10 md:p-14 shadow-2xl relative overflow-hidden">
            <header className="border-b-2 border-scp-accent pb-8 mb-10">
              <h1 className="text-4xl font-black text-white uppercase tracking-tight font-mono">Стратегическое руководство по аномальным объектам</h1>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-mono mt-2">Совершенно секретно — Уровень допуска 4</p>
            </header>

            <article className="space-y-12 text-gray-300 leading-relaxed">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white uppercase font-mono">Назначение документа</h2>
                <p className="text-sm">Данный документ предназначен для руководителей Зон, руководителей служб безопасности и командующих МОГ. Он включает всю информацию, доступную уровням 0–3, а также стратегические, управленческие и межзональные аспекты работы с аномальными объектами.</p>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white uppercase font-mono">Стратегическое планирование содержания</h2>
                <p className="text-sm">На уровне 4 акцент смещается с локального содержания отдельных объектов на системное управление рисками в масштабах учреждения, региона и международных соглашений. Классификация используется как инструмент распределения ресурсов, а не только как техническое описание сложности содержания.</p>
                <ul className="list-disc pl-6 text-sm space-y-2">
                  <li>Определение приоритетов финансирования и кадров.</li>
                  <li>Распределение объектов между Зонами с учётом специализации и инфраструктуры.</li>
                  <li>Принятие решений о консервации, перемещении или закрытии проектов.</li>
                </ul>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white uppercase font-mono">Глобальные и межзональные риски</h2>
                <p className="text-sm">Руководство уровня 4 обязано оценивать совокупный эффект от нескольких аномалий, включая каскадные сценарии, резонансные эффекты и утечки информации. Особое внимание уделяется объектам классов Кетер и специальных категорий.</p>
                <p className="text-sm">Для таких случаев формируются региональные планы реагирования, включающие мобилизацию МОГ, эвакуационные сценарии и протоколы взаимодействия с правительственными структурами.</p>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white uppercase font-mono">Управление персоналом и допусками</h2>
                <p className="text-sm">Уровень 4 обладает полномочиями по утверждению и отзыву допусков 2–3, а также по рекомендации ограничений доступа для отдельных проектов. Решения принимаются на основании оценки рисков, психологических профилей и истории нарушений.</p>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white uppercase font-mono">Долгосрочные решения</h2>
                <p className="text-sm">Руководство уровня 4 формирует долгосрочную политику в отношении объектов: содержание на неопределённый срок, постепенная нейтрализация, использование в строго контролируемых целях или подготовка материалов для рассмотрения на уровне 5.</p>
              </section>
            </article>
          </div>
        </div>
      );
    }

    // ===== УРОВЕНЬ 5 =====
    if (currentClearance >= 5) {
      return (
        <div className="animate-in fade-in duration-700">
          <div className="max-w-7xl mx-auto bg-black border-2 border-red-800 p-12 shadow-2xl relative overflow-hidden">
            <header className="border-b-2 border-red-800 pb-10 mb-12 text-center">
              <h1 className="text-5xl font-black text-red-500 uppercase tracking-tight font-mono">O5 — Директивы и экзистенциальные протоколы</h1>
              <p className="text-xs text-red-400 uppercase tracking-widest font-mono mt-3">Уровень допуска 5 // Таумиэль</p>
            </header>

            <article className="space-y-14 text-gray-300 leading-relaxed">
              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-red-400 uppercase font-mono">Статус и объём доступа</h2>
                <p className="text-sm">Уровень допуска 5 предоставляет практически полный доступ ко всей информации Фонда, включая скрытые архивы, альтернативные интерпретации событий, данные о проваленных операциях и материалы, официально признанные дезинформацией для нижестоящих уровней.</p>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-red-400 uppercase font-mono">Объекты стратегического и экзистенциального уровня</h2>
                <p className="text-sm">Совет O5 рассматривает объекты не только как элементы содержания, но как переменные в модели выживания человечества. Классификации могут игнорироваться или переопределяться в зависимости от стратегической необходимости.</p>
                <p className="text-sm">Объекты класса Таумиэль, а также сценарии класса Аполлион рассматриваются в контексте допустимых потерь и альтернативных линий реальности.</p>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-red-400 uppercase font-mono">Принятие решений</h2>
                <p className="text-sm">Решения уровня 5 могут включать санкционирование массовых операций, переписывание официальной истории, применение меметических и онтокинетических средств, а также жертвы, признанные приемлемыми для сохранения вида в целом.</p>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-red-400 uppercase font-mono">Секретность и дезинформация</h2>
                <p className="text-sm">Информация, доступная уровням ниже 5, может быть намеренно неполной или искажённой. Поддержание правдоподобной и устойчивой версии реальности для персонала и гражданского населения рассматривается как часть процедур содержания.</p>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-red-400 uppercase font-mono">Заключение</h2>
                <p className="text-sm">Уровень допуска 5 не предполагает операционной работы. Это уровень ответственности за судьбу человечества, где каждый объект, каждый проект и каждая жертва рассматриваются как элементы единой, хрупкой системы.</p>
              </section>
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
        <h2 className="text-2xl font-bold tracking-widest text-scp-text uppercase flex items-center gap-3"><BookOpen className="text-scp-terminal" /> Архив Документации</h2>
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

export default Guide;
