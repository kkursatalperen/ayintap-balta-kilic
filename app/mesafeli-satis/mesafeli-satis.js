// app/mesafeli-satis/page.jsx  (veya pages/mesafeli-satis.jsx)
// Tasarım: mevcut amber/koyu tema ile uyumlu

export default function MesafeliSatisPage() {
  return (
    <main className="min-h-screen bg-stone-950 text-amber-100/80 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Başlık */}
        <div className="mb-12 border-b border-amber-500/20 pb-8">
          <p className="font-serif tracking-widest text-amber-500 text-xs uppercase mb-3">Yasal Belgeler</p>
          <h1 className="font-serif text-3xl md:text-4xl text-amber-100 leading-tight">
            Mesafeli Satış Sözleşmesi
          </h1>
          <p className="mt-3 text-sm text-amber-100/40">Son güncelleme: Ocak 2025</p>
        </div>

        {/* İçerik */}
        <div className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed">

          <Section title="1. Taraflar">
            <p><strong className="text-amber-400">SATICI:</strong></p>
            <p>
              Unvan: Ayıntap Kılıç<br />
              Adres: [Güneş Mahallesi 79012 Sokak No 9 Şahinbey / Gaziantep, Gaziantep]<br />
              Telefon: [+90 505 547 94 42]<br />
              E-posta: [info@ayintapkilic.com]<br />
              Vergi Dairesi / No: [Şahinbey] / [9391337177]
            </p>
            <p className="mt-4"><strong className="text-amber-400">ALICI:</strong></p>
            <p>
              Sipariş sırasında girilen ad, soyad, adres ve iletişim bilgileri geçerlidir.
            </p>
          </Section>

          <Section title="2. Sözleşmenin Konusu">
            <p>
              İşbu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği
              hükümleri çerçevesinde, ALICI'nın SATICI'ya ait internet sitesi üzerinden elektronik ortamda
              siparişini verdiği ürünlerin satışı ve teslimi ile ilgili olarak tarafların hak ve yükümlülüklerini
              kapsamaktadır.
            </p>
          </Section>

          <Section title="3. Sözleşme Konusu Ürün(ler)">
            <p>
              Ürünlerin cinsi, miktarı, marka/modeli, rengi, adedi ve satış bedeli ALICI tarafından onaylanan
              sipariş formunda belirtilmiş olup bu bilgiler sözleşmenin ayrılmaz parçasını oluşturmaktadır.
              Tüm fiyatlara KDV dahildir.
            </p>
          </Section>

          <Section title="4. Genel Hükümler">
            <ul className="list-disc list-inside space-y-2 text-amber-100/70">
              <li>ALICI, sipariş vermeden önce ürün özelliklerini ve bedelini onaylamış sayılır.</li>
              <li>Ödeme işlemi tamamlandıktan sonra sipariş kesinleşir; SATICI siparişi en kısa sürede hazırlayarak kargo sürecine alır.</li>
              <li>SATICI, sipariş konusu ürün veya hizmetin yerine getirilmesinin imkânsızlaşması hâlinde bu durumu derhal ALICI'ya bildirir ve varsa ödemeyi iade eder.</li>
              <li>Ürünlerin teslim süresi, siparişin alınmasından itibaren en fazla 30 (otuz) iş günüdür.</li>
              <li>ALICI, teslimat adresinin doğruluğundan sorumludur. Yanlış adres nedeniyle oluşan gecikmeler SATICI'nın sorumluluğunda değildir.</li>
            </ul>
          </Section>

          <Section title="5. Cayma Hakkı">
            <p>
              ALICI, teslim tarihinden itibaren <strong className="text-amber-400">14 (on dört) gün</strong> içinde
              herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.
              Cayma hakkının kullanımı için SATICI ile iletişime geçilmesi yeterlidir.
            </p>
            <p className="mt-3">
              Cayma hakkı kapsamı dışında kalan ürünler (6502 sayılı Kanun md. 15):
            </p>
            <ul className="list-disc list-inside space-y-2 text-amber-100/70 mt-2">
              <li>ALICI'nın isteği doğrultusunda özel olarak üretilen veya kişiselleştirilen ürünler.</li>
              <li>Ambalajı açılmış, kullanılmış veya hijyen açısından iade edilmesi uygun olmayan ürünler.</li>
            </ul>
          </Section>

          <Section title="6. Ödeme ve Gizlilik">
            <p>
              Ödeme bilgileri (kart numarası vb.) SATICI'nın sistemlerinde tutulmaz; ödeme altyapısı SSL
              şifreleme ile güvence altında çalışır. Kredi kartı bilgileri yalnızca ödeme altyapı sağlayıcısı
              ile paylaşılır.
            </p>
          </Section>

          <Section title="7. Uyuşmazlık Çözümü">
            <p>
              İşbu sözleşmeden doğan uyuşmazlıklarda, T.C. Gümrük ve Ticaret Bakanlığı tarafından belirlenen
              parasal sınırlar dahilinde ALICI'nın bulunduğu veya ürünün satın alındığı yerdeki İl veya İlçe
              Tüketici Hakem Heyetleri yetkilidir. Söz konusu sınırın üzerindeki uyuşmazlıklarda Tüketici
              Mahkemeleri yetkilidir.
            </p>
          </Section>

        </div>
      </div>
    </main>
  );
}

// Yardımcı bileşen
function Section({ title, children }) {
  return (
    <div>
      <h2 className="font-serif text-amber-400 text-base uppercase tracking-wider mb-3 pb-2 border-b border-amber-500/10">
        {title}
      </h2>
      <div className="text-amber-100/70 space-y-3">
        {children}
      </div>
    </div>
  );
}