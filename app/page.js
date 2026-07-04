import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomepageRenderer from '@/components/HomepageRenderer';
import MediaSection from '@/components/MediaSection';

async function fetchData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  try {
    const [hp, st] = await Promise.all([
      fetch(`${base}/api/homepage`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ sections: [] })),
      fetch(`${base}/api/settings`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ settings: {} })),
    ]);
    return { sections: hp.sections || [], settings: st.settings || {} };
  } catch {
    return { sections: [], settings: {} };
  }
}

export default async function Home() {
  const { sections, settings } = await fetchData();
  return (
    <>
      <Header settings={settings}/>
      <main>
        <HomepageRenderer sections={sections}/>
       <MediaSection/>
      </main>
      <Footer settings={settings}/>
    </>
  );
}
