'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

interface LabelButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-pressed'> {
  /** The visible label. */
  children: ReactNode
  /** Whether the chip is toggled on. The parent owns this state. */
  selected?: boolean
  /** Icon before the label, 14×14px. */
  iconLeft?: ReactNode
  /** Icon after the label, 14×14px. */
  iconRight?: ReactNode
  /** Announces the toggle state. Mirrors `selected` unless set. */
  'aria-pressed'?: boolean
}

const LabelButton = forwardRef<HTMLButtonElement, LabelButtonProps>(function LabelButton(
  {
    children,
    selected = false,
    disabled = false,
    iconLeft,
    iconRight,
    onClick,
    'aria-pressed': ariaPressed,
    className = '',
    ...props
  },
  ref,
) {
  const classes = [
    'inline-flex h-[24px] items-center gap-[4px] rounded-sm-7 border px-[7px] font-medium text-body-s text-text-btn-default-primary',
    // Figma: hover fades in over 100ms (ease in) and out over 100ms (ease out);
    // selecting fades over 50ms (ease out). Figma deselects instantly; here it
    // takes the 100ms hover fade, as CSS can't tell deselecting from un-hovering.
    'transition-colors',
    'focus-visible:border-border-btn-blue-pri-focus focus-visible:bg-bg-btn-default-pri-focus focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:border-border-btn-default-pri-disabled disabled:bg-bg-btn-default-pri-disabled disabled:text-text-btn-default-disabled',
    selected
      ? 'border-border-btn-default-pri-focus bg-bg-transparent-blue-accent-light duration-[50ms] ease-figma-out'
      : 'border-border-btn-default-pri-rest bg-bg-btn-default-pri-rest hover:border-border-btn-default-pri-hover hover:bg-bg-btn-default-pri-hover duration-100 ease-figma-out hover:ease-figma-in',
    className,
  ].join(' ')

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      aria-pressed={ariaPressed ?? selected}
      onClick={onClick}
      className={classes}
      {...props}
    >
      {iconLeft && (
        <span className="inline-flex size-[14px] shrink-0 items-center justify-center">
          {iconLeft}
        </span>
      )}
      <span>{children}</span>
      {iconRight && (
        <span className="inline-flex size-[14px] shrink-0 items-center justify-center">
          {iconRight}
        </span>
      )}
    </button>
  )
})

export { LabelButton }
export type { LabelButtonProps }
