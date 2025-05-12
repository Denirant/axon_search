// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { GeistSans } from 'geist/font/sans';
import 'katex/dist/katex.min.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Metadata, Viewport } from 'next';
import { Syne } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'sonner';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
    metadataBase: new URL('https://axonai.tech'),
    title: 'AXON.AI',
    description: 'Axon AI.',
    openGraph: {
        url: 'https://axonai.ai',
        siteName: 'Axon AI',
    },
    keywords: ['Axon.ai', 'Axon ai', 'Axon AI'],
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
    ],
};

const syne = Syne({
    subsets: ['latin'],
    variable: '--font-syne',
    preload: true,
    display: 'swap',
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${GeistSans.variable} ${syne.variable} font-sans antialiased`} suppressHydrationWarning>
                <NuqsAdapter>
                    <Providers>
                        <Toaster position="top-center" />
                        {children}
                    </Providers>
                </NuqsAdapter>
                <Analytics />
                <script async src="https://cdn.seline.com/seline.js" data-token={process.env.SELINE_TOKEN}></script>
            </body>
        </html>
    );
}