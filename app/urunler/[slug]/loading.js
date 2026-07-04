import Header from '@/components/Header';

export default function Loading() {
  return (
    <>
      <Header settings={{}}/>
      <main className="pt-32 pb-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Görsel skeleton */}
            <div>
              <div className="aspect-square bg-[#161616] rounded-lg animate-pulse"/>
              <div className="flex gap-3 mt-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-20 h-20 rounded bg-amber-500/10 animate-pulse"/>
                ))}
              </div>
            </div>
            {/* İçerik skeleton */}
            <div className="space-y-4">
              <div className="h-4 w-20 bg-amber-500/20 rounded animate-pulse"/>
              <div className="h-12 w-3/4 bg-amber-500/10 rounded animate-pulse"/>
              <div className="h-4 w-32 bg-amber-500/5 rounded animate-pulse"/>
              <div className="h-10 w-48 bg-amber-500/10 rounded animate-pulse"/>
              <div className="space-y-2 mt-4">
                <div className="h-4 w-full bg-amber-500/5 rounded animate-pulse"/>
                <div className="h-4 w-5/6 bg-amber-500/5 rounded animate-pulse"/>
                <div className="h-4 w-4/6 bg-amber-500/5 rounded animate-pulse"/>
              </div>
              <div className="h-14 w-full bg-amber-500/10 rounded animate-pulse mt-6"/>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}