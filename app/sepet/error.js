'use client';

// Next.js 15 error boundary convention for /sepet route.
// When ANY client-side error happens (e.g. "Connection closed",
// hydration mismatch, store crash), Next.js renders this component
// instead of a blank white screen.
//
// Why <a href> instead of <Link>?
// -------------------------------
// Next.js <Link> performs SOFT navigation and keeps the router cache
// + history stack intact — which is exactly what gets corrupted when
// a streaming/SSR error happens. We need a HARD navigation
// (full document reload) to fully reset the router state, the cache,
// and the broken history entry. That's what a plain <a href> does.

import { useEffect } from 'react';

export default function CartError({ error, reset }) {
  useEffect(() => {
    // Optional: report to monitoring service.
    console.error('[sepet/error.js] caught:', error?.message || error);
  }, [error]);

  return (
    <main className="pt-32 pb-20 min-h-screen bg-[#0b0b0b]">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="bg-[#141414] border border-amber-500/20 rounded-lg p-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-amber-500/40 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d4af37"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h1
            className="font-serif text-3xl text-amber-50 mb-3"
            data-testid="cart-error-title"
          >
            Bağlantıda Bir Sorun Oluştu
          </h1>
          <p className="text-amber-100/70 mb-2 leading-relaxed">
            Sepetiniz şu anda yüklenemedi. Endişelenmeyin —
            <strong className="text-amber-100"> ürünleriniz güvende </strong>
            ve siz sayfayı yenilediğinizde tekrar görünecek.
          </p>
          <p className="text-amber-100/50 text-sm mb-8">
            Lütfen aşağıdaki seçeneklerden biriyle devam edin.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {/* HARD navigation — resets router stack & cache */}
            <a
              href="/"
              className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-8 py-3 rounded font-serif tracking-widest hover:from-amber-400 hover:to-amber-500 transition"
              data-testid="cart-error-home-link"
            >
              ANA SAYFAYA DÖN
            </a>

            {/* Soft retry first; if that's broken too, the user hits Home. */}
            <button
              type="button"
              onClick={() => {
                try {
                  reset?.();
                } catch {
                  // If reset itself errors, fall back to hard reload.
                  if (typeof window !== 'undefined') window.location.href = '/sepet';
                }
              }}
              className="inline-block border border-amber-500/40 text-amber-100 font-bold px-8 py-3 rounded font-serif tracking-widest hover:border-amber-500 hover:text-amber-50 transition"
              data-testid="cart-error-retry-button"
            >
              TEKRAR DENE
            </button>

            <a
              href="/urunler"
              className="inline-block border border-amber-500/20 text-amber-100/80 font-bold px-8 py-3 rounded font-serif tracking-widest hover:border-amber-500/60 hover:text-amber-50 transition"
              data-testid="cart-error-products-link"
            >
              ÜRÜNLERİ İNCELE
            </a>
          </div>

          {process.env.NODE_ENV !== 'production' && error?.message ? (
            <pre className="mt-8 text-left text-xs text-amber-100/40 bg-black/40 border border-amber-500/10 rounded p-3 overflow-auto">
              {String(error.message)}
            </pre>
          ) : null}
        </div>

        <p className="text-amber-100/40 text-xs mt-6">
          Ayıntap Balta Kılıç · Profesyonel Ustalık, Güvenli Alışveriş
        </p>
      </div>
    </main>
  );
}
