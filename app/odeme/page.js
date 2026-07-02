import Header from '@/components/Header';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';

const CheckoutFlow = dynamic(() => import('./CheckoutFlow'), { ssr: false });

async function getSettings() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const r = await fetch(`${base}/api/settings`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ settings: {} }));
  return r.settings || {};
}

export const metadata = {
  title: 'Siparişi Tamamla · Ayıntap Balta Kılıç',
  robots: 'noindex, nofollow',
};

export default async function Page() {
  const settings = await getSettings();
  return (
    <>
      <Header settings={settings}/>
      <CheckoutFlow/>
      <Footer settings={settings}/>
    </>
  );
}