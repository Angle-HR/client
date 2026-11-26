// Calendar, copied from Figma (Open HR):
// - Inputs/Calendar 🗓️, node 5042:50086, 16 variants: State (Rest, Selected,
//   Year selector, Month selector) × Wrapped (yes / no) × Spacing (Loose / Tight)
// - .Subcomponents/Calendar 🗓️/Day selector, node 5033:46138, 5 states
// - .Subcomponents/Calendar 🗓️/ Days, node 5033:46437 (weekday letters)
// Values are the token names Figma binds, as CSS variable suffixes. Tests
// check calendar.tsx against this.

type CalendarSpacing = 'loose' | 'tight'
type DayState = 'rest' | 'hover' | 'selected' | 'today' | 'disabled'

/** Wrapped: a light Slots card, 4px padding, 10px corners, 0.5px border, x-small shadow. */
const CALENDAR_WRAPPER = {
  background: 'bg-light',
  border: 'border-transparent-medium',
  borderWidth: 0.5,
  padding: 4,
  radius: 10,
  shadow: 'shadow-slots-xsmall',
} as const

const CALENDAR_LAYOUT = {
  /** Outer width: wrapped / not wrapped. */
  width: { loose: { wrapped: 264, bare: 256 }, tight: { wrapped: 228, bare: 220 } },
  /** Year and month buttons: 32px row, 4px above and below, 8px apart. */
  header: { height: 32, paddingY: 4, gap: 8, button: { variant: 'tertiary', size: 'sm' } },
  headerIcon: 'chevron-down-solid',
  /** Weekdays and dates: 4px top, 6px sides, 8px bottom; rows 4px apart. */
  body: { paddingTop: 4, paddingX: 6, paddingBottom: 8, rowGap: 4 },
  /** Between the seven columns. */
  columnGap: { loose: 8, tight: 2 },
  weekday: {
    width: 28,
    height: 13,
    utility: 'text-body-s',
    weight: 'font-medium',
    colour: 'text-tertiary',
  },
  day: { width: 28, height: 26, utility: 'text-body-m', radius: 'full' },
} as const satisfies Record<string, unknown>

const DAY_STATES: Record<
  DayState,
  { bg?: string; border?: string; text: string; weight: string; dot?: string }
> = {
  rest: { text: 'text-primary', weight: 'font-medium' },
  hover: { bg: 'bg-transparent-medium', text: 'text-primary', weight: 'font-medium' },
  selected: {
    bg: 'bg-inverted',
    border: 'border-transparent-medium',
    text: 'text-inverted-neutral',
    weight: 'font-semibold',
  },
  /** Blue number with a 3px blue dot under it (at x 13, y 21 in the 28 × 26 cell). */
  today: { text: 'text-blue-accent', weight: 'font-medium', dot: 'text-blue-accent' },
  disabled: { text: 'text-light', weight: 'font-medium' },
}

/** Prototype: Rest → Hover on mouse enter, 50ms ease out; back on leave, 50ms ease in. Click selects at once. */
const DAY_MOTION = { duration: 50, enter: 'ease-figma-out', leave: 'ease-figma-in' } as const

/**
 * Year and Month selector: a light Slots list (small shadow, 4px padding,
 * 10px corners, 0.5px border) 100 × 227px, 46px above the calendar's top
 * edge. The year list sits at the left edge; the month list moves per
 * variant (68 / 79px loose, 50 / 61px tight, wrapped / not wrapped).
 * Items are List Item instances (the 32px one squashed to 24px): 6px left
 * and 8px right padding, 8px corners, Body S Regular (13 / 19.5) in
 * text/Secondary. Fourteen years, 2017 to 2030 in Figma: nine back, four
 * ahead. The year list opens scrolled to its end; the month list at the top.
 */
const CALENDAR_DROPDOWN = {
  width: 100,
  height: 227,
  top: -46,
  left: {
    year: 0,
    month: { loose: { wrapped: 68, bare: 79 }, tight: { wrapped: 50, bare: 61 } },
  },
  shadow: 'shadow-slots-small',
  item: {
    height: 24,
    paddingLeft: 6,
    paddingRight: 8,
    radius: 8,
    utility: 'text-body-s',
    colour: 'text-secondary',
    /** List Item hover: a 4% fill, the text unchanged. Dissolve 100ms, ease in; back with ease out. */
    hoverBg: 'bg-transparent-light',
    motion: { duration: 100, enter: 'ease-figma-in', leave: 'ease-figma-out' },
  },
  years: 14,
  yearsBack: 9,
} as const

/*
 * Figma oddities, kept:
 * - Hover enters with ease out and leaves with ease in (the reverse of the
 *   other components).
 * - The year and month buttons stay at Rest while their list is open.
 * - No item in the year or month list is marked as the current one.
 * - The list sits 46px above the calendar's top, over the header.
 * - The month list's left edge differs in every variant (68, 79, 50, 61px)
 *   although the month button doesn't move by the same amounts.
 * - The list items are the 32px List Item squashed to 24px.
 *
 * Not in Figma, kept in code:
 * - Days before `min` are disabled, as well as days outside the month.
 * - Keyboard focus on a day shows the browser's focus ring (Figma has no
 *   focus state).
 * - The year list starts at `min`'s year when one is set.
 * - When the shown year or month is out of view, its list opens with it
 *   centred (Figma only shows this year and June).
 * - The lists scroll with Figma's scrollbar (3478:17263, see
 *   list/scrollbar.figma.ts); Figma's calendar lists only show the hint.
 * - The list's scroll hint is the Slots fade. Figma's is a 28px fade with a
 *   10px outline chevron in text/light, at the top when scrolled down and
 *   at the bottom when there's more below; it belongs to Slots and is
 *   matched when Slots is audited.
 */

export { CALENDAR_DROPDOWN, CALENDAR_LAYOUT, CALENDAR_WRAPPER, DAY_MOTION, DAY_STATES }
export type { CalendarSpacing, DayState }
