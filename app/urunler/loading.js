import Header from '@/components/Header';

export default function Loading() {
  return (
    <>
      <Header settings={{}}/>
      <main className="pt-32 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="text-center mb-12">
            <div className="h-3 w-24 bg-amber-500/20 rounded mx-auto mb-4 animate-pulse"/>
            <div className="h-12 w-64 bg-amber-500/10 rounded mx-auto animate-pulse"/>
          </div>
          <div className="flex gap-2 justify-center mb-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-9 w-24 bg-amber-500/10 rounded animate-pulse"/>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#161616] border border-amber-500/10 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-amber-500/5"/>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-amber-500/10 rounded w-3/4"/>
                  <div className="h-4 bg-amber-500/5 rounded w-1/2"/>
                  <div className="h-6 bg-amber-500/10 rounded w-1/3"/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}