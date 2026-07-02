'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CheckoutFlow from './CheckoutFlow';
import { useEffect, useState } from 'react';

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