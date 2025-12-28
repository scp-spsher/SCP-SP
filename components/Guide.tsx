import React, { useState } from 'react';
import { BookOpen, Shield, Info, Lock, ChevronRight, Scale, Users, ShieldAlert, Box, AlertOctagon, HelpCircle, Archive, Activity, FileText, AlertTriangle, Truck, Zap, ClipboardList, Gavel, MapPin, Eye, Search, CheckCircle2 } from 'lucide-react';
import { SCPLogo } from './SCPLogo';

interface GuideProps {
  currentClearance: number;
}

const Guide: React.FC<GuideProps> = ({ currentClearance }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'objects' | 'clearance'>('general');

  // Вспомогательная функция для цензуры текста
  const Redact = ({ text, minLevel, placeholder = "[ДАННЫЕ УДАЛЕНЫ]" }: { text: string, minLevel: number, placeholder?: string }) => {
    if (currentClearance >= minLevel) {
      return <span className="text-scp-text border-b border-white/5">{text}</span>;
    }
    return (
      <code 
        className="bg-black border border-gray-800 text-gray-600 px-1.5 py-0.5 rounded font-mono text-[0.85em] select-none cursor-help mx-0.5 inline-block leading-none translate-y-[-1px] shadow-inner" 
        title={`ДОСТУП ОГРАНИЧЕН: ТРЕБУЕТСЯ УРОВЕНЬ ${minLevel}`}
      >
        {placeholder}
      </code>
    );
  };

  const renderGeneralInfo = () => {
    if (currentClearance === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-700">
          <div className="p-8 border-2 border-red-900 bg-red-950/10 flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(153,27,27,0.2)]">
            <Lock size={64} className="text-red-600 animate-pulse" />
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-red-500 uppercase tracking-[0.3em]">Доступ запрещен</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Требуется уровень допуска 1 или выше</p>
            </div>
            <div className="h-px w-32 bg-red-900/50"></div>
            <p className="text-[10px] text-gray-600 text-center max-w-xs uppercase leading-relaxed font-mono">
              Попытка несанкционированного доступа к основному манифесту зафиксирована. 
              Ваш IP и биометрический профиль переданы в службу безопасности Зоны.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="max-w-4xl mx-auto bg-white/5 border border-gray-800 p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
            <SCPLogo className="w-[500px] h-[500px]" />
          </div>

          <header className="border-b-2 border-scp-text pb-8 mb-10 text-center relative z-10">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 font-serif">О Фонде SCP</h1>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 uppercase tracking-widest font-mono">
               <span>Архивный файл: ADM-01-RU</span>
               <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
               <span>Статус: <Redact text="Рассекречено" minLevel={2} placeholder="ОГРАНИЧЕНО" /></span>
            </div>
          </header>

          <article className="space-y-8 text-gray-300 font-serif leading-relaxed text-lg relative z-10">
            <div className="space-y-4">
              <p className="italic">
                Человечество в своем нынешнем виде существует уже четверть миллиона лет, но только последние четыре тысячи имели хоть какое-то значение.
              </p>
              <p>
                Итак, чем мы занимались почти 250 тысяч лет? Мы ютились в пещерах вокруг костерков, боясь вещей, которых не понимали. Это было нечто большее, чем объяснение того, почему восходит Солнце: это были тайны огромных птиц с головами людей и оживающих скал. Мы назвали их "богами" и "демонами" и стали молить их о защите и спасении.
              </p>
              <p>
                С течением времени их стало меньше, а нас - больше. Когда страхи пошли на убыль, мир начал становиться более понятным. Но всё же необъяснимое не могло исчезнуть насовсем, как будто сама Вселенная требует абсурдного и невозможного.
              </p>
              <p>
                Человечество больше не будет прятаться в страхе. Никто другой не защитит нас, мы должны сами постоять за себя.
              </p>
              <p>
                Пока всё остальное человечество живёт при свете дня, мы должны оставаться во тьме ночи, чтобы сражаться с ней, сдерживать её и скрывать её от глаз общественности, чтобы другие люди могли жить в нормальном и разумном мире.
              </p>
            </div>

            <div className="py-12 flex flex-col items-center border-y border-gray-800 my-10">
               <div className="w-32 h-32 mb-4 opacity-80 group">
                  <SCPLogo className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700 cursor-crosshair" />
               </div>
               <p className="text-xl font-black uppercase tracking-widest text-white italic text-center">Наша миссия – Обезопасить, Удержать, Сохранить.</p>
               <p className="text-xs text-gray-500 mt-2 font-mono">— <Redact text="Администратор" minLevel={5} placeholder="ОБЪЕКТ СОВЕТА O5" /></p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-scp-accent pl-4 font-mono">Описание цели</h2>
              <p>
                Невидимый и вездесущий, Фонд SCP <Redact text="находится вне пределов чьей-либо юрисдикции. Он наделён соответствующими полномочиями всех основных мировых правительств и имеет задачу сдерживания объектов и явлений, которые ставят под угрозу естественность и нормальность этого мира" minLevel={2} placeholder="[ДАННЫЕ УДАЛЕНЫ]" />. Подобные аномалии представляют собой значительную угрозу для глобальной безопасности и могут нести как физическую, так и психологическую опасность.
              </p>
              <p>
                Фонд действует, чтобы нормы так и оставались нормами, чтобы население Земли могло и дальше жить обычной жизнью, не боясь и не подвергая сомнению своё восприятие окружающего мира, чтобы человечество было защищено от различных внеземных угроз, а также угроз из других измерений и вселенных.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-xl font-black text-white uppercase font-mono">Наша миссия строится на трёх основных постулатах:</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-scp-terminal font-bold uppercase flex items-center gap-2"><Shield size={18} /> Обезопасить</h3>
                  <p className="text-sm">
                    Фонд захватывает аномалии, не допуская их попадания в руки гражданских лиц (тем самым обеспечивая их безопасность) или враждебных организаций (тем самым обеспечивая безопасность от них). Это достигается путём ведения глобальной слежки и быстрого реагирования на любое проявления аномальной активности.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-blue-500 font-bold uppercase flex items-center gap-2"><Box size={18} /> Удержать</h3>
                  <p className="text-sm">
                    Фонд содержит аномалии, чтобы не допускать распространения их влияния. Это достигается путём их перемещения, маскировки или <Redact text="демонтажа" minLevel={3} placeholder="УДАЛЕНО" />, а также подавлением или недопущением распространения информации об аномалиях среди широкой общественности.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-scp-accent font-bold uppercase flex items-center gap-2"><ShieldAlert size={18} /> Сохранить</h3>
                  <p className="text-sm">
                    Фонд защищает человечество от аномальных эффектов, а также сохраняет сами аномалии, пока они не будут полностью поняты или же на их основе не будут разработаны новые научные теории. Фонд также может <Redact text="нейтрализовывать или уничтожать аномалии" minLevel={3} placeholder="[СЕКРЕТНО]" />, но подобные действия применяются лишь в самых крайних случаях, когда аномалия слишком опасна, чтобы её можно было содержать.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-gray-600 pl-4 font-mono">Операции Фонда</h2>
              <p className="text-sm"><Redact text="С целью выполнения основных задач Фонд регулярно проводит множество тайных операций по всему миру." minLevel={2} placeholder="[ДАННЫЕ УДАЛЕНЫ]" /></p>
              
              <div className="p-4 border border-gray-800 bg-black/40 space-y-3">
                <h3 className="text-white font-bold uppercase text-sm">Особые условия содержания — "SCP"</h3>
                <p className="text-xs">
                  Фонд обладает обширной базой данных об аномалиях, требующих особых условий содержания, что обычно сокращается как "ОУС". Большая часть этой информации содержит общие сведения об аномальных объектах и описания процедур, требуемых для их безопасного содержания или выполняемых в случае нарушений условий содержания и других подобных событий.
                </p>
                <p className="text-xs">
                  Аномалии имеют множество форм, среди них встречаются предметы, существа, места и даже явления. При постановке на содержание каждой такой аномалии присваивается один из классов, после чего она или транспортируется в одно из множества учреждений Фонда, или же, если её перемещение невозможно, содержится на месте обнаружения.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white uppercase font-mono">Секретность</h2>
              <p className="text-sm">
                Фонд действует в режиме строжайшей секретности. Каждый из его сотрудников обладает одним из уровней допуска, который позволяет ему получать доступ только к необходимой для выполнения его обязанностей информации. Персонал Фонда, уличённый в нарушении протоколов секретности, <Redact text="идентифицируется, задерживается и подвергается дисциплинарным мерам, зависящим от серьёзности нарушения." minLevel={2} placeholder="[УДАЛЕНО]" />.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white uppercase font-mono">Связанные организации и враждебные группировки</h2>
              <p className="text-sm">
                Фонд SCP - не единственная организация, которой известно об аномалиях, многие другие группировки пытаются взаимодействовать с аномальными объектами или как-то их использовать. Некоторые такие связанные организации имеют схожие с Фондом цели и могут сотрудничать с ним, но большая часть действует в собственных интересах и чаще всего пытается приспособить аномалии для получения прибыли.
              </p>
              <p className="text-sm">
                От персонала Фонда требуется проявлять осторожность при взаимодействии с членами подобных группировок, сотрудничество с ними без предварительного согласования с руководством может послужить причиной применения дисциплинарных мер, вплоть до <Redact text="устранения" minLevel={4} placeholder="[ОГРАНИЧЕНО]" />.
              </p>
            </section>
          </article>
          
          <footer className="mt-16 pt-8 border-t border-gray-800 flex justify-between items-center opacity-40">
             <div className="text-[9px] font-mono uppercase tracking-widest">SCPNET SECURE DOC // ADM-MANIFESTO</div>
             <div className="w-8 h-8"><SCPLogo /></div>
          </footer>
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
                <p className="italic text-sm">Для быстрых оценок используется простой мысленный эксперимент:</p>
                <ul className="space-y-4 text-sm font-mono">
                  <li className="flex gap-3">
                    <span className="text-green-500 font-black">●</span>
                    <span>Если объект или ситуация легко изолируется и остаётся стабильной — это <span className="text-green-500 uppercase">низкий уровень риска</span>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-yellow-500 font-black">●</span>
                    <span>Если результат изоляции заранее трудно предсказать — это <span className="text-yellow-500 uppercase">средний уровень риска</span>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-500 font-black">●</span>
                    <span>Если объект активно противится контролю или выходит за рамки ограничений — это <span className="text-red-500 uppercase">высокий уровень риска</span>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-500 font-black">●</span>
                    <span>Если объект выполняет функцию управления или контроля над другими факторами — он относится к <span className="text-purple-500 uppercase">специальной категории</span>.</span>
                  </li>
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
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">Версия для служебного пользования — Уровень допуска 1</p>
            </header>

            <article className="space-y-8 text-gray-400 font-sans leading-relaxed text-base">
              <section className="bg-black/40 border-l-4 border-scp-terminal p-6 space-y-4 shadow-inner">
                <h2 className="text-xl font-bold text-white uppercase font-mono flex items-center gap-2">
                  <Box size={20} className="text-scp-terminal" /> Правило «коробки» — оперативная эвристика
                </h2>
                <p className="italic text-xs text-gray-500">Для быстрой предварительной оценки применяется простая мысленная проверка:</p>
                <ul className="space-y-6 text-sm">
                  <li className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded bg-green-900/30 border border-green-500 flex items-center justify-center shrink-0 font-bold text-green-500">S</div>
                    <div>
                      <p className="text-green-500 font-bold uppercase text-xs mb-1">Безопасный (Safe)</p>
                      <p className="text-xs leading-relaxed">Если объект можно поместить в контейнер и оставить — без негативных последствий (низкая сложность содержания).</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded bg-yellow-900/30 border border-yellow-500 flex items-center justify-center shrink-0 font-bold text-yellow-500">E</div>
                    <div>
                      <p className="text-yellow-500 font-bold uppercase text-xs mb-1">Евклид (Euclid)</p>
                      <p className="text-xs leading-relaxed">Если изоляция возможна, но результат непредсказуем (средняя сложность содержания).</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded bg-red-900/30 border border-red-500 flex items-center justify-center shrink-0 font-bold text-red-500">K</div>
                    <div>
                      <p className="text-red-500 font-bold uppercase text-xs mb-1">Кетер (Keter)</p>
                      <p className="text-xs leading-relaxed">Если объект легко выходит из изоляции или активно сопротивляется содержанию (высокая сложность содержания).</p>
                    </div>
                  </li>
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
              <div>
                <h1 className="text-3xl font-bold text-white uppercase tracking-tight mb-2 font-mono">Классы объектов</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">Рабочая документация — Уровень допуска 2</p>
              </div>
              <div className="text-scp-accent border border-scp-accent px-2 py-1 text-[8px] font-bold uppercase mb-2">Confidential // L2</div>
            </header>

            <article className="space-y-10 text-gray-400 font-sans leading-relaxed text-base">
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase font-mono flex items-center gap-2 border-b border-gray-800 pb-2">
                   <Info size={20} className="text-blue-400" /> Краткое введение
                </h2>
                <p className="text-sm">
                  Эта версия предназначена для сотрудников с допуском 2. Она даёт полноценное, рабочее представление о системе классов, практических требованиях к содержанию и обязанностях персонала, имеющего прямой доступ к аномальным объектам или данным о них.
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-xl font-bold text-white uppercase font-mono flex items-center gap-2">
                  <Box size={20} className="text-scp-terminal" /> Оперативная эвристика — «Правило коробки»
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-black/40 p-4 border-l-4 border-green-500 flex gap-4">
                    <div className="font-bold text-green-500 w-12 shrink-0">SAFE</div>
                    <div className="text-xs">Поместили в контейнер и оставили — никаких проявлений → обычно <b>«Безопасный»</b>: содержание стандартное, контролируемое.</div>
                  </div>
                  <div className="bg-black/40 p-4 border-l-4 border-yellow-500 flex gap-4">
                    <div className="font-bold text-yellow-500 w-12 shrink-0">EUCLID</div>
                    <div className="text-xs">Поместили в контейнер — поведение непредсказуемо → <b>«Евклид»</b>: требуется усиленный мониторинг, возможны нестандартные процедуры.</div>
                  </div>
                  <div className="bg-black/40 p-4 border-l-4 border-red-500 flex gap-4">
                    <div className="font-bold text-red-500 w-12 shrink-0">KETER</div>
                    <div className="text-xs">Поместили в контейнер — объект активно выходит/разрушает условия содержания → <b>«Кетер»</b>: содержание ресурсоёмко и/или ненадёжно.</div>
                  </div>
                  <div className="bg-black/40 p-4 border-l-4 border-purple-500 flex gap-4">
                    <div className="font-bold text-purple-500 w-12 shrink-0">SPEC</div>
                    <div className="text-xs">Объект сам по себе представляет среду/контейнер для других объектов → <b>специальная категория</b>.</div>
                  </div>
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
              <div>
                <h1 className="text-3xl font-bold text-white uppercase tracking-tight mb-2 font-mono">Классы объектов</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">Справочник старшего персонала — L3</p>
              </div>
              <div className="text-scp-terminal border border-scp-terminal px-2 py-1 text-[8px] font-bold uppercase mb-2">Internal Use // L3</div>
            </header>

            <article className="space-y-10 text-gray-400 font-sans leading-relaxed text-base">
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase font-mono flex items-center gap-2 border-b border-gray-800 pb-2">
                   <Info size={20} className="text-blue-400" /> Краткое назначение документа
                </h2>
                <p className="text-sm">
                  Эта памятка — рабочий справочник для сотрудников с допуском Уровня 3: старших научных сотрудников, руководителей проектов, офицеров службы безопасности и оперативников МОГ.
                </p>
              </section>

              <section className="bg-black/40 border border-gray-800 p-6 space-y-4">
                <h2 className="text-xl font-bold text-white uppercase font-mono flex items-center gap-2">
                  <Eye size={20} className="text-scp-terminal" /> Короткий конспект
                </h2>
                <p className="text-xs italic">Цель классификации — оценить сложность содержания и потребность в ресурсах; класс ≠ прямой показатель опасности.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono">
                  <div className="p-2 border border-gray-800 bg-green-950/10">● SAFE: Стабилен.</div>
                  <div className="p-2 border border-gray-800 bg-yellow-950/10">● EUCLID: Непредсказуем.</div>
                  <div className="p-2 border border-gray-800 bg-red-950/10">● KETER: Ресурсоёмок.</div>
                  <div className="p-2 border border-gray-800 bg-purple-950/10">● SPEC: Среда/Система.</div>
                </div>
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
        {/* Navigation - Sidebar */}
        <aside className="lg:col-span-3 space-y-2">
          <div className="p-4 border border-gray-800 bg-scp-panel mb-4">
             <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Раздел</p>
             <h3 className="text-sm font-black text-white uppercase font-mono">Основные сведения</h3>
          </div>
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center justify-between p-4 border transition-all ${activeTab === 'general' ? 'bg-scp-terminal text-black border-scp-terminal font-bold' : 'bg-transparent text-gray-500 border-gray-800 hover:text-white hover:border-gray-600'}`}
          >
            <div className="flex items-center gap-3">
              <Info size={16} />
              <span className="text-xs uppercase tracking-widest font-mono">Общая информация</span>
            </div>
            <ChevronRight size={14} />
          </button>
          <button 
            onClick={() => setActiveTab('objects')}
            className={`w-full flex items-center justify-between p-4 border transition-all ${activeTab === 'objects' ? 'bg-scp-terminal text-black border-scp-terminal font-bold' : 'bg-transparent text-gray-500 border-gray-800 hover:text-white hover:border-gray-600'}`}
          >
            <div className="flex items-center gap-3">
              <Box size={16} />
              <span className="text-xs uppercase tracking-widest font-mono">Классы объектов</span>
            </div>
            <ChevronRight size={14} />
          </button>
          <button 
            className="w-full flex items-center justify-between p-4 border border-gray-800 text-gray-700 cursor-not-allowed opacity-50"
            disabled
          >
            <div className="flex items-center gap-3">
              <Scale size={16} />
              <span className="text-xs font-bold uppercase tracking-widest font-mono">Комитет по этике</span>
            </div>
            <Lock size={14} />
          </button>
        </aside>

        {/* Content Area */}
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
