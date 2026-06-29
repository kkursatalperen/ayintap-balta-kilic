'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  LayoutDashboard, Package, LayoutGrid, Settings, ShoppingBag, LogOut, Plus, Edit, Trash2,
  ChevronUp, ChevronDown, Eye, EyeOff, Upload, Save, X, Image as ImageIcon,
} from 'lucide-react';
import Logo from '@/components/Logo';

const SECTION_TYPES = [
  { value: 'hero_slider', label: 'Hero Slider' },
  { value: 'featured_products', label: 'Öne Çıkan Ürünler' },
  { value: 'collections', label: 'Koleksiyonlar' },
  { value: 'story', label: 'Hikayemiz' },
  { value: 'testimonials', label: 'Müşteri Yorumları' },
  { value: 'newsletter', label: 'Newsletter / Bülten' },
  { value: 'faq', label: 'SSS' },
];

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.role === 'customer') { router.push('/giris'); return; }
      setUser(d.user); setLoading(false);
    });
  }, [router]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/giris');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] text-amber-100">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-amber-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-amber-500/20 flex flex-col">
        <div className="p-6 border-b border-amber-500/20">
          <Logo showText={true}/>
          <p className="text-xs text-amber-100/40 mt-3 tracking-widest">YÖNETİM PANELİ</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'products', icon: Package, label: 'Ürünler' },
            { id: 'homepage', icon: LayoutGrid, label: 'Homepage Builder' },
            { id: 'orders', icon: ShoppingBag, label: 'Siparişler' },
            { id: 'settings', icon: Settings, label: 'Site Ayarları' },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-serif tracking-wider transition ${tab === t.id ? 'bg-amber-500/10 text-amber-400 border-l-2 border-amber-500' : 'text-amber-100/70 hover:bg-amber-500/5'}`}>
              <t.icon size={18}/> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-amber-500/20">
          <p className="text-xs text-amber-100/40">{user?.email}</p>
          <p className="text-xs text-amber-400 mb-3">{user?.role}</p>
          <Link href="/" className="block text-center text-xs text-amber-100/60 mb-2 hover:text-amber-400">Siteyi Görüntüle</Link>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 border border-red-500/40 text-red-400 py-2 rounded text-sm hover:bg-red-500/10">
            <LogOut size={14}/> Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {tab === 'dashboard' && <Dashboard/>}
        {tab === 'products' && <Products/>}
        {tab === 'homepage' && <HomepageBuilder/>}
        {tab === 'orders' && <Orders/>}
        {tab === 'settings' && <SiteSettings/>}
      </main>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({});
  useEffect(() => { fetch('/api/admin/stats').then(r => r.json()).then(setStats); }, []);
  return (
    <div className="p-10">
      <h1 className="font-serif text-4xl text-amber-50 mb-2">Dashboard</h1>
      <p className="text-amber-100/50 mb-10">Hoş geldiniz usta.</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { label: 'Toplam Satış', value: (stats.totalSales || 0).toLocaleString('tr-TR') + '₺', color: 'from-amber-500 to-amber-700' },
          { label: 'Toplam Sipariş', value: stats.orderCount || 0, color: 'from-emerald-600 to-emerald-800' },
          { label: 'Ürün Sayısı', value: stats.productCount || 0, color: 'from-blue-600 to-blue-800' },
          { label: 'Kullanıcı Sayısı', value: stats.userCount || 0, color: 'from-purple-600 to-purple-800' },
        ].map((s, i) => (
          <div key={i} className="bg-[#161616] border border-amber-500/10 rounded-lg p-6">
            <div className={`w-12 h-1 bg-gradient-to-r ${s.color} mb-4`}/>
            <p className="text-amber-100/60 text-sm">{s.label}</p>
            <p className="font-serif text-3xl text-amber-50 mt-2">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 bg-[#161616] border border-amber-500/10 rounded-lg p-8">
        <h2 className="font-serif text-2xl text-amber-50 mb-4">Sistem Durumu</h2>
        <ul className="space-y-2 text-sm text-amber-100/70">
          <li>✅ MongoDB bağlantısı aktif</li>
          <li>✅ JWT auth sistemi çalışıyor</li>
          <li>✅ Homepage Builder hazır</li>
          <li>⚙️ Cloudinary entegrasyonu: <span className="text-amber-400">API key bekleniyor</span></li>
          <li>⚙️ Ödeme entegrasyonu (iyzico/PayTR): <span className="text-amber-400">Test modu</span></li>
          <li>⚙️ Email servisi: <span className="text-amber-400">Mock modu</span></li>
        </ul>
      </div>
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => {
    fetch('/api/admin/products').then(r => r.json()).then(d => setProducts(d.products || []));
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
  };
  useEffect(load, []);

  const del = async (id) => {
    if (!confirm('Ürün silinsin mi?')) return;
    await fetch('/api/admin/products/' + id, { method: 'DELETE' });
    toast.success('Silindi'); load();
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-4xl text-amber-50">Ürünler</h1>
          <p className="text-amber-100/50 mt-1">Toplam {products.length} ürün</p>
        </div>
        <button onClick={() => setEditing({})} className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-5 py-3 rounded font-serif tracking-widest flex items-center gap-2">
          <Plus size={18}/> YENİ ÜRÜN
        </button>
      </div>
      <div className="bg-[#161616] border border-amber-500/10 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-black/30 border-b border-amber-500/10">
            <tr className="text-left text-xs text-amber-400 font-serif tracking-widest">
              <th className="p-4">GÖRSEL</th>
              <th className="p-4">ÜRÜN</th>
              <th className="p-4">SKU</th>
              <th className="p-4">FİYAT</th>
              <th className="p-4">STOK</th>
              <th className="p-4">DURUM</th>
              <th className="p-4">İŞLEM</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-amber-500/5 hover:bg-amber-500/5">
                <td className="p-3"><img src={p.images?.[0]} className="w-14 h-14 rounded object-cover"/></td>
                <td className="p-3 text-amber-100">{p.name}</td>
                <td className="p-3 text-amber-100/60 text-xs">{p.sku}</td>
                <td className="p-3 text-amber-400 font-semibold">{p.price?.toLocaleString('tr-TR')}₺</td>
                <td className="p-3 text-amber-100">{p.stock}</td>
                <td className="p-3"><span className={`text-xs px-2 py-1 rounded ${p.isActive ? 'bg-emerald-700/30 text-emerald-300' : 'bg-red-700/30 text-red-300'}`}>{p.isActive ? 'Aktif' : 'Pasif'}</span></td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => setEditing(p)} className="text-amber-400 hover:text-amber-300"><Edit size={16}/></button>
                  <button onClick={() => del(p.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <ProductEditor product={editing} categories={categories} onClose={() => { setEditing(null); load(); }}/>}
    </div>
  );
}

function ProductEditor({ product, categories, onClose }) {
  const [form, setForm] = useState({
    name: '', slug: '', categoryId: '', price: 0, oldPrice: 0, stock: 0, sku: '',
    description: '', images: [], specs: {}, isFeatured: false, isBestseller: false, isNew: false, isActive: true,
    personalizable: true, personalizationPrice: 250,
    ...product,
  });
  const [saving, setSaving] = useState(false);
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');

  const upload = async (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl: reader.result, folder: 'products' }) });
      const data = await res.json();
      if (data.url) { setForm((f) => ({ ...f, images: [...(f.images || []), data.url] })); toast.success(data.fallback ? 'Görsel yerel olarak eklendi (Cloudinary kapalı)' : 'Cloudinary\'e yüklendi'); }
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      const url = product.id ? '/api/admin/products/' + product.id : '/api/admin/products';
      const method = product.id ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Hata');
      toast.success('Kaydedildi'); onClose();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const addSpec = () => {
    if (!specKey || !specVal) return;
    setForm({ ...form, specs: { ...form.specs, [specKey]: specVal } });
    setSpecKey(''); setSpecVal('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto my-10 bg-[#161616] border border-amber-500/30 rounded-lg">
        <div className="flex justify-between items-center p-6 border-b border-amber-500/20 sticky top-0 bg-[#161616] z-10">
          <h2 className="font-serif text-2xl text-amber-50">{product.id ? 'Ürün Düzenle' : 'Yeni Ürün'}</h2>
          <button onClick={onClose}><X size={22} className="text-amber-100"/></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-5">
          <Field label="Ürün Adı"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') })} className={inp}/></Field>
          <Field label="Slug"><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inp}/></Field>
          <Field label="Kategori">
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inp}>
              <option value="">— Seç —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="SKU"><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={inp}/></Field>
          <Field label="Fiyat (₺)"><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inp}/></Field>
          <Field label="Eski Fiyat (₺)"><input type="number" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: Number(e.target.value) })} className={inp}/></Field>
          <Field label="Stok"><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className={inp}/></Field>
          <Field label="Kişiselleştirme Fiyatı (₺)"><input type="number" value={form.personalizationPrice} onChange={(e) => setForm({ ...form, personalizationPrice: Number(e.target.value) })} className={inp}/></Field>
          <div className="col-span-2">
            <Field label="Açıklama"><textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inp}/></Field>
          </div>

          <div className="col-span-2">
            <label className="text-xs text-amber-400 font-serif tracking-widest">GÖRSELLER</label>
            <div className="mt-2 grid grid-cols-5 gap-3">
              {(form.images || []).map((img, i) => (
                <div key={i} className="relative aspect-square">
                  <img src={img} className="w-full h-full object-cover rounded"/>
                  <button onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs">×</button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-amber-500/30 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-amber-500/5">
                <Upload className="text-amber-500" size={20}/>
                <span className="text-xs text-amber-100/60 mt-1">Yükle</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && upload(e.target.files[0])}/>
              </label>
            </div>
          </div>

          <div className="col-span-2">
            <label className="text-xs text-amber-400 font-serif tracking-widest">TEKNİK ÖZELLİKLER</label>
            <div className="mt-2 space-y-2">
              {Object.entries(form.specs || {}).map(([k, v]) => (
                <div key={k} className="flex gap-2 items-center text-sm">
                  <span className="flex-1 text-amber-100/70">{k}: <span className="text-amber-100">{v}</span></span>
                  <button onClick={() => { const s = { ...form.specs }; delete s[k]; setForm({ ...form, specs: s }); }} className="text-red-500"><Trash2 size={14}/></button>
                </div>
              ))}
              <div className="flex gap-2">
                <input placeholder="Özellik (ör: Çelik Türü)" value={specKey} onChange={(e) => setSpecKey(e.target.value)} className={inp}/>
                <input placeholder="Değer" value={specVal} onChange={(e) => setSpecVal(e.target.value)} className={inp}/>
                <button onClick={addSpec} className="px-4 bg-amber-500 text-black rounded font-bold">+</button>
              </div>
            </div>
          </div>

          <div className="col-span-2 flex flex-wrap gap-4 text-sm text-amber-100">
            {[['isActive','Aktif'],['isFeatured','Öne Çıkan'],['isBestseller','Çok Satan'],['isNew','Yeni'],['personalizable','Kişiselleştirilebilir']].map(([k,l]) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} className="w-4 h-4 accent-amber-500"/>{l}
              </label>
            ))}
          </div>
        </div>
        <div className="p-6 border-t border-amber-500/20 flex gap-3 sticky bottom-0 bg-[#161616]">
          <button onClick={save} disabled={saving} className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded font-serif tracking-widest flex items-center gap-2"><Save size={18}/> {saving ? 'KAYDEDİLİYOR...' : 'KAYDET'}</button>
          <button onClick={onClose} className="border border-amber-500/30 text-amber-100 px-6 py-3 rounded font-serif tracking-widest">İPTAL</button>
        </div>
      </div>
    </div>
  );
}

const inp = "w-full bg-black/40 border border-amber-500/30 rounded px-3 py-2 text-amber-50 focus:outline-none focus:border-amber-500 text-sm";
function Field({ label, children }) {
  return <div><label className="text-xs text-amber-400 font-serif tracking-widest block mb-1">{label}</label>{children}</div>;
}

function HomepageBuilder() {
  const [sections, setSections] = useState([]);
  const [editing, setEditing] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const load = () => fetch('/api/admin/homepage').then(r => r.json()).then(d => setSections(d.sections || []));
  useEffect(load, []);

  const move = async (idx, dir) => {
    const next = [...sections];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    const order = next.map((s, i) => ({ id: s.id, order: i + 1 }));
    setSections(next.map((s, i) => ({ ...s, order: i + 1 })));
    await fetch('/api/admin/homepage/reorder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order }) });
  };
  const toggle = async (s) => {
    await fetch('/api/admin/homepage/' + s.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !s.isActive }) });
    load();
  };
  const del = async (id) => {
    if (!confirm('Bölüm silinsin mi?')) return;
    await fetch('/api/admin/homepage/' + id, { method: 'DELETE' }); load();
  };
  const add = async (type) => {
    const defaults = defaultData(type);
    await fetch('/api/admin/homepage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, data: defaults }) });
    setAddOpen(false); load();
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-4xl text-amber-50">Homepage Builder</h1>
          <p className="text-amber-100/50 mt-1">Anasayfa bölümlerini sürükle-bırak ile yönetin</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-5 py-3 rounded font-serif tracking-widest flex items-center gap-2">
          <Plus size={18}/> BÖLÜM EKLE
        </button>
      </div>
      <div className="space-y-3">
        {sections.map((s, i) => (
          <div key={s.id} className={`bg-[#161616] border rounded-lg p-5 flex items-center gap-4 ${s.isActive ? 'border-amber-500/20' : 'border-red-500/20 opacity-60'}`}>
            <div className="flex flex-col">
              <button onClick={() => move(i, -1)} className="text-amber-400 hover:text-amber-300"><ChevronUp size={18}/></button>
              <button onClick={() => move(i, 1)} className="text-amber-400 hover:text-amber-300"><ChevronDown size={18}/></button>
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-amber-50 text-lg">{SECTION_TYPES.find(t => t.value === s.type)?.label || s.type}</h3>
              <p className="text-xs text-amber-100/50">Sıra: {s.order} · {s.type}</p>
            </div>
            <button onClick={() => toggle(s)} className="text-amber-400">{s.isActive ? <Eye size={18}/> : <EyeOff size={18}/>}</button>
            <button onClick={() => setEditing(s)} className="text-amber-400 hover:text-amber-300"><Edit size={18}/></button>
            <button onClick={() => del(s.id)} className="text-red-500 hover:text-red-400"><Trash2 size={18}/></button>
          </div>
        ))}
      </div>

      {addOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="bg-[#161616] border border-amber-500/30 rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-serif text-xl text-amber-50">Bölüm Tipi Seç</h3>
              <button onClick={() => setAddOpen(false)}><X size={20}/></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SECTION_TYPES.map((t) => (
                <button key={t.value} onClick={() => add(t.value)} className="border border-amber-500/30 rounded p-4 text-amber-100 hover:bg-amber-500/10 font-serif">{t.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {editing && <SectionEditor section={editing} onClose={() => { setEditing(null); load(); }}/>}
    </div>
  );
}

function defaultData(type) {
  switch (type) {
    case 'hero_slider': return { slides: [{ title: 'Yeni Slayt', subtitle: 'Alt yazı', image: 'https://images.unsplash.com/photo-1528918652533-dfdb3f368093?q=85', cta: 'Keşfet', link: '/urunler' }] };
    case 'featured_products': return { title: 'Öne Çıkan Eserler', subtitle: '' };
    case 'collections': return { title: 'Koleksiyonlar', subtitle: '', items: [] };
    case 'story': return { title: 'Hikayemiz', subtitle: '', content: '', image: '', cta: '', link: '' };
    case 'testimonials': return { title: 'Müşteri Yorumları', items: [] };
    case 'newsletter': return { title: 'Bültenimize Katılın', subtitle: '' };
    case 'faq': return { title: 'Sıkça Sorulan Sorular', items: [] };
    default: return {};
  }
}

function SectionEditor({ section, onClose }) {
  const [data, setData] = useState(section.data || {});
  const [saving, setSaving] = useState(false);

  const upload = async (cb) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl: reader.result, folder: 'homepage' }) });
        const d = await res.json();
        if (d.url) { cb(d.url); toast.success('Yüklendi'); }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const save = async () => {
    setSaving(true);
    await fetch('/api/admin/homepage/' + section.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data }) });
    toast.success('Kaydedildi'); setSaving(false); onClose();
  };

  const renderEditor = () => {
    if (section.type === 'hero_slider') {
      return (
        <div className="space-y-4">
          {(data.slides || []).map((slide, i) => (
            <div key={i} className="bg-black/30 border border-amber-500/10 rounded p-4 space-y-2">
              <div className="flex justify-between"><span className="text-amber-400 text-sm">Slayt {i+1}</span>
                <button onClick={() => setData({ ...data, slides: data.slides.filter((_, j) => j !== i) })} className="text-red-500"><Trash2 size={14}/></button></div>
              <input className={inp} placeholder="Başlık" value={slide.title} onChange={(e) => { const s = [...data.slides]; s[i].title = e.target.value; setData({ ...data, slides: s }); }}/>
              <input className={inp} placeholder="Alt başlık" value={slide.subtitle} onChange={(e) => { const s = [...data.slides]; s[i].subtitle = e.target.value; setData({ ...data, slides: s }); }}/>
              <div className="flex gap-2 items-center">
                <input className={inp} placeholder="Görsel URL" value={slide.image} onChange={(e) => { const s = [...data.slides]; s[i].image = e.target.value; setData({ ...data, slides: s }); }}/>
                <button onClick={() => upload((url) => { const s = [...data.slides]; s[i].image = url; setData({ ...data, slides: s }); })} className="px-3 py-2 border border-amber-500/30 rounded text-amber-400"><Upload size={16}/></button>
              </div>
              {slide.image && <img src={slide.image} className="w-32 h-20 object-cover rounded"/>}
              <input className={inp} placeholder="CTA Buton Metni" value={slide.cta} onChange={(e) => { const s = [...data.slides]; s[i].cta = e.target.value; setData({ ...data, slides: s }); }}/>
              <input className={inp} placeholder="Link" value={slide.link} onChange={(e) => { const s = [...data.slides]; s[i].link = e.target.value; setData({ ...data, slides: s }); }}/>
            </div>
          ))}
          <button onClick={() => setData({ ...data, slides: [...(data.slides || []), { title: '', subtitle: '', image: '', cta: 'Keşfet', link: '/urunler' }] })} className="w-full border-2 border-dashed border-amber-500/30 rounded py-3 text-amber-400">+ Slayt Ekle</button>
        </div>
      );
    }
    if (section.type === 'collections') {
      return (
        <div className="space-y-3">
          <Field label="Başlık"><input className={inp} value={data.title || ''} onChange={(e) => setData({ ...data, title: e.target.value })}/></Field>
          <Field label="Alt Başlık"><input className={inp} value={data.subtitle || ''} onChange={(e) => setData({ ...data, subtitle: e.target.value })}/></Field>
          <div className="space-y-2">
            {(data.items || []).map((it, i) => (
              <div key={i} className="bg-black/30 border border-amber-500/10 rounded p-3 space-y-2">
                <div className="flex justify-between"><span className="text-amber-400 text-sm">#{i+1}</span>
                <button onClick={() => setData({ ...data, items: data.items.filter((_, j) => j !== i) })} className="text-red-500"><Trash2 size={14}/></button></div>
                <input className={inp} placeholder="Ad" value={it.name} onChange={(e) => { const s = [...data.items]; s[i].name = e.target.value; setData({ ...data, items: s }); }}/>
                <div className="flex gap-2">
                  <input className={inp} placeholder="Görsel URL" value={it.image} onChange={(e) => { const s = [...data.items]; s[i].image = e.target.value; setData({ ...data, items: s }); }}/>
                  <button onClick={() => upload((url) => { const s = [...data.items]; s[i].image = url; setData({ ...data, items: s }); })} className="px-3 border border-amber-500/30 rounded text-amber-400"><Upload size={16}/></button>
                </div>
                <input className={inp} placeholder="Link" value={it.link} onChange={(e) => { const s = [...data.items]; s[i].link = e.target.value; setData({ ...data, items: s }); }}/>
              </div>
            ))}
            <button onClick={() => setData({ ...data, items: [...(data.items || []), { name: '', image: '', link: '' }] })} className="w-full border-2 border-dashed border-amber-500/30 rounded py-2 text-amber-400 text-sm">+ Koleksiyon Ekle</button>
          </div>
        </div>
      );
    }
    if (section.type === 'story') {
      return (
        <div className="space-y-3">
          <Field label="Başlık"><input className={inp} value={data.title || ''} onChange={(e) => setData({ ...data, title: e.target.value })}/></Field>
          <Field label="Alt Başlık"><input className={inp} value={data.subtitle || ''} onChange={(e) => setData({ ...data, subtitle: e.target.value })}/></Field>
          <Field label="İçerik"><textarea rows={6} className={inp} value={data.content || ''} onChange={(e) => setData({ ...data, content: e.target.value })}/></Field>
          <Field label="Görsel URL">
            <div className="flex gap-2">
              <input className={inp} value={data.image || ''} onChange={(e) => setData({ ...data, image: e.target.value })}/>
              <button onClick={() => upload((url) => setData({ ...data, image: url }))} className="px-3 border border-amber-500/30 rounded text-amber-400"><Upload size={16}/></button>
            </div>
            {data.image && <img src={data.image} className="w-40 h-24 object-cover rounded mt-2"/>}
          </Field>
          <Field label="CTA"><input className={inp} value={data.cta || ''} onChange={(e) => setData({ ...data, cta: e.target.value })}/></Field>
          <Field label="Link"><input className={inp} value={data.link || ''} onChange={(e) => setData({ ...data, link: e.target.value })}/></Field>
        </div>
      );
    }
    if (section.type === 'testimonials') {
      return (
        <div className="space-y-3">
          <Field label="Başlık"><input className={inp} value={data.title || ''} onChange={(e) => setData({ ...data, title: e.target.value })}/></Field>
          <div className="space-y-2">
            {(data.items || []).map((it, i) => (
              <div key={i} className="bg-black/30 border border-amber-500/10 rounded p-3 space-y-2">
                <div className="flex justify-between"><span className="text-amber-400 text-sm">#{i+1}</span>
                <button onClick={() => setData({ ...data, items: data.items.filter((_, j) => j !== i) })} className="text-red-500"><Trash2 size={14}/></button></div>
                <input className={inp} placeholder="İsim" value={it.name} onChange={(e) => { const s = [...data.items]; s[i].name = e.target.value; setData({ ...data, items: s }); }}/>
                <textarea rows={2} className={inp} placeholder="Yorum" value={it.text} onChange={(e) => { const s = [...data.items]; s[i].text = e.target.value; setData({ ...data, items: s }); }}/>
                <input className={inp} type="number" min={1} max={5} placeholder="Puan" value={it.rating || 5} onChange={(e) => { const s = [...data.items]; s[i].rating = Number(e.target.value); setData({ ...data, items: s }); }}/>
              </div>
            ))}
            <button onClick={() => setData({ ...data, items: [...(data.items || []), { name: '', text: '', rating: 5 }] })} className="w-full border-2 border-dashed border-amber-500/30 rounded py-2 text-amber-400 text-sm">+ Yorum Ekle</button>
          </div>
        </div>
      );
    }
    if (section.type === 'faq') {
      return (
        <div className="space-y-3">
          <Field label="Başlık"><input className={inp} value={data.title || ''} onChange={(e) => setData({ ...data, title: e.target.value })}/></Field>
          <div className="space-y-2">
            {(data.items || []).map((it, i) => (
              <div key={i} className="bg-black/30 border border-amber-500/10 rounded p-3 space-y-2">
                <div className="flex justify-between"><span className="text-amber-400 text-sm">#{i+1}</span>
                <button onClick={() => setData({ ...data, items: data.items.filter((_, j) => j !== i) })} className="text-red-500"><Trash2 size={14}/></button></div>
                <input className={inp} placeholder="Soru" value={it.q} onChange={(e) => { const s = [...data.items]; s[i].q = e.target.value; setData({ ...data, items: s }); }}/>
                <textarea rows={2} className={inp} placeholder="Cevap" value={it.a} onChange={(e) => { const s = [...data.items]; s[i].a = e.target.value; setData({ ...data, items: s }); }}/>
              </div>
            ))}
            <button onClick={() => setData({ ...data, items: [...(data.items || []), { q: '', a: '' }] })} className="w-full border-2 border-dashed border-amber-500/30 rounded py-2 text-amber-400 text-sm">+ Soru Ekle</button>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <Field label="Başlık"><input className={inp} value={data.title || ''} onChange={(e) => setData({ ...data, title: e.target.value })}/></Field>
        <Field label="Alt Başlık"><input className={inp} value={data.subtitle || ''} onChange={(e) => setData({ ...data, subtitle: e.target.value })}/></Field>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto bg-[#161616] border border-amber-500/30 rounded-lg">
        <div className="flex justify-between items-center p-5 border-b border-amber-500/20 sticky top-0 bg-[#161616]">
          <h3 className="font-serif text-xl text-amber-50">Bölüm Düzenle: {SECTION_TYPES.find(t => t.value === section.type)?.label}</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="p-5">{renderEditor()}</div>
        <div className="p-5 border-t border-amber-500/20 flex gap-3 sticky bottom-0 bg-[#161616]">
          <button onClick={save} disabled={saving} className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-5 py-2 rounded font-serif tracking-widest flex items-center gap-2"><Save size={16}/>{saving ? '...' : 'KAYDET'}</button>
          <button onClick={onClose} className="border border-amber-500/30 text-amber-100 px-5 py-2 rounded font-serif tracking-widest">İPTAL</button>
        </div>
      </div>
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { fetch('/api/admin/orders').then(r => r.json()).then(d => setOrders(d.orders || [])); }, []);
  return (
    <div className="p-10">
      <h1 className="font-serif text-4xl text-amber-50 mb-6">Siparişler</h1>
      <div className="bg-[#161616] border border-amber-500/10 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-black/30 border-b border-amber-500/10">
            <tr className="text-left text-xs text-amber-400 font-serif tracking-widest">
              <th className="p-4">SİPARİŞ NO</th><th className="p-4">TARİH</th><th className="p-4">ÜRÜN</th><th className="p-4">TUTAR</th><th className="p-4">DURUM</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-amber-100/50">Henüz sipariş yok.</td></tr>}
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-amber-500/5">
                <td className="p-4 text-amber-100 font-mono">{o.orderNumber}</td>
                <td className="p-4 text-amber-100/60 text-sm">{new Date(o.createdAt).toLocaleString('tr-TR')}</td>
                <td className="p-4 text-amber-100/70 text-sm">{o.items?.length || 0} ürün</td>
                <td className="p-4 text-amber-400 font-semibold">{o.total?.toLocaleString('tr-TR')}₺</td>
                <td className="p-4"><span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-300">{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SiteSettings() {
  const [s, setS] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { fetch('/api/settings').then(r => r.json()).then(d => setS(d.settings || {})); }, []);
  const save = async () => {
    setSaving(true);
    await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
    toast.success('Site ayarları kaydedildi'); setSaving(false);
  };
  return (
    <div className="p-10 max-w-4xl">
      <h1 className="font-serif text-4xl text-amber-50 mb-2">Site Ayarları</h1>
      <p className="text-amber-100/50 mb-8">Genel marka ve iletişim bilgileri</p>
      <div className="bg-[#161616] border border-amber-500/10 rounded-lg p-6 grid grid-cols-2 gap-5">
        <Field label="Marka Adı"><input className={inp} value={s.brandName || ''} onChange={(e) => setS({ ...s, brandName: e.target.value })}/></Field>
        <Field label="Slogan"><input className={inp} value={s.tagline || ''} onChange={(e) => setS({ ...s, tagline: e.target.value })}/></Field>
        <Field label="Telefon"><input className={inp} value={s.contactPhone || ''} onChange={(e) => setS({ ...s, contactPhone: e.target.value })}/></Field>
        <Field label="E-posta"><input className={inp} value={s.contactEmail || ''} onChange={(e) => setS({ ...s, contactEmail: e.target.value })}/></Field>
        <div className="col-span-2"><Field label="Adres"><textarea rows={2} className={inp} value={s.contactAddress || ''} onChange={(e) => setS({ ...s, contactAddress: e.target.value })}/></Field></div>
        <Field label="WhatsApp (90...)"><input className={inp} value={s.whatsapp || ''} onChange={(e) => setS({ ...s, whatsapp: e.target.value })}/></Field>
        <Field label="Instagram URL"><input className={inp} value={s.social?.instagram || ''} onChange={(e) => setS({ ...s, social: { ...(s.social||{}), instagram: e.target.value } })}/></Field>
        <Field label="Facebook URL"><input className={inp} value={s.social?.facebook || ''} onChange={(e) => setS({ ...s, social: { ...(s.social||{}), facebook: e.target.value } })}/></Field>
        <Field label="YouTube URL"><input className={inp} value={s.social?.youtube || ''} onChange={(e) => setS({ ...s, social: { ...(s.social||{}), youtube: e.target.value } })}/></Field>
        <div className="col-span-2"><Field label="Footer Hakkımızda"><textarea rows={3} className={inp} value={s.footerAbout || ''} onChange={(e) => setS({ ...s, footerAbout: e.target.value })}/></Field></div>
        <Field label="SEO Title"><input className={inp} value={s.seo?.title || ''} onChange={(e) => setS({ ...s, seo: { ...(s.seo||{}), title: e.target.value } })}/></Field>
        <Field label="SEO Description"><input className={inp} value={s.seo?.description || ''} onChange={(e) => setS({ ...s, seo: { ...(s.seo||{}), description: e.target.value } })}/></Field>
        <Field label="Google Analytics ID"><input className={inp} placeholder="G-XXXXX" value={s.analytics?.googleAnalytics || ''} onChange={(e) => setS({ ...s, analytics: { ...(s.analytics||{}), googleAnalytics: e.target.value } })}/></Field>
        <Field label="Meta Pixel ID"><input className={inp} value={s.analytics?.metaPixel || ''} onChange={(e) => setS({ ...s, analytics: { ...(s.analytics||{}), metaPixel: e.target.value } })}/></Field>
        <div className="col-span-2 flex items-center gap-3">
          <input type="checkbox" id="maintenance" checked={!!s.maintenanceMode} onChange={(e) => setS({ ...s, maintenanceMode: e.target.checked })} className="w-5 h-5 accent-amber-500"/>
          <label htmlFor="maintenance" className="text-amber-100">Bakım Modu</label>
        </div>
      </div>
      <button onClick={save} disabled={saving} className="mt-6 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-8 py-3 rounded font-serif tracking-widest flex items-center gap-2">
        <Save size={18}/>{saving ? 'KAYDEDİLİYOR...' : 'AYARLARI KAYDET'}
      </button>
    </div>
  );
}
