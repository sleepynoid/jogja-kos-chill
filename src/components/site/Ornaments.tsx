import React from 'react';

export const Gunungan = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 150" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M50 0 C20 40 0 100 0 130 L15 150 L85 150 L100 130 C100 100 80 40 50 0Z" />
    <path d="M50 20 L60 50 L40 50 Z" opacity="0.5" />
    <path d="M30 150 L30 110 M70 150 L70 110" stroke="white" strokeWidth="2" opacity="0.3" />
  </svg>
);

export const TuguJogja = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 60 180" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Top point */}
    <path d="M30 0 L35 15 L25 15 Z" />
    {/* Body top */}
    <rect x="27" y="15" width="6" height="40" />
    {/* Decoration middle */}
    <rect x="22" y="55" width="16" height="5" />
    {/* Body middle */}
    <rect x="25" y="60" width="10" height="70" />
    {/* Decoration bottom */}
    <rect x="20" y="130" width="20" height="10" />
    {/* Base */}
    <rect x="15" y="140" width="30" height="20" />
    <rect x="10" y="160" width="40" height="20" />
  </svg>
);

export const BatikParang = ({ className = "opacity-[0.22]" }: { className?: string }) => (
  <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${className}`}
       style={{
         backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23E76F51' stroke-width='1.2' opacity='0.7'%3E%3Cpath d='M-10,70 L70,-10 M-10,30 L30,-10 M30,70 L70,30' stroke-dasharray='1,3' /%3E%3Cpath d='M0,0 Q15,-15 15,0 T30,0 T45,15 T60,30' stroke-width='1.8' /%3E%3Cpath d='M0,30 Q15,15 15,30 T30,30 T45,45 T60,60' stroke-width='1.8' /%3E%3Cpath d='M30,0 Q45,-15 45,0 T60,0' stroke-width='1.8' /%3E%3Cpath d='M-30,30 Q-15,15 -15,30 T0,30' stroke-width='1.8' /%3E%3Ccircle cx='15' cy='15' r='1.5' fill='%23E76F51' /%3E%3Ccircle cx='45' cy='45' r='1.5' fill='%23E76F51' /%3E%3Ccircle cx='45' cy='15' r='1.5' fill='%23E76F51' /%3E%3Ccircle cx='15' cy='45' r='1.5' fill='%23E76F51' /%3E%3C/g%3E%3C/svg%3E")`,
         backgroundSize: '48px 48px'
       }}
  />
);

export const BatikKawung = ({ className = "opacity-[0.25]" }: { className?: string }) => (
  <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${className}`} 
       style={{ 
         backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23E76F51' stroke-width='1.2' opacity='0.65'%3E%3Ccircle cx='40' cy='40' r='28' /%3E%3Ccircle cx='0' cy='40' r='28' /%3E%3Ccircle cx='80' cy='40' r='28' /%3E%3Ccircle cx='40' cy='0' r='28' /%3E%3Ccircle cx='40' cy='80' r='28' /%3E%3Ccircle cx='0' cy='0' r='28' /%3E%3Ccircle cx='80' cy='0' r='28' /%3E%3Ccircle cx='0' cy='80' r='28' /%3E%3Ccircle cx='80' cy='80' r='28' /%3E%3Ccircle cx='40' cy='40' r='3.5' fill='%23E76F51' /%3E%3Ccircle cx='0' cy='0' r='3.5' fill='%23E76F51' /%3E%3Ccircle cx='80' cy='0' r='3.5' fill='%23E76F51' /%3E%3Ccircle cx='0' cy='80' r='3.5' fill='%23E76F51' /%3E%3Ccircle cx='80' cy='80' r='3.5' fill='%23E76F51' /%3E%3Ccircle cx='40' cy='22' r='1.5' fill='%23E76F51' /%3E%3Ccircle cx='40' cy='58' r='1.5' fill='%23E76F51' /%3E%3Ccircle cx='22' cy='40' r='1.5' fill='%23E76F51' /%3E%3Ccircle cx='58' cy='40' r='1.5' fill='%23E76F51' /%3E%3C/g%3E%3C/svg%3E")`,
         backgroundSize: '64px 64px' 
       }} 
  />
);

export const BatikNitik = ({ className = "opacity-[0.25]" }: { className?: string }) => (
  <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${className}`} 
       style={{ 
         backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23E76F51' opacity='0.65'%3E%3Crect x='19' y='19' width='2' height='2' /%3E%3Crect x='19' y='13' width='2' height='2' /%3E%3Crect x='19' y='10' width='2' height='2' /%3E%3Crect x='19' y='25' width='2' height='2' /%3E%3Crect x='19' y='28' width='2' height='2' /%3E%3Crect x='13' y='19' width='2' height='2' /%3E%3Crect x='10' y='19' width='2' height='2' /%3E%3Crect x='25' y='19' width='2' height='2' /%3E%3Crect x='28' y='19' width='2' height='2' /%3E%3Crect x='14' y='14' width='2' height='2' /%3E%3Crect x='11' y='11' width='2' height='2' /%3E%3Crect x='24' y='24' width='2' height='2' /%3E%3Crect x='27' y='27' width='2' height='2' /%3E%3Crect x='24' y='14' width='2' height='2' /%3E%3Crect x='27' y='11' width='2' height='2' /%3E%3Crect x='14' y='24' width='2' height='2' /%3E%3Crect x='11' y='27' width='2' height='2' /%3E%3Crect x='0' y='0' width='3' height='3' /%3E%3Crect x='37' y='0' width='3' height='3' /%3E%3Crect x='0' y='37' width='3' height='3' /%3E%3Crect x='37' y='37' width='3' height='3' /%3E%3C/g%3E%3C/svg%3E")`,
         backgroundSize: '40px 40px' 
       }} 
  />
);

export const BatikPattern = ({ 
  className, 
  variant = 'kawung' 
}: { 
  className?: string; 
  variant?: 'parang' | 'kawung' | 'nitik'; 
}) => {
  if (variant === 'parang') return <BatikParang className={className} />;
  if (variant === 'nitik') return <BatikNitik className={className} />;
  return <BatikKawung className={className} />;
};

export const TumpalDivider = ({ className = "" }: { className?: string }) => (
  <div className={`w-full flex justify-center overflow-hidden py-4 select-none pointer-events-none ${className}`}>
    <svg className="w-full max-w-lg h-8 text-brand-accent/40" viewBox="0 0 400 30" fill="currentColor" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      {/* Pattern of repeating triangles (Tumpal) */}
      <path d="
        M0,30 L15,0 L30,30 
        M30,30 L45,0 L60,30 
        M60,30 L75,0 L90,30 
        M90,30 L105,0 L120,30 
        M120,30 L135,0 L150,30 
        M150,30 L165,0 L180,30 
        M180,30 L195,0 L210,30 
        M210,30 L225,0 L240,30 
        M240,30 L255,0 L270,30 
        M270,30 L285,0 L300,30 
        M300,30 L315,0 L330,30 
        M330,30 L345,0 L360,30 
        M360,30 L375,0 L390,30 
        M390,30 L400,10 L400,30 Z
      " stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Inner accent dots & mini triangles */}
      <path d="
        M15,22 L15,26 M45,22 L45,26 M75,22 L75,26 M105,22 L105,26 M135,22 L135,26 M165,22 L165,26 M195,22 L195,26 M225,22 L225,26 M255,22 L255,26 M285,22 L285,26 M315,22 L315,26 M345,22 L345,26 M375,22 L375,26
      " stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="0" y1="30" x2="400" y2="30" stroke="currentColor" strokeWidth="2" />
    </svg>
  </div>
);

export const PatraCorner = ({ position = "top-left", className = "" }: { position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right', className?: string }) => {
  const rotation = {
    'top-left': 'rotate-0',
    'top-right': 'rotate-90',
    'bottom-right': 'rotate-180',
    'bottom-left': '-rotate-90'
  }[position];

  return (
    <svg 
      className={`absolute w-12 h-12 text-brand-accent/50 pointer-events-none select-none ${rotation} ${className}`} 
      viewBox="0 0 50 50" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Classic ethnic leaf scroll motif */}
      <path d="M0,0 L15,0 Q8,8 0,15 Z" opacity="0.8" />
      <path d="M0,0 L0,20 Q12,12 20,0 Z" opacity="0.8" />
      <path d="M5,5 Q15,25 25,25 Q15,35 5,45 L5,35 Q10,25 5,15 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="2.5" />
      <circle cx="14" cy="14" r="1.5" />
    </svg>
  );
};
