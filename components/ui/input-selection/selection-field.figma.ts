// Selection field, copied from Figma (Open HR):
// - the field: .Subcomponents/Input/Selection 🔽, node 915:21577, 36 variants
//   (6 states × 3 heights × with-selection No / Yes)
// - the labelled field: node 1053:47789, 12 variants (label, field, helper,
//   6px apart, at 32 and 25px, as TextInput)
// Values are the token names Figma binds, as CSS variable suffixes. Fill,
// border and text tokens are the text input's; see input.figma.ts.
// Tests check selection-field.tsx against this.

import { INPUT_LAYOUT, type InputSize } from '../input/input.figma'

type SelectionState = 'placeholder' | 'hover' | 'focus' | 'filled' | 'disabled' | 'error'

/** Same heights, padding, radius, gap, icons and type as the text input. */
const SELECTION_LAYOUT: Record<
  InputSize,
  Pick<(typeof INPUT_LAYOUT)[InputSize], 'height' | 'paddingX' | 'radius' | 'gap' | 'icon' | 'text'>
> = {
  sm: INPUT_LAYOUT.sm,
  md: INPUT_LAYOUT.md,
  lg: INPUT_LAYOUT.lg,
}

/**
 * Per state: fill, 1px inside border, text, prefix icon (bell in Figma's
 * example, a slot in code) and the chevron-down suffix.
 */
const SELECTION_STATES: Record<
  SelectionState,
  { bg: string; border: string; text: string; prefix: string; chevron: string }
> = {
  placeholder: {
    bg: 'bg-input-placeholder',
    border: 'border-input-placeholder',
    text: 'text-input-placeholder',
    prefix: 'text-input-placeholder',
    chevron: 'text-input-icon-suffix',
  },
  hover: {
    bg: 'bg-input-hover',
    border: 'border-input-hover',
    text: 'text-input-hover',
    prefix: 'text-input-hover',
    chevron: 'text-input-icon-suffix',
  },
  focus: {
    bg: 'bg-input-focus',
    border: 'border-input-focus',
    text: 'text-input-focus',
    prefix: 'text-input-focus',
    chevron: 'text-input-icon-suffix',
  },
  filled: {
    bg: 'bg-input-filled',
    border: 'border-input-filled',
    text: 'text-input-filled',
    prefix: 'text-input-filled',
    chevron: 'text-input-icon-suffix',
  },
  disabled: {
    bg: 'bg-input-disabled',
    border: 'border-input-disabled',
    text: 'text-input-disabled',
    prefix: 'text-input-disabled',
    chevron: 'text-input-icon-suffix',
  },
  error: {
    bg: 'bg-input-error',
    border: 'border-input-error',
    text: 'text-input-error',
    prefix: 'text-input-error',
    chevron: 'text-input-icon-suffix-error',
  },
}

/**
 * The chevron-down (outline) suffix: a 14px box (12px at 25px) with the
 * arrow at 80% of a 16px frame, 9.91 × 5.54px (8.5 × 4.75px at 12).
 */
const SELECTION_CHEVRON = {
  icon: 'chevron-down-outline',
  glyph: { 14: [9.91, 5.54], 12: [8.5, 4.75] },
} as const

/** with-selection = Yes: green Large tags (20px), 2px apart; no prefix. */
const SELECTION_TAGS = { gap: 2, tagHeight: 20, colour: 'green', prefix: false } as const

/**
 * Prototype, the same as the text input: Placeholder → Hover on mouse enter
 * (Dissolve 100ms, ease in), back on leave (ease out); click → Focus (100ms,
 * ease out); Filled has no hover.
 */
const SELECTION_MOTION = {
  duration: 100,
  hoverIn: 'ease-figma-in',
  out: 'ease-figma-out',
  hoverOnlyWhenEmpty: true,
} as const

/*
 * Figma oddities, kept:
 * - Every state shows the same sample text; Focus and Filled colour it as a
 *   value. Code keeps placeholder text grey and the chosen value dark.
 * - The Place holder and Disabled variants with selection still show tags,
 *   at full colour; a disabled field's tags aren't faded.
 * - The 25px labelled variants use the 32px field instance resized to 25.
 *
 * Not in Figma, kept in code:
 * - The search text box inside the field (searchable lists).
 * - A leading visual (flag) before the chosen value.
 * - The open list itself (a separate dropdown component).
 */

export { SELECTION_CHEVRON, SELECTION_LAYOUT, SELECTION_MOTION, SELECTION_STATES, SELECTION_TAGS }
export type { SelectionState }
