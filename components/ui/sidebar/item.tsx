'use client'

import { useState } from 'react'

import { Notification } from '../notification/notification'

import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from 'react'

interface SidebarItemProps {
  label?: string
  icon?: ReactNode
  href?: string
  active?: boolean
  loading?: boolean
  notificationCount?: number
  /** Unread with no count to show — the bare red dot Figma puts on Schedule. */
  unread?: boolean
  /**
   * Icon-only rail. The label becomes a hover tooltip and any count collapses
   * to a dot, since there is no room for either at 52px wide.
   */
  collapsed?: boolean
  onClick?: () => void
  className?: string
}

// Figma's real "Rest" export has no background at all (the docs' claimed
// bg/flow-btn/sec-hover rest token isn't present in the actual node) —
// treating the rendered node as ground truth here.
const stateClasses = 'hover:bg-bg-transparent-lighter hover:text-text-primary'
const activeClasses = 'bg-bg-transparent-light text-text-primary'

function SidebarItem({
  label,
  icon,
  href,
  active = false,
  loading = false,
  notificationCount,
  unread = false,
  collapsed = false,
  onClick,
  className = '',
}: SidebarItemProps) {
  // Where the collapsed rail's tooltip should sit, or null while hidden.
  const [tooltipAt, setTooltipAt] = useState<{ top: number; left: number } | null>(null)

  if (loading) {
    return (
      <div
        aria-hidden="true"
        className={`flex h-[27px] items-center gap-[8px] rounded-sm-7 px-[8px] py-[7px] ${collapsed ? 'w-[29px]' : 'w-full'} ${className}`}
      >
        <div className="h-full w-full rounded-xs-4 bg-gradient-to-r from-bg-gradient-transparent-light to-bg-gradient-transparent-lighter" />
      </div>
    )
  }

  const content = collapsed ? (
    <>
      {icon && (
        <span
          className="flex size-[13px] shrink-0 items-center justify-center text-current"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      {/* A count has nowhere to render on the rail, so it degrades to the same
          4px dot the design uses for unread state. */}
      {(notificationCount !== undefined || unread) && (
        <span className="absolute top-0 right-0 size-[4px] rounded-sm-7 border-[0.5px] border-border-notification bg-bg-notification" />
      )}
      {/* Tooltip stands in for the hidden label — hidden from AT because the
          control already carries it as its accessible name. It is fixed to the
          viewport rather than absolutely placed: the nav list scrolls, and a
          scroll container clips anything that pokes out sideways. */}
      {tooltipAt ? (
        <span
          aria-hidden="true"
          style={{ top: tooltipAt.top + 2, left: tooltipAt.left + 34 }}
          className="pointer-events-none fixed z-50 flex h-[21px] items-center rounded-sm-6 bg-dark-grey-1 px-[8px] text-[13px] leading-[19.5px] font-medium whitespace-nowrap text-white shadow-[0_2px_4px_#00000014,0_0_4px_#00000005]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 6 10"
            className="absolute top-1/2 -left-[5px] h-[10px] w-[6px] -translate-y-1/2 fill-dark-grey-1"
          >
            <path d="M6 0v10L.5 5.7a.9.9 0 0 1 0-1.4L6 0Z" />
          </svg>
          {label}
        </span>
      ) : null}
    </>
  ) : (
    <>
      {icon && (
        <span
          className="flex size-[13px] shrink-0 items-center justify-center text-current"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 items-center gap-[8px]">
        <span className="min-w-0 flex-1 truncate text-[13px] leading-[19.5px] font-medium text-current">
          {label}
        </span>
        {notificationCount !== undefined && (
          <Notification
            withText
            plainText
            size="xlarge"
            count={notificationCount}
            className="shrink-0"
          />
        )}
        {notificationCount === undefined && unread && (
          <span className="flex w-[14px] shrink-0 justify-center">
            <Notification size="small" />
          </span>
        )}
      </span>
    </>
  )

  const sharedClasses = `group/item relative flex h-[27px] items-center gap-[8px] rounded-sm-7 px-[8px] py-[7px] text-text-secondary transition-colors ${collapsed ? 'w-[29px]' : 'w-full'} ${stateClasses} ${active ? activeClasses : ''} ${className}`
  const showTooltip = (element: HTMLElement) => {
    if (!collapsed) return
    const rect = element.getBoundingClientRect()
    setTooltipAt({ top: rect.top, left: rect.left })
  }
  const sharedProps: Pick<
    AnchorHTMLAttributes<HTMLAnchorElement> & ButtonHTMLAttributes<HTMLButtonElement>,
    'onClick' | 'onMouseEnter' | 'onMouseLeave' | 'onFocus' | 'onBlur'
  > & {
    'aria-current'?: 'page'
    'aria-label'?: string
  } = {
    onClick: onClick as MouseEventHandler<HTMLAnchorElement & HTMLButtonElement>,
    onMouseEnter: (event) => showTooltip(event.currentTarget),
    onMouseLeave: () => setTooltipAt(null),
    onFocus: (event) => showTooltip(event.currentTarget),
    onBlur: () => setTooltipAt(null),
    'aria-current': active ? 'page' : undefined,
    // Collapsed hides the text, so the name has to come from somewhere.
    'aria-label': collapsed ? label : undefined,
  }

  if (href) {
    return (
      <a href={href} className={sharedClasses} {...sharedProps}>
        {content}
      </a>
    )
  }

  return (
    <button type="button" className={`${sharedClasses} cursor-pointer text-left`} {...sharedProps}>
      {content}
    </button>
  )
}

export { SidebarItem }
export type { SidebarItemProps }
