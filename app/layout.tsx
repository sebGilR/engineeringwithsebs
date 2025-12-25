import '../styles/globals.css';
import { Inter, Fraunces, IBM_Plex_Mono } from 'next/font/google';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'Engineering with Sebs',
  description: 'An engineering notebook in public. Notes on systems, decisions, and tradeoffs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fraunces.variable} ${ibmPlexMono.variable} font-sans`}>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
