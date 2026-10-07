'use client'

import { useId, type ReactNode } from 'react'

import { MaskIcon } from '../icons/mask-icon'

import { LabelWrapper } from './label-wrapper'

interface DateParts {
  day: string
  month: string
  year: string
}

interface DateInputProps {
  label: string
  value: DateParts
  onChange: (value: DateParts) => void
  /** Shown under the field, and turns its border red. */
  errorText?: string
  className?: string
}

const EMPTY_DATE: DateParts = { day: '', month: '', year: '' }

const digits = (text: string, maxLength: number) => text.replace(/\D/g, '').slice(0, maxLength)

/**
 * A date typed as three segments, DD · MM · YYYY. Figma: Inputs/Date Picker.
 *
 * The designer's note asks that dates can be typed straight into the field, so
 * this is the typing half of that component; the calendar popover is separate.
 */
function DateInput({
  label,
  value,
  onChange,
  errorText,
  className = '',
}: DateInputProps): ReactNode {
  const labelId = useId()
  const segment = (key: keyof DateParts, placeholder: string, name: string, widthClass: string) => (
    <input
      value={value[key]}
      onChange={(event) =>
        onChange({ ...value, [key]: digits(event.target.value, placeholder.length) })
      }
      inputMode="numeric"
      placeholder={placeholder}
      aria-label={name}
      className={`${widthClass} bg-transparent text-body-m leading-21 text-text-primary outline-none placeholder:text-text-input-placeholder`}
    />
  )
  const dot = (
    <span aria-hidden="true" className="text-body-m leading-21 text-text-input-placeholder">
      ·
    </span>
  )

  return (
    <div className={`flex flex-col gap-[6px] ${className}`}>
      <span id={labelId}>
        <LabelWrapper label={label} />
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        className={`flex h-[32px] items-center gap-[4px] rounded-sm-8 border bg-bg-input-placeholder pl-[8px] transition-colors focus-within:border-border-input-focus focus-within:bg-bg-input-focus hover:border-border-input-hover ${errorText ? 'border-border-input-error' : 'border-border-input-placeholder'}`}
      >
        {segment('day', 'DD', 'Day', 'w-[22px]')}
        {dot}
        {segment('month', 'MM', 'Month', 'w-[24px]')}
        {dot}
        {segment('year', 'YYYY', 'Year', 'w-[40px]')}
        <span className="ml-auto flex size-[32px] shrink-0 items-center justify-center text-text-input-placeholder">
          <MaskIcon src="/dashboard/icons/calendar-date-range-outline.svg" size={14} />
        </span>
      </div>
      {errorText ? (
        <span role="alert" className="pl-[3px] text-body-xs leading-19_2 text-text-error">
          {errorText}
        </span>
      ) : null}
    </div>
  )
}

export { DateInput, EMPTY_DATE }
export type { DateInputProps, DateParts }
