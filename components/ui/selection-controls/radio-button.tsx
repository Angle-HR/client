'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'

type TextPosition = 'right' | 'left' | 'none'

interface RadioButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  textPosition?: TextPosition
  className?: string
}

const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(function RadioButton(
  { label, textPosition = 'right', disabled, checked, className = '', ...props },
  ref,
) {
  const circleClasses = [
    'h-[16px] w-[16px] rounded-full border transition-colors flex items-center justify-center shrink-0',
    checked
      ? 'bg-bg-selection-controls-selected border-bg-selection-controls-selected'
      : 'bg-bg-selection-controls-empty border-border-selection-controls-rest',
    // Figma defines no focus state; add a visible one in code for WCAG 2.4.7.
    'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bg-selection-controls-selected',
    disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
  ].join(' ')

  return (
    <label
      className={`inline-flex items-center gap-[8px] ${textPosition === 'left' ? 'flex-row-reverse' : ''} ${className}`}
    >
      <span className="relative inline-flex items-center justify-center h-[24px] w-[24px] shrink-0">
        <input
          ref={ref}
          type="radio"
          checked={checked}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <span className={circleClasses}>
          {checked && <span className="h-[7.6px] w-[7.6px] rounded-full bg-text-inverted" />}
        </span>
      </span>
      {textPosition !== 'none' && label && (
        <span
          className={`text-body-s font-medium text-text-primary ${disabled ? 'opacity-40' : ''}`}
        >
          {label}
        </span>
      )}
    </label>
  )
})

export { RadioButton }
export type { RadioButtonProps }
