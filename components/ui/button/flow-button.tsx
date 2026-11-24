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

// Colours per state, from Figma (see flow-button.figma.ts). Tertiary has no
// stroke except on focus, where Figma borrows the secondary focus border.
const flowColorMap: Record<FlowButtonVariant, string> = {
  primary:
    'bg-bg-flow-btn-pri-rest border-border-flow-btn-pri-rest text-text-flow-btn-primary hover:bg-bg-flow-btn-pri-hover hover:border-border-flow-btn-pri-hover active:bg-bg-flow-btn-pri-pressed active:border-border-flow-btn-pri-pressed disabled:bg-bg-btn-blue-pri-disabled disabled:border-border-btn-blue-pri-disabled disabled:opacity-24',
  secondary:
    'bg-bg-flow-btn-sec-rest border-border-flow-btn-sec-rest text-text-flow-btn-secondary hover:bg-bg-flow-btn-sec-hover hover:border-border-flow-btn-sec-hover active:bg-bg-flow-btn-sec-pressed active:border-border-flow-btn-sec-pressed focus-visible:bg-bg-flow-btn-sec-focus focus-visible:border-border-flow-btn-sec-focus disabled:bg-bg-flow-btn-sec-disabled disabled:border-border-flow-btn-sec-disabled disabled:text-text-flow-btn-sec-disabled',
  tertiary:
    'bg-bg-flow-btn-tet-rest border-transparent text-text-flow-btn-tertiary hover:bg-bg-flow-btn-tet-hover hover:border-transparent active:bg-bg-flow-btn-tet-pressed active:border-transparent focus-visible:bg-bg-flow-btn-tet-focus focus-visible:border-border-flow-btn-sec-focus disabled:bg-bg-flow-btn-tet-disabled disabled:border-transparent disabled:text-text-flow-btn-tet-disabled',
}

// Primary focus differs by height in Figma: 40px uses the flow-btn focus fill
// and stroke; 25 and 32px use the blue Button's focus fill with no stroke.
const primaryFocusMap: Record<FlowButtonSize, string> = {
  xs: 'focus-visible:bg-bg-btn-blue-pri-focus focus-visible:border-transparent',
  sm: 'focus-visible:bg-bg-btn-blue-pri-focus focus-visible:border-transparent',
  md: 'focus-visible:bg-bg-flow-btn-pri-focus focus-visible:border-border-flow-btn-pri-focus',
}

// Figma's shadow (0 1px 1px + 0 0 1px) sits on: secondary in every state but
// disabled; tertiary at rest and focus only; primary only at 40px. Attached
// buttons (position="right") have none.
function getShadowClasses(
  variant: FlowButtonVariant,
  size: FlowButtonSize,
  position: FlowButtonPosition,
) {
  if (position === 'right') return ''
  if (variant === 'secondary') return 'shadow-flow-btn disabled:shadow-none'
  if (variant === 'tertiary')
    return 'shadow-flow-btn hover:shadow-none active:shadow-none focus-visible:shadow-flow-btn disabled:shadow-none'
  return size === 'md' ? 'shadow-flow-btn disabled:shadow-none' : ''
}

// Figma: hover fades in over 50ms for secondary and tertiary at 25/32px, 100ms
// for primary and at 40px (ease in); out over 100ms (ease out); press 50ms (ease out).
function getMotionClasses(variant: FlowButtonVariant, size: FlowButtonSize) {
  const hoverIn =
    variant === 'primary' || size === 'md' ? 'hover:duration-100' : 'hover:duration-[50ms]'
  return `transition-[color,background-color,border-color,box-shadow] duration-100 ease-figma-out ${hoverIn} hover:ease-figma-in active:duration-[50ms] active:ease-figma-out`
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
    'inline-flex items-center justify-center font-medium border',
    getMotionClasses(variant, size),
    // Figma's focus is the fill and border above; no outline on top.
    'focus-visible:outline-none',
    'disabled:cursor-not-allowed aria-busy:cursor-wait',
    sizeMap[size],
    flowColorMap[variant],
    variant === 'primary' && primaryFocusMap[size],
    getShadowClasses(variant, size, position),
    getRadiusClasses(position, size, variant),
    className,
  ]
    .filter(Boolean)
    .join(' ')

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
