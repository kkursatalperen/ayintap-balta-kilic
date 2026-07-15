import Image from 'next/image';
export default function Logo({ className = '', showText = false }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/logo-clean.png"
        alt="Ayintap Kilic Logo"
        width={48}
        height={48}
        className="h-12 w-12 shrink-0 rounded-full"
        priority
      />
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-serif text-base sm:text-lg text-amber-400 tracking-widest">AYINTAP</span>
          <span className="font-serif text-xs text-amber-200/70 tracking-[0.3em]">KILIÇ</span>
        </div>
      )}
    </div>
  );
}