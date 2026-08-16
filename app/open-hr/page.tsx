import { FaqSection } from '@/components/open-hr/faq-section'
import { FooterBottom } from '@/components/open-hr/footer-bottom'
import { FooterCta } from '@/components/open-hr/footer-cta'
import { Header } from '@/components/open-hr/header'
import { Hero } from '@/components/open-hr/hero'
import { ProductPreview } from '@/components/open-hr/product-preview'
import { StickyNav } from '@/components/open-hr/sticky-nav'
import { StorySection } from '@/components/open-hr/story-section'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Open HR — Open source HR, your way',
  description:
    'Hire, manage, and grow your team without expensive contracts or lock-in. Built for startups and small businesses.',
}

export default function OpenHrLandingPage() {
  return (
    <>
      <StickyNav />
      <Header />
      <main className="flex-1">
        <Hero />
        <ProductPreview />
        <StorySection />
        <FaqSection />
        <FooterCta />
      </main>
      <FooterBottom />
    </>
  )
}
