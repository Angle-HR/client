'use client'

import { useState, type ReactNode } from 'react'

import { MaskIcon } from '../icons/mask-icon'

interface CalendarProps {
  /** The chosen day, as a local-time ISO date (yyyy-mm-dd). */
  value?: string
  onSelect: (isoDate: string) => void
  /** Days before this local-time ISO date cannot be picked. */
  min?: string
  /** "Today" for highlighting; injectable so stories and tests are stable. */
  today?: Date
  className?: string
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const pad = (value: number) => String(value).padStart(2, '0')

function toIso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * The weeks of a month, Monday first, padded with the neighbouring months'
 * days so every row is full.
 */
function monthGrid(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1)
  const lead = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const rows = Math.ceil((lead + daysInMonth) / 7)
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: 7 }, (_, column) => new Date(year, month, row * 7 + column - lead + 1)),
  )
}

const headerButton =
  'flex h-[24px] cursor-pointer items-center gap-[4px] rounded-sm-7 px-[8px] text-body-s leading-none font-medium text-text-tertiary transition-colors hover:bg-bg-transparent-light hover:text-text-primary'

/**
 * A month of days to pick one from. Figma: Inputs/Calendar 🗓️.
 *
 * The year and month in the header each open a short list; days outside the
 * month, or before `min`, are greyed out and cannot be picked.
 */
function Calendar({
  value,
  onSelect,
  min,
  today = new Date(),
  className = '',
}: CalendarProps): ReactNode {
  const selected = value ? new Date(`${value}T00:00:00`) : null
  const start = selected && !Number.isNaN(selected.getTime()) ? selected : today
  const [view, setView] = useState({ year: start.getFullYear(), month: start.getMonth() })
  const [picking, setPicking] = useState<'year' | 'month' | null>(null)
  const todayIso = toIso(today)
  const years = Array.from({ length: 8 }, (_, index) => today.getFullYear() + index)

  return (
    <div
      role="dialog"
      aria-label="Choose a date"
      className={`w-[264px] rounded-lg-10 bg-bg-secondary p-[4px] shadow-md outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium ${className}`}
    >
      <div className="relative flex h-[32px] items-start gap-[8px] pt-[4px]">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={picking === 'year'}
          onClick={() => setPicking(picking === 'year' ? null : 'year')}
          className={headerButton}
        >
          {view.year}
          <MaskIcon src="/dashboard/icons/chevron-down-solid.svg" size={14} />
        </button>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={picking === 'month'}
          onClick={() => setPicking(picking === 'month' ? null : 'month')}
          className={headerButton}
        >
          {MONTHS[view.month]}
          <MaskIcon src="/dashboard/icons/chevron-down-solid.svg" size={14} />
        </button>
        {picking ? (
          <ul
            role="listbox"
            aria-label={picking === 'year' ? 'Year' : 'Month'}
            className={`absolute top-[34px] z-10 flex max-h-[170px] w-[120px] flex-col gap-[2px] overflow-y-auto rounded-lg-10 bg-bg-secondary p-[4px] shadow-md outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium ${picking === 'year' ? 'left-0' : 'left-[75px]'}`}
          >
            {(picking === 'year' ? years : MONTHS).map((item, index) => {
              const active = picking === 'year' ? item === view.year : index === view.month
              return (
                <li key={item} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setView(
                        picking === 'year'
                          ? { ...view, year: item as number }
                          : { ...view, month: index },
                      )
                      setPicking(null)
                    }}
                    className={`flex h-[28px] w-full cursor-pointer items-center rounded-sm-8 px-[6px] text-left text-body-s text-text-secondary transition-colors hover:bg-bg-transparent-light hover:text-text-primary ${active ? 'bg-bg-transparent-light text-text-primary' : ''}`}
                  >
                    {item}
                  </button>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-col gap-[4px] px-[6px] pt-[4px] pb-[8px]">
        <div aria-hidden="true" className="flex gap-[8px]">
          {WEEKDAYS.map((day, index) => (
            <span
              key={index}
              className="flex h-[13px] w-[28px] items-center justify-center text-body-s leading-none font-medium text-text-tertiary"
            >
              {day}
            </span>
          ))}
        </div>
        <div
          role="grid"
          aria-label={`${MONTHS[view.month]} ${view.year}`}
          className="flex flex-col gap-[4px]"
        >
          {monthGrid(view.year, view.month).map((week) => (
            <div key={toIso(week[0] as Date)} role="row" className="flex gap-[8px]">
              {week.map((date) => {
                const iso = toIso(date)
                const disabled = date.getMonth() !== view.month || (min !== undefined && iso < min)
                const isSelected = iso === value
                const tone = isSelected
                  ? 'bg-text-primary font-semibold text-bg-secondary'
                  : disabled
                    ? 'text-text-light'
                    : iso === todayIso
                      ? 'text-text-blue-accent hover:bg-bg-transparent-light'
                      : 'text-text-primary hover:bg-bg-transparent-light'
                return (
                  <button
                    key={iso}
                    type="button"
                    role="gridcell"
                    aria-selected={isSelected}
                    aria-current={iso === todayIso ? 'date' : undefined}
                    aria-label={date.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                    disabled={disabled}
                    onClick={() => onSelect(iso)}
                    className={`flex h-[26px] w-[28px] items-center justify-center rounded-full text-body-m leading-none font-medium transition-colors enabled:cursor-pointer ${tone}`}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { Calendar, monthGrid }
export type { CalendarProps }
