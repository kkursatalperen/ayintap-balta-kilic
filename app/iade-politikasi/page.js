export const metadata = { title: 'Iade Politikasi | Ayintap Kilic' };
export default function IadePolitikasiPage() {
  return (
    <main className="pt-28 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif text-3xl text-amber-400 mb-2 tracking-wide">İade ve İptal Politikası</h1>
        <p className="text-amber-100/40 text-sm mb-10">Son güncelleme: Temmuz 2025</p>
        <div className="space-y-8 text-amber-100/80 text-sm leading-relaxed">
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">CAYMA HAKKI</h2>
            <p>Teslim tarihinden itibaren 14 gün içinde, herhangi bir neden belirtmeksizin ürünü iade edebilirsiniz. Ürünü kullanmamış ve orijinal ambalajında geri göndermeniz gerekmektedir.</p>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">İADE KABUL EDİLMEYEN DURUMLAR</h2>
            <ul className="list-disc list-inside space-y-2 text-amber-100/70">
              <li>Lazer kazıma, isim veya tarih gibi kişiselleştirme yapılmış ürünler iade edilemez.</li>
              <li>Kullanılmış, yıpranmış veya orijinal ambalajı zarar görmüş ürünler.</li>
              <li>Faturası kayıp olan ürünler.</li>
              <li>14 günlük yasal cayma süresini aşmış talepler.</li>
            </ul>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">İADE SÜRECİ</h2>
            <div className="space-y-4">
              <div className="flex gap-4"><div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-serif text-xs shrink-0 mt-0.5">1</div><div><p className="text-amber-200 font-serif mb-1">Bize Ulaşın</p><p className="text-amber-100/70">info@ayintapkilic.com adresine sipariş numaranızı ve iade nedeninizi bildirin.</p></div></div>
              <div className="flex gap-4"><div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-serif text-xs shrink-0 mt-0.5">2</div><div><p className="text-amber-200 font-serif mb-1">Ürünü Gönderin</p><p className="text-amber-100/70">Onay aldıktan sonra ürünü orijinal ambalajında fatura ile birlikte gönderin. İade kargo ücreti alıcıya aittir.</p></div></div>
              <div className="flex gap-4"><div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-serif text-xs shrink-0 mt-0.5">3</div><div><p className="text-amber-200 font-serif mb-1">İnceleme ve Onay</p><p className="text-amber-100/70">Ürün elimize ulaştıktan sonra 3 iş günü içinde incelenir.</p></div></div>
              <div className="flex gap-4"><div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-serif text-xs shrink-0 mt-0.5">4</div><div><p className="text-amber-200 font-serif mb-1">Para İadesi</p><p className="text-amber-100/70">Onaylanan iadelerde ödeme 7–14 iş günü içinde orijinal ödeme yönteminize yansıtılır.</p></div></div>
            </div>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">HASARLI VEYA YANLIŞ ÜRÜN</h2>
            <p>Teslimatta hasarlı veya yanlış ürün geldiğinde 48 saat içinde info@ayintapkilic.com adresine bildirin. Kargo dahil tüm masraflar tarafımızca karşılanır.</p>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">İLETİŞİM</h2>
            <p>📧 info@ayintapkilic.com</p>
            <p>📞 +90 505 547 94 42</p>
            <p className="text-amber-100/40 text-xs mt-2">Hafta içi 09:00–18:00 saatleri arasında yanıt verilir.</p>
          </div>
        </div>
      </div>
    </main>
  );
}