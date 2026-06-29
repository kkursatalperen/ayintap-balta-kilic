import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Phone, Mail, MapPin, Hammer } from 'lucide-react';

async function getSettings() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const r = await fetch(`${base}/api/settings`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ settings: {} }));
  return r.settings || {};
}

export const metadata = {
  title: 'Hakkımızda · Ayıntap Balta Kılıç',
  description: 'Ayıntap Balta Kılıç’ın üç kuşaklık demirci geleneği ve atölyemizin hikâyesi.',
};

export default async function Page() {
  const s = await getSettings();
  return (
    <>
      <Header settings={s}/>
      <main className="pt-32 pb-20 min-h-screen">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <Hammer className="text-amber-500 mx-auto mb-4" size={48}/>
            <h1 className="font-serif text-5xl text-amber-50">Hikayemiz</h1>
            <p className="mt-4 text-amber-100/60">Örsün üzerinde dövülen miras</p>
          </div>
          <div className="prose prose-invert max-w-none text-amber-100/80 leading-relaxed font-serif text-lg whitespace-pre-wrap">
            {s.footerAbout}
            {'\n\n'}
            Gaziantep’in eski adıyla Ayıntap topraklarında, dededen toruna aktarılan bir gelenek… Örsümüzün üzerinde dövülen her çelik, atalarımızın kor ateşinden bir miras taşır. Biz yalnızca silah değil; tarih dövüyoruz.
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            <div className="bg-[#161616] border border-amber-500/20 rounded p-5 flex items-start gap-3"><Phone className="text-amber-500 mt-1" size={18}/><div><p className="text-xs text-amber-100/50 tracking-widest">TELEFON</p><p className="text-amber-100 mt-1">{s.contactPhone}</p></div></div>
            <div className="bg-[#161616] border border-amber-500/20 rounded p-5 flex items-start gap-3"><Mail className="text-amber-500 mt-1" size={18}/><div><p className="text-xs text-amber-100/50 tracking-widest">E-POSTA</p><p className="text-amber-100 mt-1">{s.contactEmail}</p></div></div>
            <div className="bg-[#161616] border border-amber-500/20 rounded p-5 flex items-start gap-3"><MapPin className="text-amber-500 mt-1" size={18}/><div><p className="text-xs text-amber-100/50 tracking-widest">ADRES</p><p className="text-amber-100 mt-1">{s.contactAddress}</p></div></div>
          </div>
        </div>
      </main>
      <Footer settings={s}/>
    </>
  );
}
