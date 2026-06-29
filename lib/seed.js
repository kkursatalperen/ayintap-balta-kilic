import { getCollection } from './mongodb';
import { hashPassword } from './auth';
import { v4 as uuid } from 'uuid';

export async function ensureSeed() {
  const settings = await getCollection('site_settings');
  const existing = await settings.findOne({ key: 'main' });
  if (existing) return { seeded: false };

  // ---- SITE SETTINGS ----
  await settings.insertOne({
    id: uuid(),
    key: 'main',
    brandName: 'Ayıntap Balta Kılıç',
    tagline: 'Çeliğe Can Veren Gelenek',
    contactPhone: '+90 505 547 94 42',
    contactEmail: 'ayintapsword@gmail.com',
    contactAddress: 'Güneş Mahallesi 79012 Sokak No 9 Şahinbey / Gaziantep',
    whatsapp: '905055479442',
    social: {
      instagram: 'https://instagram.com/ayintapbaltakilic',
      facebook: '',
      youtube: '',
      twitter: ''
    },
    seo: {
      title: 'Ayıntap Balta Kılıç | Geleneksel Türk El Yapımı Kılıç ve Balta',
      description: 'Örsün üzerinde dövülen ataların mirası. Geleneksel yöntemlerle üretilen el yapımı kılıç, balta ve koleksiyon eserleri.',
      keywords: 'el yapımı kılıç, balta, türk kılıcı, osmanlı kılıcı, koleksiyon, gaziantep'
    },
    analytics: { googleAnalytics: '', metaPixel: '' },
    maintenanceMode: false,
    footerAbout: 'Ayıntap Balta Kılıç; Anadolu’nun çelik geleneğini örsten günümüze taşıyan, her bir eseri ustalıkla dövülmüş el yapımı silahlar atölyesidir.',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // ---- CATEGORIES ----
  const categories = await getCollection('categories');
  const cats = [
    { name: 'Alp Pusatları', slug: 'alp-pusatlari', order: 1 },
    { name: 'Demir Ocağından', slug: 'demir-ocagindan', order: 2 },
    { name: 'Beylere Özel', slug: 'beylere-ozel', order: 3 },
    { name: 'Koleksiyon Eserleri', slug: 'koleksiyon-eserleri', order: 4 },
    { name: 'Osmanlı Serisi', slug: 'osmanli-serisi', order: 5 },
    { name: 'Göktürk Serisi', slug: 'gokturk-serisi', order: 6 },
    { name: 'Selçuklu Serisi', slug: 'selcuklu-serisi', order: 7 },
  ].map((c) => ({ ...c, id: uuid(), image: '', isActive: true, createdAt: new Date() }));
  await categories.insertMany(cats);
  const bySlug = Object.fromEntries(cats.map(c => [c.slug, c.id]));

  // ---- PRODUCTS ----
  const products = await getCollection('products');
  const imgs = [
    'https://images.unsplash.com/photo-1591533635272-fba881938960?crop=entropy&cs=srgb&fm=jpg&q=85',
    'https://images.unsplash.com/photo-1517747814919-c0c61861b31e?crop=entropy&cs=srgb&fm=jpg&q=85',
    'https://images.unsplash.com/photo-1589728473894-4fb97b4dbb88?crop=entropy&cs=srgb&fm=jpg&q=85',
    'https://images.unsplash.com/photo-1618232527887-99eff712a8bb?crop=entropy&cs=srgb&fm=jpg&q=85',
    'https://images.unsplash.com/photo-1528918652533-dfdb3f368093?crop=entropy&cs=srgb&fm=jpg&q=85',
    'https://images.unsplash.com/photo-1549057123-650030035d85?crop=entropy&cs=srgb&fm=jpg&q=85'
  ];
  const sampleProducts = [
    { name: 'Alparslan Kılıcı', slug: 'alparslan-kilici', categoryId: bySlug['alp-pusatlari'], price: 18500, oldPrice: 22000, image: imgs[0], description: 'Selçuklu Sultanı Alparslan’ın anısına dövülmüş, el işçiliğiyle bilenmiş efsanevi bir kılıç.', sku: 'ABK-001', stock: 7, isFeatured: true, isBestseller: true, specs: { 'Çelik Türü': 'Şam Çeliği', 'Sertlik': '58 HRC', 'Kabza Malzemesi': 'Ceviz + Pirinç', 'Ağırlık': '1.4 kg', 'Uzunluk': '92 cm', 'Üretim Yöntemi': 'El Dövme' } },
    { name: 'Göktürk Savaş Baltası', slug: 'gokturk-savas-baltasi', categoryId: bySlug['gokturk-serisi'], price: 7900, image: imgs[1], description: 'Bozkırın efsanesi Göktürk Alpleri için dövülmüş çift ağızlı savaş baltası.', sku: 'ABK-002', stock: 12, isFeatured: true, specs: { 'Çelik Türü': 'Karbon Çelik', 'Sertlik': '55 HRC', 'Kabza Malzemesi': 'Meşe', 'Ağırlık': '1.1 kg', 'Uzunluk': '62 cm', 'Üretim Yöntemi': 'El Dövme' } },
    { name: 'Osmanlı Pala', slug: 'osmanli-pala', categoryId: bySlug['osmanli-serisi'], price: 14200, image: imgs[2], description: 'Yeniçeri ocağının vazgeçilmezi, kıvrımlı namlusuyla efsane Osmanlı Pala.', sku: 'ABK-003', stock: 9, isFeatured: true, isNew: true, specs: { 'Çelik Türü': 'Damascus', 'Sertlik': '60 HRC', 'Kabza Malzemesi': 'Boynuz', 'Ağırlık': '1.2 kg', 'Uzunluk': '78 cm', 'Üretim Yöntemi': 'Katlamalı Dövme' } },
    { name: 'Bey Hançeri', slug: 'bey-hanceri', categoryId: bySlug['beylere-ozel'], price: 4800, image: imgs[3], description: 'Beylere özel, asalet sembolü el yapımı hançer.', sku: 'ABK-004', stock: 20, isNew: true, specs: { 'Çelik Türü': 'Şam Çeliği', 'Sertlik': '58 HRC', 'Kabza Malzemesi': 'Abanoz', 'Ağırlık': '0.4 kg', 'Uzunluk': '28 cm', 'Üretim Yöntemi': 'El Dövme' } },
    { name: 'Selçuklu Şahin Kılıcı', slug: 'selcuklu-sahin-kilici', categoryId: bySlug['selcuklu-serisi'], price: 21900, image: imgs[4], description: 'Selçuklu Alplerinin gururla taşıdığı, çift başlı kartal motifli özel seri kılıç.', sku: 'ABK-005', stock: 4, isBestseller: true, specs: { 'Çelik Türü': 'Şam Çeliği', 'Sertlik': '60 HRC', 'Kabza Malzemesi': 'Gümüş Kakma + Ceviz', 'Ağırlık': '1.5 kg', 'Uzunluk': '96 cm', 'Üretim Yöntemi': 'Geleneksel Dövme' } },
    { name: 'Demirci Ustası Av Bıçağı', slug: 'demirci-av-bicagi', categoryId: bySlug['demir-ocagindan'], price: 2400, image: imgs[5], description: 'Demir ocağının kor ateşinde dövülmüş, av için ideal el yapımı bıçak.', sku: 'ABK-006', stock: 30, specs: { 'Çelik Türü': '1095 Karbon', 'Sertlik': '58 HRC', 'Kabza Malzemesi': 'Geyik Boynuzu', 'Ağırlık': '0.3 kg', 'Uzunluk': '22 cm', 'Üretim Yöntemi': 'El Dövme' } },
  ].map((p) => ({
    id: uuid(),
    images: [p.image],
    discount: p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0,
    rating: 4.7 + Math.random() * 0.3,
    reviewCount: Math.floor(Math.random() * 40) + 5,
    personalizable: true,
    personalizationPrice: 250,
    isActive: true,
    createdAt: new Date(),
    ...p,
  }));
  await products.insertMany(sampleProducts);

  // ---- HOMEPAGE SECTIONS ----
  const sections = await getCollection('homepage_sections');
  const heroSlides = [
    { title: 'Örsün Üzerinde Dövülen Ataların Mirası', subtitle: 'Her vuruşta bir destan, her çelikte bir hikaye.', image: 'https://images.unsplash.com/photo-1528918652533-dfdb3f368093?crop=entropy&cs=srgb&fm=jpg&q=85', cta: 'Koleksiyonu Keşfet', link: '/urunler' },
    { title: 'Çeliğe Can Veren Gelenek', subtitle: 'Anadolu’nun ateşinde dövülen el yapımı eserler.', image: 'https://images.unsplash.com/photo-1549057123-650030035d85?crop=entropy&cs=srgb&fm=jpg&q=85', cta: 'Hikayemizi Oku', link: '#hikayemiz' },
    { title: 'Alpler İçin Dövülmüş Pusatlar', subtitle: 'Beylere yaraşır, Alplere lâyık.', image: 'https://images.unsplash.com/photo-1511306162219-1c5a469ab86c?crop=entropy&cs=srgb&fm=jpg&q=85', cta: 'Beylere Özel', link: '/urunler?kategori=beylere-ozel' }
  ];
  const sectionDocs = [
    { type: 'hero_slider', order: 1, isActive: true, data: { slides: heroSlides } },
    { type: 'featured_products', order: 2, isActive: true, data: { title: 'Öne Çıkan Eserler', subtitle: 'Ustalarımızın elinden çıkan seçkin parçalar' } },
    { type: 'collections', order: 3, isActive: true, data: { title: 'Koleksiyonlar', subtitle: 'Tarihten süzülen seriler', items: [
      { name: 'Osmanlı Serisi', image: 'https://images.unsplash.com/photo-1589728473894-4fb97b4dbb88?crop=entropy&cs=srgb&fm=jpg&q=85', link: '/urunler?kategori=osmanli-serisi' },
      { name: 'Selçuklu Serisi', image: 'https://images.unsplash.com/photo-1591533635272-fba881938960?crop=entropy&cs=srgb&fm=jpg&q=85', link: '/urunler?kategori=selcuklu-serisi' },
      { name: 'Göktürk Serisi', image: 'https://images.unsplash.com/photo-1517747814919-c0c61861b31e?crop=entropy&cs=srgb&fm=jpg&q=85', link: '/urunler?kategori=gokturk-serisi' },
    ] } },
    { type: 'story', order: 4, isActive: true, data: { title: 'Hikayemiz', subtitle: 'Üç Kuşaklık Demirci Geleneği', content: 'Gaziantep’in eski adıyla Ayıntap topraklarında, dededen toruna aktarılan bir gelenek… Örsümüzün üzerinde dövülen her çelik, atalarımızın kor ateşinden bir miras taşır. Biz yalnızca silah değil; tarih dövüyoruz.', image: 'https://images.unsplash.com/photo-1658762944591-01e617527ffa?crop=entropy&cs=srgb&fm=jpg&q=85', cta: 'Devamını Oku', link: '/hakkimizda' } },
    { type: 'testimonials', order: 5, isActive: true, data: { title: 'Müşterilerimiz Anlatıyor', items: [
      { name: 'Murat K.', text: 'Aldığım Selçuklu Şahin Kılıcı tam bir sanat eseri. Detaylar inanılmaz.', rating: 5 },
      { name: 'Ahmet Y.', text: 'Babama hediye ettim, gözleri doldu. Teşekkürler usta.', rating: 5 },
      { name: 'Emre D.', text: 'Hem kalite hem hız mükemmel. Bey Hançeri çok başarılı.', rating: 5 }
    ] } },
    { type: 'newsletter', order: 6, isActive: true, data: { title: 'Demirci Mektubu', subtitle: 'Yeni koleksiyonlardan ilk siz haberdar olun.' } },
    { type: 'faq', order: 7, isActive: true, data: { title: 'Sıkça Sorulan Sorular', items: [
      { q: 'Ürünler gerçekten el yapımı mı?', a: 'Evet. Her eser ustalarımız tarafından örs üzerinde tek tek dövülerek üretilir.' },
      { q: 'Kargo süresi ne kadardır?', a: 'Stokta olan ürünler 2-3 iş günü, özel siparişler 2-4 hafta içinde gönderilir.' },
      { q: 'İade politikanız nedir?', a: 'Kişiselleştirilmemiş ürünlerde 14 gün içinde koşulsuz iade hakkınız vardır.' },
      { q: 'Lazerle isim yazdırma seçeneği var mı?', a: 'Evet, ürün sayfasında +250₺ ek ücret ile aktif edilebilir.' }
    ] } }
  ].map((s) => ({ id: uuid(), ...s, createdAt: new Date(), updatedAt: new Date() }));
  await sections.insertMany(sectionDocs);

  // ---- BOOTSTRAP ADMIN ----
  const users = await getCollection('users');
  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@ayintap.com';
  const adminPass = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'Ayintap2025!';
  const hash = await hashPassword(adminPass);
  await users.insertOne({
    id: uuid(),
    email: adminEmail,
    name: 'Super Admin',
    passwordHash: hash,
    role: 'super_admin',
    isActive: true,
    createdAt: new Date()
  });

  return { seeded: true, adminEmail, adminPass };
}
