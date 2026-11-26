// Radio Button, copied from Figma (Open HR › Selection Controls/🔘Radio Button,
// node 1267:43021, 36 variants). Values are the token names Figma binds, as CSS
// variable suffixes. Tests check radio-button.tsx against this.
//
// State=Focus (added to Figma 2026-11-24, now 48 variants): hover plus a 1px
// outside ring on the round area. Classes in focus.ts.

/** Figma's "Text size": 13px (the smaller radio) or 13.8px. */
type RadioSize = 'sm' | 'md'

const RADIO_FIGMA = {
  /** Unselected: a 1px inside stroke, no fill. */
  unselected: { bg: 'transparent', border: 'border-selection-controls-rest' },
  /** Selected: blue circle, no stroke, white dot. */
  selected: { bg: 'bg-selection-controls-selected', dot: 'white' },
  /** Hover fills the round area around the circle. */
  hover: {
    unselected: 'bg-selection-controls-hover-rest',
    selected: 'bg-selection-controls-hover-selected',
  },
  /** Disabled and selected: Figma adds a 1px border/notification stroke (black 6%, white 6% in dark). */
  disabledSelectedBorder: 'border-notification',
  label: { color: 'text-primary', weight: 400 },
  /** Disabled: the whole component at 30%. */
  disabledOpacity: 0.3,
} as const

const RADIO_LAYOUT: Record<
  RadioSize,
  {
    area: number
    circle: number
    dot: number
    font: string
    fontSize: number
    labelPaddingX: number
  }
> = {
  sm: {
    area: 22,
    circle: 15,
    dot: 7.63,
    font: 'Inter/Body/S/Regular',
    fontSize: 13,
    labelPaddingX: 3,
  },
  md: {
    area: 24,
    circle: 16,
    dot: 7.63,
    font: 'Inter/Body/M/Regular',
    fontSize: 13.8,
    labelPaddingX: 3,
  },
}

/** Prototype: hover in 100ms ease in, out 100ms ease out; select and deselect 50ms ease out. */
const RADIO_MOTION = {
  hoverIn: { ms: 100, easing: 'ease-in' },
  hoverOut: { ms: 100, easing: 'ease-out' },
  select: { ms: 50, easing: 'ease-out' },
} as const

/**
 * Figma oddities, kept as Figma has them:
 * - Disabled with a label: both the component and the radio inside it are at
 *   30%, so the circle ends up at 9% while the label is at 30%.
 * - Disabled and selected: a faint border/notification stroke appears that
 *   no other state has.
 * - The white dot binds color/white/white (a primitive), not a semantic token.
 */
const RADIO_ODDITIES = { labelledDisabledControlOpacity: 0.3 } as const

export { RADIO_FIGMA, RADIO_LAYOUT, RADIO_MOTION, RADIO_ODDITIES }
export type { RadioSize }
