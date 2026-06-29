import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ChevronRight, Calendar, Tag } from 'lucide-react';

export const metadata = {
  title: 'Blog · Ayıntap Balta Kılıç',
  description: 'Demircilik geleneği, kılıç sanatı, Anadolu mirasi ve daha fazlası.',
};

async function fetchData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const [posts, st] = await Promise.all([
    fetch(`${base}/api/blog`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ posts: [] })),
    fetch(`${base}/api/settings`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ settings: {} })),
  ]);
  return { posts: posts.posts || [], settings: st.settings || {} };
}

export default async function BlogPage() {
  const { posts, settings } = await fetchData();
  return (
    <>
      <Header settings={settings}/>
      <main className="pt-32 pb-20 min-h-screen">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-amber-500/40"/>
              <span className="text-amber-400 tracking-[0.3em] text-xs font-serif uppercase">Yazılar</span>
              <div className="h-px w-12 bg-amber-500/40"/>
            </div>
            <h1 className="font-serif text-5xl text-amber-50">Demirci Mektubu</h1>
            <p className="mt-4 text-amber-100/60 max-w-2xl mx-auto">Anadolu’nun ateşinden hikâyeler, ustalık yazıları ve koleksiyon notları.</p>
          </div>
          {posts.length === 0 ? (
            <div className="text-center text-amber-100/50 py-20">Henüz yazı yok.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="group bg-[#161616] border border-amber-500/10 rounded-lg overflow-hidden hover:border-amber-500/40 transition">
                  {p.coverImage && <div className="aspect-[16/10] overflow-hidden"><img src={p.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition duration-700"/></div>}
                  <div className="p-5">
                    {p.category && <span className="text-xs text-amber-400 tracking-widest">{p.category.toUpperCase()}</span>}
                    <h3 className="font-serif text-xl text-amber-50 mt-2 group-hover:text-amber-400 transition">{p.title}</h3>
                    {p.excerpt && <p className="text-amber-100/60 text-sm mt-3 line-clamp-3">{p.excerpt}</p>}
                    <div className="flex items-center gap-3 mt-4 text-xs text-amber-100/40">
                      <Calendar size={12}/> {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('tr-TR') : new Date(p.createdAt).toLocaleDateString('tr-TR')}
                      {p.author && <><span>·</span><span>{p.author}</span></>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer settings={settings}/>
    </>
  );
}
