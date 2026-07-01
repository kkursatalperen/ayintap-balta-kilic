'use client';
import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/users').then(r => r.json()).then(d => {
      setUsers(d.users || []);
      setLoading(false);
    });
  };
  useEffect(load, []);

  const updateRole = async (id, role) => {
    const res = await fetch('/api/admin/users/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (res.ok) { toast.success('Rol güncellendi'); load(); setSelected(s => s ? { ...s, role } : null); }
    else toast.error('Hata');
  };

  const deleteUser = async (id) => {
    if (!confirm('Bu üye silinsin mi?')) return;
    setDeleting(id);
    const res = await fetch('/api/admin/users/' + id, { method: 'DELETE' });
    if (res.ok) { toast.success('Üye silindi'); load(); if (selected?.id === id) setSelected(null); }
    else toast.error('Hata');
    setDeleting(null);
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const ROLE_COLORS = {
    super_admin: 'bg-red-700/30 text-red-300',
    admin: 'bg-amber-700/30 text-amber-300',
    editor: 'bg-blue-700/30 text-blue-300',
    customer: 'bg-emerald-700/30 text-emerald-300',
  };
  const ROLES = ['customer', 'editor', 'admin', 'super_admin'];

  return (
    <div className="p-10">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-serif text-4xl text-amber-50">Üye Yönetimi</h1>
          <p className="text-amber-100/50 mt-1">Toplam {users.length} üye</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Toplam', val: users.length, color: 'text-amber-400' },
            { label: 'Müşteri', val: users.filter(u => u.role === 'customer').length, color: 'text-emerald-400' },
            { label: 'Admin', val: users.filter(u => ['admin','super_admin','editor'].includes(u.role)).length, color: 'text-red-400' },
          ].map((s, i) => (
            <div key={i} className="bg-[#161616] border border-amber-500/10 rounded-lg px-5 py-3">
              <p className={`font-serif text-2xl ${s.color}`}>{s.val}</p>
              <p className="text-xs text-amber-100/50">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="İsim, email veya telefon ara..."
          className="flex-1 bg-[#161616] border border-amber-500/20 rounded px-4 py-2 text-amber-50 text-sm focus:outline-none focus:border-amber-500"
        />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="bg-[#161616] border border-amber-500/20 rounded px-4 py-2 text-amber-50 text-sm focus:outline-none focus:border-amber-500">
          <option value="all">Tüm Roller</option>
          <option value="customer">Müşteri</option>
          <option value="editor">Editör</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Süper Admin</option>
        </select>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-[#161616] border border-amber-500/10 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-amber-100/50">Yükleniyor...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-black/30 border-b border-amber-500/10">
                <tr className="text-left text-xs text-amber-400 font-serif tracking-widest">
                  <th className="p-4">ÜYE</th>
                  <th className="p-4">TELEFON</th>
                  <th className="p-4">ROL</th>
                  <th className="p-4">KAYIT</th>
                  <th className="p-4">İŞLEM</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="p-10 text-center text-amber-100/40">Üye bulunamadı.</td></tr>
                )}
                {filtered.map(u => (
                  <tr key={u.id} onClick={() => setSelected(u)}
                    className={`border-b border-amber-500/5 cursor-pointer transition ${selected?.id === u.id ? 'bg-amber-500/10' : 'hover:bg-amber-500/5'}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-sm font-serif text-black font-bold">
                          {(u.name || u.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-amber-100 text-sm font-medium">{u.name || '-'}</p>
                          <p className="text-amber-100/50 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-amber-100/70 text-sm font-mono">{u.phone || '-'}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded ${ROLE_COLORS[u.role] || 'bg-gray-700/30 text-gray-300'}`}>{u.role}</span>
                    </td>
                    <td className="p-4 text-amber-100/50 text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('tr-TR') : '-'}</td>
                    <td className="p-4">
                      <button onClick={e => { e.stopPropagation(); deleteUser(u.id); }} disabled={deleting === u.id}
                        className="text-red-500 hover:text-red-400 disabled:opacity-40">
                        <Trash2 size={15}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <div className="w-80 bg-[#161616] border border-amber-500/20 rounded-lg p-6 flex-shrink-0 self-start sticky top-6">
            <div className="flex justify-between items-start mb-5">
              <h3 className="font-serif text-lg text-amber-50">Üye Detayı</h3>
              <button onClick={() => setSelected(null)} className="text-amber-100/40 hover:text-amber-100"><X size={18}/></button>
            </div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-2xl font-serif text-black font-bold mx-auto mb-4">
              {(selected.name || selected.email || '?')[0].toUpperCase()}
            </div>
            <div className="space-y-3 text-sm mb-5">
              <p className="text-amber-100/70">Ad: <span className="text-amber-100">{selected.name || '-'}</span></p>
              <p className="text-amber-100/70">Email: <span className="text-amber-100">{selected.email}</span></p>
              <p className="text-amber-100/70">Tel: <span className="text-amber-100 font-mono">{selected.phone || '-'}</span></p>
              <p className="text-amber-100/70">Kayıt: <span className="text-amber-100">{selected.createdAt ? new Date(selected.createdAt).toLocaleString('tr-TR') : '-'}</span></p>
            </div>
            <div className="pt-5 border-t border-amber-500/10">
              <p className="text-xs text-amber-400 font-serif tracking-widest mb-2">ROL DEĞİŞTİR</p>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(r => (
                  <button key={r} onClick={() => updateRole(selected.id, r)}
                    className={`py-2 px-3 rounded text-xs font-serif tracking-wider border transition ${selected.role === r ? 'bg-amber-500 text-black border-amber-500' : 'border-amber-500/20 text-amber-100/70 hover:bg-amber-500/10'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => deleteUser(selected.id)}
              className="mt-4 w-full border border-red-500/40 text-red-400 py-2 rounded text-sm hover:bg-red-500/10 flex items-center justify-center gap-2">
              <Trash2 size={14}/> Üyeyi Sil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}