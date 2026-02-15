import React, { useState } from 'react';
import { BookOpen, Shield, Info, Lock, ChevronRight, Scale, Users, ShieldAlert, Box, AlertOctagon, HelpCircle, Archive, Activity, FileText, AlertTriangle, Truck, Zap, ClipboardList, Gavel, MapPin, Eye, Search, CheckCircle2 } from 'lucide-react';
import { SCPLogo } from './SCPLogo';

interface GuideProps {
  currentClearance: number;
}

const Guide: React.FC<GuideProps> = ({ currentClearance }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'objects' | 'clearance' | 'chambers'>('general');

  // Вспомогательная функция для цензуры текста
  const Redact = ({ text, minLevel, placeholder = "[ДАННЫЕ УДАЛЕНЫ]" }: { text: string, minLevel: number, placeholder?: string }) => {
  if (currentClearance >= minLevel) {
    // Текст для тех, у кого есть допуск (тоже в стиле кода)
    return <span className="font-mono text-white decoration-gray-600">{text}</span>;
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
               <span>Допуск: <Redact text="Уровень 2+" minLevel={2} placeholder="ЗАСЕКРЕЧЕНО" /></span>
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
                <div className="flex gap-3"><span className="text-purple-500 font-black">●</span> <span>Если объект и есть коробка — это <Redact text="Таумиэль" minLevel={3} placeholder="[████████]" />.</span></div>
              </div>
            </section>

            <p className="text-sm">
              Все аномальные объекты, сущности и явления, требующие особых условий содержания, подлежат присвоению класса. Класс объекта является частью шаблона статьи и примерным показателем сложности содержания объекта. Внутри статей класс используется для определения ресурсов, необходимых для сдерживания, приоритета исследовательских работ, бюджета объекта и т.д.
            </p>

            <section className="space-y-6">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-scp-accent pl-4 font-mono">Основные классы</h2>
              
              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-white-500 font-black uppercase text-xl flex items-center gap-2">Безопасный (Safe)</h3>
                  <p className="text-sm">
                    Объекты класса «Безопасный» — это аномалии, которые проще всего содержать без последствий. Эти объекты достаточно хорошо изучены для содержания без значительных затрат, либо не проявляют аномального воздействия без определённого внешнего стимула. Назначение аномалии класса «Безопасный» не значит, что работа с ней не несёт угрозы.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-white-500 font-black uppercase text-xl flex items-center gap-2">Евклид (Euclid)</h3>
                  <p className="text-sm">
                    К объектам класса «Евклид» относятся недостаточно изученные или изначально непредсказуемые аномалии. Всем аномалиям, которые можно назвать <Redact text="разумными" minLevel={2} placeholder="[УДАЛЕНО]" />, чаще всего присваивается класс не ниже «Евклида», поскольку объект, наделённый собственной волей, по сути непредсказуем.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-white-500 font-black uppercase text-xl flex items-center gap-2">Кетер (Keter)</h3>
                  <p className="text-sm">
                    Объекты класса «Кетер» — это аномалии, постоянное или надёжное содержание которых тяжело реализуемо. «Кетер» не всегда значит опасность, а скорее то, что объект очень сложно содержать или это требует огромных затрат ресурсов <Redact text="и персонала класса D" minLevel={2} placeholder="[ДАННЫЕ УДАЛЕНЫ]" />.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-white-500 font-black uppercase text-lg"><Redact text="Таумиэль (Thaumiel)" minLevel={4} placeholder="[ДАННЫЕ УДАЛЕНЫ]" /></h3>
                  <p className="text-xs">
                    <Redact 
                      text="Объекты класса «Таумиэль» применяются Фондом исключительно для содержания других аномалий. Сама информация о существовании таких объектов является секретной и доступна только Совету О5." 
                      minLevel={4} 
                      placeholder="[ДАННЫЕ УДАЛЕНЫ]" 
                    />
                  </p>
                </div>

              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-gray-600 pl-4 font-mono">Вторичные классы</h2>
              
              <div className="space-y-6">
                
                <div className="space-y-2">
                  <h3 className="text-white-400 font-black uppercase text-lg">Аполлион (Apollyon)</h3>
                  <p className="text-xs">
                    <Redact 
                      text="Объекты класса «Аполлион» являются аномалиями, которые невозможно содержать, и они неминуемо нарушат условия содержания. Обычно связаны с угрозами конца света класса К." 
                      minLevel={3} 
                      placeholder="ДОСТУП ОГРАНИЧЕН. ТРЕБУЕТСЯ ДОПУСК ПО ПРОЕКТУ ТЕРМИНАЦИИ." 
                    />
                  </p>
                </div>

                <div className="space-y-2 border-l border-gray-800 pl-4">
                  <h3 className="text-white-400 font-black uppercase text-sm italic underline decoration-dotted">Архонт (Archon) / Тикондерога (Ticonderoga)</h3>
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

  const renderClearanceRegistry = () => {
    if (currentClearance < 1) {
      return (
        <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-700">
          <div className="p-8 border-2 border-red-900 bg-red-950/10 flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(153,27,27,0.2)]">
            <Lock size={64} className="text-red-600 animate-pulse" />
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-red-500 uppercase tracking-[0.3em]">Доступ запрещен</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Требуется уровень допуска 1 или выше</p>
            </div>
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
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 font-serif">Уровни допуска</h1>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 uppercase tracking-widest font-mono">
              <span>Архивный файл: SEC-LVLS-11</span>
              <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
              <span>Допуск: <Redact text="Уровень 1+" minLevel={1} placeholder="ОГРАНИЧЕНО" /></span>
            </div>
          </header>

          <article className="space-y-8 text-gray-300 font-serif leading-relaxed text-base relative z-10">
            <section className="space-y-4 bg-black/40 border border-gray-700 p-6 shadow-inner">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-scp-terminal pl-4 font-mono">Краткое описание</h2>
              <p className="text-sm">
                Уровень допуска сотрудника Фонда соответствует максимальному уровню секретности информации, к которой он может получить доступ.
                Однако это не означает автоматического получения доступа ко всей соответствующей информации: доступ к данным предоставляется по принципу
                служебной необходимости и на усмотрение сотрудников конкретных отделов, уполномоченных раскрывать эту информацию.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-scp-accent pl-4 font-mono">Уровни допуска</h2>
              <div className="space-y-4">
                <div className="p-5 border border-gray-800 bg-black/25">
                  <h3 className="text-white font-black uppercase mb-2">Уровень 0 (Для общего пользования)</h3>
                  <p className="text-sm">Уровень допуска 0 выдаётся сотрудникам, не представляющим особой ценности, которым не требуется доступ к информации об аномальных артефактах или существах, содержащихся Фондом. Как правило, уровень допуска 0 имеется у сотрудников, занимающих должности в канцелярии и отделе снабжения учреждений, непосредственно не связанных с содержанием объектов, а также у обслуживающего персонала таких учреждений.</p>
                </div>
                <div className="p-5 border border-gray-800 bg-black/25">
                  <h3 className="text-white font-black uppercase mb-2">Уровень 1 (Для служебного пользования)</h3>
                  <p className="text-sm">Уровень допуска 1 выдаётся сотрудникам, работающим в непосредственной близости от аномальных объектов или существ, но не обладающих к ним прямым, непрямым или информационным доступом, а также сотрудникам, имеющим дело с засекреченной информацией. Как правило, уровень допуска 1 имеется у сотрудников, занимающих должности в канцелярии и отделе снабжения учреждений, непосредственно занимающихся содержанием объектов, а также у обслуживающего персонала таких учреждений.</p>
                </div>
                <div className="p-5 border border-gray-800 bg-black/25">
                  <h3 className="text-white font-black uppercase mb-2">Уровень 2 (Для ограниченного пользования)</h3>
                  <p className="text-sm">Уровень допуска 2 выдаётся сотрудникам службы безопасности и научным сотрудникам, которым необходим прямой доступ к базовой информации касательно аномальных объектов или существ, находящихся на содержании. Большинство научных сотрудников, полевых агентов и специалистов по содержанию обладают уровнем допуска 2.</p>
                </div>
                <div className="p-5 border border-gray-800 bg-black/25">
                  <h3 className="text-white font-black uppercase mb-2">Уровень 3 (Секретно)</h3>
                  <p className="text-sm">Уровень допуска 3 выдаётся старшим сотрудникам службы безопасности и научным сотрудникам, которым необходим доступ к подробной информации касательно аномальных объектов или существ, находящихся на содержании, включая их происхождение, обстоятельства изъятия и долгосрочные планы на них. Большинство старших научных сотрудников, руководителей проектов, офицеров службы безопасности, членов групп реагирования и оперативников МОГ обладают уровнем допуска 3.</p>
                </div>
                <div className="p-5 border border-gray-800 bg-black/25">
                  <h3 className="text-white font-black uppercase mb-2">Уровень 4 (Совершенно секретно)</h3>
                  <p className="text-sm">Уровень допуска 4 выдаётся старшему управленческому персоналу, которому необходим доступ ко всей информации отдельного учреждения и/или региона, а также к долгосрочным планам касательно операций и научных проектов Фонда. Как правило, 4 уровнем допуска обладают только руководители Зон, руководители служб безопасности учреждений и командующие МОГ.</p>
                </div>
                <div className="p-5 border border-gray-800 bg-black/25">
                  <h3 className="text-white font-black uppercase mb-2">Уровень 5 (Таумиэль)</h3>
                  <p className="text-sm">Уровень допуска 5 выдаётся сотрудникам высшего управленческого звена Фонда и гарантирует практически полный доступ ко всей стратегической и секретной информации. Как правило, уровнем допуска 5 обладают только члены Совета O5.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-gray-600 pl-4 font-mono">Классы персонала</h2>
              <p className="text-sm text-gray-400">Классы присваиваются персоналу на основании плотности их контакта с потенциально опасными аномальными объектами, существами или явлениями.</p>
              <div className="p-5 border border-gray-800 bg-black/25"><h3 className="text-white font-black uppercase mb-2">Класс A</h3><p className="text-sm">Класс A присваивается сотрудникам, которые считаются жизненно важными для стратегических операций Фонда, вследствие чего им запрещён какой-либо прямой доступ к аномальным объектам. Если персоналу класса A по какой-либо причине необходимо находиться поблизости от подобных аномалий (например, в случае их работы в учреждении, занимающемся содержанием), они обязаны постоянно пребывать в защищённых областях, доступ в места непосредственного содержания объектов для них закрыт. В чрезвычайных ситуациях сотрудников класса A надлежит немедленно эвакуировать в заранее установленную и безопасную область вне данного учреждения. Членам Совета O5 класс A присваивается на постоянной основе.</p></div>
              <div className="p-5 border border-gray-800 bg-black/25"><h3 className="text-white font-black uppercase mb-2">Класс B</h3><p className="text-sm">Класс B присваивается сотрудникам, которые считаются важными для локальных операций Фонда. Им разрешён доступ только к тем аномальным объектам, существам и явлениям, которые были подвергнуты карантину и мерам по блокировке возможного ментального или меметического воздействия. В случае нарушения условий содержания или враждебных действий против учреждения Фонда сотрудников класса B надлежит как можно скорее эвакуировать в заранее установленную и безопасную область вне данного учреждения.</p></div>
              <div className="p-5 border border-gray-800 bg-black/25"><h3 className="text-white font-black uppercase mb-2">Класс C</h3><p className="text-sm">Класс C присваивается сотрудникам с прямым доступом к большинству аномалий, не представляющих опасности или не проявляющих враждебности. Сотрудники класса C, прямо контактировавшие с потенциальными источниками ментального или меметического воздействия, могут быть подвергнуты обязательному карантину или психиатрическому обследованию, на усмотрение службы безопасности. В случае нарушения условий содержания или враждебных действий против учреждения Фонда небоевой персонал класса С должен или прибыть в безопасную зону учреждения, или, в случае массового нарушения условий содержания или другого катастрофического события, произвести эвакуацию, на усмотрение местной службы безопасности.</p></div>
              <div className="p-5 border border-gray-800 bg-black/25"><h3 className="text-white font-black uppercase mb-2">Класс D</h3><p className="text-sm">Класс D присваивается расходному персоналу, используемому для работ с крайне опасными аномалиями. Им запрещён какой-либо контакт с сотрудниками класса A или B. Сотрудники класса D обычно набираются из заключённых во всех странах мира, предпочтение отдаётся осуждённым за насильственные преступления и особенно приговорённым к смертной казни. В случае крайней необходимости может быть приведён в исполнение Протокол 12, предусматривающий набор сотрудников из альтернативных источников - например, среди политических заключённых, беженцев и других гражданских лиц. Набранные сотрудники перевозятся в учреждения Фонда под достоверным предлогом. Сотрудников класса D необходимо регулярно подвергать обязательным психиатрическим обследованиями, а в конце месяца - или обрабатывать амнезиаком класса B (или более сильным), или ликвидировать, на усмотрение местной службой безопасности или медицинской службы. В случае возникновения в учреждении катастрофического события все местные сотрудники класса D подлежат немедленному уничтожению, если только местная служба безопасности не примет иное решение.</p></div>
              <div className="p-5 border border-gray-800 bg-black/25"><h3 className="text-white font-black uppercase mb-2">Класс E</h3><p className="text-sm">Класс E - это временное обозначение, присваиваемое полевым агентам и персоналу, участвующему в содержании, если во время постановки нового объекта на содержание они подверглись потенциально опасным эффектам. Сотрудников класса E необходимо как можно скорее поместить в карантин, после чего установить за ними наблюдение на предмет появления в их поведении, личности или физиологии потенциально вредоносных изменений. Такие сотрудники могут вернуться к исполнению своих обязанностей только после полного допроса, медицинского осмотра и психиатрического освидетельствования.</p></div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-scp-text pl-4 font-mono">Должности</h2>
              <p className="text-sm text-gray-400">Ниже приведены самые распространённые должностные наименования, используемые Фондом.</p>

              <div className="space-y-4">
                <h3 className="text-lg font-black uppercase text-white">Персонал учреждений</h3>
                <div className="p-5 border border-gray-800 bg-black/25"><h4 className="text-white font-black uppercase mb-2">Специалисты по содержанию</h4><p className="text-sm">Специалисты по содержанию в учреждениях Фонда играют две основные роли. В первую очередь команды содержания отправляются в места проявления подтверждённой аномальной активности, чтобы обезопасить потенциальный SCP-объект, обеспечить первоначальные условия его содержания и осуществить его транспортировку в ближайшее учреждение содержания Фонда.</p><p className="text-sm mt-3">Кроме того, инженеры и техники Фонда занимаются разработкой, усовершенствованием и обслуживанием камер, а также других средств, необходимых для содержания аномальных объектов, существ или явлений.</p></div>
                <div className="p-5 border border-gray-800 bg-black/25"><h4 className="text-white font-black uppercase mb-2">Научные сотрудники</h4><p className="text-sm">Научные сотрудники отвечают за исследовательскую деятельность Фонда, они набираются из самых одарённых и квалифицированных учёных по всему миру. Среди них есть специалисты во всех возможных областях знаний, начиная с химии и ботаники и заканчивая такими малоизвестными и узкоспециализированными областями, как теоретическая физика и ксенобиология. Целью исследовательских проектов Фонда является лучшее понимание необъяснённых аномалий и принципов их действия.</p></div>
                <div className="p-5 border border-gray-800 bg-black/25"><h4 className="text-white font-black uppercase mb-2">Сотрудники службы безопасности</h4><p className="text-sm">Служба безопасности учреждений (часто называемая просто "охраной") занимается обеспечением физической и информационной безопасности проектов, операций и персонала Фонда. Сотрудники службы безопасности набираются главным образом из военных, сотрудников правоохранительных органов и персонала исправительных учреждений. Они владеют многими видами оружия, а также обучены действовать в целом ряде чрезвычайных ситуаций, включая как нарушения условий содержания, так и враждебные действия. Сотрудники службы безопасности также ответственны за информационную безопасность, в частности, за защиту компьютерных систем учреждения от вторжения извне, а также за сохранность физических копий секретной документации. Кроме того, сотрудники службы безопасности часто оказываются первой линией обороны в случае враждебного вторжения в учреждение Фонда.</p></div>
                <div className="p-5 border border-gray-800 bg-black/25"><h4 className="text-white font-black uppercase mb-2">Члены групп реагирования</h4><p className="text-sm">Группы реагирования или тактические группы - это высококвалифицированные и тяжеловооружённые воинские подразделения, сопровождающие команды по содержанию в тех случаях, когда приходится иметь дело с агрессивно настроенными аномальными сущностями или представителями враждебных связанных организаций. Также они занимаются охраной учреждений Фонда от враждебных вмешательств. Группы реагирования имеются во всех основных учреждениях Фонда и всегда готовы выступить по первому требованию.</p></div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-black uppercase text-white">Полевой персонал</h3>
                <div className="p-5 border border-gray-800 bg-black/25"><h4 className="text-white font-black uppercase mb-2">Полевые агенты</h4><p className="text-sm">Полевые агенты - это глаза и уши Фонда. Они обучены отыскивать и расследовать любые признаки проявления аномальной активности. При этом они часто работают под прикрытием в органах правопорядка или внедрены в местные службы, например, службу скорой медицинской помощи или службы контроля. Из-за необходимости поддерживать прикрытие полевые агенты, как правило, не оснащены оборудованием, необходимым для обращения с аномальной активностью. Поэтому как только факт наличия подобной активности подтвердится, агент обычно вызывает соответствующим образом экипированную команду содержания из ближайшего учреждения Фонда. Именно она и должна обезопасить потенциальный SCP-объект и осуществить его постановку на содержание.</p></div>
                <div className="p-5 border border-gray-800 bg-black/25"><h4 className="text-white font-black uppercase mb-2">Оперативники МОГ</h4><p className="text-sm">Мобильные оперативные группы - это специализированные подразделения, собранные из агентов-ветеранов самых разных учреждений Фонда и используемые в случаях специфических угроз. Их состав крайне различен - мобильная опергруппа может состоять как из полевых исследователей, специализирующихся в определённом типе аномалий, так и представлять собой тяжеловооружённый отряд, обученный справляться с конкретным видом враждебных аномальных существ. Более подробную информацию см. в документе об опергруппах.</p></div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-black uppercase text-white">Управленческий персонал</h3>
                <div className="p-5 border border-gray-800 bg-black/25"><h4 className="text-white font-black uppercase mb-2">Руководители Зон</h4><p className="text-sm">Руководители Зон осуществляют управление основными учреждениями Фонда и являются самыми высокопоставленными сотрудниками в регионах их размещения. Они ответственны за непрерывное безопасное функционирование своего учреждения, содержание всех находящихся в нём аномалий, а также проведение связанных с ними проектов. Главы всех основных местных служб отчитываются перед руководителем Зоны, который, в свою очередь, отчитывается перед Советом O5.</p></div>
                <div className="p-5 border border-gray-800 bg-black/25"><h4 className="text-white font-black uppercase mb-2">Члены Совета O5</h4><p className="text-sm">Совет O5 - это комитет руководителей Фонда высшего звена. Они обладают полным доступом ко всей информации, касающейся находящихся на содержании аномалий, осуществляют контроль за всеми глобальными операциями Фонда, а также занимаются долгосрочным стратегическим планированием. Учитывая важность их положения, членам Совета O5 не дозволяется контактировать с какими-либо аномальными объектами, существами или явлениями. Кроме того, личности всех членов Совета засекречены, используются только их числовые обозначения (с O5-1 по O5-13).</p></div>
              </div>
            </section>
          </article>

          <footer className="mt-16 pt-8 border-t border-gray-800 flex justify-between items-center opacity-40">
            <div className="text-[9px] font-mono uppercase tracking-widest">SCPNET SECURE DOC // CLEARANCE-REGISTRY</div>
            <div className="w-8 h-8"><SCPLogo /></div>
          </footer>
        </div>
      </div>
    );
  };

  const renderContainmentChambers = () => {
    if (currentClearance < 2) {
      return (
        <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-700">
          <div className="p-8 border-2 border-red-900 bg-red-950/10 flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(153,27,27,0.2)]">
            <Lock size={64} className="text-red-600 animate-pulse" />
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-red-500 uppercase tracking-[0.3em]">Доступ запрещен</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Требуется уровень допуска 2 или выше</p>
            </div>
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
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 font-serif">Камеры содержания</h1>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 uppercase tracking-widest font-mono">
              <span>Архивный файл: CNT-CELL-02</span>
              <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
              <span>Допуск: <Redact text="Уровень 2+" minLevel={2} placeholder="ОГРАНИЧЕНО" /></span>
            </div>
          </header>

          <article className="space-y-8 text-gray-300 font-serif leading-relaxed text-base relative z-10">
            <section className="space-y-4 bg-black/40 border border-gray-700 p-6 shadow-inner">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-scp-terminal pl-4 font-mono">Стандартные условия содержания гуманоидных объектов</h2>
              <p className="text-sm text-gray-400">Назначение камер и общие рекомендации.</p>
              <p className="text-sm">
                С целью сократить издержки и трудозатраты на разработку условий содержания каждого вновь обнаруженного SCP-объекта, для распространенного класса SCP-гуманоидов, то есть, аномальных субъектов, обладающих строением, физиологией и основными потребностями, близкими к таковым для обычных представителей Homo sapiens, Организацией разработаны стандартные условия содержания и стандартные камеры, которые обеспечивают жилищные условия, отвечающие как требованиям безопасного содержания SCP-объектов, так и базовым нормам комфорта и этичного обращения с разумными существами.
              </p>
              <p className="text-sm">
                Стандартные камеры содержания спроектированы таким образом, чтобы при минимальной доработке или вовсе без таковой подходить для содержания подавляющего большинства малоопасных объектов, для чего, после всестороннего изучения накопленного Организацией опыта, в их конструкцию были изначально интегрированы общие решения, наиболее широко применяемые для противодействия аномальным эффектам самой разной природы.
              </p>
              <p className="text-sm">
                Стандартные камеры типа С-1 предназначены для постоянного содержания гуманоидных объектов, характеризуемых следующими особенностями: повышенная опасность и деструктивный потенциал (особо высокая физическая сила, модификации тела встроенными средствами нападения, опасные излучения и выделения и т.п.), агрессивное или враждебное поведение, как намеренное, так и нет (искаженное восприятие действительности, психические отклонения, недостаточный самоконтроль или подверженность стороннему контролю), явная нелояльность, злостное неподчинение сотрудникам и несоблюдение требований режима содержания (рассматривается как дисциплинарная мера).
              </p>
              <p className="text-sm">
                Камеры типа С-2 предназначены для постоянного содержания гуманоидных объектов, которые не склонны оказывать противодействие. Как правило, они являются жертвами собственных аномальных особенностей, а потому заинтересованы и готовы оказывать содействие в их подавлении или нейтрализации последствий, либо относятся к бывшим сотрудникам Организации, подпавшим под различные аномальные воздействия, чья лояльность не вызывает особых сомнений. Перевод в камеру типа С-2 рекомендован после завершения цикла первичных исследований. Разрешается при условии неагрессивного/дружественного поведения, отсутствия опасных физических и психических отклонений.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-scp-accent pl-4 font-mono">Камера повышенной безопасности (Тип С-1)</h2>
              <div className="p-4 border border-dashed border-gray-700 bg-black/30 text-center">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-mono">s-1.jpg</p>
                <p className="text-sm text-gray-300 mt-1">Макет камеры С-1</p>
              </div>
              <div className="p-5 border border-gray-800 bg-black/25 space-y-3 text-sm">
                <p><span className="text-white font-bold">Размеры:</span> длина 4 м, ширина 3 м, высота 3 м.</p>
                <p><span className="text-white font-bold">Конструкция:</span> стены, пол и потолок из железобетона с креплениями для навесных защитных панелей (свинцовые, мягкие и т.д.). Освещение и видеонаблюдение на потолке под бронестеклом, с креплениями для светофильтров. Встроены дополнительные скрытые микрофоны. На стене у входа установлен интерком.</p>
                <p><span className="text-white font-bold">Пожаротушение:</span> спринклерная система.</p>
                <p><span className="text-white font-bold">Вентиляция:</span> венткороб 15x15 см в потолке; поддерживается перенаправление воздуха в фильтровентиляционную систему и подача газообразных транквилизаторов.</p>
                <p><span className="text-white font-bold">Сантехника:</span> металлическая раковина (вода по кнопке), металлический встроенный унитаз.</p>
                <p><span className="text-white font-bold">Душ:</span> в углу, с плёночной занавеской; лейка в потолке, включение по кнопке; слив закрыт решёткой, сток может идти в фильтрующую систему.</p>
                <p><span className="text-white font-bold">Мебель:</span> бетонное возвышение-кровать (0.7 x 1.5 x 2.2 м), откидной столик из АБС-пластика без ножек; постельные и банные принадлежности по решению персонала.</p>
                <p><span className="text-white font-bold">Мусоропровод:</span> люк в стене, отвод в шахту мусоросжигателя; возможна блокировка решеткой для проверки.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-scp-accent pl-4 font-mono">Камера повышенной комфортности (Тип С-2)</h2>
              <div className="p-4 border border-dashed border-gray-700 bg-black/30 text-center">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-mono">S-2.jpg</p>
                <p className="text-sm text-gray-300 mt-1">Макет камеры С-2</p>
              </div>
              <div className="p-5 border border-gray-800 bg-black/25 space-y-3 text-sm">
                <p><span className="text-white font-bold">Планировка:</span> жилой блок 5x3 м и ванная 2x2 м, высота потолков 3 м.</p>
                <p><span className="text-white font-bold">Конструкция:</span> железобетон с креплениями для защитных панелей. Допускаются крашеные стены/обои в жилой зоне; ванная — только окраска. Пол: линолеум в жилой комнате, кафель в ванной.</p>
                <p><span className="text-white font-bold">Вентиляция:</span> венткороб 15x15 см в потолке с решеткой; возможно перенаправление воздуха в фильтровентиляцию и подача газообразных транквилизаторов.</p>
                <p><span className="text-white font-bold">Ванная:</span> совмещенный санузел, душевая кабина, стальная раковина с шаровым смесителем, зеркало из акрилового ПММА, пластиковая полка; сток может направляться в фильтрующую систему.</p>
                <p><span className="text-white font-bold">Контроль:</span> освещение и камеры на потолке, крепления под светофильтры, интерком у входа.</p>
                <p><span className="text-white font-bold">Пожаротушение:</span> спринклерная система.</p>
                <p><span className="text-white font-bold">Мебель и оснащение:</span> стальная кровать с матрасом, привинченная к полу; два стула, письменный и кофейный столик из АБС-пластика; тумбочка, шкафчик, стеллаж; телеэкран в нише под бронестеклом, DVD-плеер, аудиосистема.</p>
                <p><span className="text-white font-bold">Мусоропровод:</span> люк в стене.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-gray-600 pl-4 font-mono">Оборудование шлюзовых камер</h2>
              <div className="p-5 border border-gray-800 bg-black/25 text-sm">
                Перед входом в камеры типов С-1 и С-2 находятся герметичные шлюзовые камеры. В каждой находится набор для экстренной дезинфекции персонала. В отдельном отсеке, маркированном красным крестом, хранится оборудование для экстренной медицинской помощи: анестезиологические и реанимационные препараты, травматологический и реанимационный наборы, запас крови для переливания.
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-gray-600 pl-4 font-mono">Бытовые аспекты</h2>
              <div className="p-5 border border-gray-800 bg-black/25 text-sm space-y-2">
                <p>Питание выдается 3 раза в сутки; посуда и приборы только пластиковые.</p>
                <p>Уборка: С-1 — раз в месяц, С-2 — раз в две недели силами персонала или самим объектом при согласии.</p>
                <p>Одежда: красная роба с номером объекта (формат: Безопасный/Евклид/Кетер SCP-***), ХБ ткань; 1 комплект раз в 2 недели.</p>
                <p>Обувь: тапочки подводника, 1 пара раз в 6 месяцев.</p>
                <p>Постельное белье меняется ежемесячно; выдается 4 полотенца на месяц; гигиенические принадлежности пополняются при уборке.</p>
                <p>Разрешены книги, диски с фильмами/музыкой; перечень утверждает куратор объекта.</p>
                <p>Курящим выдаются никотиновые пластыри.</p>
                <p>Медосмотр: 1 раз в месяц; оценка психолога Фонда: 1 раз в 3 месяца.</p>
                <p>Вода, освещение и электроприборы (все или отдельно) могут быть отключены с поста охраны.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-scp-text pl-4 font-mono">Права и обязанности объекта</h2>
              <div className="p-5 border border-gray-800 bg-black/25 text-sm space-y-3">
                <h3 className="text-white font-black uppercase">Имеет право</h3>
                <p>Использовать по назначению оборудование камеры.</p>
                <p>Подать жалобу на неправомерные действия персонала Фонда; заявления направляются в Комитет по этике.</p>
                <p>Подавать одну заявку в месяц на улучшение условий пребывания (развлекательная продукция, доп. гигиенические принадлежности, нестандартная одежда и обувь).</p>
                <p>Подавать одну заявку в месяц на услуги парикмахера.</p>
                <p>Подавать одну заявку в неделю на изменение меню питания.</p>
                <p>Все заявки рассматриваются куратором объекта, который принимает решение об исполнении или запрете.</p>
                <h3 className="text-white font-black uppercase pt-2">Обязан</h3>
                <p>Беспрекословно подчиняться приказам персонала Фонда (кроме обслуживающего персонала; попытки мешать их работе считаются нарушением УС и пресекаются службой безопасности).</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-red-800 pl-4 font-mono">Дисциплинарные взыскания</h2>
              <div className="p-5 border border-red-900/60 bg-red-950/10 text-sm space-y-2">
                <p>Неподчинение приказам, нарушение правил поведения, повреждение имущества Фонда, агрессия к сотрудникам наказываются ужесточением условий содержания:</p>
                <p>Перевод в камеру типа С-1.</p>
                <p>Прекращение приема личных запросов.</p>
                <p>Запрет развлекательной продукции.</p>
                <p>В случае рецидивов — перевод в состояние искусственной комы (требует согласования с КпЭ, куратором объекта, начальником Зоны и одним представителем Совета О5).</p>
                <p>Попытки побега считаются нарушением условий содержания и караются по протоколу конкретного объекта.</p>
              </div>
            </section>
          </article>

          <footer className="mt-16 pt-8 border-t border-gray-800 flex justify-between items-center opacity-40">
            <div className="text-[9px] font-mono uppercase tracking-widest">SCPNET SECURE DOC // CONTAINMENT-CELLS</div>
            <div className="w-8 h-8"><SCPLogo /></div>
          </footer>
        </div>
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
            onClick={() => setActiveTab('clearance')}
            className={`w-full flex items-center justify-between p-4 border transition-all ${activeTab === 'clearance' ? 'bg-scp-terminal text-black border-scp-terminal font-bold' : 'bg-transparent text-gray-500 border-gray-800 hover:text-white hover:border-gray-600'}`}
          >
            <div className="flex items-center gap-3">
              <Shield size={16} />
              <span className="text-xs uppercase tracking-widest font-mono">Уровни допуска</span>
            </div>
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => setActiveTab('chambers')}
            className={`w-full flex items-center justify-between p-4 border transition-all ${activeTab === 'chambers' ? 'bg-scp-terminal text-black border-scp-terminal font-bold' : 'bg-transparent text-gray-500 border-gray-800 hover:text-white hover:border-gray-600'}`}
          >
            <div className="flex items-center gap-3">
              <Archive size={16} />
              <span className="text-xs uppercase tracking-widest font-mono">Камеры содержания</span>
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
          {activeTab === 'clearance' && renderClearanceRegistry()}
          {activeTab === 'chambers' && renderContainmentChambers()}
        </div>
      </div>
    </div>
  );
};

export default Guide;
