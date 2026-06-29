'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import Header from '@/components/Header';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Sifreler eslesmiyor'); return; }
    if (form.password.length < 6) { toast.error('Min 6 karakter'); return; }
    setLoading(true);
    const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password: form.password }) });
    const d = await res.json();
    if (res.ok) { toast.success('Sifre sifirlandi. Giris yapabilirsiniz.'); setTimeout(() => router.push('/giris'), 1000); }
    else toast.error(d.error);
    setLoading(false);
  };
  return (
    <>
      <Header settings={{}}/>
      <main className="pt-32 pb-20 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-[#161616] border border-amber-500/20 rounded-lg p-8">
            <div className="text-center mb-6">
              <Lock className="text-amber-500 mx-auto mb-3" size={36}/>
              <h1 className="font-serif text-2xl text-amber-50">Yeni Sifre Belirle</h1>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Yeni sifre" className="w-full bg-black/40 border border-amber-500/30 rounded px-4 py-3 text-amber-50 focus:outline-none focus:border-amber-500"/>
              <input type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Tekrar" className="w-full bg-black/40 border border-amber-500/30 rounded px-4 py-3 text-amber-50 focus:outline-none focus:border-amber-500"/>
              <button disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-3 rounded font-serif tracking-widest">
                {loading ? 'KAYDEDILIYOR...' : 'SIFREYI SIFIRLA'}
              </button>
            </form>
            <Link href="/giris" className="block text-center mt-6 text-amber-400 text-sm hover:underline">Girise don</Link>
          </div>
        </div>
      </main>
    </>
  );
}
