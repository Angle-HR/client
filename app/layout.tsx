import { Inter, Fira_Code } from 'next/font/google'

import { Providers } from '@/providers'

import type { Metadata } from 'next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'OpenHR',
  description:
    'Open HR lets you create jobs, track applications, and manage your team. Built so any founder or small team can start hiring in minutes, with zero delay.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): React.ReactElement {
  return (
    <html lang="en" className={`${inter.variable} ${firaCode.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
