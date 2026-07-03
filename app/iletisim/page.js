import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from './ContactForm';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

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
      <main className="pt-32 pb-20 min-h-screen bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto px-6">

          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-amber-500/40"/>
              <span className="text-amber-500 tracking-[0.3em] text-xs font-serif uppercase">Bize Ulaşın</span>
              <div className="h-px w-12 bg-amber-500/40"/>
            </div>
            <h1 className="font-serif text-5xl text-amber-50 mb-4">İletişim</h1>
            <p className="text-amber-100/60 max-w-xl mx-auto">Sorularınız, önerileriniz veya destek talepleriniz için bize yazın. En kısa sürede geri döneceğiz.</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-10">

            <div className="lg:col-span-2 space-y-4">
              <a href={`tel:${(s.contactPhone||'').replace(/\s/g,'')}`} className="flex items-start gap-4 bg-[#161616] border border-amber-500/20 hover:border-amber-500/50 rounded-lg p-5 transition group">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition">
                  <Phone className="text-amber-500" size={18}/>
                </div>
                <div>
                  <p className="text-xs text-amber-100/50 tracking-widest font-serif mb-1">TELEFON</p>
                  <p className="text-amber-100">{s.contactPhone || '+90 --- --- -- --'}</p>
                  <p className="text-xs text-amber-100/40 mt-1">Hafta içi 09:00 - 18:00</p>
                </div>
              </a>

              <a href={`mailto:${s.contactEmail}`} className="flex items-start gap-4 bg-[#161616] border border-amber-500/20 hover:border-amber-500/50 rounded-lg p-5 transition group">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition">
                  <Mail className="text-amber-500" size={18}/>
                </div>
                <div>
                  <p className="text-xs text-amber-100/50 tracking-widest font-serif mb-1">E-POSTA</p>
                  <p className="text-amber-100">{s.contactEmail || 'info@ayintapbaltakilic.com'}</p>
                  <p className="text-xs text-amber-100/40 mt-1">Genellikle 24 saat içinde yanıt</p>
                </div>
              </a>

              <div className="flex items-start gap-4 bg-[#161616] border border-amber-500/20 rounded-lg p-5">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                  <MapPin className="text-amber-500" size={18}/>
                </div>
                <div>
                  <p className="text-xs text-amber-100/50 tracking-widest font-serif mb-1">ADRES</p>
                  <p className="text-amber-100 text-sm">{s.contactAddress || 'Gaziantep, Türkiye'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-[#161616] border border-amber-500/20 rounded-lg p-5">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Clock className="text-amber-500" size={18}/>
                </div>
                <div>
                  <p className="text-xs text-amber-100/50 tracking-widest font-serif mb-1">ÇALIŞMA SAATLERİ</p>
                  <p className="text-amber-100 text-sm">Pazartesi – Cumartesi</p>
                  <p className="text-amber-100/60 text-sm">09:00 – 18:00</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <ContactForm />
            </div>

          </div>
        </div>
      </main>
      <Footer settings={s}/>
    </>
  );
}
