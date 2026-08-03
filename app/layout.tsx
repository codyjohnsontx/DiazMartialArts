import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { WebSiteSchema } from '@/components/WebSiteSchema';
import { site } from '@/content/site';
import { getPublicEnv } from '@/lib/env';

import './globals.css';

const bodyFont = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body',
});

const { siteUrl } = getPublicEnv();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  icons: {
    icon: '/diaz_logo.png',
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: site.name,
    description: site.description,
    type: 'website',
    url: siteUrl,
    images: [{ url: '/og-default.svg', alt: `${site.name} OpenGraph image` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.description,
    images: ['/og-default.svg'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={bodyFont.variable}>
      <body className="font-[var(--font-body)] antialiased">
        <WebSiteSchema />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-md focus:bg-ember focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
