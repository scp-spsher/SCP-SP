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
  ClipboardList,
  Eye,
  Globe,
  AlertOctagon,
  Box,
  FileWarning,
  Skull,
  UserCheck,
  Key,
  Stethoscope,
  Trash2,
  Dna,
  Truck,
  Settings,
  Scale,
  BrainCircuit,
  Gavel,
  Radio,
  Crown,
  FileText,
  AlertCircle,
  ShieldCheck,
  Unlock,
  FileCheck,
  Briefcase,
  Activity,
  HardHat,
  HeartPulse,
  HardDrive,
  Cpu
} from 'lucide-react';

type GuideTab = 'general' | 'objects' | 'clearance' | 'personnel' | 'services' | 'ethics';

interface GuideProps {
  currentClearance: number;
}

const Guide: React.FC<GuideProps> = ({ currentClearance }) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('general');

  const isO5 = currentClearance >= 5;
  const isL4 = currentClearance >= 4;

  const menuItems = [
    { id: 'general', label: 'Устав Организации', icon: Info, min: 0 },
    { id: 'objects', label: 'Классификация объектов', icon: Database, min: 1 },
    { id: 'clearance', label: 'Регламент допусков', icon: Shield, min: 0 },
    { id: 'personnel', label: 'Кадровые классы', icon: Users, min: 0 },
    { id: 'services', label: 'Структура служб', icon: ClipboardList, min: 0 },
    { id: 'ethics', label: 'Комитет по Этике', icon: Scale, min: 2 },
  ].filter(item => currentClearance >= item.min);

  const renderGeneral = () => {
    const getClearanceSpecificGeneral = () => {
      switch (currentClearance) {
        case 0:
          return {
            title: "ДИРЕКТИВА L-0: ОБЩИЕ ПОЛОЖЕНИЯ",
            tagline: "СТАТУС: ТЕХНИЧЕСКИЙ/АДМИНИСТРАТИВНЫЙ ПЕРСОНАЛ",
            mission: "Организация является научно-исследовательским институтом закрытого типа. Ваша задача — обеспечение бесперебойной работы инфраструктуры.",
            points: [
              { h: "Соблюдение тишины", d: "Обсуждение специфики работы вне Зоны карается немедленной терминацией контракта и введением амнезиаков класса A." },
              { h: "Субординация", d: "Приказы сотрудников службы безопасности (СБ) и научного состава обязательны к исполнению без промедления." },
              { h: "Зонирование", d: "Ваш доступ ограничен жилыми блоками и техническими коридорами. Попытка входа в гермоворота содержания — летальна." }
            ],
            footer: "ВЫ — ВИНТИК В МАШИНЕ, ОБЕСПЕЧИВАЮЩЕЙ МИР."
          };
        case 1:
          return {
            title: "ОБЩАЯ ИНФОРМАЦИЯ: ВВЕДЕНИЕ В ФОНД",
            tagline: "СТАТУС: МЛАДШИЙ ОПЕРАТИВНЫЙ ПЕРСОНАЛ",
            mission: "Мы — щит, скрытый в тени. Фонд SCP — это сверхгосударственная структура, целью которой является содержание аномалий, нарушающих законы физики.",
            points: [
              { h: "Обезопасить", d: "Изоляция аномальных явлений от гражданского населения." },
              { h: "Удержать", d: "Создание и эксплуатация ОУС (Особых Условий Содержания)." },
              { h: "Сохранить", d: "Защита человечества от экзистенциальных угроз." }
            ],
            footer: "МЫ УМИРАЕМ ВО ТЬМЕ, ЧТОБЫ ВЫ ЖИЛИ ПРИ СВЕТЕ."
          };
        case 2:
          return {
            title: "СТРАТЕГИЧЕСКИЙ ОБЗОР: ПРИНЦИП ЗАВЕСЫ",
            tagline: "СТАТУС: ПОЛЕВОЙ АГЕНТ / ИССЛЕДОВАТЕЛЬ",
            mission: "Фонд SCP действует вне юрисдикции любых правительств. Наша задача — поддержание «Завесы» секретности.",
            points: [
              { h: "Глобальная нормальность", d: "Аномальная активность — это энтропия, разрушающая цивилизацию. Наша цель — консервация текущей реальности." },
              { h: "Взаимодействие с ГРУ-П/ГОК", d: "Любые контакты со связанными организациями должны фиксироваться. Помните о приоритете Фонда." },
              { h: "Сдерживание информации", d: "Мем-агенты используются для защиты архивов. Не открывайте файлы выше вашего допуска." }
            ],
            footer: "ЛОГИКА — ВАШЕ ЕДИНСТВЕННОЕ ОРУЖИЕ ПРОТИВ НЕВОЗМОЖНОГО."
          };
        case 3:
          return {
            title: "ОПЕРАТИВНЫЙ РЕГЛАМЕНТ: ГЛОБАЛЬНАЯ СЕТЬ",
            tagline: "СТАТУС: ВЕДУЩИЙ СПЕЦИАЛИСТ / КУРАТОР",
            mission: "Фонд контролирует тысячи объектов по всему миру. С уровнем L-3 вы получаете доступ к координации между Зонами (19, 17, 81).",
            points: [
              { h: "Риск нарушения ОУС", d: "Вы обязаны знать протоколы дезактивации Зоны в случае нарушения содержания класса Кетер." },
              { h: "Управление ресурсами", d: "Распределение персонала класса D — ваша ответственность. Эффективность выше гуманности." },
              { h: "Спецсвязь", d: "Использование зашифрованных каналов SCPNET обязательно для всех донесений." }
            ],
            footer: "ЗНАНИЕ — ЭТО БРЕМЯ, КОТОРОЕ МЫ НЕСЕМ РАДИ МИЛЛИАРДОВ."
          };
        case 4:
          return {
            title: "ГЛОБАЛЬНАЯ СТРАТЕГИЯ: СОВЕРЕННОЕ ПРАВО",
            tagline: "СТАТУС: ДИРЕКТОР ЗОНЫ / СТРАТЕГИЧЕСКИЙ АНАЛИТИК",
            mission: "Фонд — высшая инстанция на планете Земля. Мы обладаем правом на применение амнезиаков массового действия (Класс E/Омега).",
            points: [
              { h: "Протоколы нейтрализации", d: "Вы имеете право запрашивать ликвидацию аномалий, содержание которых становится нецелесообразным." },
              { h: "Политика Фонда", d: "Комитет по Этике подчиняется вам в рамках вашей Зоны, пока не доказано обратное." },
              { h: "Протокол 'Чистое Небо'", d: "Маскировка деятельности Фонда под глобальные катастрофы или военные конфликты." }
            ],
            footer: "ВЫ — АРХИТЕКТОР ТЕНИ, В КОТОРОЙ СКРЫВАЕТСЯ МИР."
          };
        default: // O5
          return {
            title: "БЫТИЕ: ОКОНЧАТЕЛЬНАЯ ИСТИНА",
            tagline: "СТАТУС: СОВЕТ СМОТРИТЕЛЕЙ (O5)",
            mission: "Нормальность — это консенсус. Реальность — это то, что мы позволяем существовать. Мы — кураторы этого проекта под названием 'Человечество'.",
            points: [
              { h: "SCP-001", d: "Все итерации SCP-001 доступны для ознакомления. Истина сегментирована для вашей безопасности." },
              { h: "Якоря Реальности Скрэнтона", d: "Удержание текущей мерности в стабильном состоянии — наш приоритет №1." },
              { h: "Протокол Конца Света", d: "Процедуры воссоздания цивилизации после сценария класса XK уже подготовлены." }
            ],
            footer: "СМОТРИТЕЛИ ВИДЯТ ВСЁ. МЫ — ПОСЛЕДНЯЯ ГРАНЬ."
          };
      }
    };

    const info = getClearanceSpecificGeneral();

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className={`p-8 border-l-4 ${isO5 ? 'border-yellow-600 bg-yellow-950/20' : 'border-scp-accent bg-scp-accent/5'}`}>
          <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter flex items-center gap-3">
             {isO5 ? <Crown className="text-yellow-500" /> : <ShieldCheck className="text-scp-terminal" />}
             {info.title}
          </h3>
          <p className="text-[10px] font-mono text-gray-500 tracking-[0.3em] mb-6">{info.tagline}</p>
          <p className="text-sm leading-relaxed text-gray-300 font-sans border-b border-gray-800 pb-6 mb-6 italic">
            "{info.mission}"
          </p>

          <div className="space-y-6">
            {info.points.map((pt, i) => (
              <div key={i} className="group">
                <div className="flex items-center gap-3 mb-1">
                   <div className={`w-1 h-4 ${isO5 ? 'bg-yellow-600' : 'bg-scp-accent'}`}></div>
                   <h4 className="text-xs font-black uppercase tracking-widest text-white group-hover:text-scp-terminal transition-colors">{pt.h}</h4>
                </div>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed pl-4 border-l border-gray-900 ml-0.5">
                  {pt.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderObjects = () => {
    const getClearanceSpecificObjects = () => {
      const standardClasses = [
        { cls: 'Безопасный (Safe)', color: 'text-green-500', border: 'border-green-900', bg: 'bg-green-950/10', desc: 'Аномалии, свойства которых полностью изучены. Содержание не требует значительных ресурсов. Safe не означает "неопасный", это лишь показатель надежности сдерживания.' },
        { cls: 'Евклид (Euclid)', color: 'text-yellow-500', border: 'border-yellow-900', bg: 'bg-yellow-950/10', desc: 'Объекты, поведение которых непредсказуемо или чья природа не изучена до конца. Требуют постоянного мониторинга. Большинство одушевленных аномалий классифицируются как Евклид.' },
        { cls: 'Кетер (Keter)', color: 'text-red-500', border: 'border-red-900', bg: 'bg-red-950/10', desc: 'Аномалии, представляющие враждебную угрозу и крайне сложные в содержании. Нарушение ОУС неизбежно при ослаблении бдительности. Кетер требует активного противодействия его природе.' }
      ];

      if (currentClearance <= 2) {
        return {
          title: "РЕГЛАМЕНТ КЛАССИФИКАЦИИ S/E/K",
          tagline: "СТАНДАРТНЫЕ ПРОТОКОЛЫ СОДЕРЖАНИЯ",
          intro: "Класс объекта — это первичный идентификатор сложности его сдерживания. Персоналу L-2 и ниже запрещено использование неофициальной терминологии при составлении рапортов.",
          classes: standardClasses,
          footer: "ОШИБКА В КЛАССИФИКАЦИИ ВЕДЕТ К НАРУШЕНИЮ УСЛОВИЙ СОДЕРЖАНИЯ."
        };
      }

      const esotericL4 = [
        { cls: 'Таумиэль (Thaumiel)', color: 'text-purple-500', border: 'border-purple-900', bg: 'bg-purple-950/10', desc: 'Сверхсекретные аномалии, используемые Фондом для содержания или нейтрализации других опасных объектов. Существование Thaumiel — государственная тайна высшего порядка.' }
      ];

      if (currentClearance < 5) {
        return {
          title: "РАСШИРЕННАЯ КЛАССИФИКАЦИЯ И ТЕСТ КОРОБОК",
          tagline: "СТАТУС: ДИРЕКЦИЯ / ВЕДУЩИЕ ИССЛЕДОВАТЕЛИ",
          intro: "Для упрощения понимания сложности содержания в профессиональной среде используется 'Тест Коробок'. Класс объекта не равен его разрушительному потенциалу.",
          classes: [...standardClasses, ...esotericL4],
          boxTest: [
            { h: "Safe", d: "Положите это в коробку, заприте её и оставьте. Ничего не произойдет." },
            { h: "Euclid", d: "Положите это в коробку, заприте её. Вы не знаете, что увидите, когда вернетесь." },
            { h: "Keter", d: "Положите это в коробку. Оно вырвется, убьет охрану и уничтожит коробку." },
            { h: "Thaumiel", d: "Это и есть коробка. В ней лежат те, кто хочет уничтожить мир." }
          ],
          footer: "МЫ КЛАССИФИЦИРУЕМ ХАОС, ЧТОБЫ УПРАВЛЯТЬ ИМ."
        };
      }

      const highEsoteric = [
        { cls: 'Аполлион (Apollyon)', color: 'text-orange-600', border: 'border-orange-900', bg: 'bg-orange-950/10', desc: 'Объекты, содержание которых технически невозможно или бессмысленно. Неминуемое нарушение нормальности. Ожидание сценария класса XK.' },
        { cls: 'Архонт (Archon)', color: 'text-cyan-400', border: 'border-cyan-900', bg: 'bg-cyan-950/10', desc: 'Аномалии, которые МОЖНО содержать, но НЕ СЛЕДУЕТ, так как это нанесет больше вреда реальности, чем их свобода.' },
        { cls: 'Тиамат (Tiamat)', color: 'text-pink-600', border: 'border-pink-900', bg: 'bg-pink-950/10', desc: 'Объекты, требующие открытого военного противостояния со стороны Фонда. Прямая угроза существованию цивилизации.' },
        { cls: 'Гемиэль (Hiemal)', color: 'text-blue-400', border: 'border-blue-900', bg: 'bg-blue-950/10', desc: 'Комплексные аномалии, сдерживающие друг друга естественным образом. Фонд лишь наблюдает за балансом.' }
      ];

      return {
        title: "КЛАССИФИКАЦИЯ: ОКОНЧАТЕЛЬНАЯ ИЕРАРХИЯ",
        tagline: "СТАТУС: СОВЕТ СМОТРИТЕЛЕЙ",
        intro: "Граница между 'Безопасным' и 'Аполлионом' — лишь вопрос времени и наших ресурсов. Многие классы объектов в общей базе данных являются дезинформацией для поддержания морали персонала.",
        classes: [...standardClasses, ...esotericL4, ...highEsoteric],
        boxTest: [
           { h: "Apollyon", d: "Коробки не существует. Смерть неизбежна." },
           { h: "Archon", d: "Коробка есть, но если вы закроете в ней объект — мир рухнет." }
        ],
        footer: "МЫ — ПРАВИЛА, ПО КОТОРЫМ ИГРАЕТ ВСЕЛЕННАЯ."
      };
    };

    const objInfo = getClearanceSpecificObjects();

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="p-6 border border-gray-800 bg-black/40">
           <h3 className="text-xl font-black mb-2 uppercase tracking-tighter text-white">{objInfo.title}</h3>
           <p className="text-[10px] font-mono text-gray-500 tracking-[0.2em] mb-4">{objInfo.tagline}</p>
           <p className="text-xs text-gray-400 font-sans leading-relaxed">{objInfo.intro}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {objInfo.classes.map((c, i) => (
            <div key={i} className={`p-4 border-l-2 ${c.border} ${c.bg} space-y-2 group hover:bg-white/5 transition-colors`}>
              <div className={`font-black text-xs uppercase tracking-widest ${c.color}`}>{c.cls}</div>
              <p className="text-[10px] text-gray-400 font-sans leading-tight opacity-80 group-hover:opacity-100">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderClearance = () => {
    const getClearanceData = () => {
      switch (currentClearance) {
        case 0:
          return {
            title: "РЕГЛАМЕНТ ДОПУСКА: УРОВЕНЬ 0",
            tagline: "ОБЩИЙ ДОСТУП ДЛЯ ГРАЖДАНСКИХ КОНТРАКТНИКОВ",
            desc: "Уровень 0 присваивается некритическому персоналу, не имеющему прямого, опосредованного или дистанционного доступа к аномальным объектам или сущностям на содержании.",
            rights: [
              "Доступ в общие зоны (столовые, жилые блоки L-0).",
              "Использование внутренней сети SCPNET в режиме чтения общих объявлений.",
              "Право на базовое медицинское обслуживание."
            ],
            limits: [
              "Запрещен доступ к любым SCP-файлам.",
              "Запрещено нахождение в зонах содержания.",
              "Подлежат обязательной амнезиации при увольнении."
            ],
            footer: "ВАША БЕЗОПАСНОСТЬ — В ВАШЕМ НЕЗНАНИИ."
          };
        case 1:
          return {
            title: "РЕГЛАМЕНТ ДОПУСКА: УРОВЕНЬ 1",
            tagline: "СЛУЖЕБНЫЙ ДОСТУП",
            desc: "Персонал уровня 1 имеет доступ к информации об объектах класса Safe и Euclid, с которыми они непосредственно работают в рамках технического обслуживания.",
            rights: [
              "Доступ к документации объектов класса Safe (по запросу).",
              "Разрешение на сопровождение грузов низкой аномальной активности.",
              "Право на ношение легкого вооружения (для СБ L-1)."
            ],
            limits: [
              "Запрещено взаимодействие с аномалиями класса Keter.",
              "Запрещен доступ к архивам Зоны выше своего сектора.",
              "Не имеют права голоса в Комитете по Этике."
            ],
            footer: "ИСПОЛНЯЙТЕ СВОЙ ДОЛГ БЕЗ ЛИШНИХ ВОПРОСОВ."
          };
        case 2:
          return {
            title: "РЕГЛАМЕНТ ДОПУСКА: УРОВЕНЬ 2",
            tagline: "ОПЕРАТИВНЫЙ ДОСТУП",
            desc: "Стандартный уровень для большинства исследователей и полевых агентов. Позволяет работать with большинством аномалий под надзором.",
            rights: [
              "Полный доступ к архивам объектов Safe и Euclid.",
              "Право на инициирование базовых протоколов тестирования.",
              "Допуск к информации о структуре ближайших Зон."
            ],
            limits: [
              "Ограниченный доступ к данным о классе Keter.",
              "Запрещено знание о существовании объектов Thaumiel.",
              "Любой контакт с СО (Связанными Организациями) требует одобрения L-3+."
            ],
            footer: "ЗНАНИЕ — ЭТО ИНСТРУМЕНТ, ИСПОЛЬЗУЙТЕ ЕГО МУДРО."
          };
        case 3:
          return {
            title: "РЕГЛАМЕНТ ДОПУСКА: УРОВЕНЬ 3",
            tagline: "СЕКРЕТНЫЙ ДОСТУП",
            desc: "Старший персонал. Доступ к критически опасным аномалиям и тактическим данным Фонда в регионе.",
            rights: [
              "Полный доступ к файлам Keter.",
              "Право на командование МОГ (Мобильными Опергруппами) малого состава.",
              "Допуск к системе меметической защиты архивов."
            ],
            limits: [
              "Запрещен доступ к данным о совете O5.",
              "Ограниченное право на применение амнезиаков класса C.",
              "Запрещено знание о реальном расположении Зоны-01."
            ],
            footer: "ВЫ — ОПОРА ФОНДА В ТЯЖЕЛЫЕ ВРЕМЕНА."
          };
        case 4:
          return {
            title: "РЕГЛАМЕНТ ДОПУСКА: УРОВЕНЬ 4",
            tagline: "СОВЕРШЕННО СЕКРЕТНО",
            desc: "Высшее руководство Зон. Обладают правом на принятие стратегических решений и управление ресурсами Фонда.",
            rights: [
              "Полный доступ к базе данных RAISA (кроме файлов O5).",
              "Право санкционировать протоколы нейтрализации объектов.",
              "Авторизация на применение протокола массовой амнезиации."
            ],
            limits: [
              "Обязательный мониторинг со стороны ОВБ.",
              "Запрещено знание о личностях членов совета O5.",
              "Подлежат немедленной изоляции при малейшем подозрении на ментальное заражение."
            ],
            footer: "МИР ДЕРЖИТСЯ НА ВАШИХ ПЛЕЧАХ. НЕ ДОПУСТИТЕ ОШИБКИ."
          };
        default: // O5
          return {
            title: "ДОПУСК: СОВЕТ СМОТРИТЕЛЕЙ",
            tagline: "АБСОЛЮТНЫЙ ПРИОРИТЕТ",
            desc: "Совет О5 — это тринадцать человек, которые имеют полный доступ к любой информации. Вы выведены за рамки законов и морали.",
            rights: [
              "Доступ к SCP-001 во всех его итерациях.",
              "Право на изменение фундаментальных констант реальности через SCP-объекты.",
              "Абсолютное право вето на любые решения внутри Организации."
            ],
            limits: [
              "Запрещен любой контакт с SCP-объектами лично (риск потери контроля над Советом).",
              "Вы не существуете для остального мира.",
              "Смерть — это не конец, а нарушение протокола безопасности."
            ],
            footer: "МЫ — ПОСЛЕДНЯЯ ЛИНИЯ. ДАЛЬШЕ ТОЛЬКО ПУСТОТА."
          };
      }
    };

    const data = getClearanceData();

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="p-6 border border-gray-800 bg-black/40">
           <h3 className="text-xl font-black mb-2 uppercase tracking-tighter text-white flex items-center gap-3">
             <ShieldAlert className="text-scp-accent" size={24} /> {data.title}
           </h3>
           <p className="text-[10px] font-mono text-gray-500 tracking-[0.2em] mb-4 uppercase">{data.tagline}</p>
           <p className="text-xs text-gray-400 font-sans leading-relaxed border-b border-gray-800 pb-4 mb-4">{data.desc}</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
                   <Unlock size={14} /> Полномочия и права
                 </h4>
                 <ul className="space-y-2">
                    {data.rights.map((r, i) => (
                      <li key={i} className="text-[11px] text-gray-300 font-sans flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span> {r}
                      </li>
                    ))}
                 </ul>
              </div>
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                   <Lock size={14} /> Ограничения и запреты
                 </h4>
                 <ul className="space-y-2">
                    {data.limits.map((l, i) => (
                      <li key={i} className="text-[11px] text-gray-300 font-sans flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span> {l}
                      </li>
                    ))}
                 </ul>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderPersonnel = () => {
    const getPersonnelData = () => {
      const classes = [
        { 
          cls: 'Класс A', 
          title: 'Особо ценные сотрудники', 
          desc: 'Сотрудники, считающиеся критически важными для стратегического выживания Фонда. Им запрещен любой прямой доступ к аномалиям. В случае нарушения условий содержания Зоны, сотрудники Класса A должны быть немедленно эвакуированы в защищенные бункеры.',
          icon: Crown, 
          color: 'text-yellow-500',
          l4plus: "Обычно это члены Совета Смотрителей (хотя они Класс O5) или их прямые заместители. Их смерть может вызвать коллапс управления регионом."
        },
        { 
          cls: 'Класс B', 
          title: 'Оперативный персонал', 
          desc: 'Считаются важными для локальных операций. Доступ к аномалиям разрешен только после тщательной очистки и подтверждения безопасности. Включает директоров отделов и кураторов крупных проектов.',
          icon: ShieldAlert, 
          color: 'text-blue-500',
          l4plus: "При ЧС Класс B имеет приоритет эвакуации после Класса A. Ликвидация Класса B требует санкции L-4."
        },
        { 
          cls: 'Класс C', 
          title: 'Полевой персонал', 
          desc: 'Основная масса сотрудников: исследователи, полевые агенты и сотрудники СБ. Имеют прямой контакт с аномалиями классов Safe и Euclid.',
          icon: UserCheck, 
          color: 'text-green-500',
          l4plus: "Подлежат регулярной психологической проверке и амнезиации по завершении миссий. Самый гибкий и заменяемый ресурс."
        },
        { 
          cls: 'Класс D', 
          title: 'Расходный персонал', 
          desc: 'Используются для работы с крайне опасными аномалиями и в экспериментах, где риск летального исхода превышает допустимый для Класса C. Набираются из числа заключенных, приговоренных к смерти.',
          icon: Skull, 
          color: 'text-gray-500',
          l4plus: "Протокол 'Ежемесячная Ротация': в конце месяца весь Класс D подлежит терминации или амнезиации класса B для предотвращения накопления знаний об объектах."
        },
        { 
          cls: 'Класс E', 
          title: 'Временная изоляция', 
          desc: 'Сотрудники любого класса, подвергшиеся потенциально опасному воздействию аномалии. Находятся под строгим карантином до подтверждения отсутствия заражения или ментальных изменений.',
          icon: AlertCircle, 
          color: 'text-red-500',
          l4plus: "Если Класс E проявляет признаки аномальности, он переквалифицируется в SCP-объект или ликвидируется."
        }
      ];

      return classes;
    };

    const data = getPersonnelData();

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="p-6 border border-gray-800 bg-black/40 mb-6">
           <h3 className="text-xl font-black mb-2 uppercase tracking-tighter text-white flex items-center gap-3">
             <Users className="text-scp-terminal" size={24} /> РЕГЛАМЕНТ КАДРОВЫХ КЛАССОВ
           </h3>
           <p className="text-xs text-gray-500 font-sans italic">
             "Персонал — это ресурс. Ресурс должен распределяться эффективно."
           </p>
        </div>

        <div className="space-y-4">
          {data.map((item, i) => (
            <div key={i} className="border border-gray-800 bg-scp-panel overflow-hidden group">
               <div className="flex flex-col md:flex-row">
                  <div className={`md:w-48 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-800 bg-black/40`}>
                     <item.icon className={`${item.color} mb-2`} size={32} />
                     <div className="font-black text-sm uppercase tracking-widest text-white text-center">{item.cls}</div>
                  </div>
                  <div className="flex-1 p-6 space-y-3">
                     <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.title}</div>
                     <p className="text-[11px] text-gray-500 leading-relaxed font-sans">{item.desc}</p>
                     
                     {isL4 && item.l4plus && (
                        <div className="mt-4 pt-4 border-t border-gray-800 flex gap-3 animate-in slide-in-from-left-2">
                           <Shield size={14} className="text-scp-accent shrink-0 mt-0.5" />
                           <div className="text-[10px] text-scp-accent italic font-mono leading-tight">
                             <span className="font-bold uppercase mr-1">Аддитив L-4:</span>
                             {item.l4plus}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderServices = () => {
    const getClearanceSpecificServices = () => {
      const basicServices = [
        { name: 'Служба Логистики', desc: 'Обеспечение жизнедеятельности Зон, поставка провизии, оборудования и расходных материалов.', icon: Truck, min: 0 },
        { name: 'Инженерно-Техническая Служба', desc: 'Обслуживание инфраструктуры, систем жизнеобеспечения и не-аномальных механизмов.', icon: HardHat, min: 0 },
        { name: 'Медицинская Служба', desc: 'Общее здравоохранение персонала и психологический мониторинг.', icon: HeartPulse, min: 0 }
      ];

      const operativeServices = [
        { name: 'Служба Безопасности (СБ)', desc: 'Охрана периметра Зон, внутренний порядок, конвоирование персонала класса D и объектов Safe/Euclid.', icon: Lock, min: 1 },
        { name: 'Научная Служба', desc: 'Изучение природы аномалий, разработка протоколов содержания и методов нейтрализации.', icon: BrainCircuit, min: 1 }
      ];

      const advancedServices = [
        { name: 'МОГ (Мобильные Опергруппы)', desc: 'Элитные тактические подразделения, специализирующиеся на захвате, содержании и боевых действиях против аномалий.', icon: Crosshair, min: 3 },
        { name: 'Отдел Внешних Связей', desc: 'Взаимодействие с правительственными структурами и дезинформация гражданского населения.', icon: Globe, min: 3 }
      ];

      const managementServices = [
        { name: 'ОВБ (Отдел Внутренней Безопасности)', desc: 'Поиск шпионов, мониторинг лояльности персонала, предотвращение утечек данных. ОВБ имеет право на арест любого сотрудника L-4.', icon: Key, min: 4 },
        { name: 'РАИСА (RAISA)', desc: 'Администрирование архивов, информационная безопасность и цензура документов.', icon: Database, min: 4 }
      ];

      const o5Services = [
        { name: 'Канцелярия Смотрителей', desc: 'Обеспечение оперативной деятельности Совета О5, координация глобальных проектов Организации.', icon: Crown, min: 5 },
        { name: 'Отдел Теоретической Физики', desc: 'Разработка методов изменения реальности и управление Якорями Реальности Скрэнтона.', icon: Cpu, min: 5 }
      ];

      return [
        ...basicServices,
        ...operativeServices.filter(s => currentClearance >= s.min),
        ...advancedServices.filter(s => currentClearance >= s.min),
        ...managementServices.filter(s => currentClearance >= s.min),
        ...o5Services.filter(s => currentClearance >= s.min)
      ];
    };

    const services = getClearanceSpecificServices();

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="p-6 border border-gray-800 bg-black/40">
           <h3 className="text-xl font-black mb-2 uppercase tracking-tighter text-white flex items-center gap-3">
             <ClipboardList className="text-scp-terminal" size={24} /> СТРУКТУРА ВНУТРЕННИХ СЛУЖБ
           </h3>
           <p className="text-xs text-gray-400 font-sans leading-relaxed">
             Фонд разделен на специализированные департаменты для обеспечения максимальной эффективности и сегментации информации.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((s, i) => (
            <div key={i} className="p-4 border border-gray-800 bg-scp-panel hover:border-scp-terminal transition-all group">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-black border border-gray-800 group-hover:border-scp-terminal transition-colors">
                  <s.icon className="text-scp-terminal" size={20} />
                </div>
                <div className="font-bold text-xs uppercase tracking-widest text-white group-hover:text-scp-terminal">{s.name}</div>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed font-sans">{s.desc}</p>
            </div>
          ))}
        </div>

        {isL4 && (
          <div className="p-4 border-l-2 border-scp-accent bg-scp-accent/5">
             <div className="flex items-center gap-2 text-scp-accent mb-2">
               <ShieldAlert size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Протокол Межведомственного Взаимодействия</span>
             </div>
             <p className="text-[10px] text-gray-400 font-mono italic">
               Любое несогласованное перемещение ресурсов между службами (особенно МОГ и Научной службой) без подписи Директора Зоны рассматривается как потенциальный саботаж.
             </p>
          </div>
        )}

        <div className="text-center py-4 border-t border-gray-900 mt-8">
          <p className="text-[9px] font-mono text-gray-600 uppercase tracking-[0.4em]">ФУНКЦИОНИРОВАНИЕ СИСТЕМЫ ПРЕВЫШЕ ИНДИВИДУУМА.</p>
        </div>
      </div>
    );
  };

  const renderEthics = () => {
    return (
      <div className="space-y-6">
        <div className="p-6 border border-gray-800 bg-black/40 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 opacity-5 text-gray-600 rotate-12">
            <Scale size={160} />
          </div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Scale className="text-white" /> КОМИТЕТ ПО ЭТИКЕ</h3>
          <p className="text-sm leading-relaxed text-gray-400 font-sans relative z-10">
            Фонд не является злом. Мы не пытаем просто так. Мы делаем то, что необходимо, чтобы 7 миллиардов людей могли продолжать спать спокойно. <br/><br/>
            Комитет по Этике — это не «добрые люди», это те, кто определяет допустимую цену спасения мира. Если для сдерживания аномалии класса Кетер требуется смерть 100 сотрудников класса D — Комитет даст на это разрешение. Но он накажет исследователя, который потратит 101-го просто по небрежности.
          </p>
        </div>
        {isO5 && (
          <div className="p-4 border-l-2 border-red-500 bg-red-950/10">
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <Lock size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">Аддитив О5-13</span>
            </div>
            <p className="text-xs text-gray-400 italic font-mono">
              "Комитет по Этике имеет право вето на любое решение Совета О5, если оно признано излишне жестоким или неэффективным. Помните: мы наблюдаем за наблюдателями."
            </p>
          </div>
        )}
      </div>
    );
  };

  const contentMap: Record<GuideTab, () => React.ReactNode> = {
    general: renderGeneral,
    objects: renderObjects,
    clearance: renderClearance,
    personnel: renderPersonnel,
    services: renderServices,
    ethics: renderEthics,
  };

  return (
    <div className="flex flex-col md:flex-row h-full gap-8 animate-in fade-in duration-700">
      <aside className="md:w-64 shrink-0 space-y-2">
        <div className="p-4 border border-gray-800 bg-black/60 mb-4">
           <h2 className="text-sm font-black text-scp-text uppercase tracking-widest mb-1">Архивариус</h2>
           <p className="text-[9px] text-gray-600 font-mono">БАЗА ЗНАНИЙ v12.4.2</p>
        </div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as GuideTab)}
            className={`w-full flex items-center gap-3 p-4 text-left transition-all border ${
              activeTab === item.id 
                ? 'bg-scp-terminal text-black border-scp-terminal'
                : 'bg-transparent text-gray-500 border-gray-800 hover:text-white'
            }`}
          >
            <item.icon size={16} />
            <span className="text-[10px] uppercase font-bold tracking-widest">{item.label}</span>
          </button>
        ))}
      </aside>

      <div className="flex-1 bg-scp-panel border border-gray-800 flex flex-col overflow-hidden relative">
        <div className="p-6 border-b border-gray-800 bg-black/40 flex justify-between items-center z-10">
           <h1 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <BookOpen className="text-scp-terminal" /> {menuItems.find(m => m.id === activeTab)?.label}
           </h1>
           <div className="text-[10px] font-mono text-gray-600">
             ДОСТУП L-{currentClearance}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 relative z-0">
           <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(#333_1px,transparent_1px),linear-gradient(90deg,#333_1px,transparent_1px)] bg-[length:40px_40px]"></div>
           <div className="relative max-w-4xl">
             {contentMap[activeTab]()}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;
