import React from 'react';

interface SCPLogoProps {
  className?: string;
}

export const SCPLogo: React.FC<SCPLogoProps> = ({ className = '' }) => {
  return (
    <img 
      src="/logo.png" 
      alt="SCP Foundation Logo" 
      className={`${className} block object-contain`}
      onError={(e) => {
        // Если файла нет, покажем текстовую заглушку, чтобы не было "битой" картинки
        e.currentTarget.style.display = 'none';
        console.error("Файл logo.png не найден в корне сайта.");
      }}
    />
  );
};

export default SCPLogo;
