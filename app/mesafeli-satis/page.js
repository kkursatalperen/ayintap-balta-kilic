export const metadata = { title: 'Mesafeli Satis Sozlesmesi | Ayintap Kilic' };
export default function MesafeliSatisPage() {
  return (
    <main className="pt-28 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif text-3xl text-amber-400 mb-2 tracking-wide">Mesafeli Satış Sözleşmesi</h1>
        <p className="text-amber-100/40 text-sm mb-10">6502 Sayılı Kanun kapsamında hazırlanmıştır.</p>
        <div className="space-y-8 text-amber-100/80 text-sm leading-relaxed">
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">1. SATICI BİLGİLERİ</h2>
            <p>Ünvanı: Ayıntap Kılıç</p>
            <p>Adresi: Güneş Mahallesi 79012 Sokak No 9 Şahinbey / Gaziantep</p>
            <p>Telefon: +90 505 547 94 42</p>
            <p>E-posta: info@ayintapkilic.com</p>
            <p>Vergi Dairesi / No: Şahinbey / 9391337177</p>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">2. ALICI BİLGİLERİ</h2>
            <p>Alıcı bilgileri, sipariş sırasında sisteme girilen teslimat ve iletişim bilgileriyle belirlenir.</p>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">3. SÖZLEŞME KONUSU ÜRÜN</h2>
            <p>İşbu sözleşme, alıcının ayintapkilic.com adresinden satın aldığı ürün(ler) için geçerlidir. Ürün özellikleri, fiyatı ve adedi sipariş özetinde belirtilmektedir.</p>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">4. GENEL HÜKÜMLER</h2>
            <ul className="list-disc list-inside space-y-2 text-amber-100/70">
              <li>Alıcı, ürünün temel niteliklerini, satış fiyatını ve ödeme şeklini okuyup bilgi sahibi olduğunu kabul eder.</li>
              <li>Sözleşme konusu ürün, sipariş verilmesinden itibaren en geç 30 gün içinde teslim edilir.</li>
              <li>Satıcı, stok tükenmesi veya mücbir sebep durumunda alıcıyı bilgilendirerek ödemeyi iade eder.</li>
            </ul>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">5. CAYMA HAKKI</h2>
            <p>Alıcı, teslimattan itibaren 14 gün içinde herhangi bir gerekçe göstermeksizin sözleşmeden cayma hakkına sahiptir. Cayma bildirimi info@ayintapkilic.com adresine iletilmelidir.</p>
            <p className="mt-2 text-amber-100/50 text-xs">Not: Kişiye özel lazer kazıma veya kişiselleştirme yapılan ürünler cayma hakkı kapsamı dışındadır.</p>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">6. ÖDEME VE TESLİMAT</h2>
            <ul className="list-disc list-inside space-y-2 text-amber-100/70">
              <li>Ödeme, sipariş anında kredi/banka kartı veya havale/EFT ile gerçekleştirilir.</li>
              <li>Teslimat kargo şirketi aracılığıyla yapılır; kargo bedeli sipariş özetinde gösterilir.</li>
              <li>Hasarlı veya eksik ürün tesliminde alıcı tutanak tutarak kargo görevlisine imzalatmalıdır.</li>
            </ul>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">7. UYUŞMAZLIK ÇÖZÜMÜ</h2>
            <p>Uyuşmazlıklarda Gaziantep Tüketici Hakem Heyeti veya Tüketici Mahkemeleri yetkilidir.</p>
          </div>
        </div>
      </div>
    </main>
  );
}