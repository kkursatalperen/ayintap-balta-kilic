import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Phone, Mail, MapPin } from 'lucide-react';

async function getSettings() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const r = await fetch(`${base}/api/settings`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ settings: {} }));
  return r.settings || {};
}

export const metadata = { title: 'İletişim · Ayıntap Balta Kılıç' };

export default async function Page() {
  const s = await getSettings();
  return (
    <>
      <Header settings={s}/>
      <main className="pt-32 pb-20 min-h-screen">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-serif text-5xl text-amber-50 text-center mb-12">İletişim</h1>
          <div className="grid md:grid-cols-3 gap-4">
            <a href={`tel:${(s.contactPhone||'').replace(/\s/g,'')}`} className="bg-[#161616] border border-amber-500/20 hover:border-amber-500 rounded p-6 text-center transition">
              <Phone className="text-amber-500 mx-auto mb-3" size={28}/>
              <p className="text-xs text-amber-100/50 tracking-widest">TELEFON</p>
              <p className="text-amber-100 mt-2">{s.contactPhone}</p>
            </a>
            <a href={`mailto:${s.contactEmail}`} className="bg-[#161616] border border-amber-500/20 hover:border-amber-500 rounded p-6 text-center transition">
              <Mail className="text-amber-500 mx-auto mb-3" size={28}/>
              <p className="text-xs text-amber-100/50 tracking-widest">E-POSTA</p>
              <p className="text-amber-100 mt-2">{s.contactEmail}</p>
            </a>
            <div className="bg-[#161616] border border-amber-500/20 rounded p-6 text-center">
              <MapPin className="text-amber-500 mx-auto mb-3" size={28}/>
              <p className="text-xs text-amber-100/50 tracking-widest">ADRES</p>
              <p className="text-amber-100 mt-2 text-sm">{s.contactAddress}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer settings={s}/>
    </>
  );
}
