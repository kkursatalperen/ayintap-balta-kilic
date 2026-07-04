'use client';
import { useCart } from '@/lib/store';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingCart, Shield, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, remove, setQty, total } = useCart();
  const router = useRouter();
  const subtotal = total();
  const shipping = subtotal >= 5000 ? 0 : 89;
  const grandTotal = subtotal + shipping;

  const checkout = () => {
    if (items.length === 0) return;
    router.push('/odeme');
  };

  return (
    <main className="pt-32 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="font-serif text-4xl text-amber-50 mb-10 flex items-center gap-3"><ShoppingCart className="text-amber-500"/> Sepetim</h1>
        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="mx-auto text-amber-500/30 mb-6" size={80}/>
            <h2 className="font-serif text-3xl text-amber-100/60 mb-3">Sepetiniz Boş</h2>
            <p className="text-amber-100/40 max-w-sm mx-auto mb-8">Daha koleksiyonunuzu oluşturmadınız mı? Birbirinden özel el yapımı kılıçlara göz atın.</p>
            <Link href="/urunler" className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-8 py-3 rounded font-serif tracking-widest hover:from-amber-400 hover:to-amber-500 transition">MAĞAZAYA DÖN</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((i) => (
                <div key={i.key} className="flex gap-4 bg-[#161616] border border-amber-500/10 rounded-lg p-4">
                  <img src={i.image} className="w-28 h-28 object-cover rounded"/>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg text-amber-50">{i.name}</h3>
                    {i.personalization && <p className="text-sm text-amber-400 mt-1">Lazer: “{i.personalization}”</p>}
                    <p className="text-amber-100/60 text-sm mt-1">{i.price.toLocaleString('tr-TR')}₺ {i.personalizationPrice > 0 && `+ ${i.personalizationPrice}₺ kişiselleştirme`}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-amber-500/30 rounded">
                        <button onClick={() => setQty(i.key, i.qty - 1)} className="p-2 text-amber-400"><Minus size={14}/></button>
                        <span className="px-4 text-amber-100">{i.qty}</span>
                        <button onClick={() => setQty(i.key, i.qty + 1)} className="p-2 text-amber-400"><Plus size={14}/></button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-serif text-xl text-amber-400">{((i.price + i.personalizationPrice) * i.qty).toLocaleString('tr-TR')}₺</span>
                        <button onClick={() => remove(i.key)} className="text-red-500 hover:text-red-400"><Trash2 size={18}/></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-[#161616] border border-amber-500/20 rounded-lg p-6 sticky top-28">
                <h3 className="font-serif text-2xl text-amber-50 mb-6">Sipariş Özeti</h3>
                <div className="space-y-3 text-amber-100">
                  <div className="flex justify-between"><span>Ara Toplam</span><span>{subtotal.toLocaleString('tr-TR')}₺</span></div>
                  <div className="flex justify-between"><span>Kargo</span><span>{shipping === 0 ? 'Bedava' : shipping + '₺'}</span></div>
                  {shipping > 0 && <p className="text-xs text-amber-400/70">5.000₺ ve üzeri siparişlerde kargo bedava!</p>}
                  <div className="border-t border-amber-500/20 pt-3 flex justify-between font-serif text-2xl">
                    <span>Toplam</span><span className="text-amber-400">{grandTotal.toLocaleString('tr-TR')}₺</span>
                  </div>
                </div>
                <button onClick={checkout} className="w-full mt-6 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-4 rounded font-serif tracking-widest hover:from-amber-400 hover:to-amber-500 transition disabled:opacity-50">
                  ÖDEMEYE GEÇ
                </button>
                <p className="text-xs text-amber-100/40 text-center mt-4">
                  Ödeme alt yapısı iyzico / PayTR için hazırdır. <br/>(Test modu)
                </p>
                <div className="mt-6 grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 border border-amber-500/20 rounded"><Truck className="mx-auto text-amber-500 mb-1" size={18}/><p className="text-[10px] text-amber-100/70">Güvenli Kargo</p></div>
                  <div className="p-3 border border-amber-500/20 rounded"><Shield className="mx-auto text-amber-500 mb-1" size={18}/><p className="text-[10px] text-amber-100/70">3D Secure</p></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
