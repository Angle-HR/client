import Image from 'next/image'

import { SOCIAL_LINKS } from './social-links'

function FooterBottom() {
  return (
    <footer className="flex justify-center px-[20px] pt-[32px] pb-[40px] md:px-[10px] md:pb-[80px]">
      <div className="flex w-full max-w-[1234px] flex-col items-center gap-[16px] md:flex-row md:justify-center md:gap-[14px]">
        <div className="order-2 flex flex-wrap items-center justify-center gap-[10px] text-center text-[0.8125rem] leading-[19.5px] text-[color:var(--oh-text-secondary)] md:order-1">
          <span>©2026 OpenHR</span>
          <a
            href="/privacy-policy"
            className="rounded-sm-6 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="rounded-sm-6 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected"
          >
            Terms and Conditions
          </a>
        </div>
        <div className="order-1 flex items-center md:order-2">
          {/* Real anchors, not IconButton — IconButton only renders a
              <button> (no href), and these need proper external-link
              behavior (middle-click, right-click "open in new tab", screen
              readers announcing "link"). IconButton's own "light" variant
              styling is replicated here, plus a focus-visible ring (which
              "light" omits) to match every other link on this page. */}
          <a
            href={SOCIAL_LINKS.x}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="OpenHR on X"
            className="border-transparent bg-bg-transparent-lighter text-text-secondary hover:bg-bg-transparent-light active:bg-bg-transparent-medium rounded-sm-7 relative inline-flex h-[32px] w-[32px] items-center justify-center border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected"
          >
            <span className="inline-flex h-[20px] w-[20px] items-center justify-center">
              <Image src="/open-hr/icon-twitter.svg" alt="" width={16} height={16} />
            </span>
          </a>
          <a
            href={SOCIAL_LINKS.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="OpenHR on LinkedIn"
            className="border-transparent bg-bg-transparent-lighter text-text-secondary hover:bg-bg-transparent-light active:bg-bg-transparent-medium rounded-sm-7 relative inline-flex h-[32px] w-[32px] items-center justify-center border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected"
          >
            <span className="inline-flex h-[20px] w-[20px] items-center justify-center">
              <Image src="/open-hr/icon-linkedin.svg" alt="" width={16} height={16} />
            </span>
          </a>
        </div>
      </div>
    </footer>
  )
}

export { FooterBottom }
