import { Inter, Cinzel } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' });

export const metadata = {
  title: 'Ayıntap Kılıç | Geleneksel Türk El Yapımı Kılıç ve Balta',
  description: 'Örsün üzerinde dövülen ataların mirası. Geleneksel yöntemlerle üretilen el yapımı kılıç, balta ve koleksiyon eserleri.',
  keywords: 'el yapımı kılıç, balta, türk kılıcı, osmanlı kılıcı, koleksiyon, gaziantep, ayintap',
  openGraph: {
  title: 'Ayıntap Kılıç | El Yapımı Türk Kılıcı',
  description: 'Örsün üzerinde dövülen ataların mirası. Geleneksel yöntemlerle üretilen el yapımı kılıç ve koleksiyon eserleri.',
  type: 'website',
  locale: 'tr_TR',
  url: 'https://www.ayintapkilic.com',
  siteName: 'Ayıntap Kılıç',
  images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Ayıntap Kılıç' }],
},
twitter: {
  card: 'summary_large_image',
  title: 'Ayıntap Kılıç | El Yapımı Türk Kılıcı',
  description: 'Örsün üzerinde dövülen ataların mirası.',
  images: ['/og-image.jpg'],
},
metadataBase: new URL('https://www.ayintapkilic.com'),
  robots: 'index, follow',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${inter.variable} ${cinzel.variable}`}>
      <body className="bg-[#0d0d0d] text-amber-50 antialiased">
        {children}
        <Toaster theme="dark" position="top-right" toastOptions={{ style: { background: '#161616', border: '1px solid rgba(212,175,55,0.3)', color: '#fef3c7' } }}/>
      </body>
    </html>
  );
}
