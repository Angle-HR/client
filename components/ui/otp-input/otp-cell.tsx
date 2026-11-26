'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'

import type { OTPCellState } from './otp-input.figma'

interface OTPCellProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value' | 'size'
> {
  value?: string
  /** One character typed (or '' when cleared). */
  onChange?: (value: string) => void
  /**
   * Several characters arrived at once: a code filled in from a text message,
   * or fast typing. The OTPInput spreads them over the following cells.
   */
  onFill?: (text: string) => void
  /** Placeholder and Filled follow the value; the rest are set from outside. */
  state?: OTPCellState
  position: number
  disabled?: boolean
}

// All values from otp-input.figma.ts (Figma node 2711:39040). Class strings
// are spelled out so Tailwind can see them.
//
// Focus: the cell's own focus, and every cell while its OTPInput has focus
// (Figma's All Focused). The "-" turns dark when focused, as in Figma.
const FOCUS =
  'focus:bg-bg-input-focus! focus:border-border-input-focus! focus:text-text-input-focus! focus:placeholder:text-text-input-focus! focus:ease-figma-out! group-focus-within/otp:bg-bg-input-focus! group-focus-within/otp:border-border-input-focus! group-focus-within/otp:text-text-input-focus! group-focus-within/otp:placeholder:text-text-input-focus! group-focus-within/otp:ease-figma-out!'

const STATE_CLASSES: Record<OTPCellState, string> = {
  // Only an empty cell hovers (Figma: Place-holder ↔ Hover, ease in).
  placeholder: `bg-bg-input-placeholder border-border-input-placeholder placeholder:text-text-input-placeholder hover:bg-bg-input-hover hover:border-border-input-hover hover:placeholder:text-text-input-hover hover:ease-figma-in ${FOCUS}`,
  filled: `bg-bg-input-filled border-border-input-filled text-text-input-filled ${FOCUS}`,
  hover:
    'bg-bg-input-hover border-border-input-hover text-text-input-hover placeholder:text-text-input-hover',
  focus:
    'bg-bg-input-focus border-border-input-focus text-text-input-focus placeholder:text-text-input-focus',
  error:
    'bg-bg-input-error border-border-input-error text-text-input-error placeholder:text-text-input-placeholder',
  // The token is 20% black / white; nothing else is faded.
  disabled:
    'pointer-events-none bg-bg-input-disabled border-border-input-disabled text-text-input-disabled placeholder:text-text-input-disabled',
  // Figma binds the error fill and text with the success border.
  success:
    'bg-bg-input-error border-border-input-success text-text-input-error placeholder:text-text-input-placeholder',
}

/** One character of an OTP code. Figma: .Subcomponents/Input/OTP. */
const OTPCell = forwardRef<HTMLInputElement, OTPCellProps>(function OTPCell(
  { value = '', onChange, onFill, state, position, disabled, className = '', ...props },
  ref,
) {
  const resolved: OTPCellState = disabled
    ? 'disabled'
    : state && state !== 'placeholder' && state !== 'filled'
      ? state
      : value
        ? 'filled'
        : 'placeholder'

  const classes = [
    // 12px padding less the 1px border. text-[1rem] (16px) below md: iOS
    // Safari zooms on focus for any input under 16px; from md, Figma's 14px.
    'h-[42px] w-[38px] shrink-0 px-[11px] border rounded-sm-8 text-center text-[1rem] md:text-body-l',
    'outline-none transition-colors duration-100 ease-figma-out',
    STATE_CLASSES[resolved],
    className,
  ].join(' ')

  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      value={value}
      disabled={disabled}
      placeholder="-"
      aria-label={`Digit ${position}`}
      onChange={(e) => {
        const next = e.target.value
        // No maxLength: autofill puts the whole code in the first cell.
        if (next.length <= 1) onChange?.(next)
        else if (next.length === 2 && value && next.includes(value))
          onChange?.(next.startsWith(value) ? next[1]! : next[0]!)
        else if (onFill) onFill(next)
        else onChange?.(next.slice(-1))
      }}
      className={classes}
      {...props}
    />
  )
})

export { OTPCell }
export type { OTPCellProps, OTPCellState }
