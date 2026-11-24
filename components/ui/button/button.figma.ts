// The Button's state colours, copied from Figma (Open HR › Button, node 549:36986).
// Each value is the design-token name Figma binds for that layer, written as the
// CSS variable suffix (`bg-btn-blue-pri-hover` → `var(--bg-btn-blue-pri-hover)`).
// Figma sometimes binds a token from another accent or state; those are kept
// as-is, because Figma is the source of truth. Tests check button.tsx against
// this file, and the docs state grid is drawn from it.

import type { ButtonAccent, ButtonVariant } from './button'

type ButtonState = 'rest' | 'hover' | 'pressed' | 'focus' | 'disabled'

interface StateSpec {
  bg: string
  /** `transparent` where Figma's border is hidden (0% opacity). */
  border: string
  text: string
  /** A 1px ring outside the edge (Figma: drop shadow, spread 1). */
  ring?: string
  /** Whole-button opacity (Figma: layer opacity). */
  opacity?: number
}

type ButtonSpec = Record<`${ButtonAccent}-${ButtonVariant}`, Record<ButtonState, StateSpec>>

/** Shared by every size: Figma's 24px and 32px variants use identical colours. */
const BUTTON_FIGMA: ButtonSpec = {
  'default-primary': {
    rest: {
      bg: 'bg-btn-default-pri-rest',
      border: 'border-btn-default-pri-rest',
      text: 'text-btn-default-primary',
    },
    hover: {
      bg: 'bg-btn-default-pri-hover',
      border: 'border-btn-default-pri-hover',
      text: 'text-btn-default-primary',
    },
    pressed: {
      bg: 'bg-btn-default-pri-pressed',
      border: 'border-btn-default-pri-hover',
      text: 'text-btn-default-primary',
    },
    focus: {
      bg: 'bg-btn-default-pri-focus',
      border: 'border-btn-blue-pri-focus',
      text: 'text-btn-default-primary',
    },
    disabled: {
      bg: 'bg-btn-default-pri-disabled',
      border: 'border-btn-default-pri-disabled',
      text: 'text-btn-default-disabled',
    },
  },
  'default-secondary': {
    rest: {
      bg: 'bg-btn-default-sec-rest',
      border: 'border-btn-default-sec-rest',
      text: 'text-btn-default-secondary',
    },
    hover: {
      bg: 'bg-btn-default-sec-hover',
      border: 'border-btn-default-sec-hover',
      text: 'text-btn-default-secondary',
    },
    pressed: {
      bg: 'bg-btn-default-sec-pressed',
      border: 'border-btn-default-sec-pressed',
      text: 'text-btn-default-secondary',
    },
    focus: {
      bg: 'bg-btn-default-pri-focus',
      border: 'border-btn-blue-sec-focus',
      text: 'text-btn-default-secondary',
    },
    disabled: {
      bg: 'bg-btn-default-pri-disabled',
      border: 'border-btn-default-sec-disabled',
      text: 'text-btn-default-disabled',
    },
  },
  'default-tertiary': {
    rest: {
      bg: 'bg-btn-default-tet-rest',
      border: 'border-btn-default-tet-rest',
      text: 'text-btn-default-tertiary',
    },
    hover: {
      bg: 'bg-btn-default-tet-hover',
      border: 'border-btn-default-tet-hover',
      text: 'text-btn-default-tertiary',
    },
    pressed: {
      bg: 'bg-btn-default-tet-pressed',
      border: 'border-btn-default-tet-disabled',
      text: 'text-btn-default-tertiary',
    },
    focus: {
      bg: 'bg-btn-default-pri-focus',
      border: 'border-btn-blue-tet-focus',
      text: 'text-btn-default-tertiary',
    },
    disabled: {
      bg: 'bg-btn-default-tet-disabled',
      border: 'border-btn-default-tet-disabled',
      text: 'text-btn-default-disabled',
    },
  },
  'blue-primary': {
    rest: {
      bg: 'bg-btn-blue-pri-rest',
      border: 'border-btn-blue-pri-rest',
      text: 'text-btn-blue-primary',
    },
    hover: {
      bg: 'bg-btn-blue-pri-hover',
      border: 'border-btn-blue-pri-rest',
      text: 'text-btn-blue-primary',
    },
    pressed: {
      bg: 'bg-btn-blue-pri-pressed',
      border: 'border-btn-default-pri-hover',
      text: 'text-btn-blue-primary',
    },
    focus: {
      bg: 'bg-btn-blue-pri-focus',
      border: 'transparent',
      text: 'text-btn-blue-primary',
      ring: 'bg-btn-blue-pri-focus',
    },
    disabled: {
      bg: 'bg-btn-blue-pri-disabled',
      border: 'border-btn-blue-pri-disabled',
      text: 'text-btn-blue-primary',
      opacity: 0.24,
    },
  },
  'blue-secondary': {
    rest: {
      bg: 'bg-btn-blue-sec-rest',
      border: 'border-btn-blue-sec-rest',
      text: 'text-btn-blue-secondary',
    },
    hover: {
      bg: 'bg-btn-blue-sec-hover',
      border: 'border-btn-blue-sec-hover',
      text: 'text-btn-blue-secondary',
    },
    pressed: {
      bg: 'bg-btn-blue-sec-pressed',
      border: 'border-btn-blue-sec-pressed',
      text: 'text-btn-blue-secondary',
    },
    // Figma: hidden border plus a 1px inner shadow, which draws the same as a 1px border.
    focus: {
      bg: 'bg-btn-blue-sec-focus',
      border: 'border-btn-blue-sec-focus',
      text: 'text-btn-blue-secondary',
    },
    disabled: {
      bg: 'bg-btn-blue-sec-disabled',
      border: 'border-btn-blue-sec-disabled',
      text: 'text-btn-blue-secondary',
      opacity: 0.24,
    },
  },
  'blue-tertiary': {
    rest: {
      bg: 'bg-btn-blue-tet-rest',
      border: 'border-btn-blue-tet-rest',
      text: 'text-btn-blue-tertiary',
    },
    hover: {
      bg: 'bg-btn-blue-tet-hover',
      border: 'border-btn-blue-tet-hover',
      text: 'text-btn-blue-tertiary',
    },
    pressed: {
      bg: 'bg-btn-blue-tet-pressed',
      border: 'border-btn-blue-tet-selected',
      text: 'text-btn-blue-tertiary',
    },
    focus: {
      bg: 'bg-btn-blue-tet-focus',
      border: 'transparent',
      text: 'text-btn-blue-tertiary',
      ring: 'border-btn-blue-tet-focus',
    },
    disabled: {
      bg: 'bg-btn-blue-tet-disabled',
      border: 'border-btn-blue-tet-disabled',
      text: 'text-btn-blue-tertiary',
      opacity: 0.24,
    },
  },
  'red-primary': {
    rest: {
      bg: 'bg-btn-red-pri-rest',
      border: 'border-btn-red-pri-rest',
      text: 'text-btn-red-primary',
    },
    hover: {
      bg: 'bg-btn-red-pri-hover',
      border: 'border-btn-red-pri-hover',
      text: 'text-btn-red-primary',
    },
    pressed: {
      bg: 'bg-btn-red-pri-pressed',
      border: 'border-btn-blue-pri-pressed',
      text: 'text-btn-red-primary',
    },
    focus: {
      bg: 'bg-btn-red-pri-focus',
      border: 'transparent',
      text: 'text-btn-red-primary',
      ring: 'border-btn-red-pri-focus',
    },
    disabled: {
      bg: 'bg-btn-red-pri-disabled',
      border: 'border-btn-red-pri-disabled',
      text: 'text-btn-red-primary',
      opacity: 0.24,
    },
  },
  'red-secondary': {
    rest: {
      bg: 'bg-btn-red-sec-rest',
      border: 'border-btn-red-sec-rest',
      text: 'text-btn-red-secondary',
    },
    hover: {
      bg: 'bg-btn-red-sec-hover',
      border: 'border-btn-red-sec-hover',
      text: 'text-btn-red-secondary',
    },
    pressed: {
      bg: 'bg-btn-red-sec-pressed',
      border: 'border-btn-red-sec-pressed',
      text: 'text-btn-red-secondary',
    },
    focus: {
      bg: 'bg-btn-red-sec-focus',
      border: 'transparent',
      text: 'text-btn-red-secondary',
      ring: 'border-btn-red-sec-focus',
    },
    disabled: {
      bg: 'bg-btn-red-sec-disabled',
      border: 'border-btn-red-sec-disabled',
      text: 'text-btn-red-secondary',
      opacity: 0.24,
    },
  },
  'red-tertiary': {
    rest: {
      bg: 'bg-btn-red-tet-rest',
      border: 'border-btn-red-tet-rest',
      text: 'text-btn-red-tertiary',
    },
    hover: {
      bg: 'bg-btn-red-tet-hover',
      border: 'border-btn-red-tet-hover',
      text: 'text-btn-red-tertiary',
    },
    pressed: {
      bg: 'bg-btn-red-tet-pressed',
      border: 'border-btn-red-tet-selected',
      text: 'text-btn-red-tertiary',
    },
    // Figma: no border at all on this one, only the ring.
    focus: {
      bg: 'bg-btn-red-tet-focus',
      border: 'transparent',
      text: 'text-btn-red-tertiary',
      ring: 'border-btn-red-tet-focus',
    },
    disabled: {
      bg: 'bg-btn-red-tet-disabled',
      border: 'border-btn-red-tet-disabled',
      text: 'text-btn-red-tertiary',
      opacity: 0.24,
    },
  },
}

/** Layout shared by every Button, from Figma's auto-layout. */
const BUTTON_LAYOUT = {
  height: { sm: 24, md: 32 },
  /** Figma pads 8px from the outer edge; the 1px border sits inside that. */
  paddingX: 8,
  gap: 4,
  radius: 7,
  icon: 14,
  font: { family: 'Inter', weight: 500, size: 13, lineHeight: 19.5 },
  /** Prototype: hover dissolves in 100ms ease-in, out 100ms ease-out; press 50ms ease-out. */
  motion: { hoverIn: 100, hoverOut: 100, press: 50 },
} as const

export { BUTTON_FIGMA, BUTTON_LAYOUT }
export type { ButtonSpec, ButtonState, StateSpec }
