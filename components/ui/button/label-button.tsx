'use client'

import { forwardRef, type ReactNode } from 'react'

interface LabelButtonProps {
  children: ReactNode
  selected?: boolean
  disabled?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  onClick?: () => void
  'aria-pressed'?: boolean
  className?: string
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
  },
  ref,
) {
  const classes = [
    'inline-flex h-[24px] items-center gap-[4px] rounded-sm-7 border px-[8px] font-medium text-body-s text-text-btn-default-primary transition-colors',
    'focus-visible:border-border-btn-blue-pri-focus focus-visible:bg-bg-btn-default-pri-focus focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:border-border-btn-default-pri-disabled disabled:bg-bg-btn-default-pri-disabled',
    selected
      ? 'border-border-btn-default-pri-focus bg-bg-transparent-blue-accent-light'
      : 'border-border-btn-default-pri-rest bg-bg-btn-default-pri-rest hover:border-border-btn-default-pri-hover hover:bg-bg-btn-default-pri-hover',
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
    >
      {iconLeft && <span className="inline-flex size-[14px] shrink-0 items-center justify-center">{iconLeft}</span>}
      <span>{children}</span>
      {iconRight && (
        <span className="inline-flex size-[14px] shrink-0 items-center justify-center">{iconRight}</span>
      )}
    </button>
  )
})

export { LabelButton }
export type { LabelButtonProps }
