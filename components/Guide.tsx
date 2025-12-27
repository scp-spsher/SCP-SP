import React, { useState } from 'react';
import { BookOpen, Shield, Info, Lock, ChevronRight, Scale, Users, ShieldAlert } from 'lucide-react';
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
        <div className="flex flex-col items-center justify-center py-20 opacity-20 select-none">
           <Lock size={64} className="mb-4" />
           <p className="text-xl font-black uppercase tracking-[0.5em]">Данные засекречены</p>
           <p className="text-xs mt-2 uppercase">Требуется уровень допуска 2 или выше</p>
        </div>
      );
    }

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="max-w-4xl mx-auto bg-white/5 border border-gray-800 p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Watermark Logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
            <SCPLogo className="w-[500px] h-[500px]" />
          </div>

          <header className="border-b-2 border-scp-text pb-8 mb-10 text-center relative z-10">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 font-serif">О Фонде SCP</h1>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 uppercase tracking-widest font-mono">
               <span>Архивный файл: ADM-01-RU</span>
               <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
               <span>Статус: Рассекречено для L-2</span>
            </div>
          </header>

          <article className="space-y-8 text-gray-300 font-serif leading-relaxed text-lg relative z-10">
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

            {/* Signature Block */}
            <div className="py-12 flex flex-col items-center border-y border-gray-800 my-10">
               <div className="w-32 h-32 mb-4 opacity-80 group">
                  <SCPLogo className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700 cursor-crosshair" />
               </div>
               <p className="text-xl font-black uppercase tracking-widest text-white italic">Наша миссия – Обезопасить, Удержать, Сохранить.</p>
               <p className="text-xs text-gray-500 mt-2 font-mono">— Администратор</p>
            </div>

            <section className="space-y-6">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-scp-accent pl-4">Описание цели</h2>
              <p>
                Невидимый и вездесущий, Фонд SCP находится вне пределов чьей-либо юрисдикции. Он наделён соответствующими полномочиями всех основных мировых правительств и имеет задачу сдерживания объектов и явлений, которые ставят под угрозу естественность и нормальность этого мира. Подобные аномалии представляют собой значительную угрозу для глобальной безопасности и могут нести как физическую, так и психологическую опасность.
              </p>
              <p>
                Фонд действует, чтобы нормы так и оставались нормами, чтобы население Земли могло и дальше жить обычной жизнью, не боясь и не подвергая сомнению своё восприятие окружающего мира, чтобы человечество было защищено от различных внеземных угроз, а также угроз из других измерений и вселенных.
              </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
               <div className="p-6 border border-gray-800 bg-black/40 hover:border-scp-terminal transition-all group">
                  <h3 className="text-scp-terminal font-black text-xl mb-3 uppercase flex items-center gap-2">
                    <Shield size={20} /> Обезопасить
                  </h3>
                  <p className="text-sm font-mono leading-relaxed opacity-80 group-hover:opacity-100">
                    Фонд захватывает аномалии, не допуская их попадания в руки гражданских лиц или враждебных организаций. Это достигается путём ведения глобальной слежки и быстрого реагирования.
                  </p>
               </div>
               <div className="p-6 border border-gray-800 bg-black/40 hover:border-blue-500 transition-all group">
                  <h3 className="text-blue-500 font-black text-xl mb-3 uppercase flex items-center gap-2">
                    <Lock size={20} /> Удержать
                  </h3>
                  <p className="text-sm font-mono leading-relaxed opacity-80 group-hover:opacity-100">
                    Фонд содержит аномалии, чтобы не допускать распространения их влияния. Это достигается путём их перемещения, маскировки или демонтажа.
                  </p>
               </div>
               <div className="p-6 border border-gray-800 bg-black/40 hover:border-scp-accent transition-all group">
                  <h3 className="text-scp-accent font-black text-xl mb-3 uppercase flex items-center gap-2">
                    <ShieldAlert size={20} /> Сохранить
                  </h3>
                  <p className="text-sm font-mono leading-relaxed opacity-80 group-hover:opacity-100">
                    Фонд защищает человечество от аномальных эффектов, а также сохраняет сами аномалии, пока они не будут полностью поняты.
                  </p>
               </div>
            </section>

            <section className="space-y-6 pt-10">
              <h2 className="text-2xl font-black text-white uppercase border-l-4 border-scp-accent pl-4">Операции Фонда</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="font-black text-white uppercase mb-2">Особые условия содержания (ОУС)</h4>
                  <p>Фонд обладает обширной базой данных об аномалиях, что сокращается как "ОУС". Большая часть этой информации содержит сведения для безопасного содержания или действий в случае нарушений.</p>
                </div>
                <div>
                  <h4 className="font-black text-white uppercase mb-2">Секретность</h4>
                  <p>Каждый из сотрудников обладает одним из уровней допуска. Персонал, уличённый в нарушении протоколов, задерживается и подвергается дисциплинарным мерам.</p>
                </div>
                <div>
                  <h4 className="font-black text-white uppercase mb-2">Связанные организации</h4>
                  <p>Фонд SCP - не единственная организация, которой известно об аномалиях. Сотрудничество с иными группировками без согласования может послужить причиной устранения.</p>
                </div>
              </div>
            </section>
          </article>
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
             <h3 className="text-sm font-black text-white uppercase">Основные сведения</h3>
          </div>
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center justify-between p-4 border transition-all ${activeTab === 'general' ? 'bg-scp-terminal text-black border-scp-terminal' : 'bg-transparent text-gray-500 border-gray-800 hover:text-white hover:border-gray-600'}`}
          >
            <div className="flex items-center gap-3">
              <Info size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Общая информация</span>
            </div>
            <ChevronRight size={14} />
          </button>
          <button 
            className="w-full flex items-center justify-between p-4 border border-gray-800 text-gray-700 cursor-not-allowed opacity-50"
            disabled
          >
            <div className="flex items-center gap-3">
              <Users size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Классы персонала</span>
            </div>
            <Lock size={14} />
          </button>
          <button 
            className="w-full flex items-center justify-between p-4 border border-gray-800 text-gray-700 cursor-not-allowed opacity-50"
            disabled
          >
            <div className="flex items-center gap-3">
              <Scale size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Комитет по этике</span>
            </div>
            <Lock size={14} />
          </button>
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-9 overflow-y-auto pr-2 scrollbar-hide">
          {activeTab === 'general' && renderGeneralInfo()}
        </div>
      </div>
    </div>
  );
};

export default Guide;
