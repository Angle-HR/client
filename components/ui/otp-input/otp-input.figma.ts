// OTP input, copied from Figma (Open HR):
// - the cell: .Subcomponents/Input/OTP, node 2711:39040, 7 variants
//   (state = Place-holder, Hover, Focus, Filled, Error, Disabled, Sucess)
// - the labelled group: Inputs/OTP 🍄, node 2765:34486, 4 variants
//   (State = Rest, Error, All Focused, Success; Show Label, Show Helper)
// Values are the token names Figma binds, as CSS variable suffixes. Tests
// check otp-cell.tsx and otp-input.tsx against this.

type OTPCellState = 'placeholder' | 'hover' | 'focus' | 'filled' | 'error' | 'disabled' | 'success'

/**
 * The cell: 38 × 42px, 12px side padding, 8px corners, a 1px inside border.
 * One character, centred, Inter/Body/L/Regular (14/21) trimmed to cap height.
 * Empty, it shows a "-".
 */
const OTP_CELL_LAYOUT = {
  width: 38,
  height: 42,
  paddingX: 12,
  radius: 8,
  border: 1,
  text: { style: 'Inter/Body/L/Regular', fontSize: 14, utility: 'text-body-l', align: 'center' },
  placeholder: '-',
} as const

/** Per state: fill, border and text (the "-" when empty, the digit when not). */
const OTP_CELL_STATES: Record<OTPCellState, { bg: string; border: string; text: string }> = {
  placeholder: {
    bg: 'bg-input-placeholder',
    border: 'border-input-placeholder',
    text: 'text-input-placeholder',
  },
  hover: { bg: 'bg-input-hover', border: 'border-input-hover', text: 'text-input-hover' },
  focus: { bg: 'bg-input-focus', border: 'border-input-focus', text: 'text-input-focus' },
  filled: { bg: 'bg-input-filled', border: 'border-input-filled', text: 'text-input-filled' },
  error: { bg: 'bg-input-error', border: 'border-input-error', text: 'text-input-error' },
  // The token is 20% black / white; no extra opacity on the cell.
  disabled: {
    bg: 'bg-input-disabled',
    border: 'border-input-disabled',
    text: 'text-input-disabled',
  },
  // Figma binds the error fill and text here, with the success border. The
  // error fill is the same grey as every other state's.
  success: { bg: 'bg-input-error', border: 'border-input-success', text: 'text-input-error' },
}

/**
 * Prototype: Place-holder → Hover on mouse enter (Dissolve 100ms, ease in),
 * back on leave (ease out); click → Focus (100ms, ease out). Filled has no
 * hover.
 */
const OTP_CELL_MOTION = { duration: 100, hoverIn: 'ease-figma-in', out: 'ease-figma-out' } as const

/**
 * The labelled group: label-wrapper (Prod = No), the row of cells 4px apart,
 * and Helper-Text (with Padding = yes), 6px apart. Six cells. While focused,
 * every cell shows Focus (All Focused). On Success a 24px solid check-badge
 * in text/Success follows the cells, 4px after the last one; the helper
 * stays Neutral. On Error the helper turns Error.
 */
const OTP_INPUT_FIGMA = {
  gap: 6,
  cellGap: 4,
  length: 6,
  label: 'label-wrapper',
  helper: { inset: true },
  success: { icon: 'check-badge-solid', size: 24, glyph: 19.2, colour: 'text-success' },
  states: ['rest', 'error', 'all-focused', 'success'],
} as const

/*
 * Figma oddities, kept:
 * - Success uses the error fill and text tokens (same colours as the rest).
 * - A focused empty cell's "-" is dark (text/input/focus), not grey.
 * - Every cell shows Focus while the group has focus (All Focused), not just
 *   the one being typed in. The caret marks the active cell.
 * - The prototype goes Focus → Filled on click and Focus → Place-holder on
 *   mouse leave; the code follows real focus.
 * - "Sucess" is spelled that way in Figma.
 *
 * Not in Figma, kept in code:
 * - The success badge is positioned absolutely, 4px after the cells, so the
 *   row doesn't grow 28px and shift when the code is accepted.
 * - Error and Success cells don't change on hover or focus (Figma has no such
 *   variants); the caret shows where you are.
 * - Paste fills every cell; Backspace on an empty cell moves back.
 * - 16px text below the md breakpoint, so iOS Safari doesn't zoom on focus.
 */

export { OTP_CELL_LAYOUT, OTP_CELL_MOTION, OTP_CELL_STATES, OTP_INPUT_FIGMA }
export type { OTPCellState }
