'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'

type OTPCellState = 'placeholder' | 'hover' | 'focus' | 'filled' | 'error' | 'disabled' | 'success'

interface OTPCellProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value' | 'size'
> {
  value?: string
  onChange?: (value: string) => void
  state?: OTPCellState
  position: 1 | 2 | 3 | 4
  disabled?: boolean
}

// Border/background per composite-driven state. No input-success token exists,
// so the success state uses green primitives.
const stateClasses: Record<OTPCellState, string> = {
  placeholder:
    'bg-bg-input-placeholder border-border-input-placeholder hover:border-border-input-hover focus:border-border-input-focus focus:bg-bg-input-focus',
  hover: 'bg-bg-input-hover border-border-input-hover',
  focus: 'bg-bg-input-focus border-border-input-focus',
  filled:
    'bg-bg-input-filled border-border-input-filled hover:border-border-input-hover focus:border-border-input-focus',
  error: 'bg-bg-input-error border-border-input-error',
  success: 'bg-bg-tags-green border-green-7',
  disabled: 'bg-bg-input-disabled border-border-input-disabled pointer-events-none opacity-60',
}

const OTPCell = forwardRef<HTMLInputElement, OTPCellProps>(function OTPCell(
  { value = '', onChange, state = 'placeholder', position, disabled, className = '', ...props },
  ref,
) {
  const resolvedState: OTPCellState = disabled ? 'disabled' : state

  const classes = [
    // text-[1rem] (16px) below md: iOS Safari zooms the viewport on focus
    // for any text input under 16px — text-body-l (14px) is the
    // Figma-specified size and stays exactly that from md: up, where the
    // zoom-on-focus behavior doesn't apply.
    'h-[42px] w-[38px] px-[12px] border rounded-sm-8 text-center text-[1rem] md:text-body-l text-text-input-filled',
    'outline-none transition-colors',
    stateClasses[resolvedState],
    className,
  ].join(' ')

  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value}
      disabled={disabled}
      aria-label={`Digit ${position}`}
      onChange={(e) => onChange?.(e.target.value.slice(-1))}
      className={classes}
      {...props}
    />
  )
})

export { OTPCell }
export type { OTPCellProps, OTPCellState }
