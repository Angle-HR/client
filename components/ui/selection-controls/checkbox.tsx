'use client'

import { forwardRef, useEffect, useRef, useState, type InputHTMLAttributes } from 'react'

type CheckboxSize = 'sm' | 'md' | 'lg'
type CheckboxChecked = boolean | 'indeterminate'
type TextPosition = 'right' | 'left' | 'none'

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'checked' | 'defaultChecked'
> {
  size?: CheckboxSize
  /** Controlled checked state. `'indeterminate'` sets aria-checked="mixed". */
  checked?: CheckboxChecked
  defaultChecked?: boolean
  textPosition?: TextPosition
  label?: string
  hoverable?: boolean
  className?: string
}

const sizeMap: Record<CheckboxSize, { box: string; outer: string; icon: string }> = {
  sm: {
    box: 'h-[11px] w-[11px]',
    outer: 'h-[17px] w-[17px]',
    icon: 'h-[7px] w-[7px]',
  },
  md: {
    box: 'h-[15px] w-[15px]',
    outer: 'h-[21px] w-[21px]',
    icon: 'h-[9px] w-[9px]',
  },
  lg: {
    box: 'h-[18px] w-[18px]',
    outer: 'h-[28px] w-[28px]',
    icon: 'h-[11px] w-[11px]',
  },
}

const radiusMap: Record<CheckboxSize, string> = {
  sm: 'rounded-xs-3',
  md: 'rounded-sm-5',
  lg: 'rounded-sm-6',
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1 4L3.5 6.5L9 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IndeterminateIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 8 2" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    size = 'lg',
    checked,
    defaultChecked = false,
    textPosition = 'right',
    label,
    hoverable = true,
    disabled,
    className = '',
    onChange,
    ...props
  },
  externalRef,
) {
  const internalRef = useRef<HTMLInputElement>(null)
  const ref = (externalRef as React.RefObject<HTMLInputElement>) || internalRef

  const isControlled = checked !== undefined
  const [internalChecked, setInternalChecked] = useState<boolean>(defaultChecked)
  const checkedValue: CheckboxChecked = isControlled ? checked : internalChecked

  const isIndeterminate = checkedValue === 'indeterminate'
  const isChecked = checkedValue === true
  const isFilled = isChecked || isIndeterminate

  useEffect(() => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.indeterminate = isIndeterminate
    }
  }, [isIndeterminate, ref])

  const sizes = sizeMap[size]
  const radius = radiusMap[size]

  const boxClasses = [
    sizes.box,
    radius,
    'border transition-colors flex items-center justify-center shrink-0',
    isFilled
      ? 'bg-bg-selection-controls-selected border-bg-selection-controls-selected text-text-inverted'
      : 'bg-bg-selection-controls-empty border-border-selection-controls-rest',
    'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bg-selection-controls-selected',
    disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
  ].join(' ')

  const wrapperClasses = [
    'inline-flex items-center gap-[8px]',
    textPosition === 'left' ? 'flex-row-reverse' : '',
    className,
  ].join(' ')

  // Hover ring: present but visually quiet at rest, tints on hover. It is a
  // permanent layout element when hoverable, so it reserves the larger box —
  // but it wraps ONLY the control, never the label.
  const controlClasses = [
    'relative inline-flex items-center justify-center shrink-0',
    hoverable
      ? `${sizes.outer} rounded-full hover:bg-bg-selection-controls-hover-rest transition-colors`
      : '',
  ].join(' ')

  return (
    <label className={wrapperClasses}>
      <span className={controlClasses}>
        <input
          ref={ref}
          type="checkbox"
          checked={isChecked}
          disabled={disabled}
          onChange={(e) => {
            if (!isControlled) setInternalChecked(e.target.checked)
            onChange?.(e)
          }}
          className="peer sr-only"
          aria-checked={isIndeterminate ? 'mixed' : isChecked}
          {...props}
        />
        <span className={boxClasses}>
          {isChecked && <CheckIcon className={sizes.icon} />}
          {isIndeterminate && <IndeterminateIcon className={sizes.icon} />}
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

export { Checkbox }
export type { CheckboxProps, CheckboxSize, CheckboxChecked, TextPosition }
