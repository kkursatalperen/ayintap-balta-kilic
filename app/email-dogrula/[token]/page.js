'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';
import Header from '@/components/Header';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    fetch('/api/auth/verify-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      .then(r => setStatus(r.ok ? 'success' : 'error'));
  }, [token]);
  return (
    <>
      <Header settings={{}}/>
      <main className="pt-32 pb-20 min-h-screen flex items-center justify-center px-6">
        <div className="bg-[#161616] border border-amber-500/20 rounded-lg p-10 max-w-md text-center">
          {status === 'loading' && <p className="text-amber-100/60">Dogrulaniyor...</p>}
          {status === 'success' && (<>
            <CheckCircle className="text-emerald-500 mx-auto mb-4" size={56}/>
            <h1 className="font-serif text-2xl text-amber-50 mb-3">E-posta Dogrulandi</h1>
            <p className="text-amber-100/60">Hesabiniz dogrulandi.</p>
            <Link href="/profil" className="inline-block mt-6 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded font-serif tracking-widest">PROFILIME GIT</Link>
          </>)}
          {status === 'error' && (<>
            <XCircle className="text-red-500 mx-auto mb-4" size={56}/>
            <h1 className="font-serif text-2xl text-amber-50 mb-3">Dogrulama Basarisiz</h1>
            <p className="text-amber-100/60">Gecersiz veya kullanilmis token.</p>
          </>)}
        </div>
      </main>
    </>
  );
}
