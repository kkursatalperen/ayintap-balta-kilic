// app/iade-politikasi/page.jsx

export default function IadePolitikasiPage() {
  return (
    <main className="min-h-screen bg-stone-950 text-amber-100/80 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 border-b border-amber-500/20 pb-8">
          <p className="font-serif tracking-widest text-amber-500 text-xs uppercase mb-3">Yasal Belgeler</p>
          <h1 className="font-serif text-3xl md:text-4xl text-amber-100 leading-tight">
            İade ve İptal Politikası
          </h1>
          <p className="mt-3 text-sm text-amber-100/40">Son güncelleme: Ocak 2025</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">

          <Section title="Cayma Hakkı ve İade Süreci">
            <p>
              6502 sayılı Tüketicinin Korunması Hakkında Kanun gereğince, satın aldığınız ürünü teslim
              tarihinden itibaren <strong className="text-amber-400">14 gün içinde</strong> iade edebilirsiniz.
              Cayma hakkınızı kullanmak için herhangi bir gerekçe sunmanıza gerek yoktur.
            </p>
          </Section>

          <Section title="İade Koşulları">
            <p>İade edilecek ürünlerin aşağıdaki koşulları sağlaması gerekmektedir:</p>
            <ul className="list-disc list-inside space-y-2 text-amber-100/70 mt-3">
              <li>Ürün kullanılmamış, hasarsız ve orijinal ambalajında olmalıdır.</li>
              <li>Ürünle birlikte gelen tüm aksesuarlar ve belgeler (garanti belgesi, fatura vb.) eksiksiz iade edilmelidir.</li>
              <li>Üründe kullanım kaynaklı herhangi bir yıpranma veya hasar bulunmamalıdır.</li>
            </ul>
          </Section>

          <Section title="İade Edilemeyen Ürünler">
            <p>Aşağıdaki durumlarda iade kabul edilmez:</p>
            <ul className="list-disc list-inside space-y-2 text-amber-100/70 mt-3">
              <li>Müşteri isteğiyle özel olarak üretilen veya kişiselleştirilen ürünler (üzerine isim, yazı, gravür vb. yapılanlar).</li>
              <li>Kullanılmış, yıpranmış veya zarar görmüş ürünler.</li>
              <li>14 günlük cayma süresi geçmiş siparişler.</li>
            </ul>
          </Section>

          <Section title="İade Nasıl Başlatılır?">
            <ol className="list-decimal list-inside space-y-3 text-amber-100/70">
              <li>
                <span className="text-amber-100/90">İletişime Geçin:</span> E-posta veya telefon aracılığıyla
                bize ulaşın ve iade talebinizi bildirin. Sipariş numaranızı hazır bulundurun.
              </li>
              <li>
                <span className="text-amber-100/90">Onay Alın:</span> Ekibimiz talebinizi değerlendirerek
                iade onayı ve kargo talimatlarını size iletecektir.
              </li>
              <li>
                <span className="text-amber-100/90">Ürünü Gönderin:</span> Ürünü orijinal ambalajında,
                eksiksiz olarak bildirilen adrese kargolayın. İade kargo ücreti müşteriye aittir.
              </li>
              <li>
                <span className="text-amber-100/90">Para İadesi:</span> Ürün tarafımıza ulaştıktan ve
                kontrolden geçtikten sonra ödemeniz <strong className="text-amber-400">7 iş günü içinde</strong> iade edilir.
              </li>
            </ol>
          </Section>

          <Section title="Hasarlı veya Hatalı Ürünler">
            <p>
              Ürününüz hasarlı veya hatalı geldiyse, teslimat tarihinden itibaren <strong className="text-amber-400">3 gün içinde</strong> bize
              bildirmeniz gerekmektedir. Fotoğraflı bildirim sürecin hızlanmasını sağlar. Bu durumda
              iade kargo ücreti tarafımızca karşılanır ve ürününüz ücretsiz olarak değiştirilir veya
              ödemeniz iade edilir.
            </p>
          </Section>

          <Section title="Para İadesi Yöntemi">
            <p>
              İade tutarı, ödemenizin yapıldığı yöntemle (kredi kartı, banka kartı, havale vb.) iade edilir.
              Kredi kartı iadelerinde bankanızın işlem süresi 3–10 iş günü arasında değişebilir.
            </p>
          </Section>

        </div>
      </div>
    </main>
  );
}

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