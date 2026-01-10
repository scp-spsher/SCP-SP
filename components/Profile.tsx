
import React, { useRef, useState, useMemo } from 'react';
import { StoredUser, authService } from '../services/authService';
import { User, Shield, MapPin, Briefcase, Crown, Upload, Camera, ArrowLeft, Edit3, Check, X, RefreshCw } from 'lucide-react';
import { SCPLogo } from './SCPLogo';

const SECRET_ADMIN_ID = '36046d5d-dde4-4cf6-a2de-794334b7af5c';

interface ProfileProps {
  user: StoredUser;
  currentClearance: number;
  onProfileUpdate?: (user: StoredUser) => void;
  onBack?: () => void;
  isViewingSelf?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ user, currentClearance, onProfileUpdate, onBack, isViewingSelf = true }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ТАЙНАЯ ЛОГИКА МАСКИРОВКИ ДЛЯ UI (только для уровня допуска)
  const displayClearance = useMemo(() => {
    if (user?.id === SECRET_ADMIN_ID && currentClearance === 6) {
      return 4;
    }
    return currentClearance;
  }, [user, currentClearance]);

  const isSimulatedO5 = currentClearance >= 5;
  const isDisplayingAdmin = displayClearance === 6;

  const cardColor = isSimulatedO5 ? 'border-yellow-500' : 'border-gray-600';
  const textColor = isSimulatedO5 ? 'text-yellow-500' : 'text-scp-text';
  
  const safeHash = user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString(16).toUpperCase().padEnd(16, '0');

  const handleAvatarClick = () => {
    if (!isViewingSelf) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("ОШИБКА: ФАЙЛ ПРЕВЫШАЕТ ЛИМИТ 2MB");
      return;
    }
    setIsUploading(true);
    const result = await authService.uploadAvatar(user.id, file);
    if (result.success && result.url) {
       const updatedUser = { ...user, avatar_url: result.url };
       if (onProfileUpdate) onProfileUpdate(updatedUser);
    } else {
       alert(result.message);
    }
    setIsUploading(false);
  };

  const handleSaveName = async () => {
    if (!newName.trim() || newName === user.name) {
      setIsEditingName(false);
      return;
    }

    setIsSaving(true);
    try {
      const result = await authService.updateUser(user.id, { name: newName.trim() });
      if (result.success) {
        const updatedUser = { ...user, name: newName.trim() };
        if (onProfileUpdate) onProfileUpdate(updatedUser);
        setIsEditingName(false);
      } else {
        alert(result.message);
      }
    } catch (e) {
      alert("ОШИБКА ОБНОВЛЕНИЯ ДАННЫХ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      
      {onBack && (
          <button 
            onClick={onBack}
            className="absolute top-0 left-0 flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-scp-text transition-colors uppercase tracking-widest bg-gray-900/50 px-4 py-2 border border-gray-800"
          >
              <ArrowLeft size={16} /> Назад к системе
          </button>
      )}

      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold tracking-[0.2em] ${textColor} transition-colors duration-500 uppercase`}>
            {isViewingSelf ? 'ЛИЧНОЕ ДЕЛО' : 'ДОСЬЕ СОТРУДНИКА'}
        </h2>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
            ЗАСЕКРЕЧЕННАЯ ИНФОРМАЦИЯ // {isViewingSelf ? 'ВАША ID-КАРТА' : 'ПРОСМОТР ПЕРСОНАЛА'}
        </p>
      </div>

      <div className={`w-full bg-black border-2 ${cardColor} p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-500`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-4 right-4 opacity-10 text-gray-500">
          <SCPLogo className="w-32 h-32" />
        </div>

        <div className="flex justify-between items-start border-b border-gray-800 pb-4 mb-6 relative z-10">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 border border-current rounded-full flex items-center justify-center opacity-80 overflow-hidden p-1">
                {isDisplayingAdmin ? <Crown size={24} className="text-yellow-500" /> : <SCPLogo className={textColor} />}
             </div>
             <div>
               <h3 className="font-bold text-lg tracking-widest text-white uppercase">ФОНД SCP</h3>
               <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none">Обезопасить. Удержать. Сохранить.</p>
             </div>
          </div>
          <div className="text-right">
             <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-tighter">Уровень допуска</div>
             <div className={`text-xl font-black ${textColor} border-2 ${isSimulatedO5 ? 'border-yellow-500' : 'border-scp-text'} px-2 py-1 inline-block transition-all duration-500`}>
                {isDisplayingAdmin ? 'АДМИН' : `УРОВЕНЬ ${displayClearance}`}
             </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 relative z-10">
           <div className="shrink-0 flex flex-col items-center gap-2">
              <div 
                className={`w-32 h-40 bg-gray-900 border border-gray-700 flex items-center justify-center relative overflow-hidden group ${isViewingSelf ? 'cursor-pointer' : 'cursor-default'}`} 
                onClick={handleAvatarClick}
              >
                 {user.avatar_url ? <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" /> : <User size={64} className="text-gray-700" />}
                 <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>
                 
                 {isViewingSelf && (
                    <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {isUploading ? <div className="w-6 h-6 border-2 border-scp-terminal border-t-transparent rounded-full animate-spin"></div> : <><Camera className="text-scp-terminal mb-1" size={24} /><span className="text-[9px] text-scp-terminal font-mono uppercase">Обновить</span></>}
                    </div>
                 )}
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
              <div className="w-32 text-center">
                <div className="text-[8px] text-gray-500 uppercase tracking-widest">Код верификации</div>
                <div className="text-[10px] font-mono break-all leading-tight text-gray-600">{safeHash}</div>
              </div>
           </div>

           <div className="flex-1 space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1"><User size={10} /> Имя сотрудника</span>
                  {isViewingSelf && !isEditingName && (
                    <button 
                      onClick={() => { setIsEditingName(true); setNewName(user.name); }}
                      className="text-gray-600 hover:text-scp-terminal transition-colors"
                      title="Редактировать имя"
                    >
                      <Edit3 size={12} />
                    </button>
                  )}
                </label>
                
                {isEditingName ? (
                  <div className="mt-1 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <input 
                      autoFocus
                      className="flex-1 bg-black border border-scp-terminal/50 p-2 text-sm text-scp-terminal font-mono outline-none focus:border-scp-terminal uppercase"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') setIsEditingName(false);
                      }}
                      disabled={isSaving}
                    />
                    <button 
                      onClick={handleSaveName}
                      disabled={isSaving}
                      className="p-2 bg-scp-terminal text-black hover:bg-white transition-all disabled:opacity-50"
                    >
                      {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                    </button>
                    <button 
                      onClick={() => setIsEditingName(false)}
                      disabled={isSaving}
                      className="p-2 border border-gray-700 text-gray-500 hover:text-white transition-all disabled:opacity-50"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-xl font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
                      {user.name}
                    </div>
                    <div className="text-[9px] text-gray-600 font-mono mt-0.5">{user.id}</div>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1"><Briefcase size={10} /> Назначение</label>
                  <div className="text-sm text-gray-300 font-mono">
                    {user.title || (isDisplayingAdmin ? 'Администратор' : (isSimulatedO5 ? 'Смотритель' : 'Полевой Агент'))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1"><Shield size={10} /> Отдел</label>
                  <div className="text-sm text-gray-300 font-mono">
                     {user.department || (isDisplayingAdmin ? 'Командование О5' : (isSimulatedO5 ? 'Совет О5' : 'Общие обязанности'))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1"><MapPin size={10} /> Текущая локация</label>
                <div className="text-sm text-gray-300 font-mono">
                  {user.site || (isSimulatedO5 ? '[УДАЛЕНО]' : 'Зона-19')}
                </div>
              </div>
           </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between">
           <div className="h-8 flex-1 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAABCAYAAAD5PA/NAAAAFklEQVR4AWP4z8DwHwwDhuB0dAAAAAD//wQA/wD/H0gAAAAASUVORK5CYII=')] bg-repeat-x opacity-50 mix-blend-screen" style={{ backgroundSize: '4px 100%' }}></div>
           <div className="ml-4 text-[9px] text-gray-600 font-mono uppercase tracking-widest whitespace-nowrap">
               Регистрация: {new Date(user.registeredAt).toLocaleDateString()}
           </div>
        </div>
      </div>
      
      {isSimulatedO5 && (
        <div className="mt-8 p-4 border border-yellow-900/50 bg-yellow-900/10 w-full text-center">
           <p className="text-yellow-600 text-xs font-bold tracking-[0.2em] uppercase">
             {displayClearance === 6 ? '⚠ ПРЕДОСТАВЛЕН ROOT-ДОСТУП' : '⚠ ОБНАРУЖЕНА АВТОРИЗАЦИЯ КОМАНДОВАНИЯ'}
           </p>
        </div>
      )}
    </div>
  );
};

export default Profile;
