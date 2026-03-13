import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Bebas_Neue, Manrope } from 'next/font/google';

import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { WebSiteSchema } from '@/components/WebSiteSchema';
import { site } from '@/content/site';
import { getPublicEnv, getRequiredClerkEnv } from '@/lib/env';

import './globals.css';

const headingFont = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-heading',
});

const bodyFont = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
});

const { siteUrl } = getPublicEnv();
const { publishableKey } = getRequiredClerkEnv();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  icons: {
    icon: '/diaz_logo.avif',
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
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body className="font-[var(--font-body)] antialiased">
        <ClerkProvider publishableKey={publishableKey}>
          <WebSiteSchema />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-md focus:bg-ember focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            Skip to main content
          </a>
          <AnnouncementBar />
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
