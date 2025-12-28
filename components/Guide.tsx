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
    // Текст для тех, у кого есть допуск (тоже в стиле кода)
    return <span className="font-mono text-white underline decoration-gray-600">{text}</span>;
  }
  
  // Оформление заглушки под белый "код"
  return (
    <code className="bg-white/5 border border-white/20 text-white px-1.5 py-0.5 rounded font-mono text-[0.85em] tracking-tight select-none">
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
               <p className="text-xs text-gray-500 mt-2 font-mono">— <Redact text="Администратор" minLevel={5} placeholder="████████████" /></p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-scp-accent pl-4 font-mono">Описание цели</h2>
              <p>
                Невидимый и вездесущий, Фонд SCP <Redact text="находится вне пределов чьей-либо юрисдикции. Он наделён соответствующими полномочиями всех основных мировых правительств и имеет задачу сдерживания объектов и явлений, которые ставят под угрозу естественность и нормальность этого мира" minLevel={2} placeholder="[УДАЛЕНО]" />. Подобные аномалии представляют собой значительную угрозу для глобальной безопасности и могут нести как физическую, так и психологическую опасность.
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
                <h3 className="text-white font-bold uppercase text-sm">Особые условия содержания — "ОУС"</h3>
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
                От персонала Фонда требуется проявлять осторожность при взаимодействии с членами подобных группировок, сотрудничество с ними без предварительного согласования с руководством может послужить причиной применения дисциплинарных мер, вплоть до <Redact text="устранения" minLevel={2} placeholder="[УДАЛЕНО]" />.
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
    if (currentClearance < 2) {
      return (
        <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-700">
          <div className="p-8 border-2 border-red-900 bg-red-950/10 flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(153,27,27,0.2)]">
            <Lock size={64} className="text-red-600 animate-pulse" />
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-red-500 uppercase tracking-[0.3em]">Доступ запрещен</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Требуется уровень допуска 2 или выше</p>
            </div>
            <div className="h-px w-32 bg-red-900/50"></div>
            <p className="text-[10px] text-gray-600 text-center max-w-xs uppercase leading-relaxed font-mono">
              Попытка несанкционированного доступа к системе классификации зафиксирована. 
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
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 font-serif">Классы объектов</h1>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 uppercase tracking-widest font-mono">
               <span>Архивный файл: CLS-DOC-9.04</span>
               <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
               <span>Допуск: <Redact text="Уровень 1+" minLevel={1} placeholder="ЗАСЕКРЕЧЕНО" /></span>
            </div>
          </header>

          <article className="space-y-8 text-gray-300 font-serif leading-relaxed text-base relative z-10">
            
            <section className="bg-black/40 border border-gray-700 p-6 space-y-4 shadow-inner">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-scp-terminal pl-4 font-mono">Памятка по «Правилу коробки»</h2>
              <p className="text-sm italic text-gray-400">Вспомогательная эвристика для оперативной классификации:</p>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex gap-3"><span className="text-green-500 font-black">●</span> <span>Если положить объект в коробку, убрать её подальше, и ничего плохого не случится — это <b>Безопасный</b>.</span></div>
                <div className="flex gap-3"><span className="text-yellow-500 font-black">●</span> <span>Если положить объект в коробку, убрать её подальше, и нельзя заранее сказать, что случится — это <b>Евклид</b>.</span></div>
                <div className="flex gap-3"><span className="text-red-500 font-black">●</span> <span>Если положить объект в коробку, убрать её подальше, и он с лёгкостью вырвется — это <b>Кетер</b>.</span></div>
                <div className="flex gap-3"><span className="text-purple-500 font-black">●</span> <span>Если объект и есть коробка — это <Redact text="Таумиэль" minLevel={3} placeholder="[СЕКРЕТНО]" />.</span></div>
              </div>
            </section>

            <p className="text-sm">
              Все аномальные объекты, сущности и явления, требующие особых условий содержания, подлежат присвоению класса. Класс объекта является частью шаблона статьи и примерным показателем сложности содержания объекта. Внутри статей класс используется для определения ресурсов, необходимых для сдерживания, приоритета исследовательских работ, бюджета объекта и т.д.
            </p>

            <section className="space-y-6">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-scp-accent pl-4 font-mono">Основные классы</h2>
              
              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-green-500 font-black uppercase text-xl flex items-center gap-2">Безопасный (Safe)</h3>
                  <p className="text-sm">
                    Объекты класса «Безопасный» — это аномалии, которые проще всего содержать без последствий. Эти объекты достаточно хорошо изучены для содержания без значительных затрат, либо не проявляют аномального воздействия без определённого внешнего стимула. Назначение аномалии класса «Безопасный» не значит, что работа с ней не несёт угрозы.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-yellow-500 font-black uppercase text-xl flex items-center gap-2">Евклид (Euclid)</h3>
                  <p className="text-sm">
                    К объектам класса «Евклид» относятся недостаточно изученные или изначально непредсказуемые аномалии. Всем аномалиям, которые можно назвать <Redact text="разумными" minLevel={2} placeholder="[УДАЛЕНО]" />, чаще всего присваивается класс не ниже «Евклида», поскольку объект, наделённый собственной волей, по сути непредсказуем.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-red-500 font-black uppercase text-xl flex items-center gap-2">Кетер (Keter)</h3>
                  <p className="text-sm">
                    Объекты класса «Кетер» — это аномалии, постоянное или надёжное содержание которых тяжело реализуемо. «Кетер» не всегда значит опасность, а скорее то, что объект очень сложно содержать или это требует огромных затрат ресурсов <Redact text="и персонала класса D" minLevel={2} placeholder="[ДАННЫЕ УДАЛЕНЫ]" />.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-gray-600 pl-4 font-mono">Вторичные классы</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-purple-500 font-black uppercase text-lg">Таумиэль (Thaumiel)</h3>
                  <p className="text-xs">
                    <Redact 
                      text="Объекты класса «Таумиэль» применяются Фондом исключительно для содержания других аномалий. Сама информация о существовании таких объектов является секретной и доступна только Совету О5." 
                      minLevel={4} 
                      placeholder="ОПИСАНИЕ КЛАССА ЗАСЕКРЕЧЕНО ДЛЯ СОТРУДНИКОВ НИЖЕ УРОВНЯ 4." 
                    />
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-scp-accent font-black uppercase text-lg">Аполлион (Apollyon)</h3>
                  <p className="text-xs">
                    <Redact 
                      text="Объекты класса «Аполлион» являются аномалиями, которые невозможно содержать, и они неминуемо нарушат условия содержания. Обычно связаны с угрозами конца света класса К." 
                      minLevel={3} 
                      placeholder="ДОСТУП ОГРАНИЧЕН. ТРЕБУЕТСЯ ДОПУСК ПО ПРОЕКТУ ТЕРМИНАЦИИ." 
                    />
                  </p>
                </div>

                <div className="space-y-2 border-l border-gray-800 pl-4">
                  <h3 className="text-blue-400 font-black uppercase text-sm italic underline decoration-dotted">Архонт (Archon) / Тикондерога (Ticonderoga)</h3>
                  <p className="text-xs text-gray-500">
                    Аномалии, чье содержание теоретически возможно, но Фонд решил не ставить их на содержание по этическим или логистическим соображениям.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-gray-600 pl-4 font-mono">Нестандартные классы</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-800 bg-black/20">
                  <h4 className="font-bold text-white text-sm mb-1">Обоснованный</h4>
                  <p className="text-[10px] text-gray-400 italic leading-relaxed">Природа целиком объяснена наукой или аномальность была опровергнута.</p>
                </div>
                <div className="p-4 border border-gray-800 bg-black/20">
                  <h4 className="font-bold text-white text-sm mb-1">Нейтрализованный</h4>
                  <p className="text-[10px] text-gray-400 italic leading-relaxed">Утратили аномальность из-за уничтожения или выхода из строя.</p>
                </div>
                <div className="p-4 border border-gray-800 bg-black/20">
                  <h4 className="font-bold text-white text-sm mb-1">Списан</h4>
                  <p className="text-[10px] text-gray-400 italic leading-relaxed"><Redact text="Намеренно уничтожены по решению Совета О5 или Комитета по этике." minLevel={3} /></p>
                </div>
                <div className="p-4 border border-gray-800 bg-black/20">
                  <h4 className="font-bold text-white text-sm mb-1">Ожидает назначения</h4>
                  <p className="text-[10px] text-gray-400 italic leading-relaxed">Временный статус до завершения первичных исследований.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-10 border-t border-gray-800">
              <h2 className="text-xl font-black text-white uppercase font-mono flex items-center gap-2"><HelpCircle size={20} className="text-scp-terminal" /> Часто задаваемые вопросы</h2>
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-300">Что такое класс объекта?</p>
                  <p className="text-xs text-gray-500">Примерный индикатор того, насколько опасен и сложен в содержании объект.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-300">Если объект очень опасен, должен ли его класс быть более высоким?</p>
                  <p className="text-xs text-gray-500">Нет. Класс зависит от сложности содержания, а не от опасности. Кошка-телепорт — это <b>Кетер</b>, а кнопка конца света — <b>Безопасный</b>.</p>
                </div>
              </div>
            </section>
          </article>
          
          <footer className="mt-16 pt-8 border-t border-gray-800 flex justify-between items-center opacity-40">
             <div className="text-[9px] font-mono uppercase tracking-widest">SCPNET SECURE DOC // CLASS-SYSTEM-ALPHA</div>
             <div className="w-8 h-8"><SCPLogo /></div>
          </footer>
        </div>
      </div>
    );
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
