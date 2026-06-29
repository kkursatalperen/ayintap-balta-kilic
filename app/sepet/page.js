import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartPage from './CartView';
import Link from 'next/link';

async function getSettings() {
  // Bullet-proof: any failure (network, JSON parse, timeout) returns empty settings.
  // Never throws, so the cart page can never crash because of settings fetch.
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || '';
    if (!base) return {};
    const res = await fetch(`${base}/api/settings`, {
      cache: 'no-store',
      // Avoid hanging the whole route render on a slow upstream.
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return {};
    const data = await res.json().catch(() => ({}));
    return data?.settings || {};
  } catch (e) {
    // Log but never throw — keeps /sepet renderable and history clean.
    console.error('[sepet:getSettings] failed:', e?.message || e);
    return {};
  }
}

export default async function Page() {
  let settings = {};
  try {
    settings = await getSettings();
  } catch {
    settings = {};
  }

  // Defensive: if for any reason CartPage subtree throws on the server,
  // we still want a clean shell instead of a dead history entry.
  try {
    return (
      <>
        <Header settings={settings} />
        <CartPage />
        <Footer settings={settings} />
      </>
    );
  } catch (e) {
    console.error('[sepet:Page] render failed:', e?.message || e);
    return (
      <>
        <Header settings={settings} />
        <CartFallback />
        <Footer settings={settings} />
      </>
    );
  }
}

// Inline safe fallback (server-rendered, no client JS needed).
// Uses native <a href> for HARD navigation — clears Next.js router cache
// and broken history entries that caused the "Connection closed" lockup.
function CartFallback() {
  return (
    <main className="pt-32 pb-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="bg-[#141414] border border-amber-500/20 rounded-lg p-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-amber-500/40 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl text-amber-50 mb-3">Geçici bir sorun oluştu</h1>
          <p className="text-amber-100/70 mb-8 leading-relaxed">
            Sepetiniz yüklenemedi. Bağlantınızı kontrol edip tekrar deneyebilir,
            veya ana sayfaya dönerek alışverişe devam edebilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/"
              className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-8 py-3 rounded font-serif tracking-widest hover:from-amber-400 hover:to-amber-500 transition"
              data-testid="cart-fallback-home-link"
            >
              ANA SAYFAYA DÖN
            </a>
            <a
              href="/sepet"
              className="inline-block border border-amber-500/40 text-amber-100 font-bold px-8 py-3 rounded font-serif tracking-widest hover:border-amber-500 hover:text-amber-50 transition"
              data-testid="cart-fallback-retry-link"
            >
              TEKRAR DENE
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
