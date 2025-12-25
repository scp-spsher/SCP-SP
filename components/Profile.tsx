import React, { useRef, useState } from 'react';
import { StoredUser, authService } from '../services/authService';
import { User, Shield, MapPin, Briefcase, Crown, Upload, Camera } from 'lucide-react';
import { SCPLogo } from './SCPLogo';

interface ProfileProps {
  user: StoredUser;
  currentClearance: number;
  onProfileUpdate?: (user: StoredUser) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, currentClearance, onProfileUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use simulated clearance for visuals
  const isSimulatedO5 = currentClearance >= 5;
  const isSimulatedAdmin = currentClearance === 6;
  
  const cardColor = isSimulatedO5 ? 'border-yellow-500' : 'border-gray-600';
  const textColor = isSimulatedO5 ? 'text-yellow-500' : 'text-scp-text';
  
  // Generate a safe pseudo-hash for visuals
  const safeHash = user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString(16).toUpperCase().padEnd(16, '0');

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("ОШИБКА: ФАЙЛ ПРЕВЫШАЕТ ЛИМИТ 2MB");
      return;
    }

    setIsUploading(true);
    
    // Call Service
    const result = await authService.uploadAvatar(user.id, file);

    if (result.success && result.url) {
       // Create updated user object
       const updatedUser = { ...user, avatar_url: result.url };
       if (onProfileUpdate) {
         onProfileUpdate(updatedUser);
       }
    } else {
       alert(result.message);
    }
    
    setIsUploading(false);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold tracking-[0.2em] ${textColor} transition-colors duration-500`}>ЛИЧНОЕ ДЕЛО</h2>
        <p className="text-xs text-gray-500 mt-1">ЗАСЕКРЕЧЕННАЯ ИНФОРМАЦИЯ // НЕ РАСПРОСТРАНЯТЬ</p>
      </div>

      {/* ID CARD */}
      <div className={`w-full bg-black border-2 ${cardColor} p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-500`}>
        {/* Holographic overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-4 right-4 opacity-10 text-gray-500">
          <SCPLogo className="w-32 h-32" />
        </div>

        {/* Card Header */}
        <div className="flex justify-between items-start border-b border-gray-800 pb-4 mb-6 relative z-10">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 border border-current rounded-full flex items-center justify-center opacity-80 overflow-hidden p-1">
                {isSimulatedAdmin ? <Crown size={24} className="text-yellow-500" /> : <SCPLogo className={textColor} />}
             </div>
             <div>
               <h3 className="font-bold text-lg tracking-widest text-white">ФОНД SCP</h3>
               <p className="text-[10px] text-gray-400 uppercase tracking-widest">Обезопасить. Удержать. Сохранить.</p>
             </div>
          </div>
          <div className="text-right">
             <div className="text-[10px] text-gray-500 mb-1">УРОВЕНЬ ДОПУСКА</div>
             <div className={`text-xl font-black ${textColor} border-2 ${isSimulatedO5 ? 'border-yellow-500' : 'border-scp-text'} px-2 py-1 inline-block transition-all duration-500`}>
                {isSimulatedAdmin ? 'АДМИН' : `УРОВЕНЬ ${currentClearance}`}
             </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex flex-col md:flex-row gap-8 relative z-10">
           {/* Photo Area */}
           <div className="shrink-0 flex flex-col items-center gap-2">
              <div 
                className="w-32 h-40 bg-gray-900 border border-gray-700 flex items-center justify-center relative overflow-hidden group cursor-pointer"
                onClick={handleAvatarClick}
              >
                 {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                 ) : (
                    <User size={64} className="text-gray-700" />
                 )}
                 
                 {/* Fake noise */}
                 <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>
                 
                 {/* Upload Overlay */}
                 <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {isUploading ? (
                        <div className="w-6 h-6 border-2 border-scp-terminal border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                           <Camera className="text-scp-terminal mb-1" size={24} />
                           <span className="text-[9px] text-scp-terminal font-mono uppercase">Обновить</span>
                        </>
                    )}
                 </div>
                 
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/*"
                   onChange={handleFileChange}
                 />
              </div>
              <div className="w-32 text-center">
                <div className="text-[8px] text-gray-500 uppercase">Код верификации</div>
                <div className="text-[10px] font-mono break-all leading-tight text-gray-600">
                   {safeHash}
                </div>
              </div>
           </div>

           {/* Details */}
           <div className="flex-1 space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
                   <User size={10} /> Имя
                </label>
                <div className="text-xl font-bold text-white font-mono uppercase tracking-wide">
                  {user.name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
                     <Briefcase size={10} /> Назначение
                  </label>
                  <div className="text-sm text-gray-300 font-mono">
                    {/* Visual Override for simulation */}
                    {isSimulatedAdmin ? 'Администратор' : (isSimulatedO5 ? 'Смотритель' : (user.title || 'Полевой Агент'))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
                     <Shield size={10} /> Отдел
                  </label>
                  <div className="text-sm text-gray-300 font-mono">
                     {isSimulatedAdmin ? 'Командование О5' : (isSimulatedO5 ? 'Совет О5' : (user.department || 'Общие обязанности'))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
                   <MapPin size={10} /> Текущая локация
                </label>
                <div className="text-sm text-gray-300 font-mono">
                  {isSimulatedAdmin ? 'Зона-01' : (isSimulatedO5 ? '[УДАЛЕНО]' : (user.site || 'Зона-19'))}
                </div>
              </div>
           </div>
        </div>

        {/* Footer Barcode */}
        <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between">
           <div className="h-8 flex-1 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAABCAYAAAD5PA/NAAAAFklEQVR4AWP4z8DwHwwDhuB0dAAAAAD//wQA/wD/H0gAAAAASUVORK5CYII=')] bg-repeat-x opacity-50 mix-blend-screen" style={{ backgroundSize: '4px 100%' }}></div>
           <div className="ml-4 text-[9px] text-gray-600 font-mono">
             СРОК: БЕССРОЧНО
           </div>
        </div>
      </div>
      
      {isSimulatedO5 && (
        <div className="mt-8 p-4 border border-yellow-900/50 bg-yellow-900/10 w-full text-center">
           <p className="text-yellow-600 text-xs font-bold tracking-[0.2em]">
             {isSimulatedAdmin ? '⚠ ПРЕДОСТАВЛЕН ROOT-ДОСТУП' : '⚠ ОБНАРУЖЕНА АВТОРИЗАЦИЯ КОМАНДОВАНИЯ'}
           </p>
        </div>
      )}
    </div>
  );
};

export default Profile;
