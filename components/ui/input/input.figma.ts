// Text input, copied from Figma (Open HR):
// - the field: .Subcomponents/Input/Text Input, node 840:39704, 105 variants
//   (7 states × 3 heights × 5 suffixes; Calendar and Selection belong to
//   DateInput and InputSelection, audited separately)
// - the labelled input: Inputs/Text input, node 1053:47802, 14 variants
// - helper text: .Subcomponents/Helper-Text, node 1061:48521, 8 variants
// Values are the token names Figma binds, as CSS variable suffixes. Tests
// check input.tsx, text-input.tsx and helper-text.tsx against this.

type InputSize = 'sm' | 'md' | 'lg'
type InputState = 'placeholder' | 'hover' | 'focus' | 'filled' | 'error' | 'success' | 'disabled'

/** Figma heights: sm = 25px, md = 32px, lg = 40px. */
const INPUT_LAYOUT: Record<
  InputSize,
  {
    height: number
    /** Figma padding; the 1px border sits inside it, so CSS uses one less. */
    paddingX: number
    /** Right padding when the suffix is a button. */
    buttonPaddingRight: number
    radius: number
    gap: number
    icon: number
    text: { style: string; fontSize: number; utility: string }
    /** The suffix button Figma places in this height. */
    button: { size: 'sm' | 'md'; px: number; variant: 'light' }
  }
> = {
  sm: {
    height: 25,
    paddingX: 8,
    buttonPaddingRight: 1,
    radius: 7,
    gap: 4,
    icon: 12,
    text: { style: 'Inter/Body/S/Regular', fontSize: 13, utility: 'text-body-s' },
    button: { size: 'sm', px: 24, variant: 'light' },
  },
  md: {
    height: 32,
    paddingX: 8,
    buttonPaddingRight: 0,
    radius: 8,
    gap: 4,
    icon: 14,
    text: { style: 'Inter/Body/M/Regular', fontSize: 13.8, utility: 'text-body-m' },
    button: { size: 'md', px: 32, variant: 'light' },
  },
  lg: {
    height: 40,
    paddingX: 12,
    buttonPaddingRight: 4,
    radius: 10,
    gap: 4,
    icon: 14,
    text: { style: 'Inter/Body/L/Regular', fontSize: 14, utility: 'text-body-l' },
    button: { size: 'md', px: 32, variant: 'light' },
  },
}

/**
 * Per state: field fill and 1px inside border, the text colour, the prefix
 * icon colour (Figma tints it like the text) and the suffix icon colour.
 */
const INPUT_STATES: Record<
  InputState,
  { bg: string; border: string; text: string; prefix: string; suffix: string }
> = {
  placeholder: {
    bg: 'bg-input-placeholder',
    border: 'border-input-placeholder',
    text: 'text-input-placeholder',
    prefix: 'text-input-placeholder',
    suffix: 'text-input-icon-suffix',
  },
  hover: {
    bg: 'bg-input-hover',
    border: 'border-input-hover',
    text: 'text-input-hover',
    prefix: 'text-input-hover',
    suffix: 'text-input-icon-suffix',
  },
  focus: {
    bg: 'bg-input-focus',
    border: 'border-input-focus',
    text: 'text-input-focus',
    prefix: 'text-input-focus',
    suffix: 'text-input-icon-suffix',
  },
  filled: {
    bg: 'bg-input-filled',
    border: 'border-input-filled',
    text: 'text-input-filled',
    prefix: 'text-input-filled',
    suffix: 'text-input-icon-suffix',
  },
  error: {
    bg: 'bg-input-error',
    border: 'border-input-error',
    text: 'text-input-error',
    prefix: 'text-input-error',
    suffix: 'text-error',
  },
  // Figma binds bg/input/error here (bg/input/filled at 25px); both are the
  // same colour, so the code uses bg-input-filled at every height.
  success: {
    bg: 'bg-input-filled',
    border: 'border-input-success',
    text: 'text-input-error',
    prefix: 'text-input-error',
    suffix: 'text-success',
  },
  disabled: {
    bg: 'bg-input-disabled',
    border: 'border-input-disabled',
    // The token is 20% black / white; no extra opacity on the field.
    text: 'text-input-disabled',
    prefix: 'text-input-disabled',
    suffix: 'text-input-icon-suffix',
  },
}

/**
 * Prototype: Placeholder → Hover on mouse enter (Dissolve 100ms, ease in) and
 * back on leave (ease out). Click goes to Focus (100ms, ease out). Filled has
 * no hover: only an empty field reacts to the pointer.
 */
const INPUT_MOTION = {
  duration: 100,
  hoverIn: 'ease-figma-in',
  out: 'ease-figma-out',
  hoverOnlyWhenEmpty: true,
} as const

/** Labelled input: label, field and helper stacked 6px apart. */
const TEXT_INPUT_FIGMA = {
  gap: 6,
  label: { style: 'Inter/Body/xS/SemiBold', weight: 550, colour: 'text-tertiary', paddingLeft: 3 },
  /** Only the 25px and 32px fields have a labelled version in Figma. */
  sizes: ['sm', 'md'] as const,
} as const

const HELPER_TEXT_FIGMA = {
  style: 'Inter/Body/xS/Regular',
  paddingLeft: 3,
  gap: 2,
  colour: {
    neutral: 'text-light',
    error: 'text-error',
    info: 'text-secondary',
    success: 'text-secondary',
  },
  /** Success only: check-circle (solid) in a 10px box, glyph 8px, text/Success. */
  successIcon: { name: 'check-circle-solid', size: 10, colour: 'text-success' },
} as const

/*
 * The label and its Required asterisk come from label-wrapper.figma.ts.
 *
 * Figma oddities, kept:
 * - Success uses the error text colour (text/input/error) and error fill; the
 *   values equal the filled ones, so only the green border shows.
 * - Hover has no effect once the field has text.
 * - Icons are slots. Figma's examples use bell (outline) as the prefix and
 *   information-circle (outline) as the suffix, swapped for check-circle
 *   (solid) in the success state; callers choose the glyph.
 *
 * Not in Figma, kept in code:
 * - 16px text below the md breakpoint, so iOS Safari doesn't zoom on focus.
 * - readOnly.
 */

export { HELPER_TEXT_FIGMA, INPUT_LAYOUT, INPUT_MOTION, INPUT_STATES, TEXT_INPUT_FIGMA }
export type { InputSize, InputState }
