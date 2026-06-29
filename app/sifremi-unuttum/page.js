'use client';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';
import Header from '@/components/Header';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    if (res.ok) { setDone(true); toast.success('Eposta gonderildi (mock - konsola bakin)'); }
    setLoading(false);
  };
  return (
    <>
      <Header settings={{}}/>
      <main className="pt-32 pb-20 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-[#161616] border border-amber-500/20 rounded-lg p-8">
            <div className="text-center mb-6">
              <Shield className="text-amber-500 mx-auto mb-3" size={36}/>
              <h1 className="font-serif text-2xl text-amber-50">Sifremi Unuttum</h1>
              <p className="text-amber-100/50 text-sm mt-2">E-posta adresinizi girin, sifre sifirlama baglantisi gonderelim.</p>
            </div>
            {done ? (
              <div className="text-center text-amber-100/80">
                <p>Eger bu e-posta kayitliysa, sifre sifirlama baglantisi gonderildi.</p>
                <p className="text-xs text-amber-100/40 mt-3">(Mock modunda: server konsoluna yazildi)</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta" className="w-full bg-black/40 border border-amber-500/30 rounded px-4 py-3 text-amber-50 focus:outline-none focus:border-amber-500"/>
                <button disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-3 rounded font-serif tracking-widest">
                  {loading ? 'GONDERILIYOR...' : 'BAGLANTI GONDER'}
                </button>
              </form>
            )}
            <Link href="/giris" className="block text-center mt-6 text-amber-400 text-sm hover:underline">Girise don</Link>
          </div>
        </div>
      </main>
    </>
  );
}
