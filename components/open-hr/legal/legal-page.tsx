import { type ReactNode } from 'react'

import { FooterBottom } from '../footer-bottom'
import { FooterCta } from '../footer-cta'
import { Header } from '../header'
import { StickyNav } from '../sticky-nav'

// Shared shell for the Privacy Policy and Terms & Conditions pages — both
// are the same structure in Figma (header, title, optional meta block,
// a list of numbered sections, then the site's standard FooterCta +
// FooterBottom), just different content. One layout + two content data
// files avoids duplicating that structure twice.

type LegalBlock =
  | { kind: 'subheading'; text: string }
  | { kind: 'p'; children: ReactNode }
  | { kind: 'list'; items: ReactNode[] }

interface LegalSection {
  heading: string
  blocks: LegalBlock[]
}

interface LegalPageProps {
  title: string
  meta?: string[]
  sections: LegalSection[]
}

// Every inline mailto/external link in the legal content bodies (there are
// a lot of them) shares this style — matches the focus-visible pattern
// used for every other link on this page.
function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  const isExternal = href.startsWith('http')
  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="rounded-sm-6 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected"
    >
      {children}
    </a>
  )
}

function LegalBlockView({ block }: { block: LegalBlock }) {
  if (block.kind === 'subheading') {
    return (
      <p className="w-full text-[1rem] leading-[24px] font-semibold text-[color:var(--oh-text-primary)]">
        {block.text}
      </p>
    )
  }
  if (block.kind === 'list') {
    return (
      <ul className="w-full list-disc space-y-[8px] pl-[21px] text-[0.8625rem] leading-[21px] text-[color:var(--oh-text-secondary)]">
        {block.items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    )
  }
  return (
    <p className="w-full text-[0.8625rem] leading-[21px] whitespace-pre-line text-[color:var(--oh-text-secondary)]">
      {block.children}
    </p>
  )
}

function LegalPage({ title, meta, sections }: LegalPageProps) {
  return (
    <>
      <StickyNav sentinelId="legal-nav-sentinel" basePath="/" />
      <Header basePath="/" />
      <main className="flex flex-1 flex-col">
        <section className="relative flex justify-center px-[20px] py-[80px] md:px-[32px]">
          {/* Sticky nav's reveal sentinel. StickyNav's observer uses a
              -300px top rootMargin, so it only fires a transition when the
              sentinel crosses that line — a thin marker sitting above it at
              rest (like right after the title) starts "not intersecting"
              and never crosses again while scrolling. This spans down from
              the section's own top instead, so it starts inside the counted
              region and fully exits it after a modest scroll, regardless of
              whether this page has a meta block or how tall the title is. */}
          <div id="legal-nav-sentinel" aria-hidden className="absolute inset-x-0 top-0 h-[420px]" />
          <div className="flex w-full max-w-[698px] flex-col items-center gap-[44px]">
            <div className="flex w-full flex-col items-center gap-[28px]">
              <h1 className="w-full text-center text-[1.75rem] leading-[1.2] font-semibold tracking-[-0.44px] text-[color:var(--oh-text-primary)] md:text-[2.575rem]">
                {title}
              </h1>
              {meta && (
                <div className="w-full text-[0.8625rem] leading-[21px] text-[color:var(--oh-text-secondary)]">
                  {meta.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              )}
              <div className="flex w-full flex-col gap-[44px]">
                {sections.map((section) => (
                  <div key={section.heading} className="flex w-full flex-col gap-[16px]">
                    <h2 className="w-full text-[1.1625rem] leading-[23px] font-semibold text-[color:var(--oh-text-primary)]">
                      {section.heading}
                    </h2>
                    {section.blocks.map((block, index) => (
                      <LegalBlockView key={index} block={block} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <FooterCta />
      </main>
      <FooterBottom />
    </>
  )
}

export { LegalPage, LegalLink }
export type { LegalBlock, LegalSection }
