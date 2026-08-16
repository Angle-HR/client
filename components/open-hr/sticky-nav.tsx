'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button/button'

import { GetEarlyAccessButton } from './get-early-access-button'
import { Logo } from './logo'
import { NavLinks } from './nav-links'
import { scrollToHeroForm } from './scroll-to-hero-form'

function StickyNav() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById('product-preview')
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        // Only care about the sentinel scrolling out above the viewport
        // (the user has scrolled past it) vs. back into view — ignore it
        // not having been reached yet on initial mount.
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setVisible(true)
        } else if (entry.isIntersecting) {
          setVisible(false)
        }
      },
      // Shrinks the effective viewport 300px in from the top, so the
      // section counts as "scrolled past" while its last 300px are still
      // on screen, instead of waiting for it to fully clear the viewport.
      { threshold: 0, rootMargin: '-300px 0px 0px 0px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const tabIndex = visible ? undefined : -1

  return (
    <div
      className={`sticky-nav fixed inset-x-0 top-0 z-50 ${visible ? 'pointer-events-auto opacity-100' : 'pointer-events-none -translate-y-full opacity-0'}`}
      aria-hidden={!visible}
    >
      <div className="oh-nav-scrim px-[20px] py-[20px] md:px-[32px] md:pt-[20px] md:pb-[28px]">
        {/* Mobile: logo top-left, CTA absolutely centered on the right —
            matches Figma's fixed 32px-tall row rather than the desktop's
            three-way justified layout. */}
        <div className="relative h-[32px] w-full md:hidden">
          <div className="absolute top-[8px] left-0">
            <Logo tabIndex={tabIndex} />
          </div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2">
            <GetEarlyAccessButton size="sm" tabIndex={tabIndex} />
          </div>
        </div>

        {/* Desktop: three equal-width flex groups instead of a plain
            justify-between row — that's what makes the nav links land
            exactly centered regardless of the logo/button's own widths. */}
        <div className="mx-auto hidden w-full max-w-[1116px] items-center md:flex">
          <div className="flex flex-1 items-center justify-start">
            <Logo tabIndex={tabIndex} />
          </div>
          <nav
            aria-label="Sticky"
            className="flex flex-1 items-center justify-center gap-[10px]"
          >
            <NavLinks tabIndex={tabIndex} />
          </nav>
          <div className="flex flex-1 items-center justify-end">
            {/* Unlike the mobile CTA (and the hero/footer CTAs), Figma's
                desktop sticky nav uses the plain default Button, not the
                blue Flow Button — confirmed against node 6554-104894. */}
            <Button
              variant="primary"
              accent="default"
              size="md"
              tabIndex={tabIndex}
              onClick={scrollToHeroForm}
              iconSuffix={<Image src="/open-hr/icon-arrow-right.svg" alt="" width={11} height={9} />}
            >
              Get early access
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { StickyNav }
