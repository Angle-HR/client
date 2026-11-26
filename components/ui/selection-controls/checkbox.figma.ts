// Checkbox, copied from Figma (Open HR › Selection Controls/✅Checkbox, node
// 1267:42518, 147 variants). Values are the token names Figma binds, as CSS
// variable suffixes. Tests check checkbox.tsx against this.
//
// State=Focus (added to Figma 2026-11-24, 60 variants, now 207 in all): hover
// variants plus a 1px outside ring; without a hover area, a ring 2px outside the
// box. Classes in focus.ts.

type CheckboxBoxSize = 11 | 14 | 15 | 18
type CheckboxType = 'unchecked' | 'checked' | 'indeterminate'

const CHECKBOX_FIGMA = {
  unchecked: { bg: 'transparent', border: 'border-selection-controls-rest' },
  /** Checked and indeterminate: blue fill, no stroke, white icon. */
  filled: { bg: 'bg-selection-controls-selected', border: 'transparent', icon: 'text-inverted' },
  /** Hover fills the hover area (Hoverable = Yes only). */
  hover: {
    unchecked: 'bg-selection-controls-hover-rest',
    filled: 'bg-selection-controls-hover-selected',
  },
  label: 'text-secondary',
  /** Disabled fades the whole component (box and label). */
  disabledOpacity: { unchecked: 0.3, filled: 0.4 },
} as const

interface CheckboxSizeSpec {
  box: number
  radius: number
  /** Unchecked stroke width (inside). */
  stroke: number
  icon: number
  /** Hoverable: the square hover area around the box. */
  hoverArea: { size: number; padding: number; radius: number }
  /** With a label. 14px has no labelled variant in Figma. */
  label?: {
    font: string
    fontSize: number
    plain: { padding: number; gap: number; labelPaddingX: number }
    hoverable: { paddingY: number; paddingX: number; gap: number; labelPaddingX: number }
  }
}

const CHECKBOX_LAYOUT: Record<CheckboxBoxSize, CheckboxSizeSpec> = {
  18: {
    box: 18,
    radius: 6,
    stroke: 1.4,
    icon: 14,
    hoverArea: { size: 28, padding: 5, radius: 10 },
    label: {
      font: 'Inter/Body/L/Regular',
      fontSize: 14,
      plain: { padding: 4, gap: 4, labelPaddingX: 4 },
      hoverable: { paddingY: 0, paddingX: 0, gap: 0, labelPaddingX: 3 },
    },
  },
  15: {
    box: 15,
    radius: 5,
    stroke: 1.2,
    icon: 12,
    hoverArea: { size: 21, padding: 3, radius: 8 },
    label: {
      font: 'Inter/Body/M/Regular',
      fontSize: 13.8,
      plain: { padding: 4, gap: 3, labelPaddingX: 3 },
      hoverable: { paddingY: 1, paddingX: 0, gap: 0, labelPaddingX: 3 },
    },
  },
  14: { box: 14, radius: 5, stroke: 1, icon: 12, hoverArea: { size: 20, padding: 3, radius: 8 } },
  11: {
    box: 11,
    radius: 3,
    stroke: 1,
    icon: 10,
    hoverArea: { size: 17, padding: 3, radius: 5 },
    label: {
      font: 'Inter/Body/xS/Regular',
      fontSize: 12,
      plain: { padding: 4, gap: 4, labelPaddingX: 0 },
      hoverable: { paddingY: 1, paddingX: 1, gap: 2, labelPaddingX: 0 },
    },
  },
}

/** Icons: check (check-outline) and indeterminate (long-dash-outline), same glyphs as Figma's icon/check and icon/long dash. */
const CHECKBOX_ICONS = { checked: 'check-outline', indeterminate: 'long-dash-outline' } as const

/** Prototype: hover in 70ms ease in, out 50ms ease out; check 10ms ease in; uncheck 50ms ease in. */
const CHECKBOX_MOTION = {
  hoverIn: { ms: 70, easing: 'ease-in' },
  hoverOut: { ms: 50, easing: 'ease-out' },
  check: { ms: 10, easing: 'ease-in' },
  uncheck: { ms: 50, easing: 'ease-in' },
} as const

/**
 * Figma oddities, kept as Figma has them (probably slips):
 * - 11px, no hover area, no label: the unchecked stroke is 0.5px, not 1px.
 * - 11px unchecked, hover area: hover uses the *selected* hover fill.
 * - 18px unchecked with the label on the left, disabled: 40%, not 30%.
 * - 11px checked/indeterminate with label and hover area, disabled: 30%, not 40%.
 * - 18px with hover area, disabled, no label: the icon is 12px, not 14px.
 * - 18px with hover area and label on the right, disabled: the label is Medium.
 * - 11px unchecked, no hover area, with label, disabled: the label is 13px (Body S).
 */
const CHECKBOX_ODDITIES = {
  stroke11Plain: 0.5,
  hover11Unchecked: 'bg-selection-controls-hover-selected',
  disabled18UncheckedLeft: 0.4,
  disabled11FilledLabelledHoverable: 0.3,
  icon18HoverableDisabled: 12,
  label18HoverableDisabledRightWeight: 500,
  label11UncheckedPlainDisabledSize: 13,
} as const

export { CHECKBOX_FIGMA, CHECKBOX_ICONS, CHECKBOX_LAYOUT, CHECKBOX_MOTION, CHECKBOX_ODDITIES }
export type { CheckboxBoxSize, CheckboxSizeSpec, CheckboxType }
