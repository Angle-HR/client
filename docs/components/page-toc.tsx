'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface Section {
  id: string
  title: string
}

/** Offset from the top of the scroll area at which a heading counts as "current". */
const ACTIVE_OFFSET = 96

function readSections(): Section[] {
  return [...document.querySelectorAll<HTMLHeadingElement>('.docs-prose h2[id]')].map((h) => ({
    id: h.id,
    // Skip the "#" anchor link inside the heading.
    title: [...h.childNodes]
      .filter((node) => !(node instanceof HTMLElement && node.classList.contains('docs-anchor')))
      .map((node) => node.textContent)
      .join('')
      .trim(),
  }))
}

/**
 * "On this page" rail: one short line per section on the left edge, the
 * current one longer and darker. Hovering or tabbing into it opens a card with
 * the section names. Hidden below 1024px, where there's no room beside the text.
 */
function PageToc() {
  const pathname = usePathname()
  const [sections, setSections] = useState<Section[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  // Collect the headings after each navigation, and again whenever the page
  // content changes (client navigation, hot reload).
  useEffect(() => {
    const article = document.querySelector('.docs-prose')
    const refresh = () =>
      setSections((previous) => {
        const next = readSections()
        const same =
          next.length === previous.length &&
          next.every((s, i) => s.id === previous[i]?.id && s.title === previous[i]?.title)
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

  if (sections.length < 2) return null

  return (
    <nav
      aria-label="On this page"
      className="pointer-events-none absolute top-1/2 left-[18px] z-20 hidden -translate-y-1/2 lg:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      {/* The rail. Each line is a real link, so keyboard and screen-reader users get the same list. */}
      <ul className="pointer-events-auto flex flex-col items-start gap-[2px] py-[6px] pr-[12px]">
        {sections.map((section) => {
          const isActive = section.id === active
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-label={section.title}
                aria-current={isActive ? 'location' : undefined}
                onClick={(event) => {
                  event.preventDefault()
                  go(section.id)
                }}
                className="flex h-[8px] items-center justify-start rounded-xs-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected"
              >
                <span
                  className={[
                    'block h-[1.5px] rounded-full transition-[width,background-color] duration-150 ease-out motion-reduce:transition-none',
                    isActive ? 'w-[18px] bg-text-primary' : 'w-[12px] bg-text-tertiary/60',
                  ].join(' ')}
                />
              </a>
            </li>
          )
        })}
      </ul>

      {/* The card: section names, opened from the rail. Mouse-only shortcut; the rail links above carry the semantics. */}
      <div
        aria-hidden="true"
        className={[
          'absolute top-1/2 left-[34px] w-[220px] origin-left -translate-y-1/2 rounded-lg-10 bg-bg-primary p-[6px] shadow-lg outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium',
          'transition-[opacity,translate,scale] ease-out motion-reduce:transition-none',
          open
            ? 'pointer-events-auto translate-x-0 scale-100 opacity-100 duration-150'
            : 'pointer-events-none -translate-x-[4px] scale-[0.98] opacity-0 duration-100',
        ].join(' ')}
      >
        <p className="px-[8px] pt-[4px] pb-[6px] body-xs-medium text-text-tertiary">On this page</p>
        <ul className="flex flex-col">
          {sections.map((section) => {
            const isActive = section.id === active
            return (
              <li key={section.id}>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => go(section.id)}
                  className={[
                    'flex w-full items-center gap-[10px] rounded-sm-6 px-[8px] py-[5px] text-left body-s-regular transition-colors duration-100',
                    'hover:bg-bg-transparent-light hover:text-text-primary',
                    isActive ? 'text-text-primary' : 'text-text-secondary',
                  ].join(' ')}
                >
                  <span
                    aria-hidden="true"
                    className={[
                      'block h-[1.5px] shrink-0 rounded-full',
                      isActive ? 'w-[14px] bg-text-primary' : 'w-[10px] bg-text-tertiary/60',
                    ].join(' ')}
                  />
                  <span className="truncate">{section.title}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

export { PageToc }
