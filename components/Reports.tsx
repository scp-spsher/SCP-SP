import React, { useState } from 'react';
import { AlertTriangle, Send } from 'lucide-react';

const Reports: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-8">
        <h2 className="text-2xl font-bold tracking-widest text-scp-text">ОТЧЕТ ОБ ИНЦИДЕНТЕ</h2>
      </div>

      <div className="bg-scp-panel border border-gray-800 p-8">
        {success ? (
          <div className="flex flex-col items-center justify-center py-12 text-green-500">
            <div className="w-16 h-16 border-4 border-green-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="text-xl font-bold tracking-widest mb-2">ОТЧЕТ ПРИНЯТ</h3>
            <p className="text-sm text-gray-500">Комитет по Этике рассмотрит ваше обращение.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase text-gray-500 tracking-wider">Дата инцидента</label>
                <input required type="date" className="w-full bg-black border border-gray-700 p-3 text-gray-300 focus:border-scp-accent focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase text-gray-500 tracking-wider">Локация (Зона/Сектор)</label>
                <input required type="text" placeholder="напр. Зона-19, Сектор 4" className="w-full bg-black border border-gray-700 p-3 text-gray-300 focus:border-scp-accent focus:outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase text-gray-500 tracking-wider">Вовлеченные SCP (если есть)</label>
              <input type="text" placeholder="SCP-####" className="w-full bg-black border border-gray-700 p-3 text-gray-300 focus:border-scp-accent focus:outline-none" />
            </div>

            <div className="space-y-2">
               <label className="text-xs uppercase text-gray-500 tracking-wider">Уровень угрозы</label>
               <div className="flex gap-4">
                 {['Низкий', 'Средний', 'Высокий', 'Критический'].map((level) => (
                   <label key={level} className="flex items-center gap-2 cursor-pointer">
                     <input type="radio" name="severity" className="accent-scp-accent" />
                     <span className="text-sm text-gray-400">{level}</span>
                   </label>
                 ))}
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase text-gray-500 tracking-wider">Описание инцидента</label>
              <textarea 
                required 
                rows={6} 
                className="w-full bg-black border border-gray-700 p-3 text-gray-300 focus:border-scp-accent focus:outline-none font-mono text-sm"
                placeholder="Предоставьте детальное хронологическое описание..."
              ></textarea>
            </div>

            <div className="bg-red-900/10 border border-red-900/30 p-4 flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0" size={20} />
              <p className="text-xs text-red-400">
                Предупреждение: Фальсификация отчетов ведет к немедленной терминации. Убедитесь в точности предоставляемых данных.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-scp-accent hover:bg-red-700 text-white font-bold py-4 px-6 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
            >
              {isSubmitting ? 'ШИФРОВАНИЕ И ОТПРАВКА...' : <><Send size={18} /> Отправить отчет</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Reports;
