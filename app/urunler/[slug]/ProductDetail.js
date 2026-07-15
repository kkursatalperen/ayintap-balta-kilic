'use client';
import { useState, useEffect } from 'react';
import { Star, Truck, Shield, Hammer, Flame, Check, Heart, AlertTriangle } from 'lucide-react';
import { useCart } from '@/lib/store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ProductDetail({ product }) {
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [personalize, setPersonalize] = useState(false);
  const [name, setName] = useState('');
  const [woodenBox, setWoodenBox] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const add = useCart((s) => s.add);
  const router = useRouter();
  const images = product.images?.length ? product.images : [product.image];
  const finalPrice = product.price + (personalize ? (product.personalizationPrice || 250) : 0) + (woodenBox ? (product.woodenBoxPrice || 0) : 0);

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
            <div className="aspect-square bg-[#161616] rounded-lg overflow-hidden border border-amber-500/10">
              <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover"/>
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`w-20 h-20 rounded overflow-hidden border-2 ${i === activeImg ? 'border-amber-500' : 'border-amber-500/20'}`}>
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
              <button onClick={handleAdd} disabled={product.stock < 1} className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-4 rounded font-serif tracking-widest hover:from-amber-400 hover:to-amber-500 transition disabled:opacity-50">
                {product.stock > 0 ? 'SEPETE EKLE' : 'STOKTA YOK'}
              </button>
              <button onClick={toggleFav} className={`p-4 border rounded transition ${isFav ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'}`} title="Favorilere ekle">
                <Heart size={20} fill={isFav ? 'currentColor' : 'none'}/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
