import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { CartDrawer } from '@/components/features/cart/CartDrawer';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ChatProvider, PublicSupportChat } from '@/components/chat';
import { siteConfig, metadataDefaults } from '@/config/site';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: metadataDefaults.title,
  description: metadataDefaults.description,
  keywords: metadataDefaults.keywords,
  authors: metadataDefaults.authors,
  creator: metadataDefaults.creator,
  publisher: metadataDefaults.publisher,
  openGraph: {
    ...metadataDefaults.openGraph,
    title: metadataDefaults.title.default,
    description: metadataDefaults.description,
  },
  twitter: metadataDefaults.twitter,
  robots: metadataDefaults.robots,
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#16a34a',  // SEI Tech Green
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen flex flex-col bg-white font-sans">
        <AuthProvider>
          <ChatProvider>
            {children}
            <CartDrawer />
            <PublicSupportChat />
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
