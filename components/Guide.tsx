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
  Crown
} from 'lucide-react';

type GuideTab = 'general' | 'objects' | 'clearance' | 'personnel' | 'services';

interface GuideProps {
  currentClearance: number;
}

const Guide: React.FC<GuideProps> = ({ currentClearance }) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('general');

  const menuItems = [
    { id: 'general', label: 'Общая информация', icon: Info },
    { id: 'objects', label: 'Классы объектов', icon: Database },
    { id: 'clearance', label: 'Уровни допуска', icon: Shield },
    { id: 'personnel', label: 'Классы персонала', icon: Users },
    { id: 'services', label: 'Внутренние службы', icon: ClipboardList },
  ];

  const getGeneralInfoByLevel = () => {
    const lvl = currentClearance;
    if (lvl === 0) return {
      title: "Фонд SCP — Общая информация",
      tagline: "Инструктаж: «Служба и Порядок»",
      content: "Организация является ведущим мировым НИИ. Мы изучаем редкие природные явления для обеспечения безопасности человечества. Ваша работа здесь — залог стабильности мира.",
      principles: [
        { title: "ОБЕЗОПАСИТЬ", text: "Мы ограничиваем доступ посторонних к опасным материалам." },
        { title: "УДЕРЖАТЬ", text: "Мы создаем условия для стабильного хранения исследований." },
        { title: "СОХРАНИТЬ", text: "Мы оберегаем научное наследие человечества." }
      ],
      presence: "Информация о местонахождении других Зон конфиденциальна. Ваша зона ответственности ограничена текущим сектором.",
      footer: "Архивариус // Доступ L-0"
    };
    if (lvl === 1) return {
      title: "Фонд SCP — Введение в безопасность",
      tagline: "Инструктаж: «Сверхгосударственный надзор»",
      content: "Фонд оперирует вне юрисдикции правительств. Мы изолируем аномалии, нарушающие законы физики и биологии. Любая утечка — критическая угроза.",
      principles: [
        { title: "ОБЕЗОПАСИТЬ", text: "Изоляция объектов от гражданских и террористических групп." },
        { title: "УДЕРЖАТЬ", text: "Эксплуатация Особых Условий Содержания (ОУС) для нейтрализации аномальных угроз." },
        { title: "СОХРАНИТЬ", text: "Защита гражданского населения от последствий аномальных воздействий." }
      ],
      presence: "Разрешен доступ к логистическим данным Зоны-19. Информация о других филиалах — только по запросу руководства.",
      footer: "СБ // Доступ L-1"
    };
    if (lvl === 2) return {
      title: "Фонд SCP — Защита Нормы",
      tagline: "Ориентировка: «Рабочий инструмент»",
      content: "Наша цель — содержание аномалий, угрожающих «норме» (стандартному восприятию реальности). Помните: нормальность — это то, что мы защищаем.",
      principles: [
        { title: "ОУС", text: "Нарушение условий содержания карается по уставу. Ошибка одного — смерть всей Зоны." },
        { title: "КЛАССИФИКАЦИЯ", text: "Данные по Safe и Euclid доступны. Информация по Keter выдается согласно вашему проекту." },
        { title: "ФИЛИАЛЫ", text: "Вам подтверждено существование Зон 17 и 81. Локация остается под грифом «Секретно»." }
      ],
      presence: "Вы имеете право знать о специализации объектов в вашем регионе. Координаты скрыты за шифрованием 2-го уровня.",
      footer: "Научный Совет // Доступ L-2"
    };
    if (lvl === 3) return {
      title: "Фонд SCP — Глобальная стратегия",
      tagline: "Ориентировка: «Поддержание Завесы»",
      content: "Мы — тонкая грань между цивилизацией и хаосом. Миссия Фонда заключается в сохранении Завесы секретности любой ценой, включая человеческие жизни.",
      principles: [
        { title: "СОХРАНИТЬ", text: "Запрет на уничтожение аномалий до полного изучения. Мы не уничтожаем — мы содержим, даже если это безумие." },
        { title: "РЕГИОНАЛЬНАЯ СЕТЬ", text: "Доступны данные по Зоне-19 (Safe/Euclid), Зоне-17 (гуманоиды) и Зоне-81 (глубоководные)." },
        { title: "КООРДИНАЦИЯ", text: "Разрешено взаимодействие между Зонами при проведении межобъектных операций." }
      ],
      presence: "Доступна карта основных узлов содержания в северном полушарии и данные о ресурсах МОГ.",
      footer: "Оперативный Штаб // Доступ L-3"
    };
    if (lvl === 4) return {
      title: "Фонд SCP — Политический суверенитет",
      tagline: "Ориентировка: «Высшая инстанция»",
      content: "Фонд имеет право на ликвидацию политических угроз и массовую очистку памяти целых наций. Мы выше государств. Мы — закон реальности.",
      principles: [
        { title: "РЕСУРСЫ", text: "Полный доступ к картам расположения всех стационарных Зон и Биосайтов Фонда." },
        { title: "ЗОНА-01", text: "Подтверждено существование штаба О5. Доступ разрешен только для консультаций по запросу Совета." },
        { title: "ПРОТОКОЛЫ", text: "Право на инициацию протоколов уничтожения объектов при невозможности содержания." }
      ],
      presence: "Визуализация активов в реальном времени. Включена система раннего предупреждения об угрозах класса K.",
      footer: "Командование Зоны // Доступ L-4"
    };
    return {
      title: "Фонд SCP — Истинная природа",
      tagline: "Ориентировка: «Архитекторы реальности»",
      content: "Норма — это иллюзия. Наша миссия: поддержка существующей реальности против энтропии. Мы создаем правила, по которым живет этот мир.",
      principles: [
        { title: "ЗОНА-01", text: "Прямое управление штаб-квартирой и архивами Совета Смотрителей." },
        { title: "ГЛОБАЛЬНОСТЬ", text: "Контроль над активами на орбите, в экстрамерных пространствах и временных потоках." },
        { title: "ВЫСШАЯ ЦЕЛЬ", text: "Доступ к информации о том, почему Фонд САМ является аномалией. Допуск к SCP-001." }
      ],
      presence: "Вселенная — это проект. Мы — его кураторы. Вам доступны все инструменты редактирования консенсуса.",
      footer: "Совет О5 // ДОСТУП РАЗРЕШЕН",
      isO5: true
    };
  };

  const getObjectInfoByLevel = () => {
    const lvl = currentClearance;
    if (lvl === 0) return {
      title: "Классы объектов — Ограничено",
      content: "Информация о классификации аномалий доступна только авторизованному персоналу L-1+. Пожалуйста, не покидайте пределы вашего сектора.",
      items: [],
      note: "Обратитесь к куратору для прохождения курса общей безопасности.",
      footer: "СБ // Доступ L-0"
    };
    if (lvl === 1) return {
      title: "Классы объектов — Инструктаж",
      tagline: "Ориентировка: Оценка опасности",
      items: [
        { cls: 'Безопасный (Safe)', color: 'text-green-500', desc: 'Предсказуем. Если запереть в ящике, ничего не произойдет. Не расслабляйтесь — он может убить, если вы нарушите протокол.' },
        { cls: 'Евклид (Euclid)', color: 'text-yellow-500', desc: 'Непредсказуем. Требует постоянного визуального или датчикового контроля. Склонен к попыткам побега.' },
        { cls: 'Кетер (Keter)', color: 'text-red-500', desc: 'Крайне опасен. Если он в ящике, он его уничтожит. Требует максимальных мер безопасности и вооруженной охраны.' }
      ],
      footer: "Охрана // Доступ L-1"
    };
    if (lvl === 2) return {
      title: "Классы объектов — Оперативка",
      tagline: "Ориентировка: Сложность содержания",
      items: [
        { cls: 'Safe', color: 'text-green-500', desc: 'Аномалия изучена на 90%+. Протоколы содержания статичны.' },
        { cls: 'Euclid', color: 'text-yellow-500', desc: 'Объекты с зачатками разума или волей. Требуют активного участия исследователей.' },
        { cls: 'Keter', color: 'text-red-500', desc: 'Требуют активного подавления. Информация о способах нейтрализации выдается по мере необходимости.' },
        { cls: 'Нейтрализованный', color: 'text-gray-500', desc: 'Утратил свойства. Доступ к архивам для анализа причин потери аномальности.' }
      ],
      footer: "Исследовательский корпус // Доступ L-2"
    };
    if (lvl >= 3) return {
      title: "Классификация — Ресурсный анализ",
      tagline: "Ориентировка: Стратегическая оценка",
      items: [
        { cls: 'Таумиэль (Thaumiel)', color: 'text-purple-500', desc: 'Аномалии, используемые Фондом для содержания других аномалий. Наш скрытый козырь.' },
        { cls: 'Аполлион (Apollyon)', color: 'text-orange-600', desc: 'Несодержимые объекты. Неминуемый конец света. Только для L-4+.' },
        { cls: 'Архонт (Archon)', color: 'text-blue-400', desc: 'Теоретически содержимы, но само содержание разрушит мир. Оставлены на свободе.' }
      ],
      footer: "Директорат // Доступ L-3+"
    };
    return { title: "Ошибка", items: [] }; // Fallback
  };

  const getClearanceInfoByLevel = () => {
    const lvl = currentClearance;
    return {
      title: "Система уровней допуска",
      tagline: `Ориентировка: ${lvl === 5 ? 'Абсолютная власть' : 'Иерархия безопасности'}`,
      content: lvl <= 1 ? "Допуск определяет ваши права на перемещение и выживание." : "Допуск — это мера информационной безопасности, а не статус.",
      levels: [
        { lvl: '0-1', title: 'Вспомогательный персонал', access: 'Общие зоны, столовые, безопасные коридоры.' },
        { lvl: '2', title: 'Оперативный состав', access: 'Доступ к данным объектов текущего проекта.' },
        { lvl: '3', title: 'Командный состав', access: 'Региональные базы данных и тактическое управление.' },
        { lvl: '4-5', title: 'Администрация и О5', access: 'Глобальные архивы и протоколы управления реальностью.' }
      ],
      footer: "Фонд SCP // Уровни доступа"
    };
  };

  const getPersonnelInfoByLevel = () => {
    const lvl = currentClearance;
    if (lvl <= 1) return {
      title: "Классификация персонала — Порядок",
      tagline: "Ориентировка: «Этикет и Безопасность»",
      classes: [
        { cls: 'Классы A и B', title: 'Руководство', desc: 'Важнейшие сотрудники. В случае тревоги эвакуируются первыми. Прямой контакт запрещен.' },
        { cls: 'Класс C', title: 'Сотрудники', desc: 'Ваши коллеги. Основной штат Зоны.' },
        { cls: 'Класс D', title: 'Временный персонал', desc: 'Люди в оранжевых комбинезонах. Смертельно опасно: не говорить, не брать предметы.' }
      ],
      footer: "Отдел Кадров // Доступ L-1"
    };
    if (lvl === 2) return {
      title: "Классификация персонала — Оперативка",
      tagline: "Ориентировка: «Функционал и Риски»",
      classes: [
        { cls: 'Класс A', title: 'Активы', desc: 'Носители критических данных. Контакт с ЛЮБЫМИ аномалиями запрещен.' },
        { cls: 'Класс C', title: 'Ваш статус', desc: 'Стандартный доступ. Право на медицинское обслуживание и амнезиаки.' },
        { cls: 'Класс D', title: 'Расходники', desc: 'Ваш основной ресурс для тестов. Расходуйте экономно, но без колебаний.' }
      ],
      footer: "Научный Совет // Доступ L-2"
    };
    return {
      title: "Классификация персонала — Стратегия",
      tagline: "Ориентировка: «Управление биомассой»",
      classes: [
        { cls: 'Класс D', title: 'Логистика', desc: 'Возобновляемый ресурс. Одобрение Протокола 12 (ликвидация) — ваша ответственность.' },
        { cls: 'Класс E', title: 'Карантин', desc: 'Инструмент изоляции сотрудников, увидевших лишнее или зараженных меметикой.' },
        { cls: 'Класс A', title: 'Совет Пяти', desc: 'Только для О5. Ваша жизнь — это выживание человечества.' }
      ],
      isO5: lvl >= 4,
      footer: "Директорат // Доступ L-3+"
    };
  };

  const getServicesInfoByLevel = () => {
    const lvl = currentClearance;
    if (lvl <= 1) return {
      title: "Внутренние службы — Быт",
      tagline: "Ориентировка: «Кто за что отвечает»",
      services: [
        { title: 'Служба безопасности', icon: Shield, text: 'Охраняют вас. Не злите их.' },
        { title: 'Медицинский отдел', icon: Stethoscope, text: 'Лечат травмы. Проводят ежемесячные тесты на психику.' },
        { title: 'Инженерная служба', icon: Settings, text: 'Ремонтируют двери и вентиляцию.' }
      ],
      footer: "Администрация Зоны // Доступ L-1"
    };
    if (lvl === 2) return {
      title: "Внутренние службы — Работа",
      tagline: "Ориентировка: «Наука и Разведка»",
      services: [
        { title: 'Научный отдел', icon: BookOpen, text: 'Ваше руководство. Разработка ОУС и эксперименты.' },
        { title: 'Отдел внешних связей', icon: Globe, text: 'Те, кто чистят новости в интернете за вами.' },
        { title: 'Комитет по этике', icon: Scale, text: 'Следит, чтобы вы не мучили класс D просто ради забавы.' }
      ],
      footer: "Научный Совет // Доступ L-2"
    };
    return {
      title: "Внутренние службы — Контроль",
      tagline: "Ориентировка: «Инструменты власти»",
      services: [
        { title: 'ОВБ (Внутренняя безопасность)', icon: Lock, text: 'Тайная полиция. Ищут предателей. Право на допрос до L-3.' },
        { title: 'МОГ (Оперативники)', icon: Crosshair, text: 'Ваша грубая сила для захвата объектов.' },
        { title: 'Отдел меметики', icon: BrainCircuit, text: 'Контроль информационных угроз и «убийственных файлов».' }
      ],
      isO5: lvl >= 4,
      footer: "Высшее Командование // Доступ L-3+"
    };
  };

  const renderContent = () => {
    // Вспомогательная функция для отрисовки карточек
    const renderCards = (items: any[]) => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <div key={i} className="p-4 bg-black/40 border border-gray-800 hover:border-scp-terminal transition-all">
            <div className="flex items-center gap-2 mb-2">
              {item.icon ? <item.icon size={18} className="text-scp-terminal" /> : <ChevronRight size={14} className="text-scp-terminal" />}
              <h4 className="font-bold text-sm text-white uppercase">{item.title || item.cls}</h4>
            </div>
            <p className="text-xs text-gray-400 font-sans leading-relaxed">{item.text || item.desc}</p>
          </div>
        ))}
      </div>
    );

    switch (activeTab) {
      case 'general':
        const gen = getGeneralInfoByLevel();
        return (
          <div className="space-y-6 animate-in fade-in">
            <div className={`p-6 border-l-4 ${gen.isO5 ? 'border-yellow-500 bg-yellow-950/10' : 'border-scp-terminal bg-scp-terminal/5'}`}>
              <h3 className="text-xl font-bold uppercase flex items-center gap-3">
                {gen.isO5 ? <Eye /> : <Info />} {gen.title}
              </h3>
              <p className="text-xs font-mono italic text-gray-500 mb-4">{gen.tagline}</p>
              <p className="text-gray-300 font-sans mb-4">{gen.content}</p>
              {renderCards(gen.principles)}
            </div>
            <div className="p-4 bg-scp-panel border border-gray-800">
               <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Globe size={14}/> {gen.presence}</h4>
               <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Статус: Оперативный режим активен</p>
            </div>
          </div>
        );

      case 'objects':
        const obj = getObjectInfoByLevel();
        return (
          <div className="space-y-6 animate-in fade-in">
             <div className="border-b border-gray-800 pb-2">
               <h3 className="text-xl font-bold text-white uppercase">{obj.title}</h3>
               <p className="text-xs text-gray-500 font-mono italic">{obj.tagline}</p>
             </div>
             {obj.items.length > 0 ? (
               <div className="space-y-4">
                 {obj.items.map((item: any, i) => (
                   <div key={i} className={`p-4 border-l-4 ${item.color.replace('text-', 'border-')} bg-black/40`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Box size={16} className={item.color} />
                        <h4 className={`font-bold ${item.color} uppercase`}>{item.cls}</h4>
                      </div>
                      <p className="text-xs text-gray-400 font-sans">{item.desc}</p>
                   </div>
                 ))}
               </div>
             ) : <div className="text-center py-20 text-red-900 border border-dashed border-red-900"><Lock size={48} className="mx-auto mb-2 opacity-50"/> {obj.content}</div>}
          </div>
        );

      case 'personnel':
        const pers = getPersonnelInfoByLevel();
        return (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="text-xl font-bold uppercase">{pers.title}</h3>
            <p className="text-xs text-gray-500 font-mono mb-4">{pers.tagline}</p>
            {renderCards(pers.classes.map(c => ({ title: c.cls + ' ' + c.title, text: c.desc })))}
          </div>
        );

      case 'services':
        const serv = getServicesInfoByLevel();
        return (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="text-xl font-bold uppercase">{serv.title}</h3>
            <p className="text-xs text-gray-500 font-mono mb-4">{serv.tagline}</p>
            {renderCards(serv.services)}
          </div>
        );
        
      case 'clearance':
        const clr = getClearanceInfoByLevel();
        return (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="text-xl font-bold uppercase">{clr.title}</h3>
            <p className="text-gray-300 font-sans mb-4">{clr.content}</p>
            {renderCards(clr.levels.map(l => ({ title: 'LEVEL ' + l.lvl + ': ' + l.title, text: l.access })))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-scp-terminal font-mono">
      {/* Меню вкладок */}
      <div className="flex border-b border-gray-800 bg-scp-panel overflow-x-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as GuideTab)}
            className={`flex items-center gap-2 px-6 py-4 transition-all border-b-2 whitespace-nowrap ${
              activeTab === item.id 
                ? 'border-scp-terminal bg-scp-terminal/10 text-scp-terminal' 
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <item.icon size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Основной контент */}
      <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
        {renderContent()}
        
        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-900 flex justify-between items-center text-[10px] text-gray-600 uppercase tracking-widest">
           <div>{activeTab === 'general' ? getGeneralInfoByLevel().footer : 'Status: Encrypted'}</div>
           <div className="flex gap-4">
             <span>Protocol: Secure</span>
             <span>System: V.2.0.25</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;
