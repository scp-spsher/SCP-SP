import React from 'react';
import { BookOpen, Shield, Database, MessageSquare, Terminal, FileText } from 'lucide-react';
import { SCPLogo } from './SCPLogo';

const Guide: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="border-b border-gray-800 pb-6 mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-widest text-scp-text mb-2">РУКОВОДСТВО ОПЕРАТОРА</h1>
          <p className="text-scp-dim font-mono text-sm">ВЕРСИЯ ДОКУМЕНТА: 9.0.4-RU // ТОЛЬКО ДЛЯ СЛУЖЕБНОГО ПОЛЬЗОВАНИЯ</p>
        </div>
        <div className="hidden md:block text-right">
          <div className="text-xs text-scp-accent font-bold border border-scp-accent px-2 py-1 inline-block uppercase">
            Строго секретно
          </div>
        </div>
      </div>

      <div className="bg-scp-panel border border-gray-800 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <SCPLogo className="w-32 h-32" />
        </div>
        <h2 className="text-xl font-bold text-scp-terminal mb-4 flex items-center gap-2 relative z-10">
          <Shield size={20} /> 1. УРОВНИ ДОПУСКА (SECURITY CLEARANCE)
        </h2>
        <div className="space-y-4 text-gray-300 text-sm leading-relaxed relative z-10 font-sans">
          <p>
            Система SCPNET использует биометрическую аутентификацию для определения вашего уровня доступа. 
            Функционал терминала динамически подстраивается под ваш статус.
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <li className="bg-black/40 p-3 border-l-2 border-gray-500">
              <strong className="text-white block mb-1">Уровень 1-2 (Персонал/Исследователь)</strong> 
              Базовый доступ к Дашборду, Архивам (чтение) и отправке Отчетов. Доступ к Терминалу и Секретной связи заблокирован.
            </li>
            <li className="bg-black/40 p-3 border-l-2 border-scp-accent">
              <strong className="text-white block mb-1">Уровень 3-4 (Администрация/Директор)</strong> 
              Полный доступ к системе, включая прямую связь с ИИ Командования (Secure Comms) и системный Терминал (Terminal).
            </li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ARCHIVES */}
        <div className="bg-scp-panel border border-gray-800 p-6 hover:border-scp-text transition-colors group">
          <h3 className="text-lg font-bold text-scp-text mb-3 flex items-center gap-2 group-hover:text-scp-terminal transition-colors">
            <Database size={18} /> 2. АРХИВЫ (DATABASE)
          </h3>
          <p className="text-gray-400 text-sm mb-3 font-sans">
            Централизованная база данных объектов SCP. Подключена к нейросети для восстановления поврежденных данных.
          </p>
          <div className="bg-black p-3 text-xs font-mono text-gray-500 space-y-2 border border-gray-800">
            <p><span className="text-scp-terminal">$ ПОИСК:</span> Введите номер (напр. "173", "682", "5000").</p>
            <p><span className="text-scp-terminal">$ ГЕНЕРАЦИЯ:</span> Если файл отсутствует локально, система отправит запрос к Deep Storage (Gemini AI) для генерации актуальной справки.</p>
          </div>
        </div>

        {/* COMMS */}
        <div className="bg-scp-panel border border-gray-800 p-6 hover:border-scp-text transition-colors group">
          <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
            <MessageSquare size={18} /> 3. ЗАЩИЩЕННАЯ СВЯЗЬ (COMMS)
          </h3>
          <p className="text-gray-400 text-sm mb-3 font-sans">
            Прямой канал связи с ИИ Командования Зоны (Mainframe AI). Требует уровень допуска 3+.
          </p>
          <div className="bg-black p-3 text-xs font-mono text-gray-500 space-y-2 border border-gray-800">
            <p>Используйте этот модуль для запроса тактической информации или консультаций. ИИ имеет доступ к данным 4-го уровня секретности.</p>
          </div>
        </div>

        {/* TERMINAL */}
        <div className="bg-scp-panel border border-gray-800 p-6 hover:border-scp-text transition-colors group">
          <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
            <Terminal size={18} /> 4. ТЕРМИНАЛ (TERMINAL)
          </h3>
          <p className="text-gray-400 text-sm mb-3 font-sans">
            CLI-интерфейс для прямого взаимодействия с ядром системы. Требует уровень допуска 4.
          </p>
          <div className="bg-black p-3 text-xs font-mono text-gray-500 space-y-2 border border-gray-800">
            <p>Доступные команды:</p>
            <ul className="grid grid-cols-2 gap-2 mt-1">
              <li><code className="text-scp-terminal">help</code> - Справка</li>
              <li><code className="text-scp-terminal">status</code> - Статус систем</li>
              <li><code className="text-scp-terminal">ls</code> - Файловая система</li>
              <li><code className="text-scp-terminal">whoami</code> - Текущий пользователь</li>
            </ul>
          </div>
        </div>

        {/* REPORTS */}
        <div className="bg-scp-panel border border-gray-800 p-6 hover:border-scp-text transition-colors group">
          <h3 className="text-lg font-bold text-yellow-500 mb-3 flex items-center gap-2">
            <FileText size={18} /> 5. ОТЧЕТЫ (REPORTS)
          </h3>
          <p className="text-gray-400 text-sm mb-3 font-sans">
            Модуль для регистрации нарушений условий содержания и инцидентов.
          </p>
          <div className="bg-black p-3 text-xs font-mono text-gray-500 space-y-2 border border-gray-800">
            <p>Все отчеты автоматически шифруются и отправляются в Комитет по Этике. Заполнение всех полей обязательно.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 border-l-4 border-scp-accent bg-gradient-to-r from-red-900/10 to-transparent">
        <h4 className="text-scp-accent font-bold uppercase tracking-widest text-sm mb-1">МЕМОРАНДУМ ПО БЕЗОПАСНОСТИ</h4>
        <p className="text-gray-400 text-xs font-sans">
          Несанкционированный доступ, копирование данных или оставление терминала без присмотра приведет к немедленной терминации сотрудника. 
          Помните: Мы обезопасим, мы удержим, мы сохраним.
        </p>
      </div>
    </div>
  );
};

export default Guide;
