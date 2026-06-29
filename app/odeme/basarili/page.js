import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Mail } from 'lucide-react';

async function getSettings() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const r = await fetch(`${base}/api/settings`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ settings: {} }));
  return r.settings || {};
}

export const metadata = { title: 'Sipariş Alındı', robots: 'noindex' };

export default async function Page({ searchParams }) {
  const s = await getSettings();
  const sp = await searchParams;
  const orderNo = sp.no || '';
  return (
    <>
      <Header settings={s}/>
      <main className="pt-32 pb-20 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-xl w-full text-center">
          <div className="w-20 h-20 mx-auto bg-emerald-500/10 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="text-emerald-400" size={48}/>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-amber-50">Siparişiniz Alındı</h1>
          <p className="mt-4 text-amber-100/70">Teşekkür ederiz. Ustalarımız siparişinizi hazırlamaya başlıyor.</p>
          {orderNo && (
            <div className="mt-6 inline-block bg-[#161616] border border-amber-500/20 rounded-lg px-6 py-4">
              <p className="text-xs text-amber-100/50 tracking-widest">SIPARİŞ NO</p>
              <p className="font-mono text-amber-400 text-xl mt-1">{orderNo}</p>
            </div>
          )}
          <div className="mt-10 grid grid-cols-3 gap-3 text-center">
            <div className="p-4 border border-amber-500/20 rounded"><Mail className="mx-auto text-amber-500 mb-2" size={20}/><p className="text-xs text-amber-100/70">Onay E-postası</p></div>
            <div className="p-4 border border-amber-500/20 rounded"><Package className="mx-auto text-amber-500 mb-2" size={20}/><p className="text-xs text-amber-100/70">Hazırlanıyor</p></div>
            <div className="p-4 border border-amber-500/20 rounded"><Truck className="mx-auto text-amber-500 mb-2" size={20}/><p className="text-xs text-amber-100/70">Kargoda</p></div>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/profil" className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded font-serif tracking-widest">SIPARİŞLERİMİ GÖR</Link>
            <Link href="/urunler" className="border border-amber-500/30 text-amber-100 px-6 py-3 rounded font-serif tracking-widest hover:bg-amber-500/5">ALIŞVERİŞE DEVAM</Link>
          </div>
        </div>
      </main>
      <Footer settings={s}/>
    </>
  );
}
