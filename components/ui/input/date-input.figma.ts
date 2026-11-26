// Date input, copied from Figma (Open HR):
// - Inputs/Date Picker 📆, node 5042:53560, 4 variants (State Rest / Filled /
//   Open × Position Down / Up): the labelled 32px text input with the
//   Calendar suffix, and Inputs/Calendar 🗓️ (5042:50086) when open.
// - the field: .Subcomponents/Input/Text Input (840:39704), Suffix = Calendar,
//   21 variants (7 states × 3 heights). Fill, border and text tokens are the
//   text input's (INPUT_STATES); layout below.
// Tests check date-input.tsx against this.

import { INPUT_LAYOUT, INPUT_STATES } from './input.figma'

/** Per height: the text input's layout, with the calendar button's right padding. */
const DATE_LAYOUT = {
  sm: { ...INPUT_LAYOUT.sm, calendarButton: 'sm', calendarIcon: 'calendar-days-outline' },
  md: { ...INPUT_LAYOUT.md, calendarButton: 'md', calendarIcon: 'calendar-date-range-outline' },
  lg: { ...INPUT_LAYOUT.lg, calendarButton: 'md', calendarIcon: 'calendar-days-outline' },
} as const

/** DD ⋅ MM ⋅ YYYY: each part hugs its text, 4px apart; the dots are "⋅" in text/light. */
const DATE_SEGMENTS = {
  gap: 4,
  separator: '⋅',
  separatorColour: 'text-light',
  /** The dot's width: 3px at 25px, 4px at 32 and 40px. */
  separatorWidth: { sm: 3, md: 4, lg: 4 },
  placeholders: ['DD', 'MM', 'YYYY'],
} as const

/** The calendar button: Tertiary IconButton at Rest in every state, 14px icon. */
const DATE_BUTTON = { variant: 'tertiary', iconSize: 14, radius: 7 } as const

/**
 * Open: the field takes the Hover look (not Focus) and the calendar hangs 3px
 * from it, left edges aligned: below (Down) or above (Up).
 */
const DATE_OPEN = { fieldState: 'hover', offset: 3 } as const

const DATE_STATES = INPUT_STATES

/*
 * Figma oddities, kept:
 * - Open uses the Hover field, not Focus.
 * - The calendar button stays at Rest even when the field is disabled.
 * - The 32px field uses the calendar-date-range icon; 25px and 40px use
 *   calendar-days. The 25px field's 24px button still has a 14px icon.
 * - The Date Picker is 202px wide closed, 182px open; the field alone is
 *   178px at every height. The date fills the space, so the button sits at
 *   the right edge.
 * - Up places the calendar 3px above the field, over the label.
 *
 * Not in Figma, kept in code:
 * - calendarPosition "auto" (the default): Down when the calendar and its
 *   3px gap fit below the field in the window, else Up when there's more
 *   room above; right edges line up when left-aligned would run off-screen.
 * - The open calendar is pinned to the window (position: fixed) at the field,
 *   so containers that scroll or clip can't cut it off.
 * - The field never gets narrower than its date (Figma's widths always fit
 *   it), so the button can't be pushed outside the border.
 * - Typing the date straight into the three parts (the designer's note asks
 *   for it).
 * - Error text under the field (Figma's Date Picker has no helper; the text
 *   input's error helper is used).
 * - 16px text below the md breakpoint, so iOS Safari doesn't zoom on focus.
 *
 * Not built: the success state (no caller needs it yet).
 */

export { DATE_BUTTON, DATE_LAYOUT, DATE_OPEN, DATE_SEGMENTS, DATE_STATES }
