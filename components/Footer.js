'use client';
import Link from 'next/link';
import Logo from './Logo';
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';

export default function Footer({ settings }) {
  const s = settings || {};
  return (
    <footer className="bg-[#0a0a0a] border-t border-amber-500/20 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Logo showText={true}/>
            <p className="mt-6 text-amber-100/60 text-sm leading-relaxed max-w-md">{s.footerAbout || ''}</p>
            <div className="flex items-center gap-4 mt-6">
              {s.social?.instagram && <a href={s.social.instagram} target="_blank" rel="noopener" className="text-amber-100/60 hover:text-amber-400"><Instagram size={20}/></a>}
              {s.social?.facebook && <a href={s.social.facebook} target="_blank" rel="noopener" className="text-amber-100/60 hover:text-amber-400"><Facebook size={20}/></a>}
              {s.social?.youtube && <a href={s.social.youtube} target="_blank" rel="noopener" className="text-amber-100/60 hover:text-amber-400"><Youtube size={20}/></a>}
            </div>
          </div>
          <div>
            <h4 className="font-serif text-amber-400 tracking-widest text-sm uppercase mb-5">Kurumsal</h4>
            <ul className="space-y-3 text-sm text-amber-100/60">
              <li><Link href="/hakkimizda" className="hover:text-amber-400">Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="hover:text-amber-400">İletişim</Link></li>
              <li><Link href="/mesafeli-satis" className="hover:text-amber-400">Mesafeli Satış Sözleşmesi</Link></li>
              <li><Link href="/iade-politikasi" className="hover:text-amber-400">İade Politikası</Link></li>
              <li><Link href="/kvkk" className="hover:text-amber-400">KVKK</Link></li>
              <li><Link href="/gizlilik-politikasi" className="hover:text-amber-400">Gizlilik Politikası</Link></li>
              <li><Link href="/cerez-politikasi" className="hover:text-amber-400">Çerez Politikası</Link></li>
              <li><Link href="/kullanici-sozlesmesi" className="hover:text-amber-400">Kullanıcı Sözleşmesi</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-amber-400 tracking-widest text-sm uppercase mb-5">İletişim</h4>
            <ul className="space-y-3 text-sm text-amber-100/60">
              <li className="flex items-start gap-3"><Phone size={16} className="mt-1 text-amber-500"/> <span>{s.contactPhone}</span></li>
              <li className="flex items-start gap-3"><Mail size={16} className="mt-1 text-amber-500"/> <span>{s.contactEmail}</span></li>
              <li className="flex items-start gap-3"><MapPin size={16} className="mt-1 text-amber-500"/> <span>{s.contactAddress}</span></li>
            </ul>
          </div>
        </div>
        {/* Güven Rozetleri */}
        <div className="mt-12 pt-8 border-t border-amber-500/10">
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/15 rounded-lg px-4 py-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <div>
                <p className="text-amber-50 text-xs font-serif">256-Bit SSL</p>
                <p className="text-amber-100/40 text-[10px]">Güvenli Bağlantı</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/15 rounded-lg px-4 py-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              <div>
                <p className="text-amber-50 text-xs font-serif">Güvenli Ödeme</p>
                <p className="text-amber-100/40 text-[10px]">3D Secure Korumalı</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/15 rounded-lg px-4 py-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              <div>
                <p className="text-amber-50 text-xs font-serif">İade Garantisi</p>
                <p className="text-amber-100/40 text-[10px]">14 Gün İade Hakkı</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/15 rounded-lg px-4 py-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              <div>
                <p className="text-amber-50 text-xs font-serif">Kredi Kartı</p>
                <p className="text-amber-100/40 text-[10px]">Visa / Mastercard</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-amber-100/40">
            <p>© {new Date().getFullYear()} {s.brandName || 'Ayıntap Kılıç'}. Tüm hakları saklıdır.</p>
            <p className="font-serif tracking-wider text-amber-500/60">Örsün Üzerinde Dövülen Miras</p>
          </div>
        </div>
      </div>
      {s.whatsapp && (
        <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noopener" className="fixed bottom-6 right-6 z-40 bg-green-600 hover:bg-green-500 text-white rounded-full p-4 shadow-xl shadow-green-600/30 transition">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        </a>
      )}
    </footer>
  );
}
