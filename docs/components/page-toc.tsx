'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Section {
  id: string
  title: string
  /** First paragraph under the heading, shown in the preview card. */
  excerpt: string
}

/** Offset from the top of the scroll area at which a heading counts as "current". */
const ACTIVE_OFFSET = 96

function headingText(h: HTMLElement) {
  // Skip the "#" anchor link inside the heading.
  return [...h.childNodes]
    .filter((node) => !(node instanceof HTMLElement && node.classList.contains('docs-anchor')))
    .map((node) => node.textContent)
    .join('')
    .trim()
}

function firstParagraph(h: HTMLElement) {
  for (let el = h.nextElementSibling; el && el.tagName !== 'H2'; el = el.nextElementSibling) {
    // Use the first paragraph, or the first bullet when a section opens with a list.
    const text =
      el.tagName === 'P'
        ? el.textContent
        : el.tagName === 'UL'
          ? el.querySelector('li')?.textContent
          : null
    if (text?.trim()) return text.trim()
  }
  return ''
}

function readSections(): Section[] {
  return [...document.querySelectorAll<HTMLHeadingElement>('.docs-prose h2[id]')].map((h) => ({
    id: h.id,
    title: headingText(h),
    excerpt: firstParagraph(h),
  }))
}

/**
 * "On this page" rail: one short line per section on the left edge, the
 * current one longer and darker. Hovering (or tabbing to) a line shows a small
 * preview of that section beside it, and the preview glides along as you move
 * down the rail. Hidden below 1024px, where there's no room beside the text.
 */
function PageToc() {
  const pathname = usePathname()
  const [sections, setSections] = useState<Section[]>([])
  const [active, setActive] = useState<string | null>(null)
  // The section being previewed. `shown` keeps the last one so the card can
  // fade out with its content still in it.
  const [hovered, setHovered] = useState<string | null>(null)
  const [shown, setShown] = useState<{ id: string; y: number } | null>(null)
  // True for the first frame of a new hover, so the card appears in place
  // instead of gliding in from wherever it was last time.
  const [instant, setInstant] = useState(true)
  const navRef = useRef<HTMLElement>(null)

  // Collect the headings after each navigation, and again whenever the page
  // content changes (client navigation, hot reload).
  useEffect(() => {
    const article = document.querySelector('.docs-prose')
    const refresh = () =>
      setSections((previous) => {
        const next = readSections()
        const same =
          next.length === previous.length &&
          next.every(
            (s, i) =>
              s.id === previous[i]?.id &&
              s.title === previous[i]?.title &&
              s.excerpt === previous[i]?.excerpt,
          )
        return same ? previous : next
      })
    refresh()
    if (!article) return
    const observer = new MutationObserver(refresh)
    observer.observe(article, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [pathname])

  // Track the section at the top of the scroll area.
  useEffect(() => {
    const scroller = document.getElementById('docs-scroll')
    if (!scroller || sections.length === 0) return
    let frame = 0
    const update = () => {
      frame = 0
      const top = scroller.getBoundingClientRect().top
      const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2
      let current = sections[0]?.id ?? null
      for (const section of sections) {
        const el = document.getElementById(section.id)
        if (el && el.getBoundingClientRect().top - top <= ACTIVE_OFFSET) current = section.id
      }
      setActive(atBottom ? (sections[sections.length - 1]?.id ?? current) : current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [sections])

  const go = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Scroll only the docs pane. scrollIntoView would also scroll the window.
    const scroller = document.getElementById('docs-scroll')
    if (scroller) {
      const top =
        el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop
      scroller.scrollTo({ top: top - 64, behavior: reduce ? 'auto' : 'smooth' })
    }
    history.replaceState(null, '', `#${id}`)
    setActive(id)
  }, [])

  const preview = (id: string, target: HTMLElement) => {
    const nav = navRef.current
    if (!nav) return
    const line = target.getBoundingClientRect()
    const y = line.top + line.height / 2 - nav.getBoundingClientRect().top
    setInstant(hovered === null)
    setHovered(id)
    setShown({ id, y })
  }

  // Let the "appear in place" frame render, then turn gliding back on.
  useEffect(() => {
    if (!instant || hovered === null) return
    const frame = requestAnimationFrame(() => setInstant(false))
    return () => cancelAnimationFrame(frame)
  }, [instant, hovered])

  if (sections.length < 2) return null

  const card = shown ? sections.find((s) => s.id === shown.id) : undefined
  const open = hovered !== null && card !== undefined

  return (
    <nav
      ref={navRef}
      aria-label="On this page"
      className="pointer-events-none absolute top-1/2 left-[18px] z-20 hidden -translate-y-1/2 lg:block"
      onMouseLeave={() => setHovered(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHovered(null)
      }}
    >
      {/* The rail. Each line is a real link, so keyboard and screen-reader users get the same list. */}
      <ul className="pointer-events-auto flex flex-col items-start py-[6px] pr-[12px]">
        {sections.map((section) => {
          const isActive = section.id === active
          const isHovered = section.id === hovered
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-label={section.title}
                aria-current={isActive ? 'location' : undefined}
                onMouseEnter={(event) => preview(section.id, event.currentTarget)}
                onFocus={(event) => preview(section.id, event.currentTarget)}
                onClick={(event) => {
                  event.preventDefault()
                  go(section.id)
                }}
                // 10px tall so the lines are easy to hit; the visible line is 1.5px.
                className="flex h-[10px] w-[30px] items-center justify-start rounded-xs-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected"
              >
                <span
                  className={[
                    'block h-[1.5px] rounded-full transition-[width,background-color] duration-150 ease-out motion-reduce:transition-none',
                    isActive || isHovered ? 'w-[18px]' : 'w-[12px]',
                    isActive
                      ? 'bg-text-primary'
                      : isHovered
                        ? 'bg-text-secondary'
                        : 'bg-text-tertiary/60',
                  ].join(' ')}
                />
              </a>
            </li>
          )
        })}
      </ul>

      {/* Preview of the hovered section. Decorative: the rail links carry the names. */}
      <div
        aria-hidden="true"
        style={{ transform: `translateY(${shown?.y ?? 0}px) translateY(-50%)` }}
        className={[
          'pointer-events-none absolute top-0 left-[26px] w-[240px]',
          instant ? '' : 'transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
          'motion-reduce:transition-none',
        ].join(' ')}
      >
        <div
          className={[
            'rounded-lg-10 bg-bg-primary px-[12px] py-[10px] shadow-lg outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium',
            'transition-[opacity,scale] ease-out motion-reduce:transition-none',
            open ? 'scale-100 opacity-100 duration-150' : 'scale-[0.98] opacity-0 duration-150',
          ].join(' ')}
        >
          {card && (
            <>
              <p className="truncate body-s-medium text-text-primary">{card.title}</p>
              {card.excerpt && (
                <p className="mt-[2px] line-clamp-3 body-xs-regular text-text-secondary">
                  {card.excerpt}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export { PageToc }
