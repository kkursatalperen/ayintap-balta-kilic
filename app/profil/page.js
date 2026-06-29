import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileApp from './ProfileApp';

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
      <ProfileApp/>
      <Footer settings={settings}/>
    </>
  );
}
