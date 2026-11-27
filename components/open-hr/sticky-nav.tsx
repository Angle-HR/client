'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button/button'
import { appUrl } from '@/lib/app-url'

import { Logo } from './logo'

interface StickyNavProps {
  // The element whose scroll position triggers reveal — defaults to the
  // landing page's own product screenshot section. Pages without that
  // section (Privacy Policy, Terms & Conditions) pass their own sentinel.
  sentinelId?: string
}

function StickyNav({ sentinelId = 'legal-nav-sentinel' }: StickyNavProps) {
  const [visible, setVisible] = useState(false)
  const goSignup = () => window.location.assign(appUrl('/signup'))

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId)
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
  }, [sentinelId])

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
            <Button
              variant="primary"
              accent="default"
              size="sm"
              tabIndex={tabIndex}
              onClick={goSignup}
            >
              Sign up
            </Button>
          </div>
        </div>

        {/* Desktop: three equal-width flex groups instead of a plain
            justify-between row — that's what makes the nav links land
            exactly centered regardless of the logo/button's own widths. */}
        <div className="mx-auto hidden w-full max-w-[1116px] items-center md:flex">
          <div className="flex flex-1 items-center justify-start">
            <Logo tabIndex={tabIndex} />
          </div>
          <div className="flex-1" />
          <div className="flex flex-1 items-center justify-end">
            <Button
              variant="primary"
              accent="default"
              size="md"
              tabIndex={tabIndex}
              onClick={goSignup}
            >
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { StickyNav }
