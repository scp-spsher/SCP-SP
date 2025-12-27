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
  // Added Crown icon import
  Crown
} from 'lucide-react';
import { SCPLogo } from './SCPLogo';

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

    if (lvl === 0) {
      return {
        title: "Фонд SCP — Общая информация",
        tagline: "Научно-исследовательский институт закрытого типа",
        content: "Организация является научно-исследовательским институтом закрытого типа, работающим по контракту с ведущими мировыми правительствами. Наша основная задача — изучение редких природных явлений и обеспечение глобальной безопасности.",
        principles: [
          { title: "ОБЕЗОПАСИТЬ", text: "Мы ограничиваем доступ посторонних лиц к потенциально опасным объектам." },
          { title: "УДЕРЖАТЬ", text: "Мы создаем условия для стабильного хранения исследуемых материалов." },
          { title: "СОХРАНИТЬ", text: "Мы оберегаем научное наследие человечества." }
        ],
        presence: "Фонд располагает сетью научно-исследовательских центров по всему миру. Информация о местонахождении других Зон, кроме текущей Зоны вашего пребывания, является конфиденциальной.",
        footer: "Архивариус // Доступ L-0"
      };
    }

    if (lvl === 1) {
      return {
        title: "Фонд SCP — Введение в безопасность",
        tagline: "Сверхгосударственная структура изоляции",
        content: "Фонд — это сверхгосударственная структура, занимающаяся изоляцией объектов, нарушающих законы физики или биологии.",
        principles: [
          { title: "ОБЕЗОПАСИТЬ", text: "Изоляция аномалий от гражданских лиц и террористических групп." },
          { title: "УДЕРЖАТЬ", text: "Эксплуатация Особых Условий Содержания (ОУС) для предотвращения угроз." },
          { title: "СОХРАНИТЬ", text: "Защита населения от воздействия аномалий." }
        ],
        presence: "Сотрудникам уровня 1 разрешено знать о существовании крупных логистических узлов, таких как Зона-19. Информация о специфике других филиалов предоставляется только при переводе.",
        footer: "Служба Безопасности // Доступ L-1"
      };
    }

    if (lvl === 2) {
      return {
        title: "Фонд SCP — Миссия и Структура",
        tagline: "Защита глобальной нормы",
        content: "Фонд действует вне юрисдикции правительств. Наша цель — содержание аномалий, представляющих угрозу нормальному функционированию общества (норме).",
        principles: [
          { title: "ОУС", text: "Каждый объект требует уникальных условий содержания. Нарушение ОУС карается согласно уставу." },
          { title: "КЛАССИФИКАЦИЯ", text: "Информация об объектах классов Safe и Euclid доступна в рамках текущих проектов." },
          { title: "ФИЛИАЛЫ", text: "Подтверждено существование специализированных Зон (Зона-17 для гуманоидных аномалий, Зона-81 для морских исследований)." }
        ],
        presence: "Вы имеете ограниченный доступ к списку активных Зон в вашем регионе. Точные координаты засекречены.",
        footer: "Научный Совет // Доступ L-2"
      };
    }

    if (lvl === 3) {
      return {
        title: "Фонд SCP — Глобальная стратегия",
        tagline: "Поддержание Завесы",
        content: "Миссия Фонда — сохранение завесы секретности. Аномальная активность рассматривается как экзистенциальная угроза.",
        principles: [
          { title: "СОХРАНИТЬ", text: "Под этим подразумевается не только защита аномалий, но и недопущение их уничтожения до полного изучения, даже если они крайне опасны." },
          { title: "РЕГИОНАЛЬНАЯ СЕТЬ", text: "Зона-19 (Safe/Euclid), Зона-17 (социально-активные сущности), Зона-81 (глубоководная база)." },
          { title: "ВЗАИМОДЕЙСТВИЕ", text: "Разрешена координация между Зонами при проведении совместных операций." }
        ],
        presence: "Доступны данные о специализации ключевых узлов. Доступна карта основных узлов содержания в северном полушарии.",
        footer: "Оперативный Штаб // Доступ L-3"
      };
    }

    if (lvl === 4) {
      return {
        title: "Фонд SCP — Политический суверенитет",
        tagline: "Высшая инстанция безопасности",
        content: "Фонд является высшей инстанцией в вопросах аномальной безопасности. Мы имеем право на применение протоколов массовой амнезиальной обработки населения и ликвидацию политических угроз.",
        principles: [
          { title: "РЕСУРСЫ", text: "Полный доступ к картам расположения Зон и Биосайтов." },
          { title: "ЗОНА-01", text: "Подтверждено существование «Зоны-01» (Штаб-квартира Совета О5). Информация скрыта за меметическими фильтрами." },
          { title: "ПРОТОКОЛЫ", text: "Право инициировать протоколы уничтожения объектов, если их содержание становится невозможным." }
        ],
        presence: "Полная визуализация всех активов Фонда доступна в реальном времени. Включен режим приоритетного доступа.",
        footer: "Командование Зоны // Доступ L-4"
      };
    }

    return {
      title: "Фонд SCP — Истинная природа",
      tagline: "Архитекторы реальности",
      content: "Миссия: Поддержание существующей реальности любой ценой. Норма — это консенсус, который мы создаем и защищаем от энтропии.",
      principles: [
        { title: "ЗОНА-01", text: "Прямое управление штаб-квартирой и архивами Совета." },
        { title: "ГЛОБАЛЬНОСТЬ", text: "Полная визуализация всех активов, включая скрытые объекты на орбите Земли и в экстрамерных пространствах." },
        { title: "ВЫСШАЯ ЦЕЛЬ", text: "Вам доступны данные о том, почему аномалии должны содержаться, а не уничтожаться." }
      ],
      presence: "Вселенная — это проект. Мы — его кураторы. Вам доступны все инструменты редактирования реальности, включая SCP-001.",
      footer: "Совет О5 // ДОСТУП РАЗРЕШЕН",
      isO5: true
    };
  };

  const getObjectInfoByLevel = () => {
    const lvl = currentClearance;

    if (lvl === 0) {
      return {
        title: "Классификация объектов — Доступ ограничен",
        content: "Информация о классификации аномальных объектов доступна только сотрудникам с уровнем допуска 1 и выше.",
        items: [],
        note: "Пожалуйста, обратитесь к вашему куратору для прохождения инструктажа по безопасности.",
        footer: "СБ // Доступ L-0"
      };
    }

    if (lvl === 1) {
      return {
        title: "Классы объектов — Базовый инструктаж",
        tagline: "Цель: Базовое понимание опасности при нарушении условий содержания.",
        items: [
          { cls: 'Безопасный (Safe)', color: 'text-green-500', desc: 'Аномалия изучена и предсказуема. Если запереть в ящике, ничего не произойдет. (Примечание: «Безопасный» не значит «неопасный», просто он не вылезет сам).' },
          { cls: 'Евклид (Euclid)', color: 'text-yellow-500', desc: 'Поведение непредсказуемо. Требует постоянного контроля. Если запереть в ящике, может попытаться выбраться.' },
          { cls: 'Кетер (Keter)', color: 'text-red-500', desc: 'Крайне враждебен или сложен в содержании. Если запереть в ящике, он его уничтожит, съест охрану и сбежит. Требует максимального внимания.' }
        ],
        note: "Помните: класс объекта — это не то, насколько он убивает, а то, насколько сложно его запереть.",
        footer: "Охрана // Доступ L-1"
      };
    }

    if (lvl === 2) {
      return {
        title: "Классы объектов — Оперативная сводка",
        tagline: "Цель: Оперативное понимание сложности содержания.",
        items: [
          { cls: 'Safe', color: 'text-green-500', desc: 'Статичные или активируемые объекты. Протоколы содержания минимальны и хорошо отработаны.' },
          { cls: 'Euclid', color: 'text-yellow-500', desc: 'Объекты with зачатками разума или нарушающие законы физики переменным образом. Основная категория Фонда.' },
          { cls: 'Keter', color: 'text-red-500', desc: 'Объекты, требующие активного подавления. Информация о способах нейтрализации выдается строго по необходимости (Need-to-know basis).' },
          { cls: 'Нейтрализованный', color: 'text-gray-500', desc: 'Объект утратил аномальные свойства. Доступ к истории исследований открыт для анализа причин утраты аномальности.' }
        ],
        footer: "Исследовательский сектор // Доступ L-2"
      };
    }

    if (lvl === 3) {
      return {
        title: "Классы объектов — Аналитика рисков",
        tagline: "Цель: Анализ ресурсов и рисков.",
        items: [
          { cls: 'Таумиэль (Thaumiel)', color: 'text-purple-500', desc: '[СЕКРЕТНО] Аномалии, используемые Фондом для содержания других аномалий. Допуск выдается только при участии в специфических операциях.' },
          { cls: 'Обоснованный (Explained)', color: 'text-blue-400', desc: 'Бывшая аномалия, которая теперь объяснена классической наукой. Используется для обучения персонала распознаванию ложных тревог.' },
          { cls: 'S / E / K', color: 'text-white', desc: 'Рассматриваются через призму затрат ресурсов и вероятности сценария класса К (конец света).' }
        ],
        footer: "МОГ // Доступ L-3"
      };
    }

    if (lvl === 4) {
      return {
        title: "Классы объектов — Глобальные угрозы",
        tagline: "Цель: Глобальное управление угрозами.",
        items: [
          { cls: 'Thaumiel', color: 'text-purple-500', desc: 'Полный перечень объектов, поддерживающих «Завесу» или структуру реальности.' },
          { cls: 'Аполлион (Apollyon)', color: 'text-orange-600', desc: 'Объекты, которые невозможно содержать. Неминуемая угроза. Информация скрыта от низших уровней во избежание паники.' },
          { cls: 'Архонт (Archon)', color: 'text-blue-400', desc: 'Объекты, которые теоретически можно содержать, но это нанесет непоправимый ущерб реальности. Поэтому они оставлены на свободе под наблюдением.' }
        ],
        footer: "Директорат // Доступ L-4"
      };
    }

    return {
      title: "Классы объектов — Окончательная истина",
      tagline: "Цель: Окончательная истина.",
      items: [
        { cls: 'Эзотерические классы', color: 'text-yellow-600', desc: 'Полный доступ к уникальным классификациям (Тиамат, Гемиэль, Гиесос и др.).' },
        { cls: 'Система коробок', color: 'text-white', desc: 'Понимание, что класс объекта — это не его сила, а сложность его запирания в коробку.' },
        { cls: 'Истинный статус', color: 'text-red-600', desc: 'Допуск к информации о том, какие классы объектов были выдуманы Фондом для дезинформации собственного персонала или внешних врагов.' }
      ],
      isO5: true,
      footer: "Совет О5 // ДОСТУП РАЗРЕШЕН"
    };
  };

  const getClearanceInfoByLevel = () => {
    const lvl = currentClearance;

    if (lvl === 0) {
      return {
        title: "Уровни допуска — Обзор",
        tagline: "Ориентировка: «Новобранец»",
        content: "Уровень 0 выдается временному персоналу, стажерам или гостям. Доступ к аномалиям строго запрещен.",
        levels: [
          { lvl: '0', title: 'Стажер / Гость', access: 'Только публичные и общие сектора. Ожидание распределения.' }
        ],
        note: "Помните: любопытство в Фонде часто ведет к досрочному прекращению контракта.",
        footer: "Отдел Кадров // Доступ L-0"
      };
    }

    if (lvl === 1) {
      return {
        title: "Уровни допуска — Младший персонал",
        tagline: "Ориентировка: «Знай свое место»",
        content: "Допуск для технического персонала (клининг, обслуживание зданий), работающего в зонах с объектами класса Safe.",
        levels: [
          { lvl: '1', title: 'Техник / Обслуживание', access: 'Разрешен вход в некритичные отсеки Зоны и столовую.' }
        ],
        restrictions: "Категорический запрет на чтение документации по ОУС. Информация об объектах ограничена визуальным контактом через бронестекло (если входит в обязанности).",
        risk: "При получении секретных данных — принудительная обработка амнезиаками класса А.",
        footer: "СБ // Доступ L-1"
      };
    }

    if (lvl === 2) {
      return {
        title: "Уровни допуска — Исследователи",
        tagline: "Ориентировка: «Рабочий инструмент»",
        content: "Стандартный уровень для ученых и полевых агентов. Основная рабочая сила Фонда.",
        levels: [
          { lvl: '2', title: 'Агент / Исследователь', access: 'Полная информация по объектам, над которыми ведется непосредственная работа. Доступ к локальной БД Зоны.' }
        ],
        restrictions: "Запрещен доступ к кросс-объектным экспериментам. Данные о других Зонах и глобальных планах Фонда заблокированы.",
        note: "Большинство сотрудников Фонда за всю карьеру не поднимаются выше этого уровня.",
        footer: "Научный Совет // Доступ L-2"
      };
    }

    if (lvl === 3) {
      return {
        title: "Уровни допуска — Командный состав",
        tagline: "Ориентировка: «Право знать больше»",
        content: "Допуск для старших исследователей, глав СБ и командиров МОГ.",
        levels: [
          { lvl: '3', title: 'Старший персонал / Командир МОГ', access: 'Информация о большинстве объектов в рамках региона. Тактические данные и протоколы реагирования на нарушения ОУС.' }
        ],
        restrictions: "Политические связи Фонда и объекты класса «Таумиэль» остаются закрытыми.",
        footer: "Оперативный Директорат // Доступ L-3"
      };
    }

    if (lvl === 4) {
      return {
        title: "Уровни допуска — Административный",
        tagline: "Ориентировка: «Управление ресурсами»",
        content: "Директора Зон и руководители стратегических отделов.",
        levels: [
          { lvl: '4', title: 'Директор Зоны / Глава отдела', access: 'Полная база данных по всем объектам SCP в мире (за вычетом критических O5). Право на уничтожение объектов.' }
        ],
        restrictions: "Личности Совета О5 и данные о Зоне-01.",
        footer: "Высшее Командование // Доступ L-4"
      };
    }

    return {
      title: "Уровни допуска — Абсолютный контроль",
      tagline: "Ориентировка: «Абсолютный контроль»",
      content: "Высшее руководство (Совет О5) и их личный персонал. Власть над структурой реальности.",
      levels: [
        { lvl: '5/6', title: 'Смотритель O5 / Администратор', access: 'Неограниченный. Архивы «Аполлион», история создания Фонда и данные о Связанных Организациях.' }
      ],
      note: "Вы выведены из нормального течения времени и пространства для обеспечения безопасности.",
      isO5: true,
      footer: "Совет О5 // ДОСТУП РАЗРЕШЕН"
    };
  };

  const getPersonnelInfoByLevel = () => {
    const lvl = currentClearance;

    if (lvl <= 1) {
      return {
        title: "Классификация персонала — Порядок",
        tagline: "Ориентировка: «Этикет и безопасность»",
        content: "Соблюдение субординации и протоколов безопасности является критическим условием вашего пребывания в Зоне.",
        classes: [
          { cls: 'Классы A и B', title: 'Высшее руководство', desc: 'Высшее административное звено. Соблюдайте субординацию. При тревоге их эвакуация — приоритет. Прямое обращение без необходимости запрещено.' },
          { cls: 'Класс C', title: 'Сотрудники', desc: 'Ваши непосредственные коллеги и кураторы. Основной рабочий состав Зоны.' },
          { cls: 'Класс D', title: 'Временный персонал', desc: 'Лица в оранжевых комбинезонах. Выполняют тяжелые работы. ЗАПРЕЩЕНО: вступать в разговоры, передавать предметы, обсуждать работу.' },
          { cls: 'Класс E', title: 'Временный медицинский статус', desc: 'Сотрудники на обследовании. Контакт ограничен.' }
        ],
        footer: "Отдел кадров // Доступ L-0/1"
      };
    }

    if (lvl === 2) {
      return {
        title: "Классификация персонала — Оперативка",
        tagline: "Ориентировка: «Оперативное взаимодействие»",
        content: "Как исследователю/агенту, вам необходимо понимать функциональное назначение каждой группы персонала.",
        classes: [
          { cls: 'Класс A', title: 'Стратегические активы', desc: 'Обладают критическими знаниями. Контакт with ЛЮБЫМИ аномалиями (даже Safe) запрещен протоколом.' },
          { cls: 'Класс B', title: 'Локальное начальство', desc: 'Директора отделов/Зон. Ответственны за логистику и ресурсы.' },
          { cls: 'Класс C', title: 'Стандартный статус', desc: 'Ваш текущий статус. Право на страховку и амнезиаки при ментальном заражении.' },
          { cls: 'Класс D', title: 'Расходный ресурс', desc: 'Ваш основной инструмент для тестов. Гибель сотрудника D — статистика, гибель C — административная проблема.' },
          { cls: 'Класс E', title: 'Протокол карантина', desc: 'Автоматический статус после контакта с неописанной аномалией до завершения проверок.' }
        ],
        footer: "Исследовательский корпус // Доступ L-2"
      };
    }

    if (lvl === 3) {
      return {
        title: "Классификация персонала — Управление",
        tagline: "Ориентировка: «Управление кадрами и рисками»",
        content: "Ваша задача — минимизация потерь среди ценных кадров за счет использования возобновляемых ресурсов.",
        classes: [
          { cls: 'Класс A', title: 'Стратегические активы', desc: 'Обеспечить безопасность в ущерб любому другому персоналу при нарушениях ОУС.' },
          { cls: 'Класс C', title: 'Ваши подчиненные', desc: 'Основная оперативная сила. Минимизируйте их потери, используя класс D как щит.' },
          { cls: 'Класс D', title: 'Пополняемый ресурс', desc: 'Имеете право запрашивать ротацию или устранение при признаках аномального влияния или неповиновения.' },
          { cls: 'Класс E', title: 'Протокол изоляции', desc: 'Используется для предотвращения распространения меметических вирусов в командном составе.' }
        ],
        footer: "Командование МОГ // Доступ L-3"
      };
    }

    if (lvl === 4) {
      return {
        title: "Классификация персонала — Директивы",
        tagline: "Ориентировка: «Распределение ресурсов»",
        content: "Управление логистическими потоками и обеспечение информационной стерильности.",
        classes: [
          { cls: 'Класс A', title: 'Совет О5 и Секретариат', desc: 'Личная ответственность за создание «стерильной» среды для их перемещения.' },
          { cls: 'Класс D', title: 'Логистический поток', desc: 'Утверждение ежемесячных поставок и подписание приказов о плановой ликвидации (Протокол 12).' },
          { cls: 'Класс E', title: 'Политический инструмент', desc: 'Изоляция сотрудников для сдерживания информационных утечек после крупных инцидентов.' }
        ],
        footer: "Директорат Зон // Доступ L-4"
      };
    }

    return {
      title: "Классификация персонала — Истина",
      tagline: "Ориентировка: «Истинное положение дел»",
      content: "Классификация — это лишь способ упорядочить биомассу для эффективного содержания аномалий.",
      classes: [
        { cls: 'Класс A', title: 'Совет Пяти', desc: 'Это вы. Мозг Фонда. Ваша жизнь эквивалентна выживанию человечества.' },
        { cls: 'Класс D', title: 'Реальный источник', desc: 'Допуск к данным о клонировании и «депортациях» из параллельных миров для восполнения штата.' },
        { cls: 'Класс E', title: 'Маркировка лишних', desc: 'Удобный инструмент для тех, кто «увидел лишнее» на уровнях 3 и 4.' }
      ],
      isO5: true,
      footer: "Совет О5 // ДОСТУП РАЗРЕШЕН"
    };
  };

  const getServicesInfoByLevel = () => {
    const lvl = currentClearance;

    if (lvl <= 1) {
      return {
        title: "Внутренние службы — Функциональное взаимодействие",
        tagline: "Ориентировка: Взаимодействие в рамках Зоны",
        content: "Службы, обеспечивающие ежедневное функционирование объекта и вашу безопасность.",
        services: [
          { title: 'Служба безопасности (СБ)', icon: Shield, text: 'Обеспечивает порядок и охрану периметра. К ним следует обращаться при обнаружении посторонних лиц.' },
          { title: 'Медицинская служба', icon: Stethoscope, text: 'Занимается плановыми осмотрами и лечением производственных травм.' },
          { title: 'Инженерная служба', icon: Settings, text: 'Ответственна за работу систем вентиляции, освещения и герметизации дверей.' },
          { title: 'Служба логистики', icon: Truck, text: 'Доставка питания, униформы и расходных материалов.' }
        ],
        note: "Важно: Не задавайте вопросов сотрудникам СБ о том, что находится в закрытых секторах — их работа заключается в том, чтобы вы туда не попали.",
        footer: "Служба персонала // Доступ L-1"
      };
    }

    if (lvl === 2) {
      return {
        title: "Внутренние службы — Оперативная поддержка",
        tagline: "Ориентировка: Обеспечение исследований",
        content: "Подразделения, координирующие вашу профессиональную деятельность.",
        services: [
          { title: 'Научная служба', icon: BookOpen, text: 'Ваше основное подразделение. Занимается изучением свойств аномалий и разработкой ОУС.' },
          { title: 'Отдел внешних связей', icon: Globe, text: 'Маскирует деятельность Фонда под гражданские организации. Работает with местными властями при захвате.' },
          { title: 'Внутренний трибунал', icon: Gavel, text: 'Следит за соблюдением регламентов. Сюда подаются отчеты о нарушениях дисциплины.' },
          { title: 'Комитет по этике', icon: Scale, text: 'Орган, следящий за тем, чтобы эксперименты не переходили границы «необходимой жестокости».' }
        ],
        footer: "Научный совет // Доступ L-2"
      };
    }

    if (lvl === 3) {
      return {
        title: "Внутренние службы — Координация",
        tagline: "Ориентировка: Межведомственная координация",
        content: "Службы стратегической поддержки и активного реагирования.",
        services: [
          { title: 'МОГ', icon: Crosshair, text: 'Мобильные оперативные группы. Элитные подразделения для захвата объектов и подавления нарушений ОУС.' },
          { title: 'Отдел разведки', icon: Radio, text: 'Занимается поиском аномальной активности и слежкой за Группами Интереса (СО).' },
          { title: 'Комитет по этике', icon: ShieldAlert, text: 'На этом уровне вы понимаете: Комитет одобряет самые ужасные жертвы ради общего блага.' }
        ],
        footer: "Тактический штаб // Доступ L-3"
      };
    }

    if (lvl === 4) {
      return {
        title: "Внутренние службы — Стратегия",
        tagline: "Ориентировка: Стратегическое управление",
        content: "Узкоспециализированные службы контроля и влияния.",
        services: [
          { title: 'ОВБ', icon: Lock, text: 'Отдел внутренней безопасности. Тайная полиция. Выявление шпионов. Право на допрос до L-3 включительно.' },
          { title: 'Отдел меметики', icon: BrainCircuit, text: 'Информационные угрозы. Установка меметических фильтров в БД и работа with контентом, сводящим с ума.' },
          { title: 'Администрация', icon: ClipboardList, text: 'Управление бюджетами, региональными ресурсами и протоколами массовой амнезиации населения.' }
        ],
        footer: "Директорат Зон // Доступ L-4"
      };
    }

    return {
      title: "Внутренние службы — Инструменты",
      tagline: "Ориентировка: Инструменты контроля реальности",
      content: "Высшие структуры управления и обеспечения деятельности Совета.",
      services: [
        { title: 'Штат Совета О5', icon: Crown, text: 'Личный штат сотрудников, обеспечивающий функционирование Совета и Зоны-01.' },
        { title: 'Комитет по этике', icon: Gavel, text: 'Вторая по силе структура. Право вето даже на решения О5 в вопросах выживания человечества.' }
      ],
      isO5: true,
      footer: "Совет О5 // ДОСТУП РАЗРЕШЕН"
    };
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        const genInfo = getGeneralInfoByLevel();
        const genAccent = genInfo.isO5 ? 'border-yellow-500 text-yellow-500' : 'border-scp-terminal text-scp-terminal';
        const genPanelBg = genInfo.isO5 ? 'bg-yellow-950/10' : 'bg-scp-terminal/5';

        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className={`border-l-4 ${genAccent} ${genPanelBg} p-6 space-y-4`}>
              <h3 className={`text-xl font-bold uppercase tracking-widest flex items-center gap-3`}>
                {genInfo.isO5 ? <Eye size={24} /> : <Zap size={20} />} {genInfo.title}
              </h3>
              <p className="text-gray-300 leading-relaxed font-sans italic opacity-80">
                {genInfo.tagline}
              </p>
              <p className="text-gray-300 leading-relaxed font-sans">
                {genInfo.content}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {genInfo.principles.map((item, i) => (
                <div key={i} className={`p-4 border-t-4 border-gray-800 bg-black/40 hover:border-scp-terminal transition-colors group`}>
                  <h4 className="font-bold text-white mb-2 tracking-widest group-hover:text-scp-terminal transition-colors">{item.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="p-6 bg-scp-panel border border-gray-800 mt-6 font-sans relative overflow-hidden">
              {genInfo.isO5 && <div className="absolute top-0 right-0 p-4 opacity-5"><Globe size={120} /></div>}
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Globe size={18} className={genInfo.isO5 ? 'text-yellow-500' : 'text-scp-terminal'} />
                Глобальное присутствие
              </h4>
              <p className="text-sm text-gray-400 mb-4 relative z-10">
                {genInfo.presence}
              </p>
              <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest relative z-10">
                <div className="flex items-center gap-2"><ChevronRight size={12} className={genAccent.split(' ')[0]}/> Зона-19</div>
                <div className="flex items-center gap-2"><ChevronRight size={12} className={genAccent.split(' ')[0]}/> Зона-17</div>
                <div className="flex items-center gap-2"><ChevronRight size={12} className={genAccent.split(' ')[0]}/> Зона-81</div>
                <div className="flex items-center gap-2">
                  <ChevronRight size={12} className={genAccent.split(' ')[0]}/> 
                  {currentClearance >= 4 ? 'Зона-01 [HQ]' : '[ДАННЫЕ ЗАСЕКРЕЧЕНЫ]'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'objects':
        const objInfo = getObjectInfoByLevel();
        
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className={`border-b border-gray-800 pb-2 flex justify-between items-end`}>
               <h3 className="text-xl font-bold text-white uppercase tracking-widest">{objInfo.title}</h3>
               {objInfo.isO5 && <Skull size={24} className="text-yellow-600 mb-1" />}
            </div>
            
            {objInfo.tagline && (
              <p className="text-sm text-gray-400 font-mono italic">{objInfo.tagline}</p>
            )}

            {objInfo.items.length > 0 ? (
              <div className="space-y-4">
                {objInfo.items.map((item, i) => (
                  <div key={i} className={`p-4 border-l-4 ${item.color.replace('text-', 'border-')} bg-black/40 group hover:bg-black/60 transition-colors`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Box size={16} className={item.color} />
                      <h4 className={`font-bold ${item.color} uppercase tracking-wider`}>{item.cls}</h4>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed font-sans">{item.desc}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-black/40 border border-gray-800 border-dashed">
                 <Lock size={48} className="text-red-900 opacity-30 mb-4" />
                 <p className="text-red-900 font-mono text-center uppercase tracking-widest px-8">
                   {objInfo.content}
                 </p>
              </div>
            )}
            
            {objInfo.note && (
              <div className="mt-8 p-4 bg-red-950/20 border border-red-900 flex items-center gap-4">
                <ShieldAlert className="text-red-500 shrink-0" size={32} />
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest font-mono">
                  {objInfo.note}
                </p>
              </div>
            )}
          </div>
        );

      case 'clearance':
        const clrInfo = getClearanceInfoByLevel();
        const clrAccent = clrInfo.isO5 ? 'border-yellow-500 text-yellow-500' : 'border-scp-terminal text-scp-terminal';
        const clrBg = clrInfo.isO5 ? 'bg-yellow-900/10' : 'bg-scp-terminal/5';

        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className={`p-6 border-l-4 ${clrAccent} ${clrBg}`}>
              <h3 className="text-xl font-bold uppercase tracking-widest mb-2 flex items-center gap-3">
                <Key size={20} /> {clrInfo.title}
              </h3>
              <p className="text-sm text-gray-400 font-mono italic mb-4">{clrInfo.tagline}</p>
              <p className="text-sm text-gray-300 font-sans leading-relaxed">{clrInfo.content}</p>
            </div>

            <div className="space-y-4">
              {clrInfo.levels.map((level, i) => (
                <div key={i} className="bg-black/40 border border-gray-800 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 border-2 font-black text-xs ${clrAccent}`}>LEVEL {level.lvl}</span>
                    <h4 className="font-bold text-white uppercase tracking-wider">{level.title}</h4>
                  </div>
                  <p className="text-xs text-gray-500 font-sans leading-relaxed">
                    <strong className="text-gray-400">ОБЛАСТЬ ДОСТУПА:</strong> {level.access}
                  </p>
                </div>
              ))}

              {clrInfo.restrictions && (
                <div className="p-4 border border-red-900/30 bg-red-900/5">
                   <h5 className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                     <Lock size={12}/> Ограничения
                   </h5>
                   <p className="text-xs text-gray-500 font-sans">{clrInfo.restrictions}</p>
                </div>
              )}

              {clrInfo.risk && (
                <div className="p-4 border border-red-600 bg-red-600/10 flex items-start gap-3">
                   <AlertOctagon className="text-red-500 shrink-0" size={18} />
                   <div>
                     <h5 className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-1">Протоколы риска</h5>
                     <p className="text-xs text-red-400 font-mono leading-tight">{clrInfo.risk}</p>
                   </div>
                </div>
              )}
            </div>

            {clrInfo.note && (
               <div className={`p-4 border border-gray-700 bg-black italic font-sans text-xs text-gray-500`}>
                 {clrInfo.note}
               </div>
            )}
          </div>
        );

      case 'personnel':
        const prsInfo = getPersonnelInfoByLevel();
        const prsAccent = prsInfo.isO5 ? 'border-yellow-500 text-yellow-500' : 'border-scp-terminal text-scp-terminal';
        const prsBg = prsInfo.isO5 ? 'bg-yellow-900/10' : 'bg-scp-terminal/5';

        return (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className={`p-6 border-l-4 ${prsAccent} ${prsBg}`}>
              <h3 className="text-xl font-bold uppercase tracking-widest mb-2 flex items-center gap-3">
                <Users size={20} /> {prsInfo.title}
              </h3>
              <p className="text-sm text-gray-400 font-mono italic mb-4">{prsInfo.tagline}</p>
              <p className="text-sm text-gray-300 font-sans leading-relaxed">{prsInfo.content}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 font-sans">
              {prsInfo.classes.map((item, i) => (
                <div key={i} className="flex gap-4 p-4 border border-gray-800 bg-black/40 items-center hover:bg-black/60 transition-colors group">
                  <div className={`w-16 h-16 flex items-center justify-center border-2 font-black text-xl shrink-0 ${prsAccent}`}>
                    {item.cls.split(' ').pop()}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-white uppercase tracking-wider">{item.cls}: {item.title}</h4>
                      {item.cls.includes('D') && <Trash2 size={14} className="text-orange-700 opacity-40" />}
                      {item.cls.includes('E') && <Stethoscope size={14} className="text-blue-500 opacity-40" />}
                      {item.cls.includes('A') && prsInfo.isO5 && <Dna size={14} className="text-yellow-600 opacity-40" />}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'services':
        const svcInfo = getServicesInfoByLevel();
        const svcAccent = svcInfo.isO5 ? 'border-yellow-500 text-yellow-500' : 'border-scp-terminal text-scp-terminal';
        const svcBg = svcInfo.isO5 ? 'bg-yellow-900/10' : 'bg-scp-terminal/5';

        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className={`p-6 border-l-4 ${svcAccent} ${svcBg}`}>
              <h3 className="text-xl font-bold uppercase tracking-widest mb-2 flex items-center gap-3">
                <ClipboardList size={20} /> {svcInfo.title}
              </h3>
              <p className="text-sm text-gray-400 font-mono italic mb-4">{svcInfo.tagline}</p>
              <p className="text-sm text-gray-300 font-sans leading-relaxed">{svcInfo.content}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {svcInfo.services.map((service, i) => (
                <div key={i} className="p-6 border border-gray-800 bg-scp-panel hover:border-scp-terminal transition-all group">
                   <div className="flex items-center gap-4 mb-3">
                      <service.icon className={`${svcAccent.split(' ')[1]} group-hover:scale-110 transition-transform`} size={24} />
                      <h4 className="font-bold text-white uppercase tracking-widest">{service.title}</h4>
                   </div>
                   <p className="text-xs text-gray-400 font-sans leading-relaxed">{service.text}</p>
                </div>
              ))}
            </div>

            {svcInfo.note && (
              <div className="p-4 bg-black border border-gray-800 font-sans text-xs italic text-gray-500">
                {svcInfo.note}
              </div>
            )}
            
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

  const getActiveTabInfo = () => {
    if (activeTab === 'general') return getGeneralInfoByLevel();
    if (activeTab === 'objects') return getObjectInfoByLevel();
    if (activeTab === 'clearance') return getClearanceInfoByLevel();
    if (activeTab === 'personnel') return getPersonnelInfoByLevel();
    if (activeTab === 'services') return getServicesInfoByLevel();
    return getGeneralInfoByLevel();
  };

  const activeInfo = getActiveTabInfo();

  return (
    <div className="flex flex-col md:flex-row h-full gap-8 animate-in fade-in duration-700">
      {/* Sidebar Navigation inside Guide */}
      <aside className="md:w-64 shrink-0 flex flex-col gap-2">
        <div className={`p-4 border bg-black/60 mb-2 ${activeInfo.isO5 ? 'border-yellow-900' : 'border-gray-800'}`}>
          <h2 className={`text-sm font-black uppercase tracking-[0.2em] mb-1 ${activeInfo.isO5 ? 'text-yellow-500' : 'text-scp-text'}`}>
            {activeInfo.isO5 ? 'АБСОЛЮТНЫЙ АРХИВ' : 'Архивариус'}
          </h2>
          <p className="text-[9px] text-gray-600 font-mono">БАЗА ЗНАНИЙ v10.1.0</p>
        </div>
        
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as GuideTab)}
            className={`flex items-center gap-3 p-4 text-left transition-all border ${
              activeTab === item.id 
                ? (activeInfo.isO5 ? 'bg-yellow-600 text-black border-yellow-600 font-bold' : 'bg-scp-terminal text-black border-scp-terminal font-bold')
                : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600 hover:text-white'
            }`}
          >
            <item.icon size={18} />
            <span className="text-xs uppercase tracking-widest font-mono">{item.label}</span>
          </button>
        ))}

        <div className="mt-auto p-4 opacity-10 hidden md:block">
           <SCPLogo className="w-full grayscale" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 bg-scp-panel border shadow-2xl overflow-hidden flex flex-col ${activeInfo.isO5 ? 'border-yellow-900/50' : 'border-gray-800'}`}>
        <div className="p-6 border-b border-gray-800 bg-black/40 flex justify-between items-center">
           <h1 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <BookOpen className={activeInfo.isO5 ? 'text-yellow-500' : 'text-scp-terminal'} /> {menuItems.find(m => m.id === activeTab)?.label}
           </h1>
           <div className={`text-[10px] font-mono uppercase tracking-widest ${activeInfo.isO5 ? 'text-yellow-600 animate-pulse' : 'text-gray-600'}`}>
             {activeInfo.footer}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 relative">
           <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(#333_1px,transparent_1px),linear-gradient(90deg,#333_1px,transparent_1px)] bg-[length:40px_40px]"></div>
           
           <div className="relative z-10 max-w-4xl">
              {renderContent()}
           </div>
        </div>

        <div className="p-4 border-t border-gray-800 bg-black/80 flex justify-between items-center text-[9px] text-gray-600 font-mono uppercase tracking-[0.3em]">
           <span>
             {activeInfo.isO5 ? 'СЕКРЕТНЫЙ АРХИВ СОВЕТА ПЯТИ' : 'Комитет по Этике // Отдел безопасности'}
           </span>
           <span className="animate-pulse">{activeInfo.isO5 ? 'Ожидание приказа...' : 'Запись шифруется...'}</span>
        </div>
      </div>
    </div>
  );
};

export default Guide;
