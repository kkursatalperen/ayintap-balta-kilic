'use client';
import { useState, useEffect } from 'react';
import { Star, Truck, Shield, Hammer, Flame, Check, Heart } from 'lucide-react';
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
    if (personalize && !name.trim()) { toast.error('Lütfen yazdırılacak ismi giriniz'); return; }
    add(product, { qty, personalization: personalize ? name.trim() : null, woodenBox: woodenBox ? true : false });
    toast.success('Sepete eklendi');
  };

  return (
    <main className="pt-32 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12">
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
          <div>
            <div className="flex items-center gap-2 mb-4">
              {product.isNew && <span className="bg-amber-500 text-black text-xs font-bold tracking-widest px-2 py-1">YENİ</span>}
              {product.isBestseller && <span className="bg-red-700 text-amber-50 text-xs font-bold tracking-widest px-2 py-1">ÇOK SATAN</span>}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-amber-50">{product.name}</h1>
            <div className="flex items-center gap-2 mt-3">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < Math.round(product.rating) ? 'text-amber-500 fill-amber-500' : 'text-amber-500/20'}/>)}
              <span className="text-amber-100/60 text-sm">({product.reviewCount} değerlendirme)</span>
              <span className="text-amber-100/40 text-sm ml-3">SKU: {product.sku}</span>
            </div>
            <div className="mt-6 flex items-end gap-3">
              {product.oldPrice > 0 && <span className="text-amber-100/40 line-through text-lg">{product.oldPrice.toLocaleString('tr-TR')}₺</span>}
              <span className="font-serif text-4xl text-amber-400">{finalPrice.toLocaleString('tr-TR')}₺</span>
              {product.discount > 0 && <span className="bg-emerald-700 text-amber-50 px-2 py-1 text-xs font-bold">%{product.discount} İNDİRİM</span>}
            </div>
            <p className="mt-6 text-amber-100/70 leading-relaxed text-lg">{product.description}</p>

            {product.woodenBoxPrice > 0 && (
              <div className="mt-6 p-5 border border-amber-500/30 rounded bg-amber-500/5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={woodenBox} onChange={(e) => setWoodenBox(e.target.checked)} className="w-5 h-5 accent-amber-500"/>
                  <div className="flex items-center gap-3 flex-1">
                    {product.woodenBoxImage && (
                      <img src={product.woodenBoxImage} alt="Ahşap Kutu" className="w-16 h-12 object-cover rounded border border-amber-500/20"/>
                    )}
                    <div>
                      <span className="text-amber-100 font-serif">Özel Ahşap Kutu</span>
                      <span className="text-amber-400 font-serif ml-2">(+{(product.woodenBoxPrice || 0).toLocaleString('tr-TR')}₺)</span>
                      <p className="text-xs text-amber-100/50 mt-1">Hediye veya koleksiyon için özel sunum kutusu</p>
                    </div>
                  </div>
                </label>
              </div>
            )}
            {product.personalizable && (
              <div className="mt-6 p-5 border border-amber-500/30 rounded bg-amber-500/5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={personalize} onChange={(e) => setPersonalize(e.target.checked)} className="w-5 h-5 accent-amber-500"/>
                  <span className="text-amber-100 font-serif">Lazerle İsim Yazdır (+{product.personalizationPrice || 250}₺)</span>
                </label>
                {personalize && (
                  <input type="text" maxLength={30} value={name} onChange={(e) => setName(e.target.value)} placeholder="Yazılacak isim" className="mt-3 w-full bg-black/40 border border-amber-500/30 rounded px-4 py-3 text-amber-50 focus:outline-none focus:border-amber-500"/>
                )}
              </div>
            )}

            <div className="mt-8 flex items-center gap-4">
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

            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              <div className="p-4 border border-amber-500/20 rounded"><Truck className="mx-auto text-amber-500 mb-2" size={20}/><p className="text-xs text-amber-100/70">Ücretsiz Kargo</p></div>
              <div className="p-4 border border-amber-500/20 rounded"><Shield className="mx-auto text-amber-500 mb-2" size={20}/><p className="text-xs text-amber-100/70">Güvenli Ödeme</p></div>
              <div className="p-4 border border-amber-500/20 rounded"><Hammer className="mx-auto text-amber-500 mb-2" size={20}/><p className="text-xs text-amber-100/70">El Yapımı</p></div>
            </div>

            <div className="mt-10">
              <h3 className="font-serif text-2xl text-amber-50 mb-4 flex items-center gap-2"><Flame className="text-amber-500" size={20}/> Teknik Özellikler</h3>
              <div className="divide-y divide-amber-500/10 border border-amber-500/20 rounded">
                {Object.entries(product.specs || {}).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-2 px-5 py-3">
                    <span className="text-amber-100/60">{k}</span>
                    <span className="text-amber-100 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
