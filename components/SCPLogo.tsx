import React from 'react';

interface SCPLogoProps {
  className?: string;
}

export const SCPLogo: React.FC<SCPLogoProps> = ({ className = '' }) => {
  return (
    <img 
      src="https://mweuefcktccktirbejvo.supabase.co/storage/v1/object/public/assets/logo1.png" 
      alt="SCP Foundation Logo" 
      className={`${className} block object-contain`}
      onError={(e) => {
        // Fallback or logging if the image fails to load
        console.warn("Logo failed to load from /logo.png");
      }}
    />
  );
};

export default SCPLogo;
