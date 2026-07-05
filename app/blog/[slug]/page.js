import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Calendar, ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

async function fetchData(slug) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const [pr, st] = await Promise.all([
    fetch(`${base}/api/blog/${slug}`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ post: null })),
    fetch(`${base}/api/settings`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ settings: {} })),
  ]);
  return { post: pr.post, settings: st.settings || {} };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { post } = await fetchData(slug);
  if (!post) return { title: 'Yazı bulunamadı' };
  return {
    title: post.seo?.title || `${post.title} · Ayıntap Kılıç`,
    description: post.seo?.description || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
      type: 'article',
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const { post, settings } = await fetchData(slug);
  if (!post) notFound();
  return (
    <>
      <Header settings={settings}/>
      <main className="pt-32 pb-20 min-h-screen">
        <article className="max-w-3xl mx-auto px-6">
          <Link href="/blog" className="inline-flex items-center gap-2 text-amber-400 text-sm hover:underline mb-6"><ChevronLeft size={16}/> Bloga dön</Link>
          {post.category && <span className="text-xs text-amber-400 tracking-widest">{post.category.toUpperCase()}</span>}
          <h1 className="font-serif text-4xl md:text-5xl text-amber-50 mt-3">{post.title}</h1>
          <div className="flex items-center gap-3 mt-4 text-sm text-amber-100/50">
            <Calendar size={14}/> {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('tr-TR') : new Date(post.createdAt).toLocaleDateString('tr-TR')}
            {post.author && <><span>·</span><span>{post.author}</span></>}
          </div>
          {post.coverImage && <img src={post.coverImage} className="w-full rounded-lg mt-8 aspect-[16/9] object-cover"/>}
          {post.excerpt && <p className="mt-8 text-amber-100/80 text-lg font-serif italic border-l-2 border-amber-500 pl-5">{post.excerpt}</p>}
          <div className="mt-8 prose prose-invert max-w-none text-amber-100/80 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
          {post.tags?.length > 0 && (
            <div className="mt-10 pt-6 border-t border-amber-500/10 flex flex-wrap gap-2">
              {post.tags.map((t, i) => <span key={i} className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full">#{t}</span>)}
            </div>
          )}
        </article>
      </main>
      <Footer settings={settings}/>
    </>
  );
}
