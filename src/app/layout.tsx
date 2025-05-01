import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { ThemeToggle } from '@/components/ui/theme-toggle'

// Inter is a good alternative to SF Pro while being freely available
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
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
    <html lang="en" className={`scroll-smooth ${inter.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground min-h-screen">
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange
        >
          {children}
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  )
}

