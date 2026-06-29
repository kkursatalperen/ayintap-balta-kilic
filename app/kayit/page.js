import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthForm from '../giris/AuthForm';

async function getSettings() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const r = await fetch(`${base}/api/settings`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ settings: {} }));
  return r.settings || {};
}

export default async function RegisterPage() {
  const settings = await getSettings();
  return (
    <>
      <Header settings={settings}/>
      <main className="pt-32 pb-20 min-h-screen flex items-center justify-center px-6">
        <AuthForm mode="register"/>
      </main>
      <Footer settings={settings}/>
    </>
  );
}
