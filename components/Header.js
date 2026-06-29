'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, ShoppingCart, User, Search, X } from 'lucide-react';
import Logo from './Logo';
import { useCart, useAuth } from '@/lib/store';
import CartDrawer from './CartDrawer';

export default function Header({ settings }) {
  const count = useCart((s) => s.count());
  const open = useCart((s) => s.open);
  const { user, setUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.user) setUser(d.user, null); });
  }, [setUser]);

  const nav = [
    { name: 'Anasayfa', href: '/' },
    { name: 'Tüm Ürünler', href: '/urunler' },
    { name: 'Koleksiyonlar', href: '/urunler?kategori=koleksiyon-eserleri' },
    { name: 'Blog', href: '/blog' },
    { name: 'Hikayemiz', href: '/hakkimizda' },
    { name: 'İletişim', href: '/iletisim' },
  ];

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
              <Link href={user ? (user.role !== 'customer' ? '/admin' : '/profil') : '/giris'} className="p-2 text-amber-100 hover:text-amber-400 transition">
                <User size={20}/>
              </Link>
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

      {/* Mobile menu */}
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
          </div>
        </div>
      )}

      <CartDrawer settings={settings}/>
    </>
  );
}
