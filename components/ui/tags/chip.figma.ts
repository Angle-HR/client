// Chip, copied from Figma (Open HR › 🟧 Chips, node 2363:70402, 41 variants;
// remove button: 🟧 Chips/.Subcomponents/Remove button, node 2351:69361, 6
// variants). Values are the token names Figma binds, as CSS variable
// suffixes. Tests check chip.tsx and chip-remove-button.tsx against this.

/** Figma's "🎨 Fill". */
type ChipFill = 'default' | 'accent' | 'green' | 'transparent'
/** Figma's "state". `loading` replaces the chip with a skeleton. */
type ChipState = 'rest' | 'hover' | 'placeholder' | 'disabled' | 'loading'

const CHIP_FILLS: ChipFill[] = ['default', 'accent', 'green', 'transparent']

/** Background per fill and state. `null` is no fill. Text and icon don't change on hover. */
const CHIP_FIGMA: Record<
  ChipFill,
  { rest: string | null; hover: string | null; disabled: string | null }
> = {
  default: {
    rest: 'bg-transparent-light',
    hover: 'bg-transparent-medium',
    disabled: 'bg-transparent-lighter',
  },
  accent: {
    rest: 'bg-transparent-blue-accent-light',
    hover: 'bg-transparent-blue-accent-medium',
    // Figma oddity: disabled Accent keeps the rest fill.
    disabled: 'bg-transparent-blue-accent-light',
  },
  green: {
    rest: 'bg-transparent-green-accent-light',
    hover: 'bg-transparent-green-accent-medium',
    disabled: 'bg-transparent-green-accent-lighter',
  },
  transparent: { rest: null, hover: null, disabled: null },
}

/** Label colour: primary, or light for Placeholder and Disabled. Placeholder keeps the rest fill. */
const CHIP_TEXT = { rest: 'text-primary', muted: 'text-light' } as const

/** The loading skeleton: a left-to-right gradient bar. */
const CHIP_LOADING = {
  from: 'bg-gradient-transparent-light',
  to: 'bg-gradient-transparent-lighter',
  width: 60.09,
  height: 14,
  radius: 4,
  paddingX: 3,
} as const

/**
 * Layout (all fills and states):
 * 20px tall, 7px radius, 3px padding on the left only. Then the icon (14px,
 * 4px radius, an avatar or glyph swapped in; Figma's is the square 14px photo
 * avatar with a border, Avatar type="image-border" circular={false}) with 3px
 * after it, then the label
 * (13px Body S, Regular or Medium) with 1px before it and 4px after it, or 2px
 * after it when a remove button follows. The remove button is 20×20, padding
 * 3, rounded on the right (0/7/7/0), with a 14px solid x-mark.
 */
const CHIP_LAYOUT = {
  height: 20,
  radius: 7,
  paddingLeft: 3,
  icon: 14,
  iconRadius: 4,
  iconGap: 3,
  labelPaddingLeft: 1,
  labelPaddingRight: 4,
  labelPaddingRightRemovable: 2,
  font: 'Inter/Body/S',
  fontSize: 13,
  remove: { size: 20, padding: 3, radius: [0, 7, 7, 0], icon: 14 },
} as const

/** Remove button (its own component set). Chips use its "rest" state, so the x always shows. */
const CHIP_REMOVE_FIGMA = {
  empty: {
    rest: { bg: null, icon: 'text-tertiary' },
    hover: { bg: 'bg-transparent-light', icon: 'text-secondary' },
  },
  blue: {
    rest: { bg: null, icon: 'text-blue-accent' },
    hover: { bg: 'bg-transparent-blue-accent-light', icon: 'text-blue-accent' },
  },
} as const

/** Prototype: chip hover in 50ms ease in, out 50ms ease out; remove button hover 150ms ease out. */
const CHIP_MOTION = {
  hoverIn: { ms: 50, easing: 'ease-in' },
  hoverOut: { ms: 50, easing: 'ease-out' },
  removeHover: { ms: 150, easing: 'ease-out' },
} as const

/*
 * Figma oddities, kept:
 * - Removable Accent chips show a grey x at rest and a blue x on hover.
 * - Disabled Accent keeps the rest fill (other fills go lighter).
 * - Placeholder Accent and Green (Regular text) have a 3px gap between the
 *   icon and the label, so the label sits 6px from the icon, not 3px.
 * - Disabled with Medium text has no icon: the 14px space stays empty.
 * - The set's default variant is Loading.
 * - Disabled Accent and Green with Medium text use the photo avatar without a
 *   border; every other variant has the border.
 * - Removable chips only come with Regular text, in rest and hover.
 *
 * Not in Figma, kept in code:
 * - `tone="secondary"`: a grey label used on the jobs board.
 * - A highlight sweeping across the loading bar (1.4s, ease in-out, looping;
 *   off with reduced motion). Figma's loading state is still.
 * - Keyboard focus ring on a clickable chip and on the remove button (1px
 *   blue, like the selection controls). Figma has no focus state.
 */

export {
  CHIP_FIGMA,
  CHIP_FILLS,
  CHIP_LAYOUT,
  CHIP_LOADING,
  CHIP_MOTION,
  CHIP_REMOVE_FIGMA,
  CHIP_TEXT,
}
export type { ChipFill, ChipState }
