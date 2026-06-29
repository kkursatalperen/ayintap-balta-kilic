export default function Logo({ className = '', showText = false }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 120 120" className="h-12 w-12 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="shieldBg" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#1a2b4a"/>
            <stop offset="100%" stopColor="#050a18"/>
          </radialGradient>
          <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f4d680"/>
            <stop offset="50%" stopColor="#d4af37"/>
            <stop offset="100%" stopColor="#8b6914"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#shieldBg)" stroke="url(#gold)" strokeWidth="4"/>
        <circle cx="60" cy="60" r="52" fill="none" stroke="url(#gold)" strokeWidth="1" opacity="0.7"/>
        {/* Text around */}
        <path id="top-text" d="M 18 60 A 42 42 0 0 1 102 60" fill="none"/>
        <text fill="url(#gold)" fontSize="9" fontFamily="serif" letterSpacing="2">
          <textPath href="#top-text" startOffset="50%" textAnchor="middle">AYINTAP • BALTA • KILIÇ</textPath>
        </text>
        <path id="bot-text" d="M 22 70 A 38 38 0 0 0 98 70" fill="none"/>
        <text fill="url(#gold)" fontSize="7" fontFamily="serif" letterSpacing="3">
          <textPath href="#bot-text" startOffset="50%" textAnchor="middle">GAZİANTEP</textPath>
        </text>
        {/* Crossed axes */}
        <g transform="translate(60 36)">
          <line x1="-14" y1="-8" x2="14" y2="8" stroke="url(#gold)" strokeWidth="2"/>
          <line x1="-14" y1="8" x2="14" y2="-8" stroke="url(#gold)" strokeWidth="2"/>
          <path d="M -16 -10 L -10 -4 L -14 -2 Z" fill="url(#gold)"/>
          <path d="M 16 -10 L 10 -4 L 14 -2 Z" fill="url(#gold)"/>
          <path d="M -16 10 L -10 4 L -14 2 Z" fill="url(#gold)"/>
          <path d="M 16 10 L 10 4 L 14 2 Z" fill="url(#gold)"/>
        </g>
        {/* Eagle with sword */}
        <g transform="translate(60 62)">
          <path d="M 0 -2 L -16 -8 L -10 0 L -16 4 L -6 4 L 0 10 L 6 4 L 16 4 L 10 0 L 16 -8 Z" fill="url(#gold)"/>
          <circle cx="0" cy="-4" r="3" fill="url(#gold)"/>
          {/* sword in claws */}
          <line x1="-20" y1="12" x2="20" y2="12" stroke="url(#gold)" strokeWidth="2"/>
          <rect x="-3" y="10" width="6" height="4" fill="url(#gold)"/>
          <line x1="-5" y1="14" x2="5" y2="14" stroke="url(#gold)" strokeWidth="1.5"/>
        </g>
      </svg>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-serif text-base sm:text-lg text-amber-400 tracking-widest">AYINTAP</span>
          <span className="font-serif text-xs text-amber-200/70 tracking-[0.3em]">BALTA KILIÇ</span>
        </div>
      )}
    </div>
  );
}
