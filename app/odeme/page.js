'use client';
import dynamic from 'next/dynamic';

const CheckoutFlow = dynamic(() => import('./CheckoutFlow'), {
  ssr: false,
  loading: () => (
    <main className="pt-32 min-h-screen flex items-center justify-center text-amber-100/50">
      Yükleniyor...
    </main>
  ),
});

export default function Page() {
  return <CheckoutFlow/>;
}