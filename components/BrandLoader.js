import Image from 'next/image';

/**
 * Marka kimliğine uygun loader — dönen çift halka (örs/çekiç izlenimi),
 * yükselen kor parçacıkları ve ortada logo.
 * Kullanım: <BrandLoader /> veya <BrandLoader fullScreen label="Yükleniyor" />
 */
export default function BrandLoader({ fullScreen = true, label = 'Yükleniyor' }) {
  const embers = [
    { left: '10%', delay: '0s', x: '14px', size: 3 },
    { left: '30%', delay: '0.4s', x: '-10px', size: 2 },
    { left: '55%', delay: '0.8s', x: '18px', size: 3 },
    { left: '70%', delay: '0.2s', x: '-16px', size: 2 },
    { left: '85%', delay: '0.6s', x: '8px', size: 2 },
  ];

  return (
    <div className={fullScreen ? 'min-h-screen bg-[#0d0d0d] flex items-center justify-center' : 'flex items-center justify-center py-16'}>
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Arka kor parıltısı */}
          <div className="brand-loader-glow absolute inset-2 rounded-full bg-amber-500/20 blur-xl"/>

          {/* Yükselen kor parçacıkları */}
          {embers.map((e, i) => (
            <span
              key={i}
              className="brand-loader-ember absolute bottom-8 rounded-full bg-amber-400"
              style={{
                left: e.left,
                width: e.size,
                height: e.size,
                animationDelay: e.delay,
                ['--ember-x']: e.x,
                boxShadow: '0 0 6px 1px rgba(251,191,36,0.8)',
              }}
            />
          ))}

          {/* Dönen halka — tek, net, kesiksiz gradient ark */}
          <svg className="brand-loader-ring absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none">
            <circle
              cx="50" cy="50" r="44"
              stroke="#3a3a3a"
              strokeWidth="2"
              opacity="0.4"
            />
            <circle
              cx="50" cy="50" r="44"
              stroke="url(#loaderGrad1)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="90 190"
            />
            <defs>
              <linearGradient id="loaderGrad1" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#fbbf24"/>
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0.2"/>
              </linearGradient>
            </defs>
          </svg>

          {/* Logo — sabit, ortada */}
          <div className="relative z-10 rounded-full ring-1 ring-amber-500/30 shadow-[0_0_25px_rgba(212,175,55,0.35)] overflow-hidden bg-[#0d0d0d]">
            <Image src="/logo-clean.png" alt="Ayıntap Kılıç" width={80} height={80} className="w-20 h-20" priority/>
          </div>
        </div>

        {label && (
          <p className="font-serif text-amber-100/60 text-sm tracking-[0.25em] uppercase flex items-center gap-1">
            {label}
            <span className="flex gap-0.5 ml-1">
              <span className="brand-loader-dot inline-block w-1 h-1 rounded-full bg-amber-400" style={{ animationDelay: '0s' }}/>
              <span className="brand-loader-dot inline-block w-1 h-1 rounded-full bg-amber-400" style={{ animationDelay: '0.2s' }}/>
              <span className="brand-loader-dot inline-block w-1 h-1 rounded-full bg-amber-400" style={{ animationDelay: '0.4s' }}/>
            </span>
          </p>
        )}
      </div>
    </div>
  );
}