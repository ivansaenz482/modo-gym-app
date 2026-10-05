import type { Metadata, Viewport } from 'next';
import { Inter, Barlow_Condensed } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-barlow',
  display: 'swap',
});

const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.modogym.app';

export const metadata: Metadata = {
  metadataBase: new URL('https://modo-gym.vercel.app'),
  title: 'MODO GYM — El poder está en tu interior',
  description:
    'MODO GYM: entrenamiento, rutinas con IA, dieta, progreso y más de 1.300 ejercicios con video. Descárgala en Google Play o úsala como app web.',
  keywords: ['gym', 'fitness', 'rutinas', 'entrenamiento', 'dieta', 'MODO GYM'],
  openGraph: {
    title: 'MODO GYM — El poder está en tu interior',
    description: 'Entrenamiento, rutinas con IA, dieta y progreso. Mente + Corazón + Fuerza.',
    type: 'website',
    locale: 'es_EC',
  },
  icons: { icon: '/icons/icon-192.png', apple: '/icons/apple-touch-icon.png' },
  alternates: { canonical: PLAY_STORE },
};

export const viewport: Viewport = {
  themeColor: '#E10600',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${barlow.variable}`}>
      <body className="font-sans antialiased selection:bg-modo-orange/30">{children}</body>
    </html>
  );
}
