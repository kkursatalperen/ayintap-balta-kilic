export const metadata = { title: 'Çerez Politikası | Ayintap Kilic' };
export default function CerezPage() {
  return (
    <main className="pt-28 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif text-3xl text-amber-400 mb-2 tracking-wide">Çerez (Cookie) Politikası</h1>
        <p className="text-amber-100/40 text-sm mb-10">Sitemizde kullanılan çerezler hakkında bilgilendirme.</p>
        <div className="space-y-8 text-amber-100/80 text-sm leading-relaxed">
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">1. ÇEREZ NEDİR</h2>
            <p>Çerezler, ziyaret ettiğiniz internet siteleri tarafından tarayıcınıza kaydedilen küçük metin dosyalarıdır. Sitemizin düzgün çalışması, oturumunuzun sürdürülmesi ve deneyiminizin iyileştirilmesi için kullanılır.</p>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">2. KULLANILAN ÇEREZ TÜRLERİ</h2>
            <ul className="list-disc list-inside space-y-2 text-amber-100/70">
              <li><span className="text-amber-100">Zorunlu çerezler:</span> Oturum açma, sepet bilgisi gibi temel işlevler için gereklidir, devre dışı bırakılamaz.</li>
              <li><span className="text-amber-100">Performans çerezleri:</span> Site kullanımını analiz ederek deneyimi iyileştirmemizi sağlar.</li>
              <li><span className="text-amber-100">Fonksiyonel çerezler:</span> Tercihlerinizi (dil, favori ürünler vb.) hatırlamamıza yardımcı olur.</li>
            </ul>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">3. ÇEREZLERİN YÖNETİMİ</h2>
            <p>Tarayıcınızın ayarlarından çerezleri silebilir veya engelleyebilirsiniz. Ancak zorunlu çerezlerin engellenmesi, sitenin bazı bölümlerinin (sepet, giriş vb.) düzgün çalışmamasına yol açabilir.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
