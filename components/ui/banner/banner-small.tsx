'use client'

import { type ReactNode } from 'react'

import { IconButton } from '../button/icon-button'

type BannerSmallState = 'rest' | 'success' | 'error' | 'info'

interface BannerSmallProps {
  state?: BannerSmallState
  outline?: boolean
  showCloseButton?: boolean
  onClose?: () => void
  children: ReactNode
  className?: string
}

const stateConfig: Record<
  BannerSmallState,
  {
    bg: string
    border: string
    text: string
    icon: ReactNode
  }
> = {
  rest: {
    bg: 'bg-bg-transparent-lighter',
    border: 'border-border-transparent-light',
    text: 'text-text-secondary',
    icon: (
      <svg className="h-[14px] w-[14px]" viewBox="0 0 14 14" fill="currentColor">
        <path d="M7 1.167a5.833 5.833 0 100 11.666A5.833 5.833 0 007 1.167zm-.583 4.083a.583.583 0 011.166 0v2.917a.583.583 0 01-1.166 0V5.25zM7 3.792a.729.729 0 110 1.458.729.729 0 010-1.458z" />
      </svg>
    ),
  },
  success: {
    bg: 'bg-bg-tags-green',
    border: 'border-green-7',
    text: 'text-text-tags-green',
    icon: (
      <svg className="h-[14px] w-[14px]" viewBox="0 0 14 14" fill="currentColor">
        <path d="M7 1.167a5.833 5.833 0 100 11.666A5.833 5.833 0 007 1.167zm2.744 4.494l-3.5 3.5a.583.583 0 01-.825 0l-1.75-1.75a.583.583 0 11.825-.825L5.83 7.923l3.088-3.088a.583.583 0 01.825.825z" />
      </svg>
    ),
  },
  error: {
    bg: 'bg-bg-tags-red',
    border: 'border-red-9',
    text: 'text-text-tags-red',
    icon: (
      <svg className="h-[14px] w-[14px]" viewBox="0 0 14 14" fill="currentColor">
        <path d="M7 1.167a5.833 5.833 0 100 11.666A5.833 5.833 0 007 1.167zm-.583 3.5a.583.583 0 011.166 0V7a.583.583 0 01-1.166 0V4.667zM7 10.208a.729.729 0 110-1.458.729.729 0 010 1.458z" />
      </svg>
    ),
  },
  info: {
    bg: 'bg-bg-tags-blue',
    border: 'border-blue-10',
    text: 'text-text-tags-blue',
    icon: (
      <svg className="h-[14px] w-[14px]" viewBox="0 0 14 14" fill="currentColor">
        <path d="M7 1.167a5.833 5.833 0 100 11.666A5.833 5.833 0 007 1.167zm-.583 4.083a.583.583 0 011.166 0v2.917a.583.583 0 01-1.166 0V5.25zM7 3.792a.729.729 0 110 1.458.729.729 0 010-1.458z" />
      </svg>
    ),
  },
}

function CloseIcon() {
  return (
    <svg className="h-[14px] w-[14px]" viewBox="0 0 14 14" fill="none">
      <path
        d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  )
}

function BannerSmall({
  state = 'rest',
  outline = true,
  showCloseButton = true,
  onClose,
  children,
  className = '',
}: BannerSmallProps) {
  const config = stateConfig[state]
  const role = state === 'error' ? 'alert' : 'status'
  const ariaLive = state === 'error' ? ('assertive' as const) : ('polite' as const)

  const classes = [
    'inline-flex items-center h-[30px] rounded-lg-10 px-[8px] gap-[4px]',
    config.bg,
    config.text,
    outline ? `border ${config.border}` : '',
    className,
  ].join(' ')

  return (
    <div role={role} aria-live={ariaLive} aria-atomic="true" className={classes}>
      <span className="shrink-0" aria-hidden="true">
        {config.icon}
      </span>
      <span className="flex-1 text-body-s font-medium truncate">{children}</span>
      {showCloseButton && (
        <span className="shrink-0 -mr-[5px]">
          <IconButton
            variant="tertiary"
            size="sm"
            icon={<CloseIcon />}
            aria-label="Dismiss notification"
            onClick={onClose}
          />
        </span>
      )}
    </div>
  )
}

export { BannerSmall }
export type { BannerSmallProps, BannerSmallState }
