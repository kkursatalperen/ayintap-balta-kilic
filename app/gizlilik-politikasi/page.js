export const metadata = { title: 'Gizlilik Politikası | Ayintap Kilic' };
export default function GizlilikPage() {
  return (
    <main className="pt-28 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif text-3xl text-amber-400 mb-2 tracking-wide">Gizlilik Politikası</h1>
        <p className="text-amber-100/40 text-sm mb-10">Kişisel verilerinizin korunmasına ilişkin genel ilkelerimiz.</p>
        <div className="space-y-8 text-amber-100/80 text-sm leading-relaxed">
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">1. GENEL İLKELER</h2>
            <p>Ayıntap Kılıç olarak, internet sitemizi ziyaret eden ve/veya sitemiz üzerinden alışveriş yapan kullanıcılarımızın gizliliğini korumaya önem veriyoruz. Bu politika, hangi verileri hangi amaçlarla topladığımızı ve nasıl koruduğumuzu açıklar.</p>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">2. TOPLANAN VERİLER</h2>
            <ul className="list-disc list-inside space-y-2 text-amber-100/70">
              <li>Hesap oluştururken paylaşılan ad, e-posta, telefon bilgileri</li>
              <li>Sipariş sırasında girilen teslimat ve fatura adresi</li>
              <li>Site kullanımına ilişkin teknik veriler (IP adresi, tarayıcı bilgisi, çerezler)</li>
              <li>İletişim formu veya destek talepleri yoluyla paylaşılan bilgiler</li>
            </ul>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">3. VERİLERİN KULLANIMI</h2>
            <p>Toplanan veriler; siparişlerin işlenmesi, teslimatın yapılması, müşteri desteğinin sağlanması, yasal yükümlülüklerin yerine getirilmesi ve (açık rızanız halinde) size kampanya/bilgilendirme iletileri gönderilmesi amacıyla kullanılır. Verileriniz üçüncü taraflara pazarlama amacıyla satılmaz.</p>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">4. VERİ GÜVENLİĞİ</h2>
            <p>Sitemiz 256-bit SSL şifreleme ile korunmaktadır. Ödeme işlemleri PayTR gibi lisanslı ve denetimli ödeme kuruluşları üzerinden gerçekleştirilir; kredi/banka kartı bilgileriniz tarafımızca hiçbir şekilde saklanmaz.</p>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">5. HAKLARINIZ</h2>
            <p>6698 sayılı KVKK kapsamındaki haklarınız için <a href="/kvkk" className="text-amber-400 underline">KVKK Aydınlatma Metni</a>'ni inceleyebilir, taleplerinizi info@ayintapkilic.com adresine iletebilirsiniz.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
