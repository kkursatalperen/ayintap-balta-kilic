'use client';
import { useState, useEffect } from 'react';
import { Star, Truck, Shield, Hammer, Flame, Check, Heart, AlertTriangle, X, ZoomIn, ChevronLeft, ChevronRight, ChevronDown, Facebook, Send, ImagePlus, Loader2 } from 'lucide-react';
import { useCart } from '@/lib/store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/HomepageRenderer';

export default function ProductDetail({ product }) {
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [personalize, setPersonalize] = useState(false);
  const [name, setName] = useState('');
  const [woodenBox, setWoodenBox] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '', photos: [] });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const add = useCart((s) => s.add);
  const router = useRouter();
  const images = product.images?.length ? product.images : [product.image];
  const finalPrice = product.price + (personalize ? (product.personalizationPrice || 250) : 0) + (woodenBox ? (product.woodenBoxPrice || 0) : 0);

  const loadReviews = () => {
    fetch(`/api/reviews?productId=${product.id}`).then(r => r.json()).then(d => setReviews(d.reviews || [])).catch(() => {});
  };

  useEffect(() => { loadReviews(); }, [product.id]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/upload/review-photo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl: reader.result }) });
        const d = await res.json();
        if (d.url) setReviewForm(f => ({ ...f, photos: [...f.photos, d.url].slice(0, 6) }));
        else toast.error(d.error || 'Fotoğraf yüklenemedi');
      } catch { toast.error('Fotoğraf yüklenemedi'); }
      setUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const submitReview = async () => {
    if (!authed) { toast.error('Yorum yapmak için giriş yapın'); router.push('/giris'); return; }
    if (!reviewForm.text.trim() || reviewForm.text.trim().length < 5) { toast.error('Lütfen en az birkaç kelimelik bir yorum yazın'); return; }
    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, rating: reviewForm.rating, text: reviewForm.text, photos: reviewForm.photos }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      toast.success('Yorumunuz alındı, onaylandıktan sonra yayınlanacak');
      setReviewForm({ rating: 5, text: '', photos: [] });
    } catch (e) { toast.error(e.message || 'Yorum gönderilemedi'); }
    setReviewSubmitting(false);
  };

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (!product.categoryId) return;
    fetch('/api/products').then(r => r.json()).then(d => {
      const items = (d.products || []).filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);
      setRelatedProducts(items);
    }).catch(() => {});
  }, [product.id, product.categoryId]);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      setAuthed(!!d.user);
      if (d.user) {
        fetch('/api/me/favorites').then(r => r.json()).then(fav => {
          setIsFav((fav.favorites || []).some(p => p.id === product.id));
        });
      }
    });
  }, [product.id]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setActiveImg((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setActiveImg((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [lightboxOpen, images.length]);

  const toggleFav = async () => {
    if (!authed) { toast.error('Favorilere eklemek için giriş yapın'); router.push('/giris'); return; }
    const res = await fetch('/api/me/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: product.id }) });
    const d = await res.json();
    setIsFav(d.added);
    toast.success(d.added ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı');
  };

  const handleAdd = () => {
    if (!ageConfirmed) { toast.error('Devam etmek için 18 yaşından büyük olduğunuzu onaylayınız'); return; }
    if (personalize && !name.trim()) { toast.error('Lütfen yazdırılacak ismi giriniz'); return; }
    add(product, { qty, personalization: personalize ? name.trim() : null, woodenBox: woodenBox ? true : false });
    toast.success('Sepete eklendi');
  };

  return (
    <main className="pt-32 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* SOL: Görseller */}
          <div>
            <button
              onClick={() => setLightboxOpen(true)}
              className="relative aspect-square w-full bg-[#161616] rounded-lg overflow-hidden border border-amber-500/10 group cursor-zoom-in"
            >
              <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition bg-black/60 backdrop-blur-sm rounded-full p-3">
                  <ZoomIn className="text-amber-50" size={22}/>
                </div>
              </div>
            </button>
            {images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`w-20 h-20 rounded overflow-hidden border-2 transition ${i === activeImg ? 'border-amber-500' : 'border-amber-500/20 hover:border-amber-500/50'}`}>
                    <img src={img} className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SAĞ: Bilgi sütunu — tek akış halinde, üst üste kutu yığını yok */}
          <div>
            {/* Başlık bloğu */}
            <div className="flex items-center gap-2 mb-3">
              {product.isNew && <span className="bg-amber-500 text-black text-xs font-bold tracking-widest px-2 py-1">YENİ</span>}
              {product.isBestseller && <span className="bg-red-700 text-amber-50 text-xs font-bold tracking-widest px-2 py-1">ÇOK SATAN</span>}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-amber-50">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={15} className={i < Math.round(product.rating) ? 'text-amber-500 fill-amber-500' : 'text-amber-500/20'}/>)}
              </div>
              <span className="text-amber-100/60">({product.reviewCount} değerlendirme)</span>
              <span className="text-amber-100/30">·</span>
              <span className="text-amber-100/40">SKU: {product.sku}</span>
            </div>

            {/* Fiyat bloğu */}
            <div className="mt-5 flex items-end gap-3">
              {product.oldPrice > 0 && <span className="text-amber-100/40 line-through text-lg">{product.oldPrice.toLocaleString('tr-TR')}₺</span>}
              <span className="font-serif text-4xl text-amber-400">{finalPrice.toLocaleString('tr-TR')}₺</span>
              {product.discount > 0 && <span className="bg-emerald-700 text-amber-50 px-2 py-1 text-xs font-bold rounded">%{product.discount} İNDİRİM</span>}
            </div>
            <p className="mt-1 text-amber-100/40 text-xs">KDV Dahildir</p>

            {/* Açıklama */}
            <p className="mt-5 text-amber-100/70 leading-relaxed">{product.description}</p>

            {/* Teknik Özellikler — açıklamanın hemen altına alındı */}
            {Object.keys(product.specs || {}).length > 0 && (
              <div className="mt-6">
                <h3 className="font-serif text-lg text-amber-400 mb-3 flex items-center gap-2"><Flame className="text-amber-500" size={16}/> Teknik Detaylar</h3>
                <div className="divide-y divide-amber-500/10 border border-amber-500/20 rounded-lg overflow-hidden text-sm">
                  {Object.entries(product.specs || {}).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-2 px-4 py-2.5 odd:bg-amber-500/[0.03]">
                      <span className="text-amber-100/50">{k}</span>
                      <span className="text-amber-100 font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tek satırlık kompakt rozet şeridi (kargo / güvenli ödeme / el yapımı) */}
            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              <div className="p-3 border border-amber-500/20 rounded-lg bg-amber-500/5 flex flex-col items-center gap-1">
                <Truck className="text-amber-500" size={18}/>
                <p className="text-[11px] text-amber-100/80 font-serif leading-tight">Ücretsiz Kargo</p>
              </div>
              <div className="p-3 border border-amber-500/20 rounded-lg bg-amber-500/5 flex flex-col items-center gap-1">
                <Shield className="text-amber-500" size={18}/>
                <p className="text-[11px] text-amber-100/80 font-serif leading-tight">Güvenli Ödeme</p>
              </div>
              <div className="p-3 border border-amber-500/20 rounded-lg bg-amber-500/5 flex flex-col items-center gap-1">
                <Hammer className="text-amber-500" size={18}/>
                <p className="text-[11px] text-amber-100/80 font-serif leading-tight">El Yapımı</p>
              </div>
            </div>

            {/* Ürün niteliği — tek, birleştirilmiş kompakt not (el yapımı + dekoratif/küt bilgisi birlikte) */}
            <div className="mt-3 flex items-start gap-2 text-xs text-amber-100/60 border border-amber-500/15 rounded-lg p-3 bg-amber-500/5">
              <Check className="text-amber-500 shrink-0 mt-0.5" size={13}/>
              <span>
                Sertifikalı Türk çeliğinden <span className="text-amber-300">el yapımı</span> üretilmektedir. Ürünlerimiz{' '}
                <span className="text-amber-300">koleksiyon ve dekoratif amaçlıdır</span>, ağız kısımları küt/kesmeyen şekilde üretilir;
                kesici alet olarak kullanım için tasarlanmamıştır.
              </span>
            </div>

            {/* Kişiselleştirme seçenekleri — kompakt, tek stil */}
            {(product.woodenBoxPrice > 0 || product.personalizable) && (
              <div className="mt-6 space-y-3">
                {product.woodenBoxPrice > 0 && (
                  <div className="p-4 border border-amber-500/30 rounded-lg bg-amber-500/5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={woodenBox} onChange={(e) => setWoodenBox(e.target.checked)} className="w-5 h-5 accent-amber-500"/>
                      <div className="flex items-center gap-3 flex-1">
                        {product.woodenBoxImage && (
                          <img src={product.woodenBoxImage} alt="Ahşap Kutu" className="w-14 h-10 object-cover rounded border border-amber-500/20"/>
                        )}
                        <div>
                          <span className="text-amber-100 font-serif text-sm">Özel Ahşap Kutu</span>
                          <span className="text-amber-400 font-serif ml-2 text-sm">(+{(product.woodenBoxPrice || 0).toLocaleString('tr-TR')}₺)</span>
                        </div>
                      </div>
                    </label>
                  </div>
                )}
                {product.personalizable && (
                  <div className="p-4 border border-amber-500/30 rounded-lg bg-amber-500/5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={personalize} onChange={(e) => setPersonalize(e.target.checked)} className="w-5 h-5 accent-amber-500"/>
                      <span className="text-amber-100 font-serif text-sm">Lazerle İsim Yazdır (+{product.personalizationPrice || 250}₺)</span>
                    </label>
                    {personalize && (
                      <input type="text" maxLength={30} value={name} onChange={(e) => setName(e.target.value)} placeholder="Yazılacak isim" className="mt-3 w-full bg-black/40 border border-amber-500/30 rounded px-4 py-2.5 text-amber-50 text-sm focus:outline-none focus:border-amber-500"/>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 18+ onayı — satın alma butonunun hemen üstünde, gözden kaçmasın */}
            <div className={`mt-6 p-4 border rounded-lg transition-colors ${ageConfirmed ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-amber-500 shrink-0"
                />
                <div className="flex items-start gap-2">
                  <AlertTriangle size={15} className={`shrink-0 mt-0.5 ${ageConfirmed ? 'text-emerald-400' : 'text-red-400'}`}/>
                  <span className="text-sm text-amber-100/80 leading-relaxed">
                    <span className="font-semibold text-amber-100">18 yaşından büyük olduğumu onaylıyorum.</span>
                    {' '}Bu ürünlerin 18 yaşından küçüklere satışı yapılmamaktadır.
                  </span>
                </div>
              </label>
            </div>

            {/* Adet + Sepete ekle */}
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center border border-amber-500/30 rounded">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-amber-400">−</button>
                <span className="px-5 text-amber-100">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-4 py-3 text-amber-400">+</button>
              </div>
              <button onClick={handleAdd} disabled={product.stock < 1} className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-4 rounded font-serif tracking-widest hover:from-amber-400 hover:to-amber-500 hover:scale-[1.02] hover:shadow-[0_8px_30px_-8px_rgba(212,175,55,0.6)] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none">
                {product.stock > 0 ? 'SEPETE EKLE' : 'STOKTA YOK'}
              </button>
              <button onClick={toggleFav} className={`p-4 border rounded transition ${isFav ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'}`} title="Favorilere ekle">
                <Heart size={20} fill={isFav ? 'currentColor' : 'none'}/>
              </button>
            </div>

            {/* Sosyal paylaşım */}
            <div className="mt-5 flex items-center gap-3">
              <span className="text-amber-100/40 text-xs tracking-widest uppercase">Paylaş</span>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-amber-500/20 text-amber-100/60 hover:text-amber-400 hover:border-amber-500/50 transition" title="Facebook'ta paylaş">
                <Facebook size={15}/>
              </a>
              <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-amber-500/20 text-amber-100/60 hover:text-amber-400 hover:border-amber-500/50 transition" title="Telegram'da paylaş">
                <Send size={15}/>
              </a>
              <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(product.name + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-amber-500/20 text-amber-100/60 hover:text-amber-400 hover:border-amber-500/50 transition" title="WhatsApp'ta paylaş">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm5.79 14.12c-.24.68-1.4 1.3-1.93 1.38-.49.08-1.11.11-1.79-.11-.41-.13-.95-.31-1.63-.6-2.87-1.24-4.74-4.15-4.88-4.34-.14-.19-1.17-1.55-1.17-2.96s.73-2.1.99-2.39c.26-.28.56-.35.75-.35s.38 0 .54.01c.18.01.41-.07.64.49.24.58.81 2 .88 2.14.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.16-.29.36-.42.48-.14.13-.28.28-.12.55.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.6-.07.16-.19.68-.79.86-1.06.19-.28.37-.23.62-.14.26.09 1.63.77 1.91.91.28.14.47.21.53.33.07.12.07.68-.17 1.35z"/></svg>
              </a>
            </div>

            {/* Teslimat Detayları accordion */}
            <div className="mt-4 border border-amber-500/15 rounded-lg overflow-hidden">
              <button onClick={() => setDeliveryOpen(!deliveryOpen)} className="w-full flex items-center justify-between px-4 py-3 text-sm text-amber-100 font-serif tracking-wide hover:bg-amber-500/5 transition">
                Teslimat Detayları
                <ChevronDown size={16} className={`text-amber-500 transition-transform ${deliveryOpen ? 'rotate-180' : ''}`}/>
              </button>
              {deliveryOpen && (
                <div className="px-4 pb-4 text-sm text-amber-100/60 leading-relaxed border-t border-amber-500/10 pt-3">
                  Tüm Türkiye'ye ürünlerimiz {product.stock > 0 ? '2-4 iş günü' : 'stok geldiğinde'} içerisinde kargoya verilmektedir.
                  Atölyemizin yoğunluğuna bağlı olarak süre değişiklik gösterebilir; siparişiniz kargoya verildiğinde takip numaranız
                  tarafınıza e-posta ile iletilecektir.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Değerlendirmeler */}
        <div className="mt-20 border-t border-amber-500/10 pt-14">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-10 bg-amber-500/40"/>
            <h2 className="font-serif text-2xl text-amber-50">Müşteri Değerlendirmeleri {reviews.length > 0 && <span className="text-amber-100/40 text-lg">({reviews.length})</span>}</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Yorum listesi */}
            <div className="lg:col-span-2 space-y-5">
              {reviews.length === 0 && (
                <p className="text-amber-100/40 text-sm">Bu ürün için henüz onaylı bir değerlendirme yok. İlk yorumu siz yazın!</p>
              )}
              {reviews.map((r) => (
                <div key={r.id} className="border border-amber-500/10 rounded-lg p-5 bg-black/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif text-amber-100">{r.userName}</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < r.rating ? 'text-amber-500 fill-amber-500' : 'text-amber-500/20'}/>)}
                    </div>
                  </div>
                  <p className="text-amber-100/70 text-sm leading-relaxed">{r.text}</p>
                  {r.photos?.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {r.photos.map((p, i) => (
                        <img key={i} src={p} alt="" className="w-20 h-20 object-cover rounded border border-amber-500/20"/>
                      ))}
                    </div>
                  )}
                  <p className="text-amber-100/30 text-xs mt-3">{new Date(r.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
              ))}
            </div>

            {/* Yorum formu */}
            <div className="border border-amber-500/20 rounded-lg p-6 bg-amber-500/5 h-fit">
              <h3 className="font-serif text-amber-400 text-sm tracking-widest mb-4">DEĞERLENDİRME YAZ</h3>
              {!authed ? (
                <div className="text-sm text-amber-100/60">
                  Yorum yapmak için <button onClick={() => router.push('/giris')} className="text-amber-400 underline">giriş yapmalısınız</button>.
                </div>
              ) : (
                <>
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setReviewForm(f => ({ ...f, rating: n }))}>
                        <Star size={22} className={n <= reviewForm.rating ? 'text-amber-500 fill-amber-500' : 'text-amber-500/20'}/>
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm(f => ({ ...f, text: e.target.value }))}
                    placeholder="Ürün hakkındaki deneyiminizi paylaşın..."
                    rows={4}
                    maxLength={1000}
                    className="w-full bg-black/40 border border-amber-500/30 rounded px-3 py-2.5 text-amber-50 text-sm focus:outline-none focus:border-amber-500 resize-none"
                  />

                  {reviewForm.photos.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {reviewForm.photos.map((p, i) => (
                        <div key={i} className="relative">
                          <img src={p} alt="" className="w-16 h-16 object-cover rounded border border-amber-500/30"/>
                          <button onClick={() => setReviewForm(f => ({ ...f, photos: f.photos.filter((_, j) => j !== i) }))} className="absolute -top-1.5 -right-1.5 bg-black rounded-full p-0.5 border border-amber-500/40">
                            <X size={10} className="text-amber-100"/>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="mt-3 flex items-center gap-2 text-xs text-amber-400 cursor-pointer w-fit">
                    {uploadingPhoto ? <Loader2 size={14} className="animate-spin"/> : <ImagePlus size={14}/>}
                    {uploadingPhoto ? 'Yükleniyor...' : 'Fotoğraf Ekle (opsiyonel)'}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} className="hidden"/>
                  </label>

                  <button onClick={submitReview} disabled={reviewSubmitting} className="mt-4 w-full bg-amber-500 text-black font-bold py-2.5 rounded text-sm font-serif tracking-widest hover:bg-amber-400 transition disabled:opacity-50">
                    {reviewSubmitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-10 bg-amber-500/40"/>
              <h2 className="font-serif text-2xl text-amber-50">İlginizi Çekebilecek Ürünler</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => <ProductCard key={p.id} product={p}/>)}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / Tam ekran görüntüleme */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-5 right-5 text-amber-100/70 hover:text-amber-400 transition p-2">
            <X size={28}/>
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i - 1 + images.length) % images.length); }}
                className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 text-amber-100/70 hover:text-amber-400 transition p-2"
              >
                <ChevronLeft size={32}/>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i + 1) % images.length); }}
                className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 text-amber-100/70 hover:text-amber-400 transition p-2"
              >
                <ChevronRight size={32}/>
              </button>
            </>
          )}
          <img
            src={images[activeImg]}
            alt={product.name}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[92vw] max-h-[85vh] object-contain select-none"
          />
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-amber-100/50 text-sm font-serif tracking-widest">
              {activeImg + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </main>
  );
}