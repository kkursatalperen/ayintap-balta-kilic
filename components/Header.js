'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { Menu, ShoppingCart, User, X, ChevronDown } from 'lucide-react';
import Logo from './Logo';
import { useCart, useAuth } from '@/lib/store';
import CartDrawer from './CartDrawer';

export default function Header({ settings }) {
  const count = useCart((s) => s.count());
  const open = useCart((s) => s.open);
  const { user, setUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.user) setUser(d.user, null); });
  }, [setUser]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setDropdownOpen(false), 150);
  };

  return (
    <>
    <AnnouncementBar announcements={settings?.announcements || [
  '🚚 500₺ ve üzeri alışverişlerde ücretsiz kargo',
  '⚔️ El yapımı, sertifikalı Türk çeliği',
  '✨ Lazerle isim yazdırma seçeneği mevcut',
]}/>
      <header className={`fixed top-8 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0d0d0d]/95 backdrop-blur-md border-b border-amber-500/20' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center">
              <Logo showText={true} />
            </Link>
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/" className="text-amber-100/80 hover:text-amber-400 transition-colors font-serif text-sm tracking-widest uppercase">Anasayfa</Link>
              <div ref={dropdownRef} className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <button onClick={() => setDropdownOpen((v) => !v)} className="flex items-center gap-1 text-amber-100/80 hover:text-amber-400 transition-colors font-serif text-sm tracking-widest uppercase">
                  Tüm Ürünler
                  <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-[#0d0d0d] border border-amber-500/20 rounded-lg shadow-2xl overflow-hidden z-50">
                    <div className="p-2">
                      <Link href="/urunler" onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-amber-100/80 hover:text-amber-400 hover:bg-amber-500/5 rounded font-serif text-sm tracking-widest uppercase transition-colors">Tüm Ürünler</Link>
                      {categories.length > 0 && <div className="my-2 border-t border-amber-500/10"/>}
                      {categories.map((cat) => (
                        <Link key={cat.id} href={`/urunler?kategori=${cat.slug}`} onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-amber-100/60 hover:text-amber-400 hover:bg-amber-500/5 rounded font-serif text-sm tracking-widest uppercase transition-colors">{cat.name}</Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Link href="/blog" className="text-amber-100/80 hover:text-amber-400 transition-colors font-serif text-sm tracking-widest uppercase">Blog</Link>
              <Link href="/hakkimizda" className="text-amber-100/80 hover:text-amber-400 transition-colors font-serif text-sm tracking-widest uppercase">Hikayemiz</Link>
              <Link href="/iletisim" className="text-amber-100/80 hover:text-amber-400 transition-colors font-serif text-sm tracking-widest uppercase">İletişim</Link>
            </nav>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href={user ? (user.role !== 'customer' ? '/admin' : '/profil') : '/giris'} className="p-2 text-amber-100 hover:text-amber-400 transition"><User size={20}/></Link>
              <button onClick={open} className="p-2 text-amber-100 hover:text-amber-400 transition relative">
                <ShoppingCart size={20}/>
                {count > 0 && <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{count}</span>}
              </button>
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-amber-100"><Menu size={22}/></button>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-[#0d0d0d] lg:hidden">
          <div className="flex items-center justify-between p-4 border-b border-amber-500/20">
            <Logo showText={true}/>
            <button onClick={() => setMobileOpen(false)} className="p-2 text-amber-100"><X size={24}/></button>
          </div>
          <div className="flex flex-col p-6 gap-2">
            <Link href="/" onClick={() => setMobileOpen(false)} className="text-amber-100 font-serif text-xl tracking-wider border-b border-amber-500/10 pb-4 mb-2">Anasayfa</Link>
            <Link href="/urunler" onClick={() => setMobileOpen(false)} className="text-amber-100 font-serif text-xl tracking-wider pb-2">Tüm Ürünler</Link>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/urunler?kategori=${cat.slug}`} onClick={() => setMobileOpen(false)} className="text-amber-100/60 font-serif text-base tracking-wider pl-4 pb-2">{cat.name}</Link>
            ))}
            <div className="border-b border-amber-500/10 my-2"/>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className="text-amber-100 font-serif text-xl tracking-wider border-b border-amber-500/10 pb-4">Blog</Link>
            <Link href="/hakkimizda" onClick={() => setMobileOpen(false)} className="text-amber-100 font-serif text-xl tracking-wider border-b border-amber-500/10 pb-4">Hikayemiz</Link>
            <Link href="/iletisim" onClick={() => setMobileOpen(false)} className="text-amber-100 font-serif text-xl tracking-wider border-b border-amber-500/10 pb-4">İletişim</Link>
          </div>
        </div>
      )}
      <CartDrawer settings={settings}/>
    </>
  );
function AnnouncementBar({ announcements }) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!announcements?.length) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % announcements.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(timer);
  }, [announcements]);

  if (!announcements?.length) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[51] bg-amber-500 text-black text-xs font-serif tracking-widest text-center py-2 overflow-hidden">
      <div style={{
        transition: 'all 0.4s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-10px)',
      }}>
        {announcements[current]}
      </div>
    </div>
  );
}
}

