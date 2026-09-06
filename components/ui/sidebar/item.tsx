'use client'

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
  onClick,
  className = '',
}: SidebarItemProps) {
  if (loading) {
    return (
      <div
        aria-hidden="true"
        className={`flex h-[27px] w-[204px] items-center gap-[8px] rounded-sm-7 px-[8px] py-[7px] ${className}`}
      >
        <div className="h-full w-full rounded-xs-4 bg-gradient-to-r from-bg-gradient-transparent-light to-bg-gradient-transparent-lighter" />
      </div>
    )
  }

  const content = (
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
      </span>
    </>
  )

  const sharedClasses = `flex h-[27px] w-[204px] items-center gap-[8px] rounded-sm-7 px-[8px] py-[7px] text-text-secondary transition-colors ${stateClasses} ${active ? activeClasses : ''} ${className}`
  const sharedProps: Pick<
    AnchorHTMLAttributes<HTMLAnchorElement> & ButtonHTMLAttributes<HTMLButtonElement>,
    'onClick'
  > & {
    'aria-current'?: 'page'
  } = {
    onClick: onClick as MouseEventHandler<HTMLAnchorElement & HTMLButtonElement>,
    'aria-current': active ? 'page' : undefined,
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
