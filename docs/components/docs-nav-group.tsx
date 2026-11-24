'use client'

import Link from 'next/link'
import { useEffect, useId, useState } from 'react'

import { MaskIcon } from '@/components/ui/icons'

interface DocsNavGroupItem {
  label: string
  href: string
  active: boolean
}

interface DocsNavGroupProps {
  /** Stable key, used to remember whether the group is open. */
  id: string
  title: string
  /** File in public/dashboard/icons, without "-outline.svg". */
  icon: string
  items: DocsNavGroupItem[]
  onNavigate?: () => void
}

const STORAGE_KEY = 'docs-nav-closed'

function readClosed(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function writeClosed(id: string, closed: boolean) {
  try {
    const next = new Set(readClosed())
    if (closed) next.add(id)
    else next.delete(id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
  } catch {
    // Storage blocked: the group still opens and closes, it just isn't remembered.
  }
}

/**
 * A collapsible sidebar group: icon, small caps title and caret, with its
 * pages hanging off a vertical guide line. The line darkens beside the
 * current page. Open/closed is remembered per group, and a closed group opens
 * itself when you land on one of its pages.
 */
function DocsNavGroup({ id, title, icon, items, onNavigate }: DocsNavGroupProps) {
  const listId = useId()
  const [open, setOpen] = useState(true)
  const hasActive = items.some((item) => item.active)

  // Restore the saved state after hydration, so server and client render the same.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading saved preference after mount
    if (readClosed().includes(id) && !hasActive) setOpen(false)
    // Only on mount: later navigation is handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Landing on a page in a closed group opens it.
  useEffect(() => {
    if (hasActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- open the group that holds the current page
      setOpen(true)
    }
  }, [hasActive])

  const toggle = () => {
    setOpen((previous) => {
      writeClosed(id, previous)
      return !previous
    })
  }

  return (
    <section aria-label={title} className="flex w-full flex-col">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={listId}
        className="group flex h-[28px] w-full items-center gap-[8px] rounded-sm-7 px-[8px] text-left text-text-secondary transition-colors duration-100 hover:bg-bg-transparent-lighter hover:text-text-primary focus-visible:outline-2 focus-visible:outline-bg-selection-controls-selected"
      >
        <MaskIcon
          src={`/dashboard/icons/${icon}-outline.svg`}
          size={14}
          className="shrink-0 text-text-tertiary transition-colors duration-100 group-hover:text-text-secondary"
        />
        <span className="text-[11px] leading-[16px] font-medium tracking-[0.06em] uppercase">
          {title}
        </span>
        <MaskIcon
          src="/dashboard/icons/chev-down-solid.svg"
          size={10}
          className={`shrink-0 text-text-tertiary transition-transform duration-150 ease-out motion-reduce:transition-none ${open ? '' : '-rotate-90'}`}
        />
      </button>

      <div
        id={listId}
        // Out of the tab order while closed; height alone would leave links reachable.
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <ul // The guide line is drawn inside the list (not a border) so overflow-hidden,
          // needed for the collapse animation, doesn't clip the current-page marker.
          className="relative ml-[15px] flex min-h-0 flex-col gap-[2px] overflow-hidden pl-[7px] before:absolute before:inset-y-0 before:left-0 before:w-[1px] before:bg-border-transparent-strong"
        >
          {items.map((item) => (
            <li key={item.href} className="relative">
              {item.active && (
                <span
                  aria-hidden="true"
                  className="absolute top-[4px] bottom-[4px] -left-[7px] z-10 w-[1px] bg-text-primary"
                />
              )}
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={item.active ? 'page' : undefined}
                className={[
                  'flex h-[27px] items-center rounded-sm-7 px-[8px] text-[13px] leading-[19.5px] font-medium transition-colors duration-100',
                  'focus-visible:outline-2 focus-visible:outline-bg-selection-controls-selected',
                  item.active
                    ? 'bg-bg-transparent-light text-text-primary'
                    : 'text-text-secondary hover:bg-bg-transparent-lighter hover:text-text-primary',
                ].join(' ')}
              >
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export { DocsNavGroup }
