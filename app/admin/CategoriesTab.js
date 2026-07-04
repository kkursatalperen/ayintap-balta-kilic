'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const inp = "w-full bg-black/40 border border-amber-500/30 rounded px-3 py-2 text-amber-50 focus:outline-none focus:border-amber-500 text-sm";

export default function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/categories').then(r => r.json()).then(d => {
      setCategories(d.categories || []);
      setLoading(false);
    });
  };
  useEffect(load, []);

  const del = async (id) => {
    if (!confirm('Kategori silinsin mi?')) return;
    await fetch('/api/admin/categories/' + id, { method: 'DELETE' });
    toast.success('Silindi');
    load();
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-4xl text-amber-50">Kategoriler</h1>
          <p className="text-amber-100/50 mt-1">Toplam {categories.length} kategori</p>
        </div>
        <button onClick={() => setEditing({})} className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-5 py-3 rounded font-serif tracking-widest flex items-center gap-2">
          <Plus size={18}/> YENI KATEGORI
        </button>
      </div>

      <div className="bg-[#161616] border border-amber-500/10 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-black/30 border-b border-amber-500/10">
            <tr className="text-left text-xs text-amber-400 font-serif tracking-widest">
              <th className="p-4">GORSEL</th>
              <th className="p-4">KATEGORI ADI</th>
              <th className="p-4">SLUG</th>
              <th className="p-4">DURUM</th>
              <th className="p-4">ISLEM</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-10 text-center text-amber-100/50">Yukleniyor...</td></tr>}
            {!loading && categories.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-amber-100/40">Henuz kategori yok.</td></tr>}
            {categories.map(c => (
              <tr key={c.id} className="border-b border-amber-500/5 hover:bg-amber-500/5">
                <td className="p-3">
                  {c.image ? <img src={c.image} className="w-14 h-14 rounded object-cover"/> : <div className="w-14 h-14 rounded bg-amber-500/10 flex items-center justify-center text-amber-500/40 text-xs">Gorselsiz</div>}
                </td>
                <td className="p-3 text-amber-100 font-serif">{c.name}</td>
                <td className="p-3 text-amber-100/60 text-xs font-mono">{c.slug}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded ${c.isActive ? 'bg-emerald-700/30 text-emerald-300' : 'bg-red-700/30 text-red-300'}`}>
                    {c.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => setEditing(c)} className="text-amber-400 hover:text-amber-300"><Edit size={16}/></button>
                  <button onClick={() => del(c.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing !== null && <CategoryEditor category={editing} onClose={() => { setEditing(null); load(); }}/>}
    </div>
  );
}

function CategoryEditor({ category, onClose }) {
  const [form, setForm] = useState({
    name: '', slug: '', description: '', image: '', isActive: true, ...category
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.name.trim()) { toast.error('Kategori adi zorunlu'); return; }
    setSaving(true);
    try {
      const url = category.id ? '/api/admin/categories/' + category.id : '/api/admin/categories';
      const method = category.id ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Hata');
      toast.success('Kaydedildi');
      onClose();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-[#161616] border border-amber-500/30 rounded-lg w-full max-w-lg">
        <div className="flex justify-between items-center p-5 border-b border-amber-500/20">
          <h3 className="font-serif text-xl text-amber-50">{category.id ? 'Kategori Duzenle' : 'Yeni Kategori'}</h3>
          <button onClick={onClose}><X size={20} className="text-amber-100"/></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-amber-400 font-serif tracking-widest block mb-1">KATEGORI ADI</label>
            <input className={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') })}/>
          </div>
          <div>
            <label className="text-xs text-amber-400 font-serif tracking-widest block mb-1">SLUG (URL)</label>
            <input className={inp} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}/>
          </div>
          <div>
            <label className="text-xs text-amber-400 font-serif tracking-widest block mb-1">ACIKLAMA</label>
            <textarea rows={2} className={inp} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/>
          </div>
          <div>
            <label className="text-xs text-amber-400 font-serif tracking-widest block mb-1">GORSEL URL</label>
            <input className={inp} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}/>
            {form.image && <img src={form.image} className="w-32 h-20 object-cover rounded mt-2"/>}
          </div>
          <label className="flex items-center gap-2 text-amber-100 cursor-pointer">
            <input type="checkbox" checked={!!form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-amber-500"/>
            Aktif
          </label>
        </div>
        <div className="p-5 border-t border-amber-500/20 flex gap-3">
          <button onClick={save} disabled={saving} className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-5 py-2 rounded font-serif tracking-widest flex items-center gap-2">
            <Save size={16}/>{saving ? '...' : 'KAYDET'}
          </button>
          <button onClick={onClose} className="border border-amber-500/30 text-amber-100 px-5 py-2 rounded font-serif tracking-widest">IPTAL</button>
        </div>
      </div>
    </div>
  );
}