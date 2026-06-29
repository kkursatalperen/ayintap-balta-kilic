import { getCollection } from '@/lib/mongodb';

export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const [products, blogs, cats] = await Promise.all([
    getCollection('products').then(c => c.find({ isActive: true }, { projection: { slug: 1, updatedAt: 1, createdAt: 1 } }).toArray()).catch(() => []),
    getCollection('blogs').then(c => c.find({ isPublished: true }, { projection: { slug: 1, updatedAt: 1, createdAt: 1, publishedAt: 1 } }).toArray()).catch(() => []),
    getCollection('categories').then(c => c.find({ isActive: true }, { projection: { slug: 1 } }).toArray()).catch(() => []),
  ]);

  const staticUrls = ['', '/urunler', '/blog', '/hakkimizda', '/iletisim', '/giris', '/kayit'];
  const productUrls = products.map(p => ({ loc: `${base}/urunler/${p.slug}`, lastmod: (p.updatedAt || p.createdAt || new Date()).toString() }));
  const blogUrls = blogs.map(b => ({ loc: `${base}/blog/${b.slug}`, lastmod: (b.publishedAt || b.updatedAt || b.createdAt || new Date()).toString() }));
  const catUrls = cats.map(c => ({ loc: `${base}/urunler?kategori=${c.slug}` }));

  const all = [
    ...staticUrls.map(u => ({ loc: base + u })),
    ...productUrls,
    ...blogUrls,
    ...catUrls,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map(u => `<url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}</url>`).join('\n')}
</urlset>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
