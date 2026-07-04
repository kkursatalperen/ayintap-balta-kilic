'use client';
import { useState } from 'react';
import { Play, Tv } from 'lucide-react';

export default function MediaSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="py-20 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Tv className="text-amber-500" size={20}/>
            <span className="text-amber-500 text-xs font-serif tracking-[0.3em] uppercase">Medyada Biz</span>
          </div>
          <h2 className="font-serif text-4xl text-amber-50 mb-4">Haberlerde Ayintap Balta Kilic</h2>
          <p className="text-amber-100/50 max-w-xl mx-auto">Turk el yapimi celik gelenegi ve ustaca isciligimiz medyada yerini aldi.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Haber Videosu - YouTube */}
          <div className="group">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-amber-500/20 bg-black">
              {!playing ? (
                <div className="relative w-full h-full cursor-pointer" onClick={() => setPlaying(true)}>
                  <img
                    src="https://img.youtube.com/vi/a-2mcTTl3Hk/maxresdefault.jpg"
                    alt="Haber Videosu"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition duration-300">
                      <Play size={24} className="text-black ml-1" fill="black"/>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-xs text-amber-400 font-serif tracking-widest">HABER YAYINI</span>
                  </div>
                </div>
              ) : (
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/a-2mcTTl3Hk?autoplay=1"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
            <p className="mt-3 text-amber-100/60 text-sm font-serif">Televizyon Haber Yayini</p>
          </div>

          {/* Tanitim Videosu - Cloudinary */}
          <div className="group">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-amber-500/20 bg-black">
              <video
                className="w-full h-full object-cover"
                controls
                preload="metadata"
                poster=""
              >
                <source src="https://res.cloudinary.com/dd6r2yroe/video/upload/v1783178918/real_beiqhi.mp4" type="video/mp4"/>
              </video>
            </div>
            <p className="mt-3 text-amber-100/60 text-sm font-serif">Atоlye Tanitim Videosu</p>
          </div>

        </div>
      </div>
    </section>
  );
}