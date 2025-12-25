import React, { useState } from 'react';
import { Search, FileText, AlertOctagon, RefreshCw, Lock } from 'lucide-react';
import { SCPFile, ObjectClass } from '../types';
import { generateSCPReport } from '../services/geminiService';

// Initial Mock Data
const INITIAL_DB: SCPFile[] = [
  {
    id: '173',
    itemNumber: 'SCP-173',
    objectClass: ObjectClass.EUCLID,
    containmentProcedures: 'SCP-173 должен постоянно находиться в закрытом контейнере. При посещении контейнера персоналом, в него должны входить не менее трёх человек, и дверь должна быть немедленно заперта за ними. Два человека должны постоянно поддерживать зрительный контакт с SCP-173 до тех пор, пока все сотрудники не покинут контейнер и он не будет заперт.',
    description: 'Перевезен в Зону 19 в 1993 году. Происхождение все еще неизвестно. Изготовлен из бетона и арматуры со следами аэрозольной краски марки Krylon. SCP-173 одушевлен и крайне враждебен. Объект не может двигаться, пока находится в пределах прямой видимости. При работе с SCP-173 ни в коем случае нельзя нарушать зрительный контакт.',
    isRedacted: false,
    lastUpdated: new Date().toISOString()
  }
];

const Database: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [db, setDb] = useState<SCPFile[]>(INITIAL_DB);
  const [selectedScp, setSelectedScp] = useState<SCPFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredDb = db.filter(f => f.itemNumber.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;

    // Check if exists locally
    const existing = db.find(f => f.itemNumber.toLowerCase() === `scp-${searchTerm.toLowerCase().replace('scp-', '')}`);
    if (existing) {
      setSelectedScp(existing);
      return;
    }

    // If not, generate it via Gemini
    setIsLoading(true);
    setError(null);
    setSelectedScp(null);

    try {
      // Extract number
      const num = searchTerm.replace(/\D/g, '');
      if (!num) throw new Error("Пожалуйста, введите корректный номер (напр. 5000)");

      const newScpData = await generateSCPReport(num);
      
      const newFile: SCPFile = {
        id: num,
        itemNumber: newScpData.itemNumber || `SCP-${num}`,
        objectClass: newScpData.objectClass || ObjectClass.SAFE,
        containmentProcedures: newScpData.containmentProcedures || 'Данные повреждены.',
        description: newScpData.description || 'Данные повреждены.',
        isRedacted: false,
        lastUpdated: new Date().toISOString()
      };

      setDb(prev => [...prev, newFile]);
      setSelectedScp(newFile);
    } catch (err) {
      setError("ОШИБКА ДОСТУПА К АРХИВУ. ФАЙЛ ПОВРЕЖДЕН ИЛИ ЗАСЕКРЕЧЕН.");
    } finally {
      setIsLoading(false);
    }
  };

  const getObjectClassColor = (cls: ObjectClass) => {
    switch (cls) {
      case ObjectClass.SAFE: return 'text-green-500 border-green-500';
      case ObjectClass.EUCLID: return 'text-yellow-500 border-yellow-500';
      case ObjectClass.KETER: return 'text-red-500 border-red-500';
      case ObjectClass.THAUMIEL: return 'text-purple-500 border-purple-500';
      default: return 'text-gray-500 border-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold tracking-widest text-scp-text">АРХИВЫ ФОНДА</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full min-h-[500px]">
        {/* Search & List - Left Column */}
        <div className="md:col-span-4 flex flex-col gap-4 bg-scp-panel border border-gray-800 p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
              type="text" 
              placeholder="ВВЕДИТЕ SCP-####" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-black border border-gray-700 p-2 text-sm text-scp-terminal focus:border-scp-terminal focus:outline-none font-mono"
            />
            <button 
              type="submit" 
              className="bg-gray-800 hover:bg-scp-terminal hover:text-black p-2 border border-gray-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="animate-spin" size={20}/> : <Search size={20} />}
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {filteredDb.map(file => (
              <button 
                key={file.id}
                onClick={() => setSelectedScp(file)}
                className={`w-full text-left p-3 border-l-2 transition-all hover:bg-gray-900 ${
                  selectedScp?.id === file.id 
                    ? 'border-scp-accent bg-gray-900' 
                    : 'border-transparent text-gray-500'
                }`}
              >
                <div className="font-bold text-sm tracking-wider">{file.itemNumber}</div>
                <div className="text-[10px] opacity-70 uppercase mt-1">{file.objectClass}</div>
              </button>
            ))}
            {filteredDb.length === 0 && !isLoading && (
               <div className="p-4 text-xs text-gray-600 text-center italic">
                 Локальные файлы не найдены. Используйте поиск для запроса из глубокого хранилища.
               </div>
            )}
          </div>
        </div>

        {/* Detail View - Right Column */}
        <div className="md:col-span-8 bg-scp-panel border border-gray-800 p-8 relative overflow-y-auto">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 bg-scp-panel/90 z-10">
              <RefreshCw className="animate-spin text-scp-terminal" size={48} />
              <div className="text-scp-terminal font-mono animate-pulse">РАСШИФРОВКА ФАЙЛА...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-scp-accent">
              <AlertOctagon size={48} className="mb-4" />
              <p className="font-bold tracking-widest">{error}</p>
            </div>
          ) : selectedScp ? (
            <div className="space-y-8 font-serif">
              <div className="flex items-start justify-between border-b-2 border-scp-text pb-6">
                 <div>
                    <h1 className="text-4xl font-black mb-2">{selectedScp.itemNumber}</h1>
                    <div className={`inline-block px-3 py-1 border-2 text-sm font-bold tracking-[0.2em] ${getObjectClassColor(selectedScp.objectClass)}`}>
                      {selectedScp.objectClass}
                    </div>
                 </div>
                 <div className="text-right">
                   <Lock className="inline-block mb-2 text-scp-accent" size={24} />
                   <div className="text-xs text-gray-500">ДОПУСК 2/Общий</div>
                   <div className="text-xs text-gray-500">{new Date(selectedScp.lastUpdated).toLocaleDateString()}</div>
                 </div>
              </div>

              <section>
                <h3 className="text-lg font-bold uppercase tracking-wider mb-2 text-scp-text">Особые условия содержания</h3>
                <p className="text-gray-300 leading-relaxed font-mono text-sm whitespace-pre-wrap">
                  {selectedScp.containmentProcedures}
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold uppercase tracking-wider mb-2 text-scp-text">Описание</h3>
                <p className="text-gray-300 leading-relaxed font-mono text-sm whitespace-pre-wrap">
                  {selectedScp.description}
                </p>
              </section>

              <div className="mt-12 p-4 border border-gray-800 bg-black/50 text-center">
                 <p className="text-xs text-red-900 font-bold uppercase tracking-widest">
                   ВНИМАНИЕ: НЕСАНКЦИОНИРОВАННОЕ ИЗМЕНЕНИЕ ЭТОГО ДОКУМЕНТА ЯВЛЯЕТСЯ НАРУШЕНИЕМ 4-ГО УРОВНЯ.
                 </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
               <FileText size={64} className="mb-4 opacity-20" />
               <p className="tracking-widest">ВЫБЕРИТЕ ФАЙЛ ДЛЯ ПРОСМОТРА</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Database;
