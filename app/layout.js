import { Inter, Cinzel } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' });

export const metadata = {
  title: 'Ayıntap Balta Kılıç | Geleneksel Türk El Yapımı Kılıç ve Balta',
  description: 'Örsün üzerinde dövülen ataların mirası. Geleneksel yöntemlerle üretilen el yapımı kılıç, balta ve koleksiyon eserleri.',
  keywords: 'el yapımı kılıç, balta, türk kılıcı, osmanlı kılıcı, koleksiyon, gaziantep, ayintap',
  openGraph: {
    title: 'Ayıntap Balta Kılıç',
    description: 'Çeliğe Can Veren Gelenek',
    type: 'website',
    locale: 'tr_TR',
  },
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
