import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductDetail from './ProductDetail';

async function fetchData(slug) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const [pr, st] = await Promise.all([
    fetch(`${base}/api/products/${slug}`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ product: null })),
    fetch(`${base}/api/settings`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ settings: {} })),
  ]);
  return { product: pr.product, settings: st.settings || {} };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const { product, settings } = await fetchData(slug);
  if (!product) {
    return (
      <>
        <Header settings={settings}/>
        <main className="pt-32 min-h-screen text-center text-amber-100/60"><p className="py-32">Ürün bulunamadı.</p></main>
        <Footer settings={settings}/>
      </>
    );
  }
  return (
    <>
      <Header settings={settings}/>
      <ProductDetail product={product}/>
      <Footer settings={settings}/>
    </>
  );
}
