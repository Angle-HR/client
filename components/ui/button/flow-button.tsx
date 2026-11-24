'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type FlowButtonVariant = 'primary' | 'secondary' | 'tertiary'
type FlowButtonSize = 'xs' | 'sm' | 'md'
type FlowButtonPosition = 'left' | 'right'

interface FlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual hierarchy. Defaults to `secondary`, not `primary`. */
  variant?: FlowButtonVariant
  /** Height: `xs` = 25px, `sm` = 32px, `md` = 40px. */
  size?: FlowButtonSize
  /** `right` squares off the left corners so the button can join a container on its left, such as an input. Not CSS positioning. */
  position?: FlowButtonPosition
  /** Icon before the label, shown at 14×14px. */
  iconPrefix?: ReactNode
  /** Icon after the label, shown at 15×15px. */
  iconSuffix?: ReactNode
  /** Shows a spinner before the label and ignores clicks, while staying focusable. Don't also set `disabled`. */
  loading?: boolean
  /** Overrides the accessible name. Only needed when the visible label isn't enough. */
  'aria-label'?: string
}

// Height / padding / gap / font scale per size (from Figma). Figma's 8/10/12px
// padding is measured from the outer edge (its stroke sits inside), so each
// value here is 1px less to make room for the 1px border.
const sizeMap: Record<FlowButtonSize, string> = {
  xs: 'h-[25px] px-[7px] gap-[4px] text-body-s',
  sm: 'h-[32px] px-[9px] gap-[8px] text-body-l',
  md: 'h-[40px] px-[11px] gap-[8px] text-body-l',
}

// Figma radius: xs=7px, sm/md=10px, except a standalone sm primary, which is 7px.
// Attached (position="right") buttons are always 10px on the right at sm.
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

// Figma: hover fades in over 100ms for primary and 50ms for the others, out over 100ms; press takes 50ms.
const motionMap: Record<FlowButtonVariant, string> = {
  primary: 'transition-colors duration-100 ease-out hover:ease-in active:duration-[50ms]',
  secondary:
    'transition-colors duration-100 ease-out hover:duration-[50ms] hover:ease-in active:duration-[50ms]',
  tertiary:
    'transition-colors duration-100 ease-out hover:duration-[50ms] hover:ease-in active:duration-[50ms]',
}

function getRadiusClasses(
  position: FlowButtonPosition,
  size: FlowButtonSize,
  variant: FlowButtonVariant,
): string {
  // Figma: position="right" keeps the right corners and squares the left ones, so the
  // button joins flush onto the container to its left (e.g. an input).
  if (position === 'right') return `${radiusMap[size]} rounded-l-none`
  if (variant === 'primary' && size === 'sm') return 'rounded-sm-7'
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
    onClick,
    children,
    className = '',
    type = 'button',
    ...props
  },
  ref,
) {
  const isLoading = loading && !disabled

  const classes = [
    'inline-flex items-center justify-center font-medium border shadow-flow-btn',
    motionMap[variant],
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected',
    'disabled:cursor-not-allowed aria-busy:cursor-wait',
    sizeMap[size],
    flowColorMap[variant],
    getRadiusClasses(position, size, variant),
    className,
  ].join(' ')

  const spinnerOrPrefix = isLoading ? <Spinner /> : iconPrefix

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      // While loading the button stays focusable (so focus isn't lost mid-action) but ignores clicks.
      aria-disabled={isLoading || undefined}
      aria-busy={isLoading || undefined}
      onClick={(event) => {
        if (isLoading) {
          event.preventDefault()
          return
        }
        onClick?.(event)
      }}
      className={classes}
      {...props}
    >
      {spinnerOrPrefix && (
        <span className="inline-flex h-[14px] w-[14px] items-center justify-center shrink-0">
          {spinnerOrPrefix}
        </span>
      )}
      {children && <span>{children}</span>}
      {iconSuffix && (
        <span className="inline-flex h-[15px] w-[15px] items-center justify-center shrink-0">
          {iconSuffix}
        </span>
      )}
    </button>
  )
})

export { FlowButton }
export type { FlowButtonProps, FlowButtonVariant, FlowButtonSize, FlowButtonPosition }
