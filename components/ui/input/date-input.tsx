'use client'

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

import { IconButton } from '../button/icon-button'
import { MaskIcon } from '../icons/mask-icon'

import { Calendar } from './calendar'
import { HelperText } from './helper-text'
import { LabelWrapper } from './label-wrapper'

interface DateParts {
  day: string
  month: string
  year: string
}

type DateInputSize = 'sm' | 'md' | 'lg'
type CalendarPosition = 'auto' | 'down' | 'up'

interface CalendarPlacement {
  vertical: 'down' | 'up'
  align: 'left' | 'right'
}

/** Figma: the calendar hangs 3px from the field. */
const CALENDAR_GAP = 3

/**
 * Where an open calendar goes, given the field's box, the calendar's size
 * and the viewport. Down if it fits below (or `down` is asked for); else Up
 * if there's more room above. Left edges aligned unless that runs off the
 * right edge and lining up the right edges fits.
 */
function placeCalendar(
  field: { top: number; bottom: number; left: number; right: number },
  calendar: { width: number; height: number },
  viewport: { width: number; height: number },
  position: CalendarPosition = 'auto',
): CalendarPlacement {
  const need = calendar.height + CALENDAR_GAP
  const below = viewport.height - field.bottom
  const above = field.top
  const vertical = position !== 'auto' ? position : below >= need || below >= above ? 'down' : 'up'
  const align =
    field.left + calendar.width > viewport.width && field.right - calendar.width >= 0
      ? 'right'
      : 'left'
  return { vertical, align }
}

interface DateInputProps {
  label: string
  value: DateParts
  onChange: (value: DateParts) => void
  /** Figma heights: sm = 25px, md = 32px (the Date Picker), lg = 40px. */
  size?: DateInputSize
  /** Shown under the field, and turns its border red. */
  errorText?: string
  disabled?: boolean
  /** Adds Figma's red asterisk to the label and marks each part required. */
  required?: boolean
  /**
   * Where the calendar opens: below the field (Figma's Down), above it (Up),
   * or `auto` (the default): below when it fits, otherwise on the side with
   * more room, and lined up on the right when the left edge would run off-screen.
   */
  calendarPosition?: CalendarPosition
  /** Days before this local-time ISO date (yyyy-mm-dd) cannot be picked from the calendar. */
  min?: string
  className?: string
}

const EMPTY_DATE: DateParts = { day: '', month: '', year: '' }

const digits = (text: string, maxLength: number) => text.replace(/\D/g, '').slice(0, maxLength)

// All values from date-input.figma.ts (Figma 5042:53560 and the Calendar
// suffix of 840:39704). Padding is Figma's minus the 1px border; the right
// side is the text input's button padding, so the button sits as Figma has it.
const sizeConfig: Record<
  DateInputSize,
  {
    field: string
    buttonSlot: string
    text: string
    dot: string
    button: 'sm' | 'md'
    icon: string
  }
> = {
  sm: {
    field: 'h-[25px] pl-[7px] pr-0 rounded-sm-7',
    buttonSlot: '',
    text: 'md:text-body-s',
    dot: 'w-[3px]',
    button: 'sm',
    icon: 'calendar-days-outline',
  },
  md: {
    field: 'h-[32px] pl-[7px] pr-0 rounded-sm-8',
    buttonSlot: '-mr-[1px]',
    text: 'md:text-body-m',
    dot: 'w-[4px]',
    button: 'md',
    icon: 'calendar-date-range-outline',
  },
  lg: {
    field: 'h-[40px] pl-[11px] pr-[3px] rounded-lg-10',
    buttonSlot: '',
    text: 'md:text-body-l',
    dot: 'w-[4px]',
    button: 'md',
    icon: 'calendar-days-outline',
  },
}

// Empty fields hover (ease in); a typed part in focus turns the field blue.
// Open pins Figma's Hover look; error and disabled are fixed.
const FOCUS =
  'has-[input:focus]:bg-bg-input-focus! has-[input:focus]:border-border-input-focus! has-[input:focus]:ease-figma-out!'
const FIELD_STATES = {
  empty: `bg-bg-input-placeholder border-border-input-placeholder hover:bg-bg-input-hover hover:border-border-input-hover hover:ease-figma-in ${FOCUS}`,
  filled: `bg-bg-input-filled border-border-input-filled ${FOCUS}`,
  open: `bg-bg-input-hover border-border-input-hover ${FOCUS}`,
  error: 'bg-bg-input-error border-border-input-error',
  disabled: 'pointer-events-none bg-bg-input-disabled border-border-input-disabled',
} as const

/**
 * A date typed as three parts, DD ⋅ MM ⋅ YYYY. Figma: Inputs/Date Picker.
 *
 * The designer's note asks that dates can be typed straight into the field;
 * the calendar button opens a month to pick from instead.
 */
function DateInput({
  label,
  value,
  onChange,
  size = 'md',
  errorText,
  disabled = false,
  required = false,
  calendarPosition = 'auto',
  min,
  className = '',
}: DateInputProps): ReactNode {
  const labelId = useId()
  const errorId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)
  const buttonSlotRef = useRef<HTMLSpanElement>(null)
  // Set when the calendar opens, so focus moves into it once it's placed.
  const focusOnOpen = useRef(false)
  // Where the open calendar sits. Null until it's measured, so it never
  // flashes in the wrong place.
  const [placement, setPlacement] = useState<(CalendarPlacement & { style: CSSProperties }) | null>(
    null,
  )
  const config = sizeConfig[size]

  // The calendar is pinned to the window (position: fixed) at the field, so a
  // scrolling or clipped container around the field can't cut it off. It's
  // placed before it paints, and again when anything scrolls or the window
  // resizes. Up is held by its bottom edge and right-aligned by its right
  // edge, so changing month never moves the edge next to the field.
  useLayoutEffect(() => {
    // A previous opening's position is only a starting point: this runs
    // before paint, so the calendar is never seen there.
    if (!open) return
    function place() {
      const anchor = anchorRef.current
      const calendar = calendarRef.current
      if (!anchor || !calendar) return
      const field = anchor.getBoundingClientRect()
      const viewport = {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      }
      const { vertical, align } = placeCalendar(
        field,
        { width: calendar.offsetWidth, height: calendar.offsetHeight },
        viewport,
        calendarPosition,
      )
      setPlacement({
        vertical,
        align,
        style: {
          ...(vertical === 'down'
            ? { top: field.bottom + CALENDAR_GAP }
            : { bottom: viewport.height - field.top + CALENDAR_GAP }),
          ...(align === 'left' ? { left: field.left } : { right: viewport.width - field.right }),
        },
      })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, { capture: true, passive: true })
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, { capture: true })
    }
  }, [open, calendarPosition])

  // Opening moves focus to the chosen day (or today) in the calendar.
  useEffect(() => {
    if (!open || !placement || !focusOnOpen.current) return
    focusOnOpen.current = false
    calendarRef.current
      ?.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]')
      ?.focus({ preventScroll: true })
  }, [open, placement])

  function closeToButton() {
    setOpen(false)
    buttonSlotRef.current?.querySelector('button')?.focus()
  }

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    // Escape closes it, and focus goes back to the button if it was inside.
    // A year or month list handles its own Escape (and prevents the default).
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      if (wrapperRef.current?.contains(document.activeElement)) closeToButton()
      else setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const isEmpty = !value.day && !value.month && !value.year
  const state = disabled
    ? 'disabled'
    : errorText
      ? 'error'
      : open
        ? 'open'
        : isEmpty
          ? 'empty'
          : 'filled'
  const textColour = disabled
    ? 'text-text-input-disabled placeholder:text-text-input-disabled'
    : `${errorText ? 'text-text-input-error' : 'text-text-input-filled'} placeholder:text-text-input-placeholder`

  // Only a fully typed date is shown as chosen in the calendar.
  const iso =
    value.day && value.month && value.year.length === 4
      ? `${value.year}-${value.month.padStart(2, '0')}-${value.day.padStart(2, '0')}`
      : undefined
  // Each part hugs what it shows: its placeholder while empty, its digits
  // once typed, so a filled date closes up as in Figma. A hidden copy of the
  // text sizes the box and the input fills it. 16px below md, for iOS.
  const text = `text-[1rem] ${config.text} leading-none`
  const segment = (key: keyof DateParts, placeholder: string, name: string) => (
    <span className="relative inline-grid shrink-0">
      <span aria-hidden="true" className={`invisible whitespace-pre ${text}`}>
        {value[key] || placeholder}
      </span>
      <input
        value={value[key]}
        onChange={(event) =>
          onChange({ ...value, [key]: digits(event.target.value, placeholder.length) })
        }
        inputMode="numeric"
        placeholder={placeholder}
        aria-label={name}
        aria-invalid={errorText ? true : undefined}
        aria-describedby={errorText ? errorId : undefined}
        disabled={disabled}
        required={required || undefined}
        className={`absolute inset-0 w-full bg-transparent outline-none ${text} ${textColour}`}
      />
    </span>
  )
  const dot = (
    // Figma's dot is 4px wide (3px at 25px). "⋅" isn't in the app's Inter
    // subset and the fallback glyph is wider, so the box is fixed and centred.
    <span
      aria-hidden="true"
      className={`flex shrink-0 justify-center overflow-visible text-text-light ${config.dot} ${text}`}
    >
      ⋅
    </span>
  )

  return (
    <div
      ref={wrapperRef}
      // Tabbing (or otherwise moving focus) out of the field closes the calendar.
      onBlur={(event) => {
        const next = event.relatedTarget as Node | null
        if (open && next && !wrapperRef.current?.contains(next)) setOpen(false)
      }}
      className={`flex flex-col gap-[6px] ${className}`}
    >
      <LabelWrapper label={label} required={required} id={labelId} />
      <div ref={anchorRef} className="relative">
        <div
          role="group"
          aria-labelledby={labelId}
          className={`flex w-full min-w-fit items-center gap-[4px] border transition-colors duration-100 ease-figma-out ${config.field} ${FIELD_STATES[state]}`}
        >
          {segment('day', 'DD', 'Day')}
          {dot}
          {segment('month', 'MM', 'Month')}
          {dot}
          {segment('year', 'YYYY', 'Year')}
          <span
            ref={buttonSlotRef}
            className={`ml-auto inline-flex shrink-0 items-center ${config.buttonSlot}`}
          >
            <IconButton
              variant="tertiary"
              size={config.button}
              aria-label="Open calendar"
              aria-haspopup="dialog"
              aria-expanded={open}
              // Figma keeps the button at Rest in a disabled field, so it isn't
              // `disabled` (that greys it); the field blocks the pointer and the
              // button leaves the tab order.
              aria-disabled={disabled || undefined}
              tabIndex={disabled ? -1 : undefined}
              onClick={() => {
                focusOnOpen.current = !open
                setOpen(!open)
              }}
              icon={<MaskIcon src={`/dashboard/icons/${config.icon}.svg`} size={14} />}
            />
          </span>
        </div>
        {open ? (
          // 3px from the field, as in Figma; which side is decided by placeCalendar.
          <div
            ref={calendarRef}
            data-placement={placement ? `${placement.vertical} ${placement.align}` : undefined}
            style={placement?.style}
            className={`fixed z-50 ${placement ? '' : 'invisible top-0 left-0'}`}
          >
            <Calendar
              value={iso}
              min={min}
              onSelect={(picked) => {
                const [year = '', month = '', day = ''] = picked.split('-')
                onChange({ day, month, year })
                closeToButton()
              }}
            />
          </div>
        ) : null}
      </div>
      {errorText ? (
        <div role="alert">
          <HelperText id={errorId} state="error">
            {errorText}
          </HelperText>
        </div>
      ) : null}
    </div>
  )
}

export { DateInput, EMPTY_DATE, placeCalendar }
export type { CalendarPlacement, CalendarPosition, DateInputProps, DateInputSize, DateParts }
