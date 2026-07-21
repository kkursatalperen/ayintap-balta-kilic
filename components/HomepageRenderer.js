'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, Star, Flame, Hammer, Shield, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/store';
import { toast } from 'sonner';
import Reveal from './Reveal';

export default function HomepageRenderer({ sections }) {
  return (
    <div className="bg-[#0d0d0d] text-amber-50">
      {sections.map((s) => (
        <SectionRouter key={s.id} section={s}/>
      ))}
    </div>
  );
}

function SectionRouter({ section }) {
  switch (section.type) {
    case 'hero_slider': return <HeroSlider data={section.data}/>;
    case 'featured_products': return <FeaturedProducts data={section.data}/>;
    case 'collections': return <Collections data={section.data}/>;
    case 'story': return <Story data={section.data}/>;
    case 'testimonials': return <Testimonials data={section.data}/>;
    case 'newsletter': return <Newsletter data={section.data}/>;
    case 'faq': return <Faq data={section.data}/>;
    case 'user_photos': return <UserPhotos data={section.data}/>;
    case 'media': return <MediaSection data={section.data}/>;
    default: return null;
  }
}

function HeroSlider({ data }) {
  const slides = data?.slides || [];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);
  if (!slides.length) return null;
  const slide = slides[idx];
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="absolute inset-0">
          <Image
            src={slide.image}
            alt={slide.title || 'Ayıntap Kılıç'}
            fill
            priority={idx === 0}
            sizes="100vw"
            quality={90}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0d0d0d]"/>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"/>
        </motion.div>
      </AnimatePresence>
      <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
        <motion.div key={'text-'+idx} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }} className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-amber-500"/>
            <span className="text-amber-400 tracking-[0.3em] text-xs font-serif uppercase">El Yapımı Miras</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl text-amber-50 leading-tight tracking-tight">{slide.title}</h1>
          <p className="mt-6 text-lg md:text-xl text-amber-100/80 font-light max-w-xl">{slide.subtitle}</p>
          <div className="mt-10 flex gap-4 flex-wrap">
            <Link href={slide.link || '/urunler'} className="btn-amber group bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-8 py-4 rounded font-serif tracking-widest hover:from-amber-400 hover:to-amber-500 transition flex items-center gap-2">
              {slide.cta || 'Keşfet'} <ChevronRight size={18} className="group-hover:translate-x-1 transition"/>
            </Link>
            <Link href="#hikayemiz" className="border-2 border-amber-500/50 text-amber-100 px-8 py-4 rounded font-serif tracking-widest hover:bg-amber-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">HİKAYEMİZ</Link>
          </div>
        </motion.div>
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-3 z-10">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`h-1 transition-all ${i === idx ? 'w-12 bg-amber-500' : 'w-6 bg-amber-500/30'}`}/>
          ))}
        </div>
      )}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between z-10 pointer-events-none">
        <button onClick={() => setIdx((i) => (i - 1 + slides.length) % slides.length)} className="pointer-events-auto p-3 rounded-full bg-black/40 hover:bg-amber-500/20 border border-amber-500/30 text-amber-100"><ChevronLeft size={20}/></button>
        <button onClick={() => setIdx((i) => (i + 1) % slides.length)} className="pointer-events-auto p-3 rounded-full bg-black/40 hover:bg-amber-500/20 border border-amber-500/30 text-amber-100"><ChevronRight size={20}/></button>
      </div>
    </section>
  );
}

export function ProductCard({ product }) {
  const add = useCart((s) => s.add);
  const [isFav, setIsFav] = useState(false);

  const toggleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const me = await fetch('/api/auth/me').then(r => r.json()).catch(() => ({}));
    if (!me.user) { toast.error('Favorilere eklemek için giriş yapın'); return; }
    const res = await fetch('/api/me/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: product.id }) });
    const d = await res.json();
    setIsFav(d.added);
    toast.success(d.added ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı');
  };

  return (
    <motion.div whileHover={{ y: -6 }} className="group relative bg-[#161616] border border-amber-500/10 rounded-lg overflow-hidden transition-shadow duration-500 hover:border-amber-500/40 hover:shadow-[0_20px_50px_-15px_rgba(212,175,55,0.25)]">
      <Link href={`/urunler/${product.slug}`} className="block">
        <div className="aspect-[3/4] overflow-hidden bg-black relative">
          <img src={product.images?.[0] || product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700"/>
          {product.images?.[1] && (
            <img src={product.images[1]} alt={product.name} className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition duration-500 scale-105 group-hover:scale-110"/>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500"/>
        </div>
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && <span className="bg-amber-500 text-black text-[10px] font-bold tracking-widest px-2 py-1">YENİ</span>}
          {product.isBestseller && <span className="bg-red-700 text-amber-50 text-[10px] font-bold tracking-widest px-2 py-1">ÇOK SATAN</span>}
          {product.discount > 0 && <span className="bg-emerald-700 text-amber-50 text-[10px] font-bold tracking-widest px-2 py-1">%{product.discount}</span>}
        </div>
        <button onClick={toggleFav} className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${isFav ? 'bg-red-500/20 text-red-400 opacity-100' : 'bg-black/40 text-amber-100/50 opacity-0 group-hover:opacity-100'}`}>
          <Heart size={16} fill={isFav ? 'currentColor' : 'none'}/>
        </button>
        <div className="p-5">
          <h3 className="font-serif text-amber-50 text-lg group-hover:text-amber-400 transition truncate">{product.name}</h3>
          <div className="flex items-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < Math.round(product.rating || 5) ? 'text-amber-500 fill-amber-500' : 'text-amber-500/20'}/>)}
            <span className="text-xs text-amber-100/50 ml-1">({product.reviewCount || 0})</span>
          </div>
          <div className="mt-3 flex items-end gap-2">
            {product.oldPrice > 0 && <span className="text-sm text-amber-100/40 line-through">{product.oldPrice.toLocaleString('tr-TR')}₺</span>}
            <span className="text-amber-400 font-serif text-xl">{product.price.toLocaleString('tr-TR')}₺</span>
          </div>
        </div>
      </Link>
      <button onClick={() => { add(product); toast.success('Sepete eklendi'); }} className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-3 font-serif tracking-widest translate-y-full group-hover:translate-y-0 transition duration-300">
        SEPETE EKLE
      </button>
    </motion.div>
  );
}

function FeaturedProducts({ data }) {
  const products = data?.products || [];
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <Reveal className="text-center mb-14">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-12 bg-amber-500/40"/>
          <Flame className="text-amber-500" size={20}/>
          <div className="h-px w-12 bg-amber-500/40"/>
        </div>
        <h2 className="font-serif text-4xl md:text-5xl text-amber-50">{data?.title || 'Öne Çıkan Eserler'}</h2>
        <p className="mt-4 text-amber-100/60 max-w-2xl mx-auto">{data?.subtitle || ''}</p>
      </Reveal>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i * 0.07, 0.35)}>
            <ProductCard product={p}/>
          </Reveal>
        ))}
      </div>
      <Reveal className="text-center mt-12">
        <Link href="/urunler" className="inline-flex items-center gap-2 border border-amber-500/40 px-8 py-3 text-amber-100 font-serif tracking-widest hover:bg-amber-500/10 transition">
          TÜM ÜRÜNLERİ GÖR <ChevronRight size={18}/>
        </Link>
      </Reveal>
    </section>
  );
}

function Collections({ data }) {
  return (
    <section className="py-24 px-6 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-14">
          <h2 className="font-serif text-4xl md:text-5xl text-amber-50">{data?.title}</h2>
          <p className="mt-4 text-amber-100/60">{data?.subtitle}</p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {(data?.items || []).map((it, i) => (
            <Reveal key={i} delay={Math.min(i * 0.1, 0.3)}>
              <Link href={it.link} className="group relative h-96 overflow-hidden rounded-lg block">
                <Image
                  src={it.image}
                  alt={it.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  quality={88}
                  className="object-cover group-hover:scale-110 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"/>
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <h3 className="font-serif text-3xl text-amber-50 mb-2">{it.name}</h3>
                  <span className="text-amber-400 font-serif tracking-widest text-sm inline-flex items-center gap-2">KEŞFET <ChevronRight size={14}/></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Story({ data }) {
  return (
    <section id="hikayemiz" className="py-24 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <img src={data?.image} alt={data?.title} className="w-full rounded-lg"/>
          <div className="absolute -bottom-6 -right-6 bg-amber-500 text-black p-6 hidden md:block">
            <Hammer size={40}/>
            <p className="font-serif text-2xl mt-2">Üç Kuşak</p>
            <p className="text-xs tracking-widest">DEMİRCİ GELENEĞİ</p>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-amber-500"/>
            <span className="text-amber-400 tracking-[0.3em] text-xs font-serif uppercase">{data?.subtitle}</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-amber-50 mb-6">{data?.title}</h2>
          <p className="text-amber-100/70 leading-relaxed text-lg">{data?.content}</p>
          {data?.cta && (
            <Link href={data?.link || '/hakkimizda'} className="mt-8 inline-flex items-center gap-2 border border-amber-500/40 px-6 py-3 text-amber-100 font-serif tracking-widest hover:bg-amber-500/10 transition">
              {data.cta} <ChevronRight size={16}/>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ data }) {
  const [realReviews, setRealReviews] = useState(null);

  useEffect(() => {
    fetch('/api/reviews?featured=true').then(r => r.json()).then(d => {
      setRealReviews(d.reviews || []);
    }).catch(() => setRealReviews([]));
  }, []);

  const items = (realReviews && realReviews.length > 0)
    ? realReviews.map(r => ({ name: r.userName, text: r.text, rating: r.rating, photos: r.photos, productName: r.productName }))
    : (data?.items || []);

  return (
    <section className="py-24 px-6 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="font-serif text-4xl md:text-5xl text-amber-50 mb-14">{data?.title}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <div key={i} className="bg-[#161616] border border-amber-500/10 p-8 rounded-lg text-left">
              {t.photos?.[0] && (
                <img src={t.photos[0]} alt="" className="w-full h-40 object-cover rounded mb-4"/>
              )}
              <div className="flex gap-1 mb-4">{[...Array(t.rating)].map((_, i) => <Star key={i} size={16} className="text-amber-500 fill-amber-500"/>)}</div>
              <p className="text-amber-100/80 italic font-serif text-lg leading-relaxed">"{t.text}"</p>
              <p className="mt-6 text-amber-400 tracking-widest text-sm">— {t.name}{t.productName && <span className="text-amber-100/30"> · {t.productName}</span>}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Newsletter({ data }) {
  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-[#161616] to-[#0a0a0a] border border-amber-500/20 rounded-lg p-12">
        <Shield className="text-amber-500 mx-auto mb-4" size={40}/>
        <h2 className="font-serif text-3xl md:text-4xl text-amber-50">{data?.title}</h2>
        <p className="mt-3 text-amber-100/60">{data?.subtitle}</p>
        <form onSubmit={(e) => e.preventDefault()} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input type="email" placeholder="E-posta adresiniz" className="flex-1 bg-black/40 border border-amber-500/30 rounded px-4 py-3 text-amber-50 focus:outline-none focus:border-amber-500"/>
          <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded font-serif tracking-widest hover:from-amber-400 hover:to-amber-500">KAYIT OL</button>
        </form>
      </div>
    </section>
  );
}

function Faq({ data }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-serif text-4xl md:text-5xl text-amber-50 text-center mb-12">{data?.title}</h2>
        <div className="space-y-3">
          {(data?.items || []).map((it, i) => (
            <div key={i} className="border border-amber-500/20 rounded-lg overflow-hidden bg-[#161616]">
              <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full p-5 text-left flex justify-between items-center text-amber-50 font-serif">
                {it.q}
                <ChevronRight className={`text-amber-500 transition ${open === i ? 'rotate-90' : ''}`} size={18}/>
              </button>
              {open === i && <div className="px-5 pb-5 text-amber-100/70">{it.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UserPhotos({ data }) {
  const items = data?.items || [];
  if (!items.length) return null;
  return (
    <section className="py-24 px-6 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-amber-500/40"/>
            <span className="text-amber-400 font-serif text-sm tracking-[0.3em]">MÜŞTERİLERİMİZ</span>
            <div className="h-px w-12 bg-amber-500/40"/>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-amber-50">{data?.title || 'Sizden Gelenler'}</h2>
          <p className="mt-4 text-amber-100/60 max-w-xl mx-auto">{data?.subtitle || 'Ustalıkla üretilen parçalar, onları sahiplenen kişilerle anlam kazanır.'}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <div key={i} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-amber-500/10 group">
              <img src={item.image} alt={item.name || 'Müşteri fotoğrafı'} className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-700"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"/>
              {item.name && (
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition duration-300">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-xs shrink-0">{item.name[0].toUpperCase()}</div>
                    <span className="text-amber-50 text-sm font-serif">{item.name}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {data?.instagramUrl && (
          <div className="text-center mt-10">
            <a href={data.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-amber-500/40 px-8 py-3 text-amber-100 font-serif tracking-widest hover:bg-amber-500/10 transition">
              Topluluğa Göz At
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function MediaSection({ data }) {
  const [playing, setPlaying] = useState(false);
  const youtubeId = (data?.youtubeUrl || 'a-2mcTTl3Hk').split('v=')[1]?.split('&')[0] || 'a-2mcTTl3Hk';
  const videoUrl = data?.videoUrl || 'https://res.cloudinary.com/dd6r2yroe/video/upload/v1783178918/real_beiqhi.mp4';

  return (
    <section className="py-20 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-amber-500/40"/>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
<span className="text-amber-400 font-serif text-sm tracking-[0.3em]">{data?.badge || 'MEDYADA BİZ'}</span>
            <div className="h-px w-12 bg-amber-500/40"/>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-amber-50">{data?.title || 'Haberlerde Ayıntap Kılıç'}</h2>
          <p className="mt-4 text-amber-100/60 max-w-xl mx-auto">{data?.subtitle || ''}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="group">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-amber-500/20 bg-black">
              {!playing ? (
                <div className="relative w-full h-full cursor-pointer" onClick={() => setPlaying(true)}>
                  <img src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`} alt="Haber Videosu" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-300"/>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition duration-300">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-black ml-1" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-xs text-amber-400 font-serif tracking-widest">{data?.youtubeLabel || 'HABER YAYINI'}</span>
                  </div>
                </div>
              ) : (
                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
              )}
            </div>
            <p className="mt-3 text-amber-100/60 text-sm font-serif">{data?.youtubeLabel || 'Televizyon Haber Yayını'}</p>
          </div>
          <div className="group">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-amber-500/20 bg-black">
              <video className="w-full h-full object-cover" controls preload="metadata">
                <source src={videoUrl} type="video/mp4"/>
              </video>
            </div>
            <p className="mt-3 text-amber-100/60 text-sm font-serif">{data?.videoLabel || 'Atölye Tanıtım Videosu'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}