'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

import { SocialFollowButton } from './social-follow-button'
import { SOCIAL_LINKS } from './social-links'

// The success page's main content. success-hero-bg.webp is a pre-composited
// export straight from Figma (product mockup + its darkening baked in), not
// a CSS approximation — so it needs no extra opacity/scrim layered on top
// here. success-footer-bg.svg is this page's own dedicated wave graphic
// (not the shared FooterCta asset).
function SuccessSection() {
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Client-side route transitions don't reset focus the way a full page
  // load does, so move it to the page's heading on mount — the standard
  // accessibility pattern for SPA navigations.
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section className="relative -mt-[72px] flex flex-1 justify-center overflow-hidden px-[20px] md:-mt-[89px] md:px-[32px]">
      <div className="relative w-full max-w-[1116px]">
        {/* Background layer — fixed behind the content, never clipping it. */}
        <div className="absolute inset-x-0 top-0 z-0 h-[486px] overflow-hidden">
          <Image
            src="/open-hr/success-hero-bg.webp"
            alt=""
            aria-hidden
            fill
            className="object-cover"
          />
        </div>

        {/* Button group centers within a box matching Figma's total section
            height (703/756px) — independent of the footer-bg strip below,
            which is anchored to the *page's* stretched height (via the
            parent <main>'s flex-1 sticky-footer sizing), so it always sits
            just above FooterBottom regardless of viewport height. */}
        <div className="relative z-10 flex min-h-[703px] flex-col items-center justify-center gap-[32px] px-[20px] text-center md:min-h-[756px] md:gap-[40px]">
          <Image src="/open-hr/logo-mark.svg" alt="" width={40} height={40} />
          <div className="flex flex-col items-center gap-[16px]">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-[2rem] leading-[1.2] font-[550] tracking-[-0.55px] text-[color:var(--oh-text-primary)] outline-none"
            >
              You&apos;re on the list.
            </h1>
            <p className="text-[0.99375rem] leading-[24px] text-[color:var(--oh-text-secondary)]">
              Check your inbox for a confirmation
              <br />
              email from Open HR.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-[2px] md:gap-[12px]">
            <SocialFollowButton
              href={SOCIAL_LINKS.linkedin}
              icon={<Image src="/open-hr/icon-linkedin-follow.svg" alt="" width={14} height={14} />}
            >
              Follow us on LinkedIn
            </SocialFollowButton>
            <SocialFollowButton
              href={SOCIAL_LINKS.x}
              icon={<Image src="/open-hr/icon-x-follow.svg" alt="" width={14} height={14} />}
            >
              Follow us on X
            </SocialFollowButton>
          </div>
        </div>

        {/* Cropped to a compact strip — the asset's own lines only become
            visible near its bottom edge (a fade from transparent to opaque
            baked into the SVG), so most of its native 411px height is
            empty. Anchored to this section's full (stretched) height, not
            the button group's fixed-height box above, so it tracks the
            footer instead of drifting away from it on tall screens. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[140px] w-full overflow-hidden opacity-40">
          <Image
            src="/open-hr/success-footer-bg.svg"
            alt=""
            aria-hidden
            width={1116}
            height={411}
            className="absolute inset-x-0 bottom-0 w-full"
          />
        </div>
      </div>
    </section>
  )
}

export { SuccessSection }
