import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProductCard } from '@/components/HomepageRenderer';

async function fetchData(searchParams) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const sp = await searchParams;
  const qs = new URLSearchParams();
  if (sp.kategori) qs.set('kategori', sp.kategori);
  if (sp.q) qs.set('q', sp.q);
  const [pr, cats, st] = await Promise.all([
    fetch(`${base}/api/products?${qs}`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ products: [] })),
    fetch(`${base}/api/categories`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ categories: [] })),
    fetch(`${base}/api/settings`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ settings: {} })),
  ]);
  return { products: pr.products || [], categories: cats.categories || [], settings: st.settings || {}, currentCat: sp.kategori };
}

export default async function UrunlerPage({ searchParams }) {
  const { products, categories, settings, currentCat } = await fetchData(searchParams);
  return (
    <>
      <Header settings={settings}/>
      <main className="pt-32 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-amber-500/40"/>
              <span className="text-amber-400 tracking-[0.3em] text-xs font-serif uppercase">Koleksiyon</span>
              <div className="h-px w-12 bg-amber-500/40"/>
            </div>
            <h1 className="font-serif text-5xl text-amber-50">Tüm Eserler</h1>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            <a href="/urunler" className={`px-5 py-2 border text-sm font-serif tracking-wider ${!currentCat ? 'bg-amber-500 text-black border-amber-500' : 'border-amber-500/30 text-amber-100 hover:bg-amber-500/10'}`}>TÜMÜ</a>
            {categories.map((c) => (
              <a key={c.id} href={`/urunler?kategori=${c.slug}`} className={`px-5 py-2 border text-sm font-serif tracking-wider ${currentCat === c.slug ? 'bg-amber-500 text-black border-amber-500' : 'border-amber-500/30 text-amber-100 hover:bg-amber-500/10'}`}>
                {c.name.toUpperCase()}
              </a>
            ))}
          </div>
          {products.length === 0 ? (
            <div className="text-center py-20 text-amber-100/50">Bu kategoride henuz ürün yok.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => <ProductCard key={p.id} product={p}/>)}
            </div>
          )}
        </div>
      </main>
      <Footer settings={settings}/>
    </>
  );
}
