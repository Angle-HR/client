'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'

import { RADIO_FOCUS_RING } from './focus'

import type { RadioSize } from './radio-button.figma'

type TextPosition = 'right' | 'left' | 'none'

interface RadioButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  textPosition?: TextPosition
  /** Figma's "Text size": `sm` is 13px text with a 15px circle (default), `md` is 13.8px with 16px. */
  size?: RadioSize
  className?: string
}

// All values from radio-button.figma.ts (Figma node 1267:43021).
const areaClasses: Record<RadioSize, string> = { sm: 'size-[22px]', md: 'size-[24px]' }
const circleClasses: Record<RadioSize, string> = { sm: 'size-[15px]', md: 'size-[16px]' }
const fontClasses: Record<RadioSize, string> = { sm: 'text-body-s', md: 'text-body-m' }

const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(function RadioButton(
  { label, textPosition = 'right', size = 'sm', disabled, checked, className = '', ...props },
  ref,
) {
  const labelled = textPosition !== 'none' && !!label

  // Figma: hover fades in over 100ms (ease in) and out over 100ms (ease out).
  const areaClassName = [
    'relative inline-flex shrink-0 items-center justify-center rounded-full transition-colors duration-100 ease-figma-out group-hover/radio:ease-figma-in',
    areaClasses[size],
    // Figma State=Focus (keyboard focus): the hover fill plus a 1px ring (see focus.ts).
    !disabled &&
      (checked
        ? 'group-hover/radio:bg-bg-selection-controls-hover-selected group-has-[:focus-visible]/radio:bg-bg-selection-controls-hover-selected'
        : 'group-hover/radio:bg-bg-selection-controls-hover-rest group-has-[:focus-visible]/radio:bg-bg-selection-controls-hover-rest'),
    !disabled && RADIO_FOCUS_RING,
    // Figma oddity kept: with a label, the radio is faded again inside the faded component.
    disabled && labelled && 'opacity-30',
  ]
    .filter(Boolean)
    .join(' ')

  // Figma: selecting and deselecting take 50ms (ease out). The stroke is an
  // inset shadow so it sits inside the circle, as in Figma.
  const circleClassName = [
    'flex shrink-0 items-center justify-center rounded-full transition-[background-color,box-shadow] duration-[50ms] ease-figma-out',
    circleClasses[size],
    checked
      ? disabled
        ? 'bg-bg-selection-controls-selected shadow-[inset_0_0_0_1px_var(--color-border-notification)]'
        : 'bg-bg-selection-controls-selected shadow-none'
      : 'bg-transparent shadow-[inset_0_0_0_1px_var(--color-border-selection-controls-rest)]',
  ].join(' ')

  return (
    <label
      className={[
        'group/radio inline-flex items-center',
        textPosition === 'left' && 'flex-row-reverse',
        disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={areaClassName}>
        <input
          ref={ref}
          type="radio"
          checked={checked}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <span className={circleClassName}>
          {checked && <span className="size-[7.63px] rounded-full bg-white" />}
        </span>
      </span>
      {labelled && (
        <span
          className={`text-trim-cap whitespace-nowrap px-[3px] font-regular text-text-primary ${fontClasses[size]}`}
        >
          {label}
        </span>
      )}
    </label>
  )
})

export { RadioButton }
export type { RadioButtonProps }
