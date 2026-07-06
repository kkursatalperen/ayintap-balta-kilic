'use client';
import Link from 'next/link';

export default function CustomerPhotos({ data }) {
  // data içindeki instagramUrl yoksa varsayılan olarak '#' koyar
  const instaLink = data.instagramUrl || 'https://instagram.com/ayintapbaltakilic';

  return (
    <section className="py-20 bg-[#0a0a0a] text-amber-50">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
        <div className="lg:col-span-1">
          <h2 className="text-3xl font-serif text-amber-500 mb-4">{data.title}</h2>
          <p className="text-amber-100/70 mb-6 font-serif">{data.subtitle}</p>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">{data.description}</p>
          
          {/* Instagram'a yönlendiren buton */}
          <Link 
            href={instaLink} 
            target="_blank"
            className="inline-block bg-amber-600/10 border border-amber-500/50 px-6 py-3 hover:bg-amber-500 hover:text-black transition-all font-serif tracking-widest"
          >
            {data.buttonText || 'Topluluktan Paylaşımlar →'}
          </Link>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.photos && data.photos.map((photo, i) => (
            <div key={i} className="aspect-[3/4] rounded-lg overflow-hidden border border-amber-500/10 relative group">
              <img src={photo.url} alt="Topluluk" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}