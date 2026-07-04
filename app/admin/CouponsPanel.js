'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CouponsPanel() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: '', discount: 10, type: 'percent', minOrder: 0, maxUses: 0, expiresAt: '' });
  const [saving, setSaving] = useState(false);

  const load = () => fetch('/api/admin/coupons').then(r => r.json()).then(d => setCoupons(d.coupons || []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.code || !form.discount) { toast.error('Kod ve indirim zorunlu'); return; }
    setSaving(true);
    const res = await fetch('/api/admin/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const d = await res.json();
    if (res.ok) { toast.success('Kupon olusturuldu'); setForm({ code: '', discount: 10, type: 'percent', minOrder: 0, maxUses: 0, expiresAt: '' }); load(); }
    else toast.error(d.error || 'Hata');
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm('Kupon silinsin mi?')) return;
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
    toast.success('Silindi'); load();
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = 'AYT-' + [...Array(6)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    setForm({ ...form, code });
  };

  return (
    <div className="p-10">
      <h1 className="font-serif text-4xl text-amber-50 mb-2">Kupon Yonetimi</h1>
      <p className="text-amber-100/50 mb-8">Indirim kuponlari olustur ve yonet</p>

      <div className="bg-[#161616] border border-amber-500/10 rounded-lg p-6 mb-8">
        <h2 className="font-serif text-xl text-amber-400 mb-5">Yeni Kupon Olustur</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-amber-400 font-serif tracking-widest block mb-1">KUPON KODU</label>
            <div className="flex gap-2">
              <input className="flex-1 bg-black/40 border border-amber-500/30 rounded px-3 py-2 text-amber-50 text-sm focus:outline-none focus:border-amber-500 uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="AYT-XXXX"/>
              <button onClick={generateCode} className="px-3 border border-amber-500/30 rounded text-amber-400 hover:bg-amber-500/10 text-xs">URET</button>
            </div>
          </div>
          <div>
            <label className="text-xs text-amber-400 font-serif tracking-widest block mb-1">INDIRIM TURU</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-black/40 border border-amber-500/30 rounded px-3 py-2 text-amber-50 text-sm focus:outline-none focus:border-amber-500">
              <option value="percent">Yuzde (%)</option>
              <option value="fixed">Sabit Tutar</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-amber-400 font-serif tracking-widest block mb-1">{form.type === 'percent' ? 'INDIRIM (%)' : 'INDIRIM'}</label>
            <input type="number" className="w-full bg-black/40 border border-amber-500/30 rounded px-3 py-2 text-amber-50 text-sm focus:outline-none focus:border-amber-500" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} min={1}/>
          </div>
          <div>
            <label className="text-xs text-amber-400 font-serif tracking-widest block mb-1">MINIMUM SIPARIS</label>
            <input type="number" className="w-full bg-black/40 border border-amber-500/30 rounded px-3 py-2 text-amber-50 text-sm focus:outline-none focus:border-amber-500" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} min={0}/>
          </div>
          <div>
            <label className="text-xs text-amber-400 font-serif tracking-widest block mb-1">MAX KULLANIM (0 = Sinirsiz)</label>
            <input type="number" className="w-full bg-black/40 border border-amber-500/30 rounded px-3 py-2 text-amber-50 text-sm focus:outline-none focus:border-amber-500" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })} min={0}/>
          </div>
          <div>
            <label className="text-xs text-amber-400 font-serif tracking-widest block mb-1">SON KULLANIM TARIHI</label>
            <input type="date" className="w-full bg-black/40 border border-amber-500/30 rounded px-3 py-2 text-amber-50 text-sm focus:outline-none focus:border-amber-500" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}/>
          </div>
        </div>
        <button onClick={save} disabled={saving} className="mt-5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded font-serif tracking-widest flex items-center gap-2 hover:from-amber-400 hover:to-amber-500 transition">
          <Plus size={16}/> {saving ? 'OLUSTURULUYOR...' : 'KUPON OLUSTUR'}
        </button>
      </div>

      <div className="bg-[#161616] border border-amber-500/10 rounded-lg overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-black/30 border-b border-amber-500/10">
            <tr className="text-left text-xs text-amber-400 font-serif tracking-widest">
              <th className="p-4">KOD</th>
              <th className="p-4">INDIRIM</th>
              <th className="p-4">MIN. SIPARIS</th>
              <th className="p-4">KULLANIM</th>
              <th className="p-4">SON TARIH</th>
              <th className="p-4">DURUM</th>
              <th className="p-4">ISLEM</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-amber-100/50">Henuz kupon yok.</td></tr>}
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-amber-500/5 hover:bg-amber-500/5">
                <td className="p-4 font-mono text-amber-400 font-bold">{c.code}</td>
                <td className="p-4 text-amber-100">{c.type === 'percent' ? `%${c.discount}` : `${c.discount}`}</td>
                <td className="p-4 text-amber-100/60">{c.minOrder > 0 ? `${c.minOrder.toLocaleString('tr-TR')}` : 'Yok'}</td>
                <td className="p-4 text-amber-100">{c.usedCount}/{c.maxUses > 0 ? c.maxUses : 'Sinirsiz'}</td>
                <td className="p-4 text-amber-100/60 text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('tr-TR') : 'Suresiz'}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded ${c.isActive ? 'bg-emerald-700/30 text-emerald-300' : 'bg-red-700/30 text-red-300'}`}>
                    {c.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => del(c.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}