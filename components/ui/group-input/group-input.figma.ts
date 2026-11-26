// Group input, copied from Figma (Open HR):
// - the field: .Subcomponents/Group-input, node 991:22214, 126 variants
//   (state × Suffix × size × ⛔ Position)
// - left panels: .Subcomponents/Group-input/Left/Currency (974:44159),
//   /Left/Flag (974:91945), /Left/Text-helpers (974:92276), 6 variants each
//   (height × state = Rest, hover)
// - right panel: .Subcomponents/Group-input/Right/Text-helpers (974:92414)
// - the labelled group: Inputs/Text Group input ✏️, node 1061:48573, 12 variants
// Values are the token names Figma binds, as CSS variable suffixes. Tests
// check the group-input components against this.

type GroupInputSize = 'sm' | 'md' | 'lg'
/**
 * Figma's ⛔ Position: which end of the group the field is at. Right = the
 * field ends the group (right corners rounded), Left = it starts it (left
 * corners rounded), Center = panels on both sides (square).
 */
type GroupFieldPosition = 'left' | 'center' | 'right'
type GroupFieldState = 'placeholder' | 'hover' | 'focus' | 'filled' | 'error' | 'disabled'

/**
 * The field: a row with a 4px gap and a 1px inside border, 156px wide in
 * Figma (fills the group in use). Padding includes the border, so CSS uses one
 * less. Radius only on the outer side.
 */
const GROUP_FIELD_LAYOUT: Record<
  GroupInputSize,
  {
    figmaSize: string
    height: number
    paddingX: number
    /** Right padding with the ✅ Button suffix. */
    buttonPaddingRight: number
    radius: number
    icon: number
    text: { style: string; fontSize: number; utility: string }
    button: { size: 'sm' | 'md'; px: number }
  }
> = {
  sm: {
    figmaSize: '25px',
    height: 25,
    paddingX: 8,
    buttonPaddingRight: 1,
    radius: 7,
    icon: 12,
    text: { style: 'Inter/Body/S/Regular', fontSize: 13, utility: 'text-body-s' },
    button: { size: 'sm', px: 24 },
  },
  md: {
    figmaSize: '32 px',
    height: 32,
    paddingX: 8,
    buttonPaddingRight: 0,
    radius: 8,
    icon: 14,
    text: { style: 'Inter/Body/M/Regular', fontSize: 13.8, utility: 'text-body-m' },
    button: { size: 'md', px: 32 },
  },
  lg: {
    figmaSize: '40 px',
    height: 40,
    paddingX: 12,
    buttonPaddingRight: 12,
    radius: 10,
    icon: 14,
    text: { style: 'Inter/Body/L/Regular', fontSize: 14, utility: 'text-body-l' },
    button: { size: 'md', px: 32 },
  },
}

const GROUP_FIELD_GAP = 4

/** Corners per position: [top-left, top-right, bottom-right, bottom-left], 1 = rounded. */
const GROUP_FIELD_CORNERS: Record<GroupFieldPosition, [number, number, number, number]> = {
  right: [0, 1, 1, 0],
  center: [0, 0, 0, 0],
  left: [1, 0, 0, 1],
}

/**
 * Per state: fill, border, text, prefix icon (same token as the text) and
 * suffix icon. The ✅ Button's icon is text/btn-default/light in every state
 * (#b3b3b3, #4c4c4c dark, the same values as text/input/icon-suffix).
 */
const GROUP_FIELD_STATES: Record<
  GroupFieldState,
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
    suffix: 'text-input-icon-suffix-error',
  },
  // The text token is 20% black / white; no extra opacity on the field.
  disabled: {
    bg: 'bg-input-disabled',
    border: 'border-input-disabled',
    text: 'text-input-disabled',
    prefix: 'text-input-disabled',
    suffix: 'text-input-icon-suffix',
  },
}

const GROUP_FIELD_BUTTON = { variant: 'light', icon: 'text-btn-default-light' } as const

/**
 * Prototype: Place-holder → Hover on mouse enter (Smart animate 100ms, ease
 * in), back on leave (ease out); click → Focus (100ms, ease out).
 */
const GROUP_FIELD_MOTION = {
  duration: 100,
  hoverIn: 'ease-figma-in',
  out: 'ease-figma-out',
} as const

type GroupPanelKind = 'currency' | 'flag' | 'leftText' | 'rightText'

/**
 * The side panels: a row with a 3px gap, hugging its content. The border
 * skips the side that touches the field (Left panels: no right border, the
 * Right panel: no left border), so the two never double up.
 */
const GROUP_PANEL_LAYOUT: Record<
  GroupInputSize,
  {
    height: number
    left: { paddingLeft: number; paddingRight: number }
    right: { paddingX: number }
    radius: number
  }
> = {
  sm: { height: 25, left: { paddingLeft: 8, paddingRight: 4 }, right: { paddingX: 8 }, radius: 7 },
  md: { height: 32, left: { paddingLeft: 8, paddingRight: 4 }, right: { paddingX: 8 }, radius: 8 },
  lg: {
    height: 40,
    left: { paddingLeft: 12, paddingRight: 6 },
    right: { paddingX: 8 },
    radius: 10,
  },
}

const GROUP_PANEL_GAP = 3

/** Panel text: Medium, text/input/sec-items. Currency is one step smaller. */
const GROUP_PANEL_TEXT: Record<
  'currency' | 'helper',
  Record<GroupInputSize, { style: string; utility: string }>
> = {
  currency: {
    sm: { style: 'Inter/Body/xS/Medium', utility: 'text-body-xs' },
    md: { style: 'Inter/Body/xS/Medium', utility: 'text-body-xs' },
    lg: { style: 'Inter/Body/S/Medium', utility: 'text-body-s' },
  },
  helper: {
    sm: { style: 'Inter/Body/S/Medium', utility: 'text-body-s' },
    md: { style: 'Inter/Body/S/Medium', utility: 'text-body-s' },
    lg: { style: 'Inter/Body/M/Medium', utility: 'text-body-m' },
  },
}

/** Every panel: same fill and border at rest; a faint grey on hover. */
const GROUP_PANEL_STATES = {
  rest: {
    bg: 'bg-input-placeholder',
    border: 'border-input-placeholder',
    text: 'text-input-sec-items',
  },
  hover: {
    bg: 'bg-input-hover-group-items',
    border: 'border-input-hover-group-items',
    text: 'text-input-sec-items',
  },
} as const

/** Currency and Flag: a 12px chevron-down (outline) in text/input/sec-items. The flag is 18×12, 2px corners. */
const GROUP_PANEL_CHEVRON = {
  icon: 'chevron-down-outline',
  size: 12,
  colour: 'text-input-sec-items',
} as const
const GROUP_PANEL_FLAG = { width: 18, height: 12, radius: 2 } as const

/** Prototype: Rest ↔ hover on mouse enter / leave, Smart animate 100ms, ease out both ways. */
const GROUP_PANEL_MOTION = { duration: 100, easing: 'ease-figma-out' } as const

/**
 * The labelled group: label-wrapper, the group row (no gap) and Helper-Text
 * (with Padding = yes) 6px apart. The four Figma compositions:
 * - Right:  Flag + field
 * - Center: Flag + field + Right text
 * - Left:   field (prefix icon on) + Right text, or + Flow Button
 *           (Primary, ⛔ Position - right = yes, both icons) with Button = yes
 */
const GROUP_INPUT_FIGMA = {
  gap: 6,
  label: 'label-wrapper',
  helper: { inset: true },
  flowButton: { variant: 'primary', position: 'right', size: { sm: 'xs', md: 'sm', lg: 'md' } },
} as const

/*
 * Figma oddities:
 * - Left/Text-helpers at 40px is 43px tall (a fixed height, every other panel
 *   matches its field). The code uses 40px so the panel lines up; flagged.
 * - The text panels (Left and Right Text-helpers) have a hover state although
 *   they aren't clickable. Kept.
 * - The panels hover with ease out on enter; the field uses ease in.
 * - "Left" position exists only without a suffix.
 * - The ✅ Button at 40px is the 32px Icon Button, as in the text input.
 *
 * Not in Figma, kept in code:
 * - Keyboard focus on the Currency and Flag buttons: a 1px blue ring, as on
 *   the selection controls.
 * - 16px text below the md breakpoint, so iOS Safari doesn't zoom on focus.
 */

export {
  GROUP_FIELD_BUTTON,
  GROUP_FIELD_CORNERS,
  GROUP_FIELD_GAP,
  GROUP_FIELD_LAYOUT,
  GROUP_FIELD_MOTION,
  GROUP_FIELD_STATES,
  GROUP_INPUT_FIGMA,
  GROUP_PANEL_CHEVRON,
  GROUP_PANEL_FLAG,
  GROUP_PANEL_GAP,
  GROUP_PANEL_LAYOUT,
  GROUP_PANEL_MOTION,
  GROUP_PANEL_STATES,
  GROUP_PANEL_TEXT,
}
export type { GroupFieldPosition, GroupFieldState, GroupInputSize, GroupPanelKind }
