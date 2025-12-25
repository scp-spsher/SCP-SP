import React from 'react';

interface SCPLogoProps {
  className?: string;
}

export const SCPLogo: React.FC<SCPLogoProps> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className={className} 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <mask id="arrow-mask">
           <rect x="0" y="0" width="200" height="200" fill="white" />
           {/* Cuts for the arrows in the outer ring */}
           <path d="M92 0 H108 V50 H92 Z" transform="rotate(0 100 100)" fill="black" />
           <path d="M92 0 H108 V50 H92 Z" transform="rotate(120 100 100)" fill="black" />
           <path d="M92 0 H108 V50 H92 Z" transform="rotate(240 100 100)" fill="black" />
        </mask>
      </defs>

      {/* Outer Ring with cuts */}
      <circle cx="100" cy="100" r="90" mask="url(#arrow-mask)" fill="none" stroke="currentColor" strokeWidth="18" />

      {/* Inner Arrows */}
      <g transform="translate(100 100)">
         {[0, 120, 240].map((rot) => (
           <g key={rot} transform={`rotate(${rot})`}>
              {/* Arrow Head */}
              <path d="M-18 -55 L0 -25 L18 -55 H8 V-95 H-8 V-55 Z" fill="currentColor" />
           </g>
         ))}
      </g>
      
      {/* Center Element */}
      <path d="M100 80 L117 90 V110 L100 120 L83 110 V90 Z" fill="none" stroke="currentColor" strokeWidth="5" />
      <circle cx="100" cy="100" r="12" fill="currentColor" />
    </svg>
  );
};

export default SCPLogo;
