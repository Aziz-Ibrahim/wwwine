import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'wwwine — World Wide Wine Atlas',
  description:
    'An interactive atlas of the world\'s great wine regions. Explore appellations, ancient mythology, and notable houses. Compare styles across continents.',
  keywords: ['wine', 'atlas', 'appellations', 'wine regions', 'Bordeaux', 'Burgundy', 'Napa', 'comparison'],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'wwwine — World Wide Wine Atlas',
    description: 'Explore the world\'s great wine regions, their mythology, appellations, and notable houses.',
    type: 'website',
    images: [{ url: '/wwwine-logo.png' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Cinzel:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
