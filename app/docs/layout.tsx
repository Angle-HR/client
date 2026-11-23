import { DocsShell } from '@/docs/components/docs-shell'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './docs.css'

export const metadata: Metadata = {
  title: { default: 'Open HR design system', template: '%s · Open HR design system' },
  description: 'Live documentation for the Open HR design system: foundations and components.',
  // Internal for now; decide before launch whether the docs are public.
  robots: { index: false, follow: false },
}

export default function DocsLayout({ children }: { children: ReactNode }) {
  return <DocsShell>{children}</DocsShell>
}
