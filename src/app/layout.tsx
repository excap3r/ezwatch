import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ezwatch',
  description: 'Watch your favorite movies and TV shows',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-gray-900 to-gray-800`}>
        {children}
      </body>
    </html>
  )
}