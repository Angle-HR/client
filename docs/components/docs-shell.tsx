'use client'

import { usePathname } from 'next/navigation'
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

import { IconButton } from '@/components/ui/button'
import { MaskIcon } from '@/components/ui/icons'
import { Divider } from '@/components/ui/notification/divider'
import { Overlay, Sidebar, SidebarGroupItem, SidebarItem } from '@/components/ui/sidebar'
import { DOCS_HOME, DOCS_NAV } from '@/docs/nav'
import { useTheme } from '@/providers/theme'

import { PageToc } from './page-toc'

import type { ThemePreference } from '@/lib/theme'

const THEMES: { key: ThemePreference; label: string; icon: ReactNode }[] = [
  {
    key: 'light',
    label: 'Light',
    icon: <MaskIcon src="/dashboard/icons/sun-outline.svg" size={14} />,
  },
  {
    key: 'dark',
    label: 'Dark',
    icon: <MaskIcon src="/dashboard/icons/moon-outline.svg" size={14} />,
  },
  {
    key: 'system',
    label: 'System',
    icon: <MaskIcon src="/dashboard/icons/computer-desktop-outline.svg" size={14} />,
  },
]

const CLOSED_KEY = 'docs-nav-closed'

function readClosed(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(CLOSED_KEY) ?? '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

/**
 * Which sidebar groups are closed. Remembered in this browser; the group
 * holding the current page always opens.
 */
function useClosedGroups(pathname: string) {
  const [closed, setClosed] = useState<string[]>([])
  // False until the saved groups are applied: they close without animating.
  const [restored, setRestored] = useState(false)
  const current = DOCS_NAV.find((group) => group.items.some((item) => item.href === pathname))?.key

  // Restore after hydration (so server and client render the same), but
  // before the browser paints, so saved groups don't visibly snap shut.
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a saved preference after mount
    setClosed(readClosed().filter((key) => key !== current))
    // Turn the open/close animation on only after that first, silent restore.
    const frame = requestAnimationFrame(() => setRestored(true))
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Landing on a page in a closed group opens it (adjusted during render, not in an effect).
  const [openedFor, setOpenedFor] = useState(current)
  if (current !== openedFor) {
    setOpenedFor(current)
    if (current && closed.includes(current)) setClosed(closed.filter((k) => k !== current))
  }

  const toggle = (key: string, open: boolean) =>
    setClosed((keys) => {
      const next = open ? keys.filter((k) => k !== key) : [...keys, key]
      try {
        localStorage.setItem(CLOSED_KEY, JSON.stringify(next))
      } catch {
        // Storage blocked: the group still opens and closes, it just isn't remembered.
      }
      return next
    })

  const isOpen = (key: string) => !closed.includes(key)

  return { isOpen, toggle, restored }
}

function DocsNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { isOpen, toggle, restored } = useClosedGroups(pathname)
  const navRef = useRef<HTMLDivElement>(null)

  // Keep the current page in view, e.g. after landing on a page far down the list.
  useEffect(() => {
    navRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' })
  }, [pathname])

  return (
    <div ref={navRef} className={restored ? 'contents' : 'contents [&_*]:transition-none!'}>
      <Sidebar
        className="h-full"
        companySelector={
          <a
            href="/docs"
            onClick={onNavigate}
            className="flex h-[32px] items-center gap-[8px] rounded-sm-7 px-[8px] body-s-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-bg-selection-controls-selected"
          >
            Open HR <span className="body-s-regular text-text-secondary">Design system</span>
          </a>
        }
      >
        {DOCS_NAV.map((group, index) => {
          const isComponents = group.key !== 'foundations'
          const groupNode = (
            <SidebarGroupItem
              key={group.key}
              title={group.title}
              open={isOpen(group.key)}
              onToggle={(open) => toggle(group.key, open)}
              // Component pages sit one step in from their group's title.
              className={isComponents ? '[&_ul]:pl-[16px]' : ''}
              items={group.items.map((item) => ({
                label: item.label,
                href: item.href,
                active: pathname === item.href,
                onClick: onNavigate,
              }))}
            />
          )
          // Overview sits over Foundations, and "Components" over the first
          // group after it, both 4px apart, with a divider between the two.
          if (index === 0)
            return (
              <div key={group.key} className="flex w-full flex-col gap-[4px]">
                <SidebarItem
                  label={DOCS_HOME.label}
                  href={DOCS_HOME.href}
                  active={pathname === DOCS_HOME.href}
                  onClick={onNavigate}
                />
                {groupNode}
              </div>
            )
          if (index === 1)
            return (
              <Fragment key={group.key}>
                <Divider padded />
                <div className="flex w-full flex-col gap-[4px]">
                  <p className="px-[8px] text-[11px] leading-[16px] font-medium tracking-[0.06em] text-text-primary uppercase">
                    Components
                  </p>
                  {groupNode}
                </div>
              </Fragment>
            )
          return groupNode
        })}
      </Sidebar>
    </div>
  )
}

function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  return (
    <div role="group" aria-label="Theme" className="flex items-center gap-[2px]">
      {THEMES.map((option) => (
        <IconButton
          key={option.key}
          size="sm"
          variant={theme === option.key ? 'secondary' : 'tertiary'}
          aria-pressed={theme === option.key}
          aria-label={`${option.label} theme`}
          title={`${option.label} theme`}
          icon={option.icon}
          onClick={() => setTheme(option.key)}
        />
      ))}
    </div>
  )
}

/**
 * The /docs frame. It is the dashboard's own frame — the design-system
 * Sidebar on the shell surface, content in an inset card — so the docs look
 * like the product they describe. Under 768px the sidebar becomes a drawer.
 */
/** The current page's name from the nav, shown in the top bar. */
function pageTitle(pathname: string) {
  if (pathname === DOCS_HOME.href) return DOCS_HOME.label
  for (const group of DOCS_NAV) {
    const item = group.items.find((i) => i.href === pathname)
    if (item) return item.label
  }
  return 'Design system'
}

function DocsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the drawer when the page changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- route change closes the drawer
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <div className="flex h-dvh w-full bg-bg-primary">
      <a
        href="#docs-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-[8px] focus:left-[8px] focus:z-[60] focus:rounded-sm-8 focus:bg-bg-light focus:px-[12px] focus:py-[8px] focus:body-s-medium focus:text-text-primary focus:shadow-sm"
      >
        Skip to content
      </a>
      <div className="hidden md:flex">
        <DocsNav />
      </div>

      {menuOpen && (
        <>
          <Overlay onClick={() => setMenuOpen(false)} className="md:hidden" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Docs navigation"
            className="fixed inset-y-0 left-0 z-50 flex bg-bg-primary shadow-lg md:hidden"
          >
            <DocsNav onNavigate={() => setMenuOpen(false)} />
            <div className="absolute top-[12px] right-[8px]">
              <IconButton
                size="sm"
                variant="tertiary"
                aria-label="Close navigation"
                icon={<MaskIcon src="/dashboard/icons/x-mark-outline.svg" size={14} />}
                onClick={() => setMenuOpen(false)}
              />
            </div>
          </div>
        </>
      )}

      <main className="relative flex min-w-0 flex-1 flex-col p-0 md:py-[5px] md:pr-[5px]">
        <div
          id="docs-scroll"
          className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-bg-secondary md:rounded-lg-10 md:outline-[0.5px] md:-outline-offset-[0.5px] md:outline-border-transparent-medium"
        >
          <header className="sticky top-0 z-10 flex h-[48px] shrink-0 items-center justify-between gap-[8px] border-b-[0.5px] border-border-transparent-medium bg-bg-secondary/80 px-[16px] backdrop-blur md:px-[24px]">
            <div className="flex items-center gap-[8px]">
              <span className="md:hidden">
                <IconButton
                  size="sm"
                  variant="tertiary"
                  aria-label="Open navigation"
                  aria-expanded={menuOpen}
                  icon={<MaskIcon src="/dashboard/icons/sidebar-outline.svg" size={14} />}
                  onClick={() => setMenuOpen(true)}
                />
              </span>
              <span className="body-s-medium text-text-secondary">{pageTitle(pathname)}</span>
            </div>
            <ThemeSwitch />
          </header>
          {/* Fixed column widths per breakpoint (padding included); full width below 1024px. */}
          <article
            id="docs-content"
            tabIndex={-1}
            className="docs-prose mx-auto outline-none w-full px-[16px] pt-[32px] pb-[78px] md:px-[40px] lg:w-[680px] xl:w-[760px] 2xl:w-[800px]"
          >
            {children}
          </article>
        </div>
        <PageToc />
      </main>
    </div>
  )
}

export { DocsShell }
