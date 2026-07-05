export const metadata = { title: 'KVKK | Ayintap Kilic' };
export default function KvkkPage() {
  return (
    <main className="pt-28 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif text-3xl text-amber-400 mb-2 tracking-wide">KVKK Aydınlatma Metni</h1>
        <p className="text-amber-100/40 text-sm mb-10">6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında hazırlanmıştır.</p>
        <div className="space-y-8 text-amber-100/80 text-sm leading-relaxed">
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">1. VERİ SORUMLUSU</h2>
            <p>Ünvan: Ayıntap Kılıç</p>
            <p>Adres: Güneş Mahallesi 79012 Sokak No 9 Şahinbey / Gaziantep</p>
            <p>E-posta: info@ayintapkilic.com</p>
            <p>Vergi Dairesi / No: Şahinbey / 9391337177</p>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">2. İŞLENEN KİŞİSEL VERİLER</h2>
            <ul className="list-disc list-inside space-y-2 text-amber-100/70">
              <li>Kimlik verileri: Ad, soyad</li>
              <li>İletişim verileri: E-posta, telefon, teslimat adresi</li>
              <li>Finansal veriler: Sipariş tutarı, ödeme yöntemi (kart bilgileri saklanmaz)</li>
              <li>İşlem verileri: Sipariş geçmişi, teslimat bilgileri</li>
              <li>Teknik veriler: IP adresi, tarayıcı türü, çerez bilgileri</li>
            </ul>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">3. İŞLENME AMAÇLARI</h2>
            <ul className="list-disc list-inside space-y-2 text-amber-100/70">
              <li>Sipariş ve teslimat süreçlerinin yürütülmesi</li>
              <li>Müşteri hizmetleri ve destek süreçlerinin yönetilmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Açık rıza halinde pazarlama ve bilgilendirme iletişimi</li>
            </ul>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">4. VERİLERİN AKTARILMASI</h2>
            <ul className="list-disc list-inside space-y-2 text-amber-100/70">
              <li>Kargo şirketleri: Teslimat amacıyla ad, adres ve telefon bilgisi</li>
              <li>Ödeme altyapısı: Ödeme işlemi için; kart bilgileri tarafımızca saklanmaz</li>
              <li>Yasal merciler: Mahkeme kararı veya yasal zorunluluk halinde</li>
            </ul>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">5. SAKLAMA SÜRESİ</h2>
            <p>Ticari kayıtlar 10 yıl, vergi kayıtları 5 yıl saklanır. Bu süreler sonunda veriler silinir veya anonimleştirilir.</p>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">6. HAKLARINIZ</h2>
            <ul className="list-disc list-inside space-y-2 text-amber-100/70">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
              <li>Silinmesini veya yok edilmesini isteme</li>
              <li>İşlenen veriler aleyhine sonuç doğurması halinde itiraz etme</li>
              <li>Zararın giderilmesini talep etme</li>
            </ul>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-5">
            <h2 className="font-serif text-amber-400 text-base tracking-widest mb-3">7. BAŞVURU YÖNTEMİ</h2>
            <p>Taleplerinizi info@ayintapkilic.com adresine kimliğinizi doğrulayan belgelerle iletebilirsiniz. Başvurular en geç 30 gün içinde yanıtlanır.</p>
          </div>
        </div>
      </div>
    </main>
  );
}