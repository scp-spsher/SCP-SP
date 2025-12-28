import React, { useState } from 'react';
import { Search, FileText, AlertOctagon, RefreshCw, Lock } from 'lucide-react';
import { SCPFile, ObjectClass } from '../types';
import { generateSCPReport } from '../services/geminiService';

const Database: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // Инициализируем пустым массивом, чтобы не ловить ReferenceError
  const [db, setDb] = useState<SCPFile[]>([]);
  const [selectedScp, setSelectedScp] = useState<SCPFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredDb = db.filter(f => f.itemNumber.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;

    const formattedSearch = `scp-${searchTerm.toLowerCase().replace('scp-', '')}`;
    const existing = db.find(f => f.itemNumber.toLowerCase() === formattedSearch);
    
    if (existing) {
      setSelectedScp(existing);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedScp(null);

    try {
      const num = searchTerm.replace(/\D/g, '');
      if (!num) throw new Error("Введите номер объекта");

      const newScpData = await generateSCPReport(num);
      
      const newFile: SCPFile = {
        id: num,
        itemNumber: newScpData.itemNumber || `SCP-${num}`,
        objectClass: (newScpData.objectClass as ObjectClass) || ObjectClass.SAFE,
        containmentProcedures: newScpData.containmentProcedures || 'Данные повреждены.',
        description: newScpData.description || 'Данные повреждены.',
        isRedacted: false,
        lastUpdated: new Date().toISOString()
      };

      setDb(prev => [...prev, newFile]);
      setSelectedScp(newFile);
    } catch (err) {
      setError("ОШИБКА ДОСТУПА. ФАЙЛ НЕ НАЙДЕН В ГЛУБОКОМ ХРАНИЛИЩЕ.");
    } finally {
      setIsLoading(false);
    }
  };

  const getObjectClassColor = (cls: ObjectClass) => {
    const colors = {
      [ObjectClass.SAFE]: 'text-green-500 border-green-500',
      [ObjectClass.EUCLID]: 'text-yellow-500 border-yellow-500',
      [ObjectClass.KETER]: 'text-red-500 border-red-500',
      [ObjectClass.THAUMIEL]: 'text-purple-500 border-purple-500',
    };
    return colors[cls] || 'text-gray-500 border-gray-500';
  };

  return (
    // Добавил min-h-screen, чтобы твой черный экран не схлопывался в полоску
    <div className="flex flex-col min-h-screen h-full gap-6 bg-black p-4 text-gray-200">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold tracking-widest text-white uppercase">Центральный Архив SCIPNET</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
        {/* Боковая панель */}
        <div className="md:col-span-4 flex flex-col gap-4 bg-gray-900/50 border border-gray-800 p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
              type="text" 
              placeholder="ПОИСК: SCP-####" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-black border border-gray-700 p-2 text-sm text-green-500 focus:outline-none font-mono"
            />
            <button type="submit" className="bg-gray-800 p-2 hover:bg-green-900 transition-colors">
              <Search size={20} />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredDb.length > 0 ? (
              filteredDb.map(file => (
                <button 
                  key={file.id}
                  onClick={() => setSelectedScp(file)}
                  className={`w-full text-left p-3 border-l-2 transition-all ${
                    selectedScp?.id === file.id ? 'border-red-600 bg-gray-800' : 'border-transparent hover:bg-gray-800/50'
                  }`}
                >
                  <div className="font-bold text-sm">{file.itemNumber}</div>
                  <div className="text-[10px] uppercase text-gray-500">{file.objectClass}</div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertOctagon size={32} className="mb-2 text-gray-700" />
                <p className="text-[10px] text-gray-600 uppercase font-mono">
                  Локальная база пуста.<br/>Требуется удаленный запрос.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Основной экран */}
        <div className="md:col-span-8 bg-gray-900/30 border border-gray-800 p-8 relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <RefreshCw className="animate-spin text-green-500" size={48} />
              <p className="font-mono text-green-500 animate-pulse">ОБРАЩЕНИЕ К СЕРВЕРУ О7...</p>
            </div>
          ) : selectedScp ? (
            <div className="animate-in fade-in duration-500">
               {/* Тут рендер файла как в твоем коде */}
               <h1 className="text-4xl font-black mb-4">{selectedScp.itemNumber}</h1>
               <div className={`inline-block px-3 py-1 border-2 mb-6 ${getObjectClassColor(selectedScp.objectClass)}`}>
                 {selectedScp.objectClass}
               </div>
               <div className="space-y-4 font-mono text-sm">
                 <p><span className="text-gray-500">УСЛОВИЯ:</span> {selectedScp.containmentProcedures}</p>
                 <p><span className="text-gray-500">ОПИСАНИЕ:</span> {selectedScp.description}</p>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-30">
              <FileText size={80} strokeWidth={1} />
              <p className="mt-4 tracking-tighter uppercase">Документ не выбран</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Database;
