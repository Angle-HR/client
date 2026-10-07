'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

import { MaskIcon } from '../icons/mask-icon'

import { Calendar } from './calendar'
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
  /** Days before this local-time ISO date (yyyy-mm-dd) cannot be picked from the calendar. */
  min?: string
  className?: string
}

const EMPTY_DATE: DateParts = { day: '', month: '', year: '' }

const digits = (text: string, maxLength: number) => text.replace(/\D/g, '').slice(0, maxLength)

/**
 * A date typed as three segments, DD · MM · YYYY. Figma: Inputs/Date Picker.
 *
 * The designer's note asks that dates can be typed straight into the field;
 * the calendar button opens a month to pick from instead.
 */
function DateInput({
  label,
  value,
  onChange,
  errorText,
  min,
  className = '',
}: DateInputProps): ReactNode {
  const labelId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  // Only a fully typed date is shown as chosen in the calendar.
  const iso =
    value.day && value.month && value.year.length === 4
      ? `${value.year}-${value.month.padStart(2, '0')}-${value.day.padStart(2, '0')}`
      : undefined
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
    <div ref={wrapperRef} className={`relative flex flex-col gap-[6px] ${className}`}>
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
        <button
          type="button"
          aria-label="Open calendar"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className={`ml-auto flex size-[30px] shrink-0 cursor-pointer items-center justify-center rounded-sm-7 transition-colors hover:text-text-primary ${open ? 'text-text-primary' : 'text-text-input-placeholder'}`}
        >
          <MaskIcon src="/dashboard/icons/calendar-date-range-outline.svg" size={14} />
        </button>
      </div>
      {open ? (
        // Hangs 3px under the field, left edges aligned, as in the design.
        <Calendar
          value={iso}
          min={min}
          onSelect={(picked) => {
            const [year = '', month = '', day = ''] = picked.split('-')
            onChange({ day, month, year })
            setOpen(false)
          }}
          className="absolute top-[50px] left-0 z-20"
        />
      ) : null}
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
