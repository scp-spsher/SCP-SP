import React, { useState } from 'react';

interface SCPLogoProps {
  className?: string;
}

export const SCPLogo: React.FC<SCPLogoProps> = ({ className = '' }) => {
  // Logic to apply color filters to the PNG based on Tailwind text color classes.
  // The source image is assumed to be BLACK on TRANSPARENT.
  
  const [imgSrc, setImgSrc] = useState('/logo.png');

  // Default: Invert(1) to make it white on dark background.
  let filter = 'invert(1)'; 

  // Check for specific colors used in the app to apply matching CSS filters
  if (className.includes('text-yellow')) {
     // Approximate filter for Yellow-500 (O5 Council Theme)
     filter = 'invert(72%) sepia(74%) saturate(1787%) hue-rotate(1deg) brightness(103%) contrast(105%)';
  } else if (className.includes('text-scp-terminal') || className.includes('text-green')) {
     // Approximate filter for Terminal Green
     filter = 'invert(70%) sepia(72%) saturate(400%) hue-rotate(80deg) brightness(120%) contrast(120%)';
  } else if (className.includes('text-scp-accent') || className.includes('text-red')) {
     // Approximate filter for Red/Accent
     filter = 'invert(22%) sepia(94%) saturate(7460%) hue-rotate(358deg) brightness(96%) contrast(113%)';
  } else if (className.includes('text-black')) {
     // If explicitly black text requested, show original black logo (e.g. for light paper)
     filter = 'none';
  }

  const handleError = () => {
    // Fallback to Wikipedia version if local logo.png is not found
    if (imgSrc === '/logo.png') {
      setImgSrc('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/SCP_Foundation_Logo.svg/512px-SCP_Foundation_Logo.svg.png');
    }
  };

  return (
    <img 
      src={imgSrc}
      alt="SCP Foundation Logo"
      className={`${className} object-contain`}
      style={{ filter, transition: 'filter 0.5s ease' }}
      onError={handleError}
    />
  );
};

export default SCPLogo;
