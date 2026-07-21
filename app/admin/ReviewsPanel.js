'use client';
import { useState, useEffect } from 'react';
import { Star, Check, X, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewsPanel() {
  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const qs = statusFilter ? `?status=${statusFilter}` : '';
    fetch(`/api/admin/reviews${qs}`).then(r => r.json()).then(d => { setReviews(d.reviews || []); setLoading(false); });
  };
  useEffect(() => { load(); }, [statusFilter]);

  const updateReview = async (id, patch) => {
    await fetch(`/api/admin/reviews/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
    toast.success('Güncellendi');
    load();
  };

  const deleteReview = async (id) => {
    if (!confirm('Bu yorum silinsin mi?')) return;
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    toast.success('Silindi');
    load();
  };

  const FILTERS = [
    { id: 'pending', label: 'Onay Bekleyen' },
    { id: 'approved', label: 'Onaylı' },
    { id: 'rejected', label: 'Reddedilen' },
    { id: '', label: 'Tümü' },
  ];

  return (
    <div className="p-10">
      <h1 className="font-serif text-4xl text-amber-50 mb-2">Yorum Yönetimi</h1>
      <p className="text-amber-100/50 mb-8">Müşteri değerlendirmelerini onayla, öne çıkar veya kaldır</p>

      <div className="flex gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={`px-4 py-2 rounded font-serif text-sm tracking-widest transition ${statusFilter === f.id ? 'bg-amber-500 text-black' : 'border border-amber-500/30 text-amber-100/70 hover:bg-amber-500/10'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-amber-100/50">Yükleniyor...</p>}
      {!loading && reviews.length === 0 && <p className="text-amber-100/40">Bu filtrede yorum yok.</p>}

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-[#161616] border border-amber-500/10 rounded-lg p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[240px]">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-serif text-amber-100">{r.userName}</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={13} className={i < r.rating ? 'text-amber-500 fill-amber-500' : 'text-amber-500/20'}/>)}
                  </div>
                  {r.productName && <span className="text-amber-400/70 text-xs">{r.productName}</span>}
                  <span className={`text-[10px] px-2 py-0.5 rounded font-serif tracking-wide ${
                    r.status === 'approved' ? 'bg-emerald-700/30 text-emerald-300' :
                    r.status === 'rejected' ? 'bg-red-700/30 text-red-300' :
                    'bg-amber-700/30 text-amber-300'
                  }`}>{r.status}</span>
                  {r.featured && <span className="text-[10px] px-2 py-0.5 rounded bg-purple-700/30 text-purple-300 font-serif tracking-wide flex items-center gap-1"><Sparkles size={10}/> Öne Çıkan</span>}
                </div>
                <p className="text-amber-100/70 text-sm mt-2">{r.text}</p>
                {r.photos?.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {r.photos.map((p, i) => (
                      <img key={i} src={p} alt="" className="w-16 h-16 object-cover rounded border border-amber-500/20"/>
                    ))}
                  </div>
                )}
                <p className="text-amber-100/30 text-xs mt-2">{new Date(r.createdAt).toLocaleString('tr-TR')}</p>
              </div>

              <div className="flex gap-2 shrink-0">
                {r.status !== 'approved' && (
                  <button onClick={() => updateReview(r.id, { status: 'approved' })} className="p-2 border border-emerald-500/40 text-emerald-400 rounded hover:bg-emerald-500/10 transition" title="Onayla">
                    <Check size={16}/>
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button onClick={() => updateReview(r.id, { status: 'rejected' })} className="p-2 border border-red-500/40 text-red-400 rounded hover:bg-red-500/10 transition" title="Reddet">
                    <X size={16}/>
                  </button>
                )}
                {r.status === 'approved' && (
                  <button onClick={() => updateReview(r.id, { featured: !r.featured })} className={`p-2 border rounded transition ${r.featured ? 'border-purple-500/60 text-purple-300 bg-purple-500/10' : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'}`} title="Ana Sayfada Öne Çıkar">
                    <Sparkles size={16}/>
                  </button>
                )}
                <button onClick={() => deleteReview(r.id)} className="p-2 border border-red-500/20 text-red-400/70 rounded hover:bg-red-500/10 transition" title="Sil">
                  <Trash2 size={16}/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}