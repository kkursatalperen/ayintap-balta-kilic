import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartPage from './CartView';

async function getSettings() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const r = await fetch(`${base}/api/settings`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ settings: {} }));
  return r.settings || {};
}

export default async function Page() {
  const settings = await getSettings();
  return (
    <>
      <Header settings={settings}/>
      <CartPage/>
      <Footer settings={settings}/>
    </>
  );
}
