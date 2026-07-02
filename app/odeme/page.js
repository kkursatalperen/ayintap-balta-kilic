'use client';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';

const CheckoutFlow = dynamic(() => import('./CheckoutFlow'), {
  ssr: false,
  loading: () => (
    <main className="pt-32 min-h-screen flex items-center justify-center text-amber-100/50">
      Yükleniyor...
    </main>
  ),
});

export default function Page() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => setSettings(d.settings || {}))
      .catch(() => {});
  }, []);

  return (
    <>
      <Header settings={settings}/>
      <CheckoutFlow/>
      <Footer settings={settings}/>
    </>
  );
}