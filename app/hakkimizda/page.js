import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Phone, Mail, MapPin, Hammer, Flame, Shield, Award, Users } from 'lucide-react';

async function getSettings() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const r = await fetch(`${base}/api/settings`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ settings: {} }));
  return r.settings || {};
}

export const metadata = {
  title: 'Hikayemiz · Ayıntap Balta Kılıç',
  description: 'Ayıntap Balta Kılıç\'ın üç kuşaklık demirci geleneği ve atölyemizin hikayesi.',
};

export default async function Page() {
  const s = await getSettings();
  return (
    <>
      <Header settings={s}/>
      <main className="min-h-screen">

        {/* Hero Bölümü */}
        <div className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=srgb&fm=jpg&q=85"
            alt="Demirci Atölyesi"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0d0d0d]"/>
          <div className="relative z-10 text-center px-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-amber-500"/>
              <span className="text-amber-400 font-serif text-sm tracking-[0.3em]">EL YAPIMI MİRAS</span>
              <div className="h-px w-12 bg-amber-500"/>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl text-amber-50">Hikayemiz</h1>
            <p className="mt-4 text-amber-100/70 text-lg font-serif">Örsün üzerinde dövülen ataların mirası</p>
          </div>
        </div>

        {/* Ana Hikaye */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="font-serif text-3xl text-amber-400 mb-6">Gaziantep'ten Dünyaya</h2>
              <div className="space-y-4 text-amber-100/80 leading-relaxed font-serif text-lg">
                <p>
                  Gaziantep'in eski adıyla Ayıntap topraklarında, dededen toruna aktarılan bir gelenek...
                  Örsümüzün üzerinde dövülen her çelik, atalarımızın kor ateşinden bir miras taşır.
                </p>
                <p>
                  Biz yalnızca silah değil; tarih dövüyoruz. Her kılıcın içinde bir destan,
                  her baltanın sapında nesillerin teri ve emeği saklıdır.
                </p>
                <p>
                  {s.footerAbout || 'Geleneksel Türk demircilik sanatını yaşatmak ve dünyaya tanıtmak için çalışıyoruz. Her eserimiz el yapımı, her biri benzersiz.'}
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1566454544259-f4b94c3d758c?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Kılıç yapımı"
                className="w-full h-80 object-cover rounded-lg border border-amber-500/20"
              />
              <div className="absolute -bottom-4 -right-4 bg-amber-500 text-black p-4 rounded font-serif text-center">
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs tracking-widest">KUŞAK</p>
              </div>
            </div>
          </div>

          {/* Değerlerimiz */}
          <div className="mb-20">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl text-amber-50">Değerlerimiz</h2>
              <div className="h-px w-24 bg-amber-500 mx-auto mt-4"/>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: Hammer, title: 'El Yapımı', desc: 'Her eser ustanın elleriyle, geleneksel yöntemlerle üretilir.' },
                { icon: Flame, title: 'Gerçek Çelik', desc: 'Sertifikalı Türk çeliği, yüksek sertlik ve dayanıklılık.' },
                { icon: Shield, title: 'Kalite Garantisi', desc: 'Her ürün titizlikle denetlenir, kusursuz teslim edilir.' },
                { icon: Award, title: 'Üç Kuşak', desc: 'Dededen toruna aktarılan demircilik bilgisi ve ustalığı.' },
              ].map((item, i) => (
                <div key={i} className="bg-[#161616] border border-amber-500/10 rounded-lg p-6 text-center hover:border-amber-500/40 transition">
                  <item.icon className="text-amber-500 mx-auto mb-3" size={32}/>
                  <h3 className="font-serif text-amber-100 mb-2">{item.title}</h3>
                  <p className="text-amber-100/60 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* İkinci Görsel Bölümü */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative order-2 md:order-1">
              <img
                src="https://images.unsplash.com/photo-1528918652533-dfdb3f368093?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Kılıç koleksiyonu"
                className="w-full h-80 object-cover rounded-lg border border-amber-500/20"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="font-serif text-3xl text-amber-400 mb-6">Atölyemiz</h2>
              <div className="space-y-4 text-amber-100/80 leading-relaxed font-serif text-lg">
                <p>
                  Gaziantep'in kalbinde, geleneksel bir atölyede çalışıyoruz. Modern teknoloji ile
                  geleneksel ustalığı birleştirerek, her müşterimize özel eserler üretiyoruz.
                </p>
                <p>
                  Lazer kazıma teknolojimizle kılıçlarınıza isim, tarih veya özel mesajlar
                  yazdırabilirsiniz. Her kılıç, sipariş verenin ruhunu taşır.
                </p>
              </div>
            </div>
          </div>

          {/* İstatistikler */}
          <div className="bg-[#161616] border border-amber-500/20 rounded-lg p-8 mb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '500+', label: 'Mutlu Müşteri' },
                { value: '3', label: 'Kuşak Deneyim' },
                { value: '50+', label: 'Farklı Model' },
                { value: '100%', label: 'El Yapımı' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="font-serif text-4xl text-amber-400">{stat.value}</p>
                  <p className="text-amber-100/60 text-sm mt-1 tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* İletişim */}
          <div>
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl text-amber-50">Bize Ulaşın</h2>
              <div className="h-px w-24 bg-amber-500 mx-auto mt-4"/>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[#161616] border border-amber-500/20 rounded p-5 flex items-start gap-3">
                <Phone className="text-amber-500 mt-1 shrink-0" size={18}/>
                <div>
                  <p className="text-xs text-amber-100/50 tracking-widest">TELEFON</p>
                  <p className="text-amber-100 mt-1">{s.contactPhone || 'Bilgi için iletişime geçin'}</p>
                </div>
              </div>
              <div className="bg-[#161616] border border-amber-500/20 rounded p-5 flex items-start gap-3">
                <Mail className="text-amber-500 mt-1 shrink-0" size={18}/>
                <div>
                  <p className="text-xs text-amber-100/50 tracking-widest">E-POSTA</p>
                  <p className="text-amber-100 mt-1">{s.contactEmail || 'info@ayintapbaltakilic.com'}</p>
                </div>
              </div>
              <div className="bg-[#161616] border border-amber-500/20 rounded p-5 flex items-start gap-3">
                <MapPin className="text-amber-500 mt-1 shrink-0" size={18}/>
                <div>
                  <p className="text-xs text-amber-100/50 tracking-widest">ADRES</p>
                  <p className="text-amber-100 mt-1">{s.contactAddress || 'Gaziantep, Türkiye'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer settings={s}/>
    </>
  );
}