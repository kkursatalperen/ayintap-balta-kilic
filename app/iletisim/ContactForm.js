'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

const inp = "w-full bg-black/40 border border-amber-500/30 rounded px-4 py-3 text-amber-50 focus:outline-none focus:border-amber-500 text-sm placeholder:text-amber-100/30";

const SUBJECTS = [
  'Sipariş Hakkında', 'Ürün Bilgisi', 'İade / Değişim', 
  'Kargo ve Teslimat', 'Özel Üretim Talebi', 'Öneri / Görüş', 'Diğer'
];

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const validateEmail = (email) => {
    return String(email).toLowerCase().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const send = async () => {
    // Validasyonlar
    if (form.name.trim().length < 3) { toast.error('Lütfen geçerli bir ad soyad girin.'); return; }
    if (!validateEmail(form.email)) { toast.error('Lütfen geçerli bir e-posta adresi girin.'); return; }
    if (form.message.trim().length < 10) { toast.error('Mesajınız en az 10 karakter olmalıdır.'); return; }

    setSending(true);
    try {
      const res = await fetch('/api/contact', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(form) 
      });
      
      if (res.ok) { 
        setSent(true); 
        toast.success('Mesajınız iletildi, en kısa sürede dönüş yapacağız.'); 
      } else { 
        const d = await res.json(); 
        toast.error(d.error || 'Bir hata oluştu'); 
      }
    } catch { 
      toast.error('Bağlantı hatası, lütfen tekrar deneyin'); 
    }
    setSending(false);
  };

  if (sent) return (
    <div className="bg-[#161616] border border-amber-500/20 rounded-lg p-10 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
      <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
        <Send className="text-amber-500" size={28}/>
      </div>
      <h3 className="font-serif text-2xl text-amber-50 mb-3">Mesajınız Alındı</h3>
      <p className="text-amber-100/60 max-w-sm">Ekibimiz en kısa sürede sizinle iletişime geçecektir.</p>
      <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }} className="mt-8 border border-amber-500/40 text-amber-400 px-6 py-2 rounded font-serif tracking-widest text-sm hover:bg-amber-500/10 transition">
        YENİ MESAJ
      </button>
    </div>
  );

  return (
    <div className="bg-[#161616] border border-amber-500/20 rounded-lg p-8">
      <h2 className="font-serif text-2xl text-amber-50 mb-6">Mesaj Gönderin</h2>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-amber-400 font-serif tracking-widest block mb-1">AD SOYAD *</label>
            <input className={inp} placeholder="Adınız Soyadınız" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/>
          </div>
          <div>
            <label className="text-xs text-amber-400 font-serif tracking-widest block mb-1">E-POSTA *</label>
            <input className={inp} type="email" placeholder="ornek@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/>
          </div>
        </div>
        <div>
          <label className="text-xs text-amber-400 font-serif tracking-widest block mb-1">KONU</label>
          <select className={inp} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
            <option value="">Konu seçin (opsiyonel)</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-amber-400 font-serif tracking-widest block mb-1">MESAJ *</label>
          <textarea className={inp} rows={6} placeholder="Mesajınızı buraya yazın..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}/>
        </div>
        <button onClick={send} disabled={sending} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-4 rounded font-serif tracking-widest hover:from-amber-400 hover:to-amber-500 transition flex items-center justify-center gap-2 disabled:opacity-60">
          <Send size={16}/> {sending ? 'GÖNDERİLİYOR...' : 'MESAJ GÖNDER'}
        </button>
      </div>
    </div>
  );
}