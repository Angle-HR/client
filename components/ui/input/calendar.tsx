'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

import { Button } from '../button/button'
import { MaskIcon } from '../icons/mask-icon'
import { Slots } from '../slots/slots'

import { CALENDAR_DROPDOWN } from './calendar.figma'

interface CalendarProps {
  /** The chosen day, as a local-time ISO date (yyyy-mm-dd). */
  value?: string
  onSelect: (isoDate: string) => void
  /** Days before this local-time ISO date cannot be picked. */
  min?: string
  /** "Today" for highlighting; injectable so stories and tests are stable. */
  today?: Date
  /** Figma's Wrapped: the light card with a border and shadow (default), or bare to sit inside another surface. */
  wrapped?: boolean
  /** Figma's Spacing: 8px between columns (loose) or 2px (tight). */
  spacing?: 'loose' | 'tight'
  className?: string
}

/** Where the month list sits, per Figma variant (static so Tailwind sees them). */
const MONTH_LIST_LEFT = {
  loose: { wrapped: 'left-[68px]', bare: 'left-[79px]' },
  tight: { wrapped: 'left-[50px]', bare: 'left-[61px]' },
} as const

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

/** The same day n months on, or the month's last day if it has fewer. */
function addMonths(date: Date, n: number): Date {
  const last = new Date(date.getFullYear(), date.getMonth() + n + 1, 0).getDate()
  return new Date(date.getFullYear(), date.getMonth() + n, Math.min(date.getDate(), last))
}

const addDays = (date: Date, n: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + n)

type CalendarSpacing = 'loose' | 'tight'

// All values from calendar.figma.ts (Figma 5042:50086, Day selector 5033:46138).
const WIDTH: Record<CalendarSpacing, { wrapped: string; bare: string }> = {
  loose: { wrapped: 'w-[264px]', bare: 'w-[256px]' },
  tight: { wrapped: 'w-[228px]', bare: 'w-[220px]' },
}
const COLUMN_GAP: Record<CalendarSpacing, string> = { loose: 'gap-[8px]', tight: 'gap-[2px]' }

// Hover enters over 50ms ease out and leaves with ease in, as Figma's
// prototype has it; the base class holds the leave timing.
// Not in Figma: keyboard focus draws the selection controls' 1px blue ring.
const DAY_BASE =
  'relative flex h-[26px] w-[28px] items-center justify-center rounded-full text-body-m leading-none transition-colors duration-[50ms] ease-figma-in outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-bg-selection-controls-selected'
const DAY_TONE = {
  rest: 'font-medium text-text-primary hover:bg-bg-transparent-medium hover:ease-figma-out enabled:cursor-pointer',
  selected:
    'border border-border-transparent-medium bg-bg-inverted font-semibold text-text-inverted-neutral enabled:cursor-pointer',
  // Figma's Today has no hover.
  today: 'font-medium text-text-blue-accent enabled:cursor-pointer',
  disabled: 'font-medium text-text-light',
} as const

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
  wrapped = true,
  spacing = 'loose',
  className = '',
}: CalendarProps): ReactNode {
  const selected = value ? new Date(`${value}T00:00:00`) : null
  const start = selected && !Number.isNaN(selected.getTime()) ? selected : today
  const [view, setView] = useState({ year: start.getFullYear(), month: start.getMonth() })
  const [picking, setPicking] = useState<'year' | 'month' | null>(null)
  const activeRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  // The day the arrow keys last moved to; set with moveFocus so the effect
  // below focuses it once it's drawn (it may be in the next month).
  const [focusIso, setFocusIso] = useState<string | null>(null)
  const moveFocus = useRef(false)
  const todayIso = toIso(today)
  const monthKey = `${view.year}-${pad(view.month + 1)}`
  const pickable = (iso: string) => iso.startsWith(monthKey) && (min === undefined || iso >= min)
  const firstPickable = [`${monthKey}-01`, min].find(
    (iso): iso is string => iso !== undefined && pickable(iso),
  )
  // One day is in the Tab order (a roving tab stop); the arrow keys move between days.
  const tabbableIso =
    [focusIso, value, todayIso].find((iso): iso is string => !!iso && pickable(iso)) ??
    firstPickable
  // Fourteen years, as in Figma: from min's year when there is one, otherwise
  // nine years back to four ahead.
  const firstYear = min
    ? Number(min.slice(0, 4))
    : today.getFullYear() - CALENDAR_DROPDOWN.yearsBack
  const years = Array.from({ length: CALENDAR_DROPDOWN.years }, (_, index) => firstYear + index)

  // Open lists show the current year or month. A list that already shows it
  // stays at the top (Figma's month list); otherwise it's centred, which for
  // this year runs the list to its end (Figma's year list).
  useEffect(() => {
    const item = activeRef.current
    item?.focus({ preventScroll: true })
    const list = item?.closest('.overflow-y-auto')
    if (!item || !list) return
    const top = item.offsetTop - list.scrollTop
    if (top >= 0 && top + item.clientHeight <= list.clientHeight) return
    list.scrollTop = item.offsetTop - list.clientHeight / 2 + item.clientHeight / 2
  }, [picking])

  useEffect(() => {
    if (!moveFocus.current) return
    moveFocus.current = false
    gridRef.current?.querySelector<HTMLElement>(`[data-iso="${tabbableIso}"]`)?.focus()
  }, [tabbableIso])

  // Arrow keys move a day or a week, Home and End to the week's ends, Page Up
  // and Down a month (a year with Shift). Enter or Space picks the day.
  function onGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const from = (event.target as HTMLElement).dataset.iso
    if (!from) return
    const day = new Date(`${from}T00:00:00`)
    const weekday = (day.getDay() + 6) % 7
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(day, -1),
      ArrowRight: () => addDays(day, 1),
      ArrowUp: () => addDays(day, -7),
      ArrowDown: () => addDays(day, 7),
      Home: () => addDays(day, -weekday),
      End: () => addDays(day, 6 - weekday),
      PageUp: () => addMonths(day, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(day, event.shiftKey ? 12 : 1),
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    const next = move()
    const iso = toIso(next)
    if (min !== undefined && iso < min) return
    moveFocus.current = true
    setFocusIso(iso)
    if (next.getFullYear() !== view.year || next.getMonth() !== view.month)
      setView({ year: next.getFullYear(), month: next.getMonth() })
  }

  // Closing a list puts focus back on the header button that opened it.
  function closeList() {
    const buttons = headerRef.current?.querySelectorAll('button')
    buttons?.[picking === 'year' ? 0 : 1]?.focus()
    setPicking(null)
  }

  // Up and Down move through a list, Home and End to its ends; Escape closes it
  // (and only it: preventDefault tells the date input not to close too).
  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="option"]'))
    const index = items.indexOf(document.activeElement as HTMLElement)
    const targets: Record<string, number> = {
      ArrowDown: Math.min(index + 1, items.length - 1),
      ArrowUp: Math.max(index - 1, 0),
      Home: 0,
      End: items.length - 1,
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      closeList()
      return
    }
    if (!(event.key in targets)) return
    event.preventDefault()
    items[targets[event.key] as number]?.focus()
  }

  const chevron = <MaskIcon src="/dashboard/icons/chevron-down-solid.svg" size={14} />
  const content = (
    <>
      <div ref={headerRef} className="flex h-[32px] items-center gap-[8px] py-[4px]">
        <Button
          variant="tertiary"
          accent="default"
          size="sm"
          aria-haspopup="listbox"
          aria-expanded={picking === 'year'}
          onClick={() => setPicking(picking === 'year' ? null : 'year')}
          iconSuffix={chevron}
        >
          {view.year}
        </Button>
        <Button
          variant="tertiary"
          accent="default"
          size="sm"
          aria-haspopup="listbox"
          aria-expanded={picking === 'month'}
          onClick={() => setPicking(picking === 'month' ? null : 'month')}
          iconSuffix={chevron}
        >
          {MONTHS[view.month]}
        </Button>
      </div>

      <div className="flex flex-col gap-[4px] px-[6px] pt-[4px] pb-[8px]">
        <div aria-hidden="true" className={`flex ${COLUMN_GAP[spacing]}`}>
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
          ref={gridRef}
          role="grid"
          aria-label={`${MONTHS[view.month]} ${view.year}`}
          onKeyDown={onGridKeyDown}
          className="flex flex-col gap-[4px]"
        >
          {monthGrid(view.year, view.month).map((week) => (
            <div key={toIso(week[0] as Date)} role="row" className={`flex ${COLUMN_GAP[spacing]}`}>
              {week.map((date) => {
                const iso = toIso(date)
                const disabled = date.getMonth() !== view.month || (min !== undefined && iso < min)
                const isSelected = iso === value
                const isToday = iso === todayIso
                const tone = isSelected
                  ? DAY_TONE.selected
                  : disabled
                    ? DAY_TONE.disabled
                    : isToday
                      ? DAY_TONE.today
                      : DAY_TONE.rest
                return (
                  <button
                    key={iso}
                    type="button"
                    role="gridcell"
                    data-iso={iso}
                    tabIndex={iso === tabbableIso ? 0 : -1}
                    aria-selected={isSelected}
                    aria-current={isToday ? 'date' : undefined}
                    aria-label={date.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                    disabled={disabled}
                    onClick={() => onSelect(iso)}
                    className={`${DAY_BASE} ${tone}`}
                  >
                    {date.getDate()}
                    {isToday && !isSelected && !disabled ? (
                      <span
                        aria-hidden="true"
                        className="absolute top-[21px] left-[13px] size-[3px] rounded-full bg-text-blue-accent"
                      />
                    ) : null}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  )

  const width = WIDTH[spacing][wrapped ? 'wrapped' : 'bare']
  // The lists hang outside the card, so they sit beside it, not in its
  // clipped Slots.
  const positioned = /\b(absolute|fixed|sticky)\b/.test(className)
  return (
    <div
      role="dialog"
      aria-label="Choose a date"
      className={`${positioned ? '' : 'relative '}${width} ${className}`}
    >
      {wrapped ? (
        <Slots background="light" shadow="xsmall" padding="tight">
          {content}
        </Slots>
      ) : (
        content
      )}
      {picking ? (
        <Slots
          background="light"
          shadow="small"
          padding="tight"
          scrollable
          className={`absolute top-[-46px] z-10 h-[227px] w-[100px] ${picking === 'year' ? 'left-0' : MONTH_LIST_LEFT[spacing][wrapped ? 'wrapped' : 'bare']}`}
        >
          <ul
            role="listbox"
            aria-label={picking === 'year' ? 'Year' : 'Month'}
            onKeyDown={onListKeyDown}
          >
            {(picking === 'year' ? years : MONTHS).map((item, index) => {
              const active = picking === 'year' ? item === view.year : index === view.month
              return (
                <li key={item} role="none">
                  <button
                    ref={active ? activeRef : undefined}
                    type="button"
                    role="option"
                    aria-selected={active}
                    tabIndex={active ? 0 : -1}
                    onClick={() => {
                      setView(
                        picking === 'year'
                          ? { ...view, year: item as number }
                          : { ...view, month: index },
                      )
                      closeList()
                    }}
                    // Figma's List Item at 24px: 6px left, 8px right, 8px corners.
                    // Hover adds a 4% fill (text stays secondary), 100ms ease in;
                    // leaving fades out with ease out. Not in Figma: keyboard
                    // focus shows the hover fill and a 1px blue ring inside.
                    className="flex h-[24px] w-full cursor-pointer items-center rounded-sm-8 pr-[8px] pl-[6px] text-left text-body-s text-text-secondary transition-colors duration-100 ease-figma-out outline-none hover:bg-bg-transparent-light hover:ease-figma-in focus-visible:bg-bg-transparent-light focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-bg-selection-controls-selected"
                  >
                    {item}
                  </button>
                </li>
              )
            })}
          </ul>
        </Slots>
      ) : null}
    </div>
  )
}

export { Calendar, monthGrid }
export type { CalendarProps, CalendarSpacing }
