'use client'

import { type ReactNode } from 'react'

import { type ButtonAccent, Button } from '../button/button'
import { IconButton } from '../button/icon-button'
import { CheckBadge, ExclamationTriangle, InformationCircle, XCircle } from '../icons'

type BannerSmallState = 'rest' | 'success' | 'error' | 'info'

interface BannerSmallProps {
  state?: BannerSmallState
  outline?: boolean
  showCloseButton?: boolean
  withButton?: boolean
  onUndo?: () => void
  onClose?: () => void
  children: ReactNode
  className?: string
}

const stateIcon: Record<BannerSmallState, ReactNode> = {
  rest: <InformationCircle className="size-[14px]" />,
  success: <CheckBadge className="size-[14px]" />,
  error: <ExclamationTriangle className="size-[14px]" />,
  info: <InformationCircle className="size-[14px]" />,
}

const bgClasses: Record<BannerSmallState, string> = {
  rest: 'bg-bg-banner-neutral',
  success: 'bg-bg-banner-success',
  error: 'bg-bg-banner-error',
  info: 'bg-bg-banner-info',
}

// Info's outline fill has its own dedicated (lighter) token; the other three
// states reuse their filled background at both outline settings.
const outlineBgClasses: Record<BannerSmallState, string> = {
  ...bgClasses,
  info: 'bg-bg-banner-info-outline',
}

const borderClasses: Record<BannerSmallState, string> = {
  rest: 'border-border-banner-neutral',
  success: 'border-border-banner-success',
  error: 'border-border-banner-error',
  info: 'border-border-banner-info',
}

// Info uses one text colour regardless of outline; success/error/neutral each
// have a distinct (if subtle) shade for their outlined vs filled-only look.
const textClasses: Record<BannerSmallState, string> = {
  rest: 'text-text-banner-neutral',
  success: 'text-text-banner-success',
  error: 'text-text-banner-error',
  info: 'text-text-banner-info',
}

const outlineTextClasses: Record<BannerSmallState, string> = {
  rest: 'text-text-banner-neutral-bd',
  success: 'text-text-banner-success-bd',
  error: 'text-text-banner-error-bd',
  info: 'text-text-banner-info',
}

const undoAccent: Record<BannerSmallState, ButtonAccent> = {
  rest: 'default',
  success: 'default',
  error: 'red',
  info: 'blue',
}

function BannerSmall({
  state = 'rest',
  outline = true,
  showCloseButton = true,
  withButton = false,
  onUndo,
  onClose,
  children,
  className = '',
}: BannerSmallProps) {
  const role = state === 'error' ? 'alert' : 'status'
  const ariaLive = state === 'error' ? ('assertive' as const) : ('polite' as const)

  const outerClasses = [
    'inline-flex items-center overflow-clip rounded-lg-10 pr-[3px]',
    withButton ? 'gap-[8px]' : '',
    outline ? outlineBgClasses[state] : bgClasses[state],
    outline ? `border ${borderClasses[state]}` : '',
    className,
  ].join(' ')

  return (
    <div role={role} aria-live={ariaLive} aria-atomic="true" className={outerClasses}>
      <div
        className={`flex min-w-0 flex-1 items-center gap-[4px] p-[8px] ${outline ? outlineTextClasses[state] : textClasses[state]}`}
      >
        <span className="shrink-0" aria-hidden="true">
          {stateIcon[state]}
        </span>
        <span className="min-w-0 flex-1 truncate text-body-s font-medium">{children}</span>
      </div>
      {withButton && (
        <Button variant="secondary" size="sm" accent={undoAccent[state]} onClick={onUndo}>
          Undo
        </Button>
      )}
      {showCloseButton && (
        <IconButton
          variant="tertiary"
          size="sm"
          icon={<XCircle />}
          aria-label="Dismiss notification"
          onClick={onClose}
        />
      )}
    </div>
  )
}

export { BannerSmall }
export type { BannerSmallProps, BannerSmallState }
