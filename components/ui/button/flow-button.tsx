'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type FlowButtonVariant = 'primary' | 'secondary' | 'tertiary'
type FlowButtonSize = 'xs' | 'sm' | 'md'
type FlowButtonPosition = 'left' | 'right'

interface FlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: FlowButtonVariant
  size?: FlowButtonSize
  position?: FlowButtonPosition
  iconPrefix?: ReactNode
  iconSuffix?: ReactNode
  loading?: boolean
  'aria-label'?: string
}

// Height / padding / gap / font scale per size (from Figma bounding boxes).
const sizeMap: Record<FlowButtonSize, string> = {
  xs: 'h-[25px] px-[8px] gap-[4px] text-body-s',
  sm: 'h-[32px] px-[10px] gap-[8px] text-body-l',
  md: 'h-[40px] px-[12px] gap-[8px] text-body-l',
}

// Default border-radius is size-aware: xs=7px, sm/md=10px.
const radiusMap: Record<FlowButtonSize, string> = {
  xs: 'rounded-sm-7',
  sm: 'rounded-lg-10',
  md: 'rounded-lg-10',
}

// Note: the design system defines no bg/border tokens for the flow-button
// tertiary variant (only `text-flow-btn-tertiary`). Tertiary is therefore a
// transparent/ghost treatment that reuses the shared transparent tokens.
const flowColorMap: Record<FlowButtonVariant, string> = {
  primary:
    'bg-bg-flow-btn-pri-rest hover:bg-bg-flow-btn-pri-hover active:bg-bg-flow-btn-pri-pressed focus-visible:bg-bg-flow-btn-pri-focus disabled:bg-bg-flow-btn-pri-disabled border-border-flow-btn-pri-rest hover:border-border-flow-btn-pri-hover active:border-border-flow-btn-pri-pressed focus-visible:border-border-flow-btn-pri-focus disabled:border-border-flow-btn-pri-disabled text-text-flow-btn-primary disabled:opacity-40',
  secondary:
    'bg-bg-flow-btn-sec-rest hover:bg-bg-flow-btn-sec-hover active:bg-bg-flow-btn-sec-pressed focus-visible:bg-bg-flow-btn-sec-focus disabled:bg-bg-flow-btn-sec-disabled border-border-flow-btn-sec-rest hover:border-border-flow-btn-sec-hover active:border-border-flow-btn-sec-pressed focus-visible:border-border-flow-btn-sec-focus disabled:border-border-flow-btn-sec-disabled text-text-flow-btn-secondary disabled:text-text-flow-btn-sec-disabled',
  tertiary:
    'bg-transparent hover:bg-bg-transparent-light active:bg-bg-transparent-medium border-transparent text-text-flow-btn-tertiary disabled:text-text-flow-btn-sec-disabled disabled:opacity-40',
}

function getRadiusClasses(position: FlowButtonPosition, size: FlowButtonSize): string {
  // position="right" squares off ALL four corners to sit flush against a container.
  if (position === 'right') return 'rounded-none'
  return radiusMap[size]
}

function Spinner() {
  return (
    <svg className="h-[14px] w-[14px] animate-spin" viewBox="0 0 16 16" fill="none">
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="28"
        strokeDashoffset="8"
      />
    </svg>
  )
}

const FlowButton = forwardRef<HTMLButtonElement, FlowButtonProps>(function FlowButton(
  {
    variant = 'secondary',
    size = 'sm',
    position = 'left',
    iconPrefix,
    iconSuffix,
    loading = false,
    disabled,
    children,
    className = '',
    type = 'button',
    ...props
  },
  ref,
) {
  const isLoading = loading && !disabled

  const classes = [
    'inline-flex items-center justify-center font-medium border transition-colors shadow-flow-btn',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected',
    'disabled:cursor-not-allowed',
    sizeMap[size],
    flowColorMap[variant],
    getRadiusClasses(position, size),
    className,
  ].join(' ')

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={isLoading || undefined}
      className={classes}
      {...props}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {iconPrefix && (
            <span className="inline-flex h-[14px] w-[14px] items-center justify-center shrink-0">
              {iconPrefix}
            </span>
          )}
          {children && <span>{children}</span>}
          {iconSuffix && (
            <span className="inline-flex h-[15px] w-[15px] items-center justify-center shrink-0">
              {iconSuffix}
            </span>
          )}
        </>
      )}
    </button>
  )
})

export { FlowButton }
export type { FlowButtonProps, FlowButtonVariant, FlowButtonSize, FlowButtonPosition }
