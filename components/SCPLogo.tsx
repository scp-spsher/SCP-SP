import React, { useState, useEffect } from 'react';

interface SCPLogoProps {
  className?: string;
}

export const SCPLogo: React.FC<SCPLogoProps> = ({ className = '' }) => {
  const [useFallback, setUseFallback] = useState(false);
  const localLogoPath = '/logo.png';

  // State to track if the local file actually exists
  useEffect(() => {
    const img = new Image();
    img.src = localLogoPath;
    img.onload = () => setUseFallback(false);
    img.onerror = () => setUseFallback(true);
  }, []);

  // Filter logic for consistent coloring across both PNG and SVG fallback
  let filter = 'invert(1)'; 
  if (className.includes('text-yellow')) {
     filter = 'invert(72%) sepia(74%) saturate(1787%) hue-rotate(1deg) brightness(103%) contrast(105%)';
  } else if (className.includes('text-scp-terminal') || className.includes('text-green')) {
     filter = 'invert(70%) sepia(72%) saturate(400%) hue-rotate(80deg) brightness(120%) contrast(120%)';
  } else if (className.includes('text-scp-accent') || className.includes('text-red')) {
     filter = 'invert(22%) sepia(94%) saturate(7460%) hue-rotate(358deg) brightness(96%) contrast(113%)';
  } else if (className.includes('text-black')) {
     filter = 'none';
  }

  if (useFallback) {
    // High-quality SVG Fallback (The SCP Foundation Logo)
    return (
      <svg 
        viewBox="0 0 200 200" 
        className={className} 
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transition: 'color 0.5s ease' }}
      >
        <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="10" />
        <g transform="translate(100, 100)">
          {[0, 120, 240].map((angle) => (
            <g key={angle} transform={`rotate(${angle})`}>
              <path d="M -15,-95 L 15,-95 L 15,-50 L 30,-50 L 0,-20 L -30,-50 L -15,-50 Z" fill="currentColor" />
            </g>
          ))}
          <circle cx="0" cy="0" r="35" fill="none" stroke="currentColor" strokeWidth="8" />
          <path d="M -15,-5 L 0,15 L 15,-5" fill="none" stroke="currentColor" strokeWidth="5" transform="rotate(180)" />
          <circle cx="0" cy="0" r="10" fill="currentColor" />
        </g>
      </svg>
    );
  }

  return (
    <img 
      src={localLogoPath}
      alt="SCP Foundation"
      className={`${className} object-contain`}
      style={{ filter, transition: 'filter 0.5s ease' }}
      onError={() => setUseFallback(true)}
    />
  );
};

export default SCPLogo;
