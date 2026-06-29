'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/lib/store';
import { Shield } from 'lucide-react';

export default function AuthForm({ mode: initialMode }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuth((s) => s.setUser);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hata oluştu');
      setUser(data.user, data.token);
      toast.success(mode === 'login' ? 'Hoşgeldiniz, ' + (data.user.name || data.user.email) : 'Kayıt başarılı');
      if (data.user.role && data.user.role !== 'customer') router.push('/admin');
      else router.push('/');
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#161616] border border-amber-500/20 rounded-lg p-8">
        <div className="text-center mb-8">
          <Shield className="text-amber-500 mx-auto mb-3" size={36}/>
          <h1 className="font-serif text-3xl text-amber-50">{mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</h1>
          <p className="text-amber-100/50 text-sm mt-2">{mode === 'login' ? 'Hesabınıza giriş yapın' : 'Demirci ailesine katılın'}</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="İsim Soyisim" className="w-full bg-black/40 border border-amber-500/30 rounded px-4 py-3 text-amber-50 focus:outline-none focus:border-amber-500"/>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Telefon" className="w-full bg-black/40 border border-amber-500/30 rounded px-4 py-3 text-amber-50 focus:outline-none focus:border-amber-500"/>
            </>
          )}
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="E-posta" className="w-full bg-black/40 border border-amber-500/30 rounded px-4 py-3 text-amber-50 focus:outline-none focus:border-amber-500"/>
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Şifre" className="w-full bg-black/40 border border-amber-500/30 rounded px-4 py-3 text-amber-50 focus:outline-none focus:border-amber-500"/>
          <button disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-3 rounded font-serif tracking-widest hover:from-amber-400 hover:to-amber-500 transition disabled:opacity-50">
            {loading ? 'İşleniyor...' : (mode === 'login' ? 'GİRİŞ YAP' : 'KAYIT OL')}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-amber-100/60">
          {mode === 'login' ? (
            <>Hesabınız yok mu? <button onClick={() => setMode('register')} className="text-amber-400 hover:underline">Kayıt Olun</button></>
          ) : (
            <>Zaten üyemisiniz? <button onClick={() => setMode('login')} className="text-amber-400 hover:underline">Giriş Yapın</button></>
          )}
        </div>
        {mode === 'login' && (
          <div className="mt-3 text-center">
            <Link href="/sifremi-unuttum" className="text-xs text-amber-100/60 hover:text-amber-400">Şifremi unuttum</Link>
          </div>
        )}
        {mode === 'login' && (
          <div className="mt-4 text-center text-xs text-amber-100/40">
            Admin girişi: <span className="text-amber-400">admin@ayintap.com / Ayintap2025!</span>
          </div>
        )}
      </div>
      <Link href="/" className="block text-center mt-6 text-amber-100/50 text-sm hover:text-amber-400">← Anasayfaya Dön</Link>
    </div>
  );
}
