import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

// Updated metadata for the specific application
export const metadata: Metadata = {
  title: 'Crypto & Web3 Good First Issues',
  description: 'Find beginner-friendly issues in popular crypto, web3, blockchain, and DeFi projects to start contributing.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      {/* Removed default dark mode, added font-sans for better readability */}
      <body className={`${geistSans.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}

