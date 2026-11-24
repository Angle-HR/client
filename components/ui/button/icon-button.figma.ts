// Icon Button, copied from Figma (Open HR › Button/⦿ IconButton, node 551:37765).
// Values are the token names Figma binds, as CSS variable suffixes. `transparent`
// means Figma has no fill/border on that layer in that state. Figma's 16, 24 and
// 32px variants share the same colours. Tests check icon-button.tsx against this.

import type { IconButtonSize, IconButtonVariant } from './icon-button'

type IconButtonState = 'rest' | 'hover' | 'pressed' | 'focus' | 'disabled'

interface IconStateSpec {
  bg: string
  border: string
  icon: string
}

/** `focus` is missing where Figma has no focus variant (light, light-w-hover). */
type IconButtonSpec = Record<
  IconButtonVariant,
  Omit<Record<IconButtonState, IconStateSpec>, 'focus'> & { focus?: IconStateSpec }
>

// Every focus state in Figma: white (or near-black) fill and a blue border.
const focus = (icon: string): IconStateSpec => ({
  bg: 'bg-btn-default-pri-focus',
  border: 'border-btn-red-pri-focus', // Figma binds the red token; its value is blue #3e63dd
  icon,
})
const disabledIcon = 'text-btn-default-disabled'

const ICON_BUTTON_FIGMA: IconButtonSpec = {
  primary: {
    rest: {
      bg: 'bg-btn-default-pri-rest',
      border: 'border-btn-default-pri-rest',
      icon: 'text-secondary',
    },
    hover: {
      bg: 'bg-btn-default-pri-hover',
      border: 'border-btn-default-pri-hover',
      icon: 'text-secondary',
    },
    pressed: {
      bg: 'bg-btn-default-pri-pressed',
      border: 'border-btn-default-pri-hover',
      icon: 'text-secondary',
    },
    focus: focus('text-secondary'),
    disabled: {
      bg: 'bg-btn-default-pri-disabled',
      border: 'border-btn-default-pri-disabled',
      icon: disabledIcon,
    },
  },
  secondary: {
    rest: {
      bg: 'bg-btn-default-sec-rest',
      border: 'border-btn-default-sec-rest',
      icon: 'text-secondary',
    },
    hover: {
      bg: 'bg-btn-default-sec-hover',
      border: 'border-btn-default-sec-hover',
      icon: 'text-secondary',
    },
    pressed: {
      bg: 'bg-btn-default-sec-pressed',
      border: 'border-btn-default-sec-pressed',
      icon: 'text-secondary',
    },
    focus: focus('text-secondary'),
    disabled: {
      bg: 'bg-btn-default-pri-disabled',
      border: 'border-btn-default-pri-disabled',
      icon: disabledIcon,
    },
  },
  tertiary: {
    rest: {
      bg: 'bg-btn-default-tet-rest',
      border: 'border-btn-default-tet-rest',
      icon: 'text-secondary',
    },
    hover: {
      bg: 'bg-btn-default-tet-hover',
      border: 'border-btn-default-tet-hover',
      icon: 'text-secondary',
    },
    pressed: {
      bg: 'bg-btn-default-tet-pressed',
      border: 'border-btn-default-tet-disabled',
      icon: 'text-secondary',
    },
    focus: focus('text-secondary'),
    disabled: { bg: 'bg-btn-default-sec-disabled', border: 'transparent', icon: disabledIcon },
  },
  light: {
    rest: {
      bg: 'bg-btn-default-tet-rest',
      border: 'border-btn-default-tet-rest',
      icon: 'text-tertiary',
    },
    hover: { bg: 'transparent', border: 'transparent', icon: 'text-tertiary' },
    pressed: { bg: 'transparent', border: 'transparent', icon: 'text-tertiary' },
    disabled: { bg: 'bg-btn-default-tet-disabled', border: 'transparent', icon: disabledIcon },
  },
  'light-w-hover': {
    rest: {
      bg: 'bg-btn-default-tet-rest',
      border: 'border-btn-default-tet-rest',
      icon: 'text-tertiary',
    },
    hover: { bg: 'bg-transparent-light', border: 'transparent', icon: 'text-tertiary' },
    pressed: { bg: 'bg-transparent-light', border: 'transparent', icon: 'text-tertiary' },
    disabled: { bg: 'bg-btn-default-tet-disabled', border: 'transparent', icon: disabledIcon },
  },
  error: {
    rest: {
      bg: 'bg-btn-default-tet-rest',
      border: 'border-btn-default-tet-rest',
      icon: 'text-error',
    },
    hover: { bg: 'bg-btn-red-tet-hover', border: 'transparent', icon: 'text-error' },
    pressed: { bg: 'bg-btn-red-tet-pressed', border: 'transparent', icon: 'text-error' },
    focus: focus('text-error'),
    disabled: {
      bg: 'bg-btn-default-sec-disabled',
      border: 'border-btn-default-sec-disabled',
      icon: disabledIcon,
    },
  },
}

const ICON_BUTTON_LAYOUT: Record<
  IconButtonSize,
  { box: number; padding: number; radius: number; icon: number; glyph: number }
> = {
  xs: { box: 16, padding: 5, radius: 4, icon: 10, glyph: 8 },
  sm: { box: 24, padding: 5, radius: 7, icon: 14, glyph: 11.2 },
  md: { box: 32, padding: 0, radius: 7, icon: 14, glyph: 11.2 },
}

/** Figma oddity kept as-is: light-w-hover at 24px uses a 6px radius on hover and press. */
const LIGHT_W_HOVER_SM_RADIUS = 6

/** Counter badge (Button/IconButton/Counter): 12px pill, 3px sides, Inter Semi Bold 9px, white on blue. */
const ICON_BUTTON_COUNTER = {
  height: 12,
  paddingX: 3,
  radius: 24,
  bg: 'bg-btn-blue-pri-focus',
  text: 'text-inverted', // Figma: text/inverted-white, same value (#fff both modes)
  font: { size: 9, weight: 600 },
  /** Top-left corner of the badge, from the button's outer edge. */
  offset: { x: -5.67, y: -5.71 },
} as const

export { ICON_BUTTON_COUNTER, ICON_BUTTON_FIGMA, ICON_BUTTON_LAYOUT, LIGHT_W_HOVER_SM_RADIUS }
export type { IconButtonSpec, IconButtonState, IconStateSpec }
