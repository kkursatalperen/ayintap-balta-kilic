'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { User, Package, Heart, MapPin, Lock, LogOut, Edit, Trash2, Plus, Check, Star, Truck } from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profilim', icon: User },
  { id: 'orders', label: 'SipariÅŸlerim', icon: Package },
  { id: 'favorites', label: 'Favorilerim', icon: Heart },
  { id: 'addresses', label: 'Adreslerim', icon: MapPin },
  { id: 'password', label: 'Åifre DeÄŸiÅŸtir', icon: Lock },
];

export default function ProfileApp() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/giris'); return; }
      setUser(d.user); setLoading(false);
    });
  }, [router]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) return <main className="pt-32 min-h-screen text-center text-amber-100/50">YÃ¼kleniyor...</main>;

  return (
    <main className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <h1 className="font-serif text-4xl text-amber-50">HoÅŸgeldin, {user.name || user.email.split('@')[0]}</h1>
          <p className="text-amber-100/50 mt-2">Hesap ayarlarÄ±nÄ± ve sipariÅŸlerini yÃ¶net</p>
        </div>
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-[#161616] border border-amber-500/20 rounded-lg overflow-hidden">
              <div className="p-5 border-b border-amber-500/20">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-2xl font-serif text-black">
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
                <p className="mt-3 text-amber-100 font-serif">{user.name || 'Misafir'}</p>
                <p className="text-xs text-amber-100/50">{user.email}</p>
              </div>
              <nav className="p-2">
                {TABS.map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-serif tracking-wider transition ${tab === t.id ? 'bg-amber-500/10 text-amber-400' : 'text-amber-100/70 hover:bg-amber-500/5'}`}>
                    <t.icon size={16}/> {t.label}
                  </button>
                ))}
                {user.role && user.role !== 'customer' && (
                  <Link href="/admin" className="w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-serif tracking-wider text-amber-400 hover:bg-amber-500/5">
                    <Star size={16}/> Admin Paneli
                  </Link>
                )}
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded text-sm text-red-400 hover:bg-red-500/10">
                  <LogOut size={16}/> Ã‡Ä±kÄ±ÅŸ Yap
                </button>
              </nav>
            </div>
          </aside>
          {/* Main */}
          <section className="lg:col-span-3">
            {tab === 'profile' && <ProfileTab user={user} onUpdate={setUser}/>}
            {tab === 'orders' && <OrdersTab/>}
            {tab === 'favorites' && <FavoritesTab/>}
            {tab === 'addresses' && <AddressesTab/>}
            {tab === 'password' && <PasswordTab/>}
          </section>
        </div>
      </div>
    </main>
  );
}

const inp = "w-full bg-black/40 border border-amber-500/30 rounded px-4 py-3 text-amber-50 focus:outline-none focus:border-amber-500";
const btn = "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded font-serif tracking-widest hover:from-amber-400 hover:to-amber-500 transition disabled:opacity-50";

function ProfileTab({ user, onUpdate }) {
  const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '' });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/me/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const d = await res.json();
    if (res.ok) { onUpdate(d.user); toast.success('Profil gÃ¼ncellendi'); } else toast.error(d.error);
    setSaving(false);
  };
  return (
    <div className="bg-[#161616] border border-amber-500/20 rounded-lg p-8">
      <h2 className="font-serif text-2xl text-amber-50 mb-6">Profil Bilgilerim</h2>
      <div className="space-y-4 max-w-md">
        <div><label className="text-xs text-amber-400 font-serif tracking-widest block mb-1">E-POSTA</label><input disabled value={user.email} className={inp + ' opacity-50'}/></div>
        <div><label className="text-xs text-amber-400 font-serif tracking-widest block mb-1">Ä°SÄ°M SOYÄ°SÄ°M</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp}/></div>
        <div><label className="text-xs text-amber-400 font-serif tracking-widest block mb-1">TELEFON</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, '') })} className={inp} type="tel" inputMode="numeric"/></div>
        <button onClick={save} disabled={saving} className={btn}>{saving ? 'KAYDEDÄ°LÄ°YOR...' : 'GÃœNCELLE'}</button>
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch('/api/me/orders').then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false); }); }, []);
  if (loading) return <div className="text-amber-100/50">YÃ¼kleniyor...</div>;
  if (orders.length === 0) return (
    <div className="bg-[#161616] border border-amber-500/20 rounded-lg p-12 text-center">
      <Package className="mx-auto text-amber-500/40 mb-4" size={48}/>
      <p className="text-amber-100/60 font-serif text-lg">HenÃ¼z sipariÅŸin yok</p>
      <Link href="/urunler" className="inline-block mt-4 text-amber-400 hover:underline">AlÄ±ÅŸveriÅŸe baÅŸla</Link>
    </div>
  );
  return (
    <div className="space-y-4">
      {orders.map((o) => <OrderCard key={o.id} order={o}/>)}
    </div>
  );
}

const STATUS_MAP = {
  pending_payment: { label: 'Ã–deme Bekliyor', color: 'bg-amber-700/30 text-amber-300' },
  paid: { label: 'Ã–deme AlÄ±ndÄ±', color: 'bg-emerald-700/30 text-emerald-300' },
  preparing: { label: 'HazÄ±rlanÄ±yor', color: 'bg-blue-700/30 text-blue-300' },
  shipped: { label: 'Kargoya Verildi', color: 'bg-purple-700/30 text-purple-300' },
  delivered: { label: 'Teslim Edildi', color: 'bg-green-700/30 text-green-300' },
  cancelled: { label: 'Ä°ptal Edildi', color: 'bg-red-700/30 text-red-300' },
};
const STATUS_TIMELINE = ['pending_payment', 'paid', 'preparing', 'shipped', 'delivered'];

function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const status = STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-700/30 text-gray-300' };
  const currentIdx = STATUS_TIMELINE.indexOf(order.status);
  return (
    <div className="bg-[#161616] border border-amber-500/20 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-5 flex flex-wrap items-center justify-between gap-4 text-left">
        <div>
          <p className="font-mono text-amber-400 text-sm">{order.orderNumber}</p>
          <p className="text-xs text-amber-100/50 mt-1">{new Date(order.createdAt).toLocaleString('tr-TR')}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-xs px-3 py-1 rounded ${status.color}`}>{status.label}</span>
          <span className="font-serif text-xl text-amber-400">{(order.total || 0).toLocaleString('tr-TR')}â‚º</span>
        </div>
      </button>
      {open && (
        <div className="p-5 border-t border-amber-500/10 space-y-5">
          {/* Timeline */}
          {order.status !== 'cancelled' && (
            <div>
              <h4 className="font-serif text-amber-400 text-sm tracking-widest mb-4">SÄ°PARÄ°Å DURUMU</h4>
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 right-0 top-3 h-px bg-amber-500/20"/>
                <div className="absolute left-0 top-3 h-px bg-amber-500" style={{ width: `${(currentIdx / (STATUS_TIMELINE.length - 1)) * 100}%` }}/>
                {STATUS_TIMELINE.map((s, i) => (
                  <div key={s} className="relative z-10 flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${i <= currentIdx ? 'bg-amber-500 text-black' : 'bg-[#0d0d0d] border border-amber-500/30 text-amber-100/40'}`}>
                      {i <= currentIdx ? <Check size={14}/> : i + 1}
                    </div>
                    <span className="text-[10px] text-amber-100/60 mt-2 text-center max-w-[80px]">{STATUS_MAP[s].label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Tracking */}
          {order.trackingCode && (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded flex items-center gap-3">
              <Truck className="text-amber-500"/>
              <div className="flex-1">
                <p className="text-xs text-amber-100/60">Kargo Takip Kodu</p>
                <p className="font-mono text-amber-400">{order.trackingCode}</p>
                {order.trackingCarrier && <p className="text-xs text-amber-100/60">{order.trackingCarrier}</p>}
              </div>
            </div>
          )}
          {/* Items */}
          <div>
            <h4 className="font-serif text-amber-400 text-sm tracking-widest mb-3">ÃœRÃœNLER</h4>
            <div className="space-y-2">
              {(order.items || []).map((i, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-black/30 rounded">
                  {i.image && <img src={i.image} className="w-12 h-12 rounded object-cover"/>}
                  <div className="flex-1">
                    <p className="text-amber-100 text-sm">{i.name}</p>
                    {i.personalization && <p className="text-xs text-amber-400">Lazer: "{i.personalization}"</p>}
                    <p className="text-xs text-amber-100/50">{i.qty} adet x {(i.price + (i.personalizationPrice || 0)).toLocaleString('tr-TR')}â‚º</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FavoritesTab() {
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => fetch('/api/me/favorites').then(r => r.json()).then(d => { setFavs(d.favorites || []); setLoading(false); });
  useEffect(() => { load(); }, []);
  const remove = async (productId) => {
    await fetch('/api/me/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }) });
    toast.success('Favorilerden Ã§Ä±karÄ±ldÄ±'); load();
  };
  if (loading) return <div className="text-amber-100/50">YÃ¼kleniyor...</div>;
  if (favs.length === 0) return (
    <div className="bg-[#161616] border border-amber-500/20 rounded-lg p-12 text-center">
      <Heart className="mx-auto text-amber-500/40 mb-4" size={48}/>
      <p className="text-amber-100/60 font-serif text-lg">Favorilerin boÅŸ</p>
      <Link href="/urunler" className="inline-block mt-4 text-amber-400 hover:underline">ÃœrÃ¼nleri keÅŸfet</Link>
    </div>
  );
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {favs.map((p) => (
        <div key={p.id} className="bg-[#161616] border border-amber-500/10 rounded-lg overflow-hidden group relative">
          <Link href={`/urunler/${p.slug}`}><img src={p.images?.[0]} className="w-full aspect-square object-cover group-hover:scale-105 transition duration-500"/></Link>
          <button onClick={() => remove(p.id)} className="absolute top-3 right-3 bg-red-600/80 text-white rounded-full p-2 hover:bg-red-500"><Heart size={16} fill="white"/></button>
          <div className="p-4">
            <h3 className="font-serif text-amber-50 truncate">{p.name}</h3>
            <p className="text-amber-400 font-serif text-lg mt-1">{p.price.toLocaleString('tr-TR')}â‚º</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AddressesTab() {
  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = () => fetch('/api/me/addresses').then(r => r.json()).then(d => setAddresses(d.addresses || []));
  useEffect(() => { load(); }, []);
  const del = async (id) => {
    if (!confirm('Adres silinsin mi?')) return;
    await fetch('/api/me/addresses/' + id, { method: 'DELETE' });
    toast.success('Silindi'); load();
  };
  return (
    <div className="space-y-4">
      <button onClick={() => setEditing({})} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-5 py-2 rounded font-serif tracking-widest">
        <Plus size={18}/> YENÄ° ADRES
      </button>
      <div className="grid md:grid-cols-2 gap-4">
        {addresses.map((a) => (
          <div key={a.id} className="bg-[#161616] border border-amber-500/20 rounded-lg p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-serif text-amber-100 text-lg">{a.title}</h3>
                {a.isDefault && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-1 rounded mt-1 inline-block">VARSAYILAN</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(a)} className="text-amber-400"><Edit size={16}/></button>
                <button onClick={() => del(a.id)} className="text-red-500"><Trash2 size={16}/></button>
              </div>
            </div>
            <p className="text-amber-100/70 text-sm">{a.fullName}</p>
            <p className="text-amber-100/60 text-sm">{a.phone}</p>
            <p className="text-amber-100/60 text-sm mt-2">{a.addressLine}</p>
            <p className="text-amber-100/60 text-sm">{a.district} / {a.city} {a.zipCode}</p>
          </div>
        ))}
      </div>
      {editing && <AddressEditor address={editing} onClose={() => { setEditing(null); load(); }}/>}
    </div>
  );
}

function AddressEditor({ address, onClose }) {
  const [form, setForm] = useState({ title: '', fullName: '', phone: '', city: '', district: '', zipCode: '', addressLine: '', isDefault: false, ...address });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    const url = address.id ? '/api/me/addresses/' + address.id : '/api/me/addresses';
    const method = address.id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { toast.success('Kaydedildi'); onClose(); } else toast.error('Hata');
    setSaving(false);
  };
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#161616] border border-amber-500/30 rounded-lg p-6 max-w-lg w-full">
        <h3 className="font-serif text-xl text-amber-50 mb-5">{address.id ? 'Adres DÃ¼zenle' : 'Yeni Adres'}</h3>
        <div className="grid grid-cols-2 gap-3">
          <input className={inp} placeholder="BaÅŸlÄ±k (Ev, Ä°ÅŸ)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/>
          <input className={inp} placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, '') })} type="tel" inputMode="numeric"/>
          <input className={inp + ' col-span-2'} placeholder="Ä°sim Soyisim" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}/>
          <input className={inp} placeholder="Ä°l" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}/>
          <input className={inp} placeholder="Ä°lÃ§e" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}/>
          <input className={inp} placeholder="Posta Kodu" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })}/>
          <textarea className={inp + ' col-span-2'} rows={2} placeholder="Adres" value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })}/>
          <label className="col-span-2 flex items-center gap-2 text-amber-100">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="w-4 h-4 accent-amber-500"/> VarsayÄ±lan adres
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={save} disabled={saving} className={btn}>{saving ? '...' : 'KAYDET'}</button>
          <button onClick={onClose} className="border border-amber-500/30 text-amber-100 px-6 py-3 rounded font-serif tracking-widest">Ä°PTAL</button>
        </div>
      </div>
    </div>
  );
}

function PasswordTab() {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (form.newPassword !== form.confirm) { toast.error('Yeni ÅŸifreler eÅŸleÅŸmiyor'); return; }
    if (form.newPassword.length < 6) { toast.error('Åifre en az 6 karakter olmalÄ±'); return; }
    setSaving(true);
    const res = await fetch('/api/me/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const d = await res.json();
    if (res.ok) { toast.success('Åifre deÄŸiÅŸtirildi'); setForm({ oldPassword: '', newPassword: '', confirm: '' }); }
    else toast.error(d.error);
    setSaving(false);
  };
  return (
    <div className="bg-[#161616] border border-amber-500/20 rounded-lg p-8 max-w-md">
      <h2 className="font-serif text-2xl text-amber-50 mb-6">Åifre DeÄŸiÅŸtir</h2>
      <div className="space-y-4">
        <input type="password" placeholder="Mevcut ÅŸifre" value={form.oldPassword} onChange={(e) => setForm({ ...form, oldPassword: e.target.value })} className={inp}/>
        <input type="password" placeholder="Yeni ÅŸifre (min 6)" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className={inp}/>
        <input type="password" placeholder="Yeni ÅŸifre (tekrar)" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className={inp}/>
        <button onClick={save} disabled={saving} className={btn}>{saving ? 'GÃœNCELLENÄ°YOR...' : 'ÅÄ°FREYÄ° DEÄÄ°ÅTÄ°R'}</button>
      </div>
    </div>
  );
}
