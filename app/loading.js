export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Hero skeleton */}
      <div className="h-screen bg-amber-500/5 animate-pulse flex items-center justify-center">
        <div className="space-y-6 text-center">
          <div className="h-4 w-32 bg-amber-500/20 rounded mx-auto"/>
          <div className="h-16 w-96 bg-amber-500/10 rounded mx-auto"/>
          <div className="h-6 w-72 bg-amber-500/5 rounded mx-auto"/>
          <div className="flex gap-4 justify-center">
            <div className="h-12 w-40 bg-amber-500/20 rounded"/>
            <div className="h-12 w-32 bg-amber-500/10 rounded"/>
          </div>
        </div>
      </div>
    </div>
  );
}