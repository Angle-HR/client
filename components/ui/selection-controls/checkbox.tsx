'use client'

import { forwardRef, useEffect, useRef, useState, type InputHTMLAttributes } from 'react'

import { MaskIcon } from '../icons/mask-icon'

import { CHECKBOX_ICONS, CHECKBOX_LAYOUT, type CheckboxBoxSize } from './checkbox.figma'
import {
  CHECKBOX_FOCUS_RING_AREA as FOCUS_RING_AREA,
  CHECKBOX_FOCUS_RING_BOX as FOCUS_RING_BOX,
} from './focus'

/**
 * Box size in px, as Figma's "Box Size": 18, 15, 14 or 11. `lg`, `md` and `sm`
 * still work and mean 18, 15 and 11.
 */
type CheckboxSize = CheckboxBoxSize | 'sm' | 'md' | 'lg'
type CheckboxChecked = boolean | 'indeterminate'
type TextPosition = 'right' | 'left' | 'none'

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'checked' | 'defaultChecked'
> {
  /** Box size: 18 (default), 15, 14 or 11. Figma has no labelled 14px checkbox; a label there uses the 15px style. */
  size?: CheckboxSize
  /** Controlled checked state. `'indeterminate'` sets aria-checked="mixed". */
  checked?: CheckboxChecked
  defaultChecked?: boolean
  textPosition?: TextPosition
  label?: string
  /** Adds Figma's square hover area around the box. */
  hoverable?: boolean
  className?: string
}

const LEGACY: Record<'sm' | 'md' | 'lg', CheckboxBoxSize> = { sm: 11, md: 15, lg: 18 }

// All values from checkbox.figma.ts (Figma node 1267:42518).
const boxClasses: Record<CheckboxBoxSize, string> = {
  18: 'size-[18px] rounded-sm-6',
  15: 'size-[15px] rounded-sm-5',
  14: 'size-[14px] rounded-sm-5',
  11: 'size-[11px] rounded-xs-3',
}
// Unchecked stroke, inside the box. Drawn as an inset shadow because browsers
// snap border widths to whole device pixels (1.4px would render as 1px).
const strokeClasses: Record<CheckboxBoxSize, string> = {
  18: 'shadow-[inset_0_0_0_1.4px_var(--color-border-selection-controls-rest)]',
  15: 'shadow-[inset_0_0_0_1.2px_var(--color-border-selection-controls-rest)]',
  14: 'shadow-[inset_0_0_0_1px_var(--color-border-selection-controls-rest)]',
  11: 'shadow-[inset_0_0_0_1px_var(--color-border-selection-controls-rest)]',
}
const STROKE_11_PLAIN = 'shadow-[inset_0_0_0_0.5px_var(--color-border-selection-controls-rest)]'
const hoverAreaClasses: Record<CheckboxBoxSize, string> = {
  18: 'size-[28px] p-[5px] rounded-lg-10',
  15: 'size-[21px] p-[3px] rounded-sm-8',
  14: 'size-[20px] p-[3px] rounded-sm-8',
  11: 'size-[17px] p-[3px] rounded-sm-5',
}
// With a label. 14px has none in Figma, so it borrows 15px.
type LabelledSize = 18 | 15 | 11
const rootLabelled: Record<LabelledSize, { plain: string; hoverable: string }> = {
  18: { plain: 'p-[4px] gap-[4px]', hoverable: 'gap-0' },
  15: { plain: 'p-[4px] gap-[3px]', hoverable: 'py-[1px] gap-0' },
  11: { plain: 'p-[4px] gap-[4px]', hoverable: 'p-[1px] gap-[2px]' },
}
const labelClasses: Record<LabelledSize, { plain: string; hoverable: string; font: string }> = {
  18: { plain: 'px-[4px]', hoverable: 'px-[3px]', font: 'text-body-l' },
  15: { plain: 'px-[3px]', hoverable: 'px-[3px]', font: 'text-body-m' },
  11: { plain: '', hoverable: '', font: 'text-body-xs' },
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    size = 18,
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

  const box: CheckboxBoxSize = typeof size === 'number' ? size : LEGACY[size]
  const labelled = textPosition !== 'none' && !!label
  const labelSize: LabelledSize = box === 14 ? 15 : box
  const mode = hoverable ? 'hoverable' : 'plain'

  // Figma oddities, kept as Figma has them (see CHECKBOX_ODDITIES).
  const stroke = box === 11 && !hoverable && !labelled ? STROKE_11_PLAIN : strokeClasses[box]
  let disabledOpacity = isFilled ? 'opacity-40' : 'opacity-30'
  if (!isFilled && box === 18 && labelled && textPosition === 'left') disabledOpacity = 'opacity-40'
  if (isFilled && box === 11 && labelled && hoverable) disabledOpacity = 'opacity-30'
  const iconSize = box === 18 && hoverable && disabled && !labelled ? 12 : CHECKBOX_LAYOUT[box].icon
  const labelWeight =
    box === 18 && hoverable && disabled && textPosition === 'right' ? 'font-medium' : 'font-regular'
  const labelFont =
    box === 11 && !isFilled && !hoverable && disabled ? 'text-body-s' : labelClasses[labelSize].font

  const rootClasses = [
    'group/checkbox inline-flex items-center',
    labelled && rootLabelled[labelSize][mode],
    textPosition === 'left' && 'flex-row-reverse',
    disabled ? `${disabledOpacity} cursor-not-allowed` : 'cursor-pointer',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // Figma: checking takes 10ms, unchecking 50ms (both ease in).
  const boxClassName = [
    'flex shrink-0 items-center justify-center transition-[background-color,box-shadow] ease-figma-in',
    boxClasses[box],
    isFilled
      ? 'bg-bg-selection-controls-selected shadow-none text-text-inverted duration-[10ms]'
      : `bg-transparent duration-[50ms] ${stroke}`,
    // Without a hover area, the focus ring sits 2px outside the box.
    !hoverable && !disabled && FOCUS_RING_BOX,
  ]
    .filter(Boolean)
    .join(' ')

  // Figma: hover fades in over 70ms (ease in) and out over 50ms (ease out).
  // Figma State=Focus (keyboard focus) shows the hover fill too (see focus.ts).
  const hoverFill =
    isFilled || box === 11
      ? 'group-hover/checkbox:bg-bg-selection-controls-hover-selected group-has-[:focus-visible]/checkbox:bg-bg-selection-controls-hover-selected'
      : 'group-hover/checkbox:bg-bg-selection-controls-hover-rest group-has-[:focus-visible]/checkbox:bg-bg-selection-controls-hover-rest'
  const hoverAreaClassName = [
    'flex shrink-0 items-center justify-center transition-colors duration-[50ms] ease-figma-out group-hover/checkbox:duration-[70ms] group-hover/checkbox:ease-figma-in',
    hoverAreaClasses[box],
    !disabled && hoverFill,
    !disabled && FOCUS_RING_AREA,
  ]
    .filter(Boolean)
    .join(' ')

  const input = (
    <input
      ref={ref}
      type="checkbox"
      checked={isChecked}
      disabled={disabled}
      onChange={(e) => {
        if (!isControlled) setInternalChecked(e.target.checked)
        onChange?.(e)
      }}
      className="sr-only"
      aria-checked={isIndeterminate ? 'mixed' : isChecked}
      {...props}
    />
  )

  const boxEl = (
    <span className={boxClassName}>
      {isChecked && (
        <MaskIcon src={`/dashboard/icons/${CHECKBOX_ICONS.checked}.svg`} size={iconSize} />
      )}
      {isIndeterminate && (
        <MaskIcon src={`/dashboard/icons/${CHECKBOX_ICONS.indeterminate}.svg`} size={iconSize} />
      )}
    </span>
  )

  return (
    <label className={rootClasses}>
      {input}
      {hoverable ? <span className={hoverAreaClassName}>{boxEl}</span> : boxEl}
      {labelled && (
        <span
          className={[
            'text-trim-cap whitespace-nowrap text-text-secondary',
            labelClasses[labelSize][mode],
            labelFont,
            labelWeight,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {label}
        </span>
      )}
    </label>
  )
})

export { Checkbox }
export type { CheckboxProps, CheckboxSize, CheckboxChecked, TextPosition }
