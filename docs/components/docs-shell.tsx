'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

import { IconButton } from '@/components/ui/button'
import { MaskIcon } from '@/components/ui/icons'
import { Overlay, Sidebar, SidebarGroupItem, SidebarItem } from '@/components/ui/sidebar'
import { DOCS_HOME, DOCS_NAV } from '@/docs/nav'
import { useTheme } from '@/providers/theme'

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

function DocsNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <Sidebar
      className="h-full"
      companySelector={
        <a
          href="/docs"
          onClick={onNavigate}
          className="flex h-[32px] items-center gap-[8px] rounded-sm-7 px-[8px] body-s-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-bg-selection-controls-selected"
        >
          Open HR <span className="body-s-regular text-text-tertiary">Design system</span>
        </a>
      }
    >
      <div className="flex flex-col gap-[2px]">
        <SidebarItem
          label={DOCS_HOME.label}
          href={DOCS_HOME.href}
          active={pathname === DOCS_HOME.href}
          onClick={onNavigate}
        />
      </div>
      {DOCS_NAV.map((group) => (
        <SidebarGroupItem
          key={group.key}
          title={group.title}
          items={group.items.map((item) => ({
            label: item.label,
            href: item.href,
            active: pathname === item.href,
            onClick: onNavigate,
          }))}
        />
      ))}
    </Sidebar>
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

      <main className="flex min-w-0 flex-1 flex-col p-0 md:py-[5px] md:pr-[5px]">
        <div
          id="docs-scroll"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-bg-secondary md:rounded-lg-10 md:outline-[0.5px] md:-outline-offset-[0.5px] md:outline-border-transparent-medium"
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
              <span className="body-s-medium text-text-secondary">Live docs</span>
            </div>
            <ThemeSwitch />
          </header>
          <article className="docs-prose mx-auto w-full max-w-[880px] px-[16px] pt-[32px] pb-[78px] md:px-[40px]">
            {children}
          </article>
        </div>
      </main>
    </div>
  )
}

export { DocsShell }
