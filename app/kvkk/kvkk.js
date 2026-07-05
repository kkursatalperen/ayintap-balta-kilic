// app/kvkk/page.jsx

export default function KvkkPage() {
  return (
    <main className="min-h-screen bg-stone-950 text-amber-100/80 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 border-b border-amber-500/20 pb-8">
          <p className="font-serif tracking-widest text-amber-500 text-xs uppercase mb-3">Yasal Belgeler</p>
          <h1 className="font-serif text-3xl md:text-4xl text-amber-100 leading-tight">
            Kişisel Verilerin Korunması
          </h1>
          <p className="mt-2 text-amber-100/60">KVKK Kapsamında Aydınlatma Metni</p>
          <p className="mt-2 text-sm text-amber-100/40">Son güncelleme: Ocak 2025</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">

          <Section title="1. Veri Sorumlusu">
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca kişisel verileriniz;
              veri sorumlusu sıfatıyla <strong className="text-amber-400">Ayıntap Balta Kılıç</strong> tarafından
              aşağıda açıklanan kapsamda işlenmektedir.
            </p>
          </Section>

          <Section title="2. İşlenen Kişisel Veriler">
            <p>Tarafınızdan toplanan kişisel veriler şunlardır:</p>
            <ul className="list-disc list-inside space-y-2 text-amber-100/70 mt-3">
              <li><strong className="text-amber-100/90">Kimlik Bilgileri:</strong> Ad, soyad</li>
              <li><strong className="text-amber-100/90">İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, teslimat adresi</li>
              <li><strong className="text-amber-100/90">Sipariş Bilgileri:</strong> Satın alınan ürünler, sipariş tarihi, ödeme yöntemi (kart bilgileri saklanmaz)</li>
              <li><strong className="text-amber-100/90">Teknik Veriler:</strong> IP adresi, tarayıcı türü, site kullanım istatistikleri (çerezler aracılığıyla)</li>
            </ul>
          </Section>

          <Section title="3. Kişisel Verilerin İşlenme Amaçları">
            <ul className="list-disc list-inside space-y-2 text-amber-100/70">
              <li>Sipariş ve teslimat süreçlerinin yürütülmesi</li>
              <li>Fatura ve muhasebe işlemlerinin gerçekleştirilmesi</li>
              <li>Müşteri hizmetleri ve destek taleplerinin yanıtlanması</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Açık rızanız olması hâlinde kampanya ve yeni ürün bildirimlerinin gönderilmesi</li>
              <li>Site güvenliğinin ve kullanıcı deneyiminin iyileştirilmesi</li>
            </ul>
          </Section>

          <Section title="4. Kişisel Verilerin Aktarılması">
            <p>
              Kişisel verileriniz; sipariş teslimatı amacıyla kargo firmaları, ödeme altyapısı amacıyla
              ödeme hizmet sağlayıcıları ve yasal zorunluluk hâlinde yetkili kamu kurum ve kuruluşları
              ile paylaşılabilir. Üçüncü taraflarla veri paylaşımı, yalnızca hizmetin ifası için gerekli
              olan minimum düzeyde gerçekleştirilir.
            </p>
          </Section>

          <Section title="5. Kişisel Verilerin Saklanma Süresi">
            <p>
              Kişisel verileriniz, işlenme amacının ortadan kalkmasıyla birlikte silinir, yok edilir
              veya anonim hâle getirilir. Sipariş ve fatura kayıtları, vergi mevzuatı gereği
              <strong className="text-amber-400"> 10 yıl</strong> boyunca saklanır.
            </p>
          </Section>

          <Section title="6. KVKK Kapsamındaki Haklarınız">
            <p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc list-inside space-y-2 text-amber-100/70 mt-3">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmiş ise buna ilişkin bilgi talep etme</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri öğrenme</li>
              <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
              <li>KVKK'da öngörülen koşullarda silinmesini veya yok edilmesini isteme</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonuç ortaya çıkmasına itiraz etme</li>
              <li>Kanuna aykırı işleme nedeniyle uğradığınız zararın giderilmesini talep etme</li>
            </ul>
          </Section>

          <Section title="7. Başvuru Yöntemi">
            <p>
              Yukarıda belirtilen haklarınızı kullanmak için kimliğinizi doğrulayan belgelerle birlikte
              aşağıdaki kanallar aracılığıyla bize başvurabilirsiniz:
            </p>
            <ul className="list-disc list-inside space-y-2 text-amber-100/70 mt-3">
              <li><strong className="text-amber-100/90">E-posta:</strong> [info@ayintapilic.com]</li>
              <li><strong className="text-amber-100/90">Posta:</strong> [Şirket Adresi, Gaziantep]</li>
            </ul>
            <p className="mt-3">
              Başvurularınız, niteliğine göre en kısa sürede ve her hâlükârda <strong className="text-amber-400">30 gün içinde</strong> ücretsiz
              olarak sonuçlandırılacaktır.
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