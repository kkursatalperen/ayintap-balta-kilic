export const metadata = { title: 'Kullanıcı Sözleşmesi | Ayintap Kilic' };
export default function KullaniciSozlesmesiPage() {
  return (
    <main className="pt-28 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif text-3xl text-amber-400 mb-2 tracking-wide">Kullanıcı Sözleşmesi</h1>
        <p className="text-amber-100/40 text-sm mb-10">Sitemizi kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.</p>
        <div className="space-y-8 text-amber-100/80 text-sm leading-relaxed">
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">1. TARAFLAR VE KONU</h2>
            <p>İşbu sözleşme, Ayıntap Kılıç ("SİTE") ile siteyi ziyaret eden/üye olan kullanıcı arasında, sitenin kullanım koşullarını belirlemek amacıyla düzenlenmiştir.</p>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">2. ÜRÜNLERİN NİTELİĞİ</h2>
            <p>Sitede satışa sunulan kılıç, balta ve benzeri ürünler <span className="text-amber-400">koleksiyon ve dekoratif amaçlıdır</span>. Ürünlerin ağız kısımları küt/kesmeyen şekilde üretilmektedir ve kesici alet olarak günlük kullanım için tasarlanmamıştır. Kullanıcı, ürünleri yürürlükteki mevzuata (bıçak/kesici alet taşıma ve bulundurmaya ilişkin kanunlar dahil) uygun şekilde kullanmayı, taşımayı ve saklamayı kabul eder; aksi kullanımdan doğacak hukuki sorumluluk kullanıcıya aittir.</p>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">3. ÜYELİK VE HESAP GÜVENLİĞİ</h2>
            <p>Kullanıcı, üyelik sırasında verdiği bilgilerin doğru ve güncel olduğunu, hesap bilgilerinin gizliliğinden kendisinin sorumlu olduğunu kabul eder. 18 yaşından küçük kullanıcılar veli/vasi onayı olmaksızın sipariş veremez.</p>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">4. FİKRİ MÜLKİYET</h2>
            <p>Sitede yer alan tüm görsel, metin, logo ve tasarım öğeleri Ayıntap Kılıç'a aittir; izinsiz kopyalanamaz veya çoğaltılamaz.</p>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">5. SORUMLULUĞUN SINIRLANDIRILMASI</h2>
            <p>SİTE, teknik aksaklıklardan veya mücbir sebeplerden kaynaklanan hizmet kesintilerinden sorumlu tutulamaz. Sipariş ve ödeme süreçlerine ilişkin ayrıntılar <a href="/mesafeli-satis" className="text-amber-400 underline">Mesafeli Satış Sözleşmesi</a>'nde yer almaktadır.</p>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">6. DEĞİŞİKLİKLER</h2>
            <p>SİTE, işbu sözleşme koşullarını dilediği zaman güncelleyebilir; güncel metin her zaman bu sayfada yayınlanır.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
