'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { Menu, ShoppingCart, User, Search, X, ChevronDown, LayoutDashboard, Package, Heart, MapPin, LogOut, Settings } from 'lucide-react';
import Logo from './Logo';
import { useCart, useAuth } from '@/lib/store';
import CartDrawer from './CartDrawer';

export default function Header({ settings }) {
  const count = useCart((s) => s.count());
  const open = useCart((s) => s.open);
  const { user, setUser, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.user) setUser(d.user, null); });
  }, [setUser]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    setDropdownOpen(false);
    window.location.href = '/';
  };

  const nav = [
    { name: 'Anasayfa', href: '/' },
    { name: 'Tüm Ürünler', href: '/urunler' },
    { name: 'Koleksiyonlar', href: '/urunler?kategori=koleksiyon-eserleri' },
    { name: 'Blog', href: '/blog' },
    { name: 'Hikayemiz', href: '/hakkimizda' },
    { name: 'İletişim', href: '/iletisim' },
  ];

  const menuItems = user ? [
    ...(user.role !== 'customer' ? [{ icon: LayoutDashboard, label: 'Admin Paneli', href: '/admin' }] : []),
    { icon: User, label: 'Profilim', href: '/profil' },
    { icon: Package, label: 'Siparişlerim', href: '/profil?tab=orders' },
    { icon: Heart, label: 'Favorilerim', href: '/profil?tab=favorites' },
    { icon: MapPin, label: 'Adreslerim', href: '/profil?tab=addresses' },
    { icon: Settings, label: 'Ayarlar', href: '/profil?tab=password' },
  ] : [];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0d0d0d]/95 backdrop-blur-md border-b border-amber-500/20' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center">
              <Logo showText={true} />
            </Link>
            <nav className="hidden lg:flex items-center gap-8">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="text-amber-100/80 hover:text-amber-400 transition-colors font-serif text-sm tracking-widest uppercase">
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-1.5 p-2 text-amber-100 hover:text-amber-400 transition"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xs font-bold text-black">
                      {(user.name || user.email || '?')[0].toUpperCase()}
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}/>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#161616] border border-amber-500/20 rounded-lg shadow-2xl shadow-black/50 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-amber-500/10">
                        <p className="text-amber-50 text-sm font-serif font-medium truncate">{user.name || 'Kullanici'}</p>
                        <p className="text-amber-100/40 text-xs truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        {menuItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-amber-100/70 hover:text-amber-400 hover:bg-amber-500/5 transition text-sm font-serif tracking-wide"
                          >
                            <item.icon size={15} className="text-amber-500/70"/>
                            {item.label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-amber-500/10 py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition text-sm font-serif tracking-wide"
                        >
                          <LogOut size={15}/>
                          Çıkış Yap
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/giris" className="p-2 text-amber-100 hover:text-amber-400 transition">
                  <User size={20}/>
                </Link>
              )}
              <button onClick={open} className="p-2 text-amber-100 hover:text-amber-400 transition relative">
                <ShoppingCart size={20}/>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{count}</span>
                )}
              </button>
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-amber-100">
                <Menu size={22}/>
              </button>
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
          <div className="flex flex-col p-6 gap-6">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="text-amber-100 font-serif text-xl tracking-wider border-b border-amber-500/10 pb-4">
                {item.name}
              </Link>
            ))}
            {user && (
              <>
                <div className="border-t border-amber-500/20 pt-4">
                  {menuItems.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-amber-100/70 font-serif text-lg tracking-wider border-b border-amber-500/10 pb-4 mb-4">
                      <item.icon size={18} className="text-amber-500"/>
                      {item.label}
                    </Link>
                  ))}
                  <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 font-serif text-lg tracking-wider">
                    <LogOut size={18}/> Çıkış Yap
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <CartDrawer settings={settings}/>
    </>
  );
function AnnouncementBar({ announcements }) {
  if (!announcements?.length) return null;

  const text = announcements.join('          ✦          ');

  return (
    <div className="fixed top-0 left-0 right-0 z-[51] bg-amber-500 text-black text-xs font-serif tracking-widest py-2 overflow-hidden whitespace-nowrap">
      <div style={{
        display: 'inline-block',
        animation: 'marquee 20s linear infinite',
      }}>
        {text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
}