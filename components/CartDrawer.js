'use client';
import { useCart } from '@/lib/store';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function CartDrawer() {
  const { items, isOpen, close, remove, setQty, total } = useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close}/>
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-[#0d0d0d] border-l border-amber-500/30 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-amber-500/20">
          <h3 className="font-serif text-xl text-amber-400 tracking-wider">Sepetim ({items.length})</h3>
          <button onClick={close} className="text-amber-100 hover:text-amber-400"><X size={22}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 && (
            <div className="text-center py-20 text-amber-100/60">
              <p className="font-serif text-lg">Sepetiniz henuz boş</p>
              <p className="text-sm mt-2">Örsün mirasını keşfedin.</p>
            </div>
          )}
          {items.map((i) => (
            <div key={i.key} className="flex gap-4 border border-amber-500/10 rounded-lg p-3 bg-[#161616]">
              <img src={i.image} alt={i.name} className="w-20 h-20 object-cover rounded"/>
              <div className="flex-1">
                <h4 className="text-amber-100 font-serif text-sm">{i.name}</h4>
                {i.personalization && <p className="text-xs text-amber-400/80 mt-1">Lazer: {i.personalization}</p>}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-amber-500/30 rounded">
                    <button onClick={() => setQty(i.key, i.qty - 1)} className="p-1 text-amber-400"><Minus size={14}/></button>
                    <span className="px-3 text-amber-100 text-sm">{i.qty}</span>
                    <button onClick={() => setQty(i.key, i.qty + 1)} className="p-1 text-amber-400"><Plus size={14}/></button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-semibold text-sm">{((i.price + i.personalizationPrice) * i.qty).toLocaleString('tr-TR')}₺</span>
                    <button onClick={() => remove(i.key)} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="border-t border-amber-500/20 p-6 space-y-3">
            <div className="flex justify-between text-amber-100">
              <span>Ara Toplam</span>
              <span className="font-serif text-amber-400 text-lg">{total().toLocaleString('tr-TR')}₺</span>
            </div>
            <p className="text-xs text-amber-100/50">Kargo ücreti checkout sayfasında hesaplanır.</p>
            <Link href="/sepet" onClick={close} className="block w-full text-center bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-3 rounded font-serif tracking-widest hover:from-amber-400 hover:to-amber-500 transition">
              SEPETİ GÖRÜNTÜLE
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
