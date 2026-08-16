import { FooterBottom } from '@/components/open-hr/footer-bottom'
import { Header } from '@/components/open-hr/header'
import { SuccessSection } from '@/components/open-hr/success-section'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "You're on the list — Open HR",
  description: 'Thanks for joining the Open HR waitlist — check your inbox for a confirmation email.',
}

export default function OpenHrSuccessPage() {
  return (
    <>
      <Header basePath="/open-hr" />
      {/* flex flex-col (not just flex-1) so SuccessSection's own flex-1
          below can chain through it — a percentage height (h-full) doesn't
          reliably resolve through an intermediate flex item that got its
          size from flex-grow rather than an explicit height. */}
      <main className="flex flex-1 flex-col">
        <SuccessSection />
      </main>
      <FooterBottom />
    </>
  )
}
