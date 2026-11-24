// Text Button, copied from Figma (Open HR › Button/Text button, node 2859:27385).
// Values are the token names Figma binds, as CSS variable suffixes. Bold and
// Wrapped don't change colours. Tests check text-button.tsx against this.

import type { TextButtonSize, TextButtonUnderline } from './text-button'

type TextButtonState = 'rest' | 'hover' | 'pressed' | 'focus' | 'disabled'

/** Label and icon colour per state. Rest depends on the underline mode. */
const TEXT_BUTTON_FIGMA = {
  rest: { never: 'text-secondary', hover: 'text-primary', always: 'text-primary' } satisfies Record<
    TextButtonUnderline,
    string
  >,
  hover: 'text-primary',
  pressed: 'text-blue-accent',
  focus: 'text-blue-accent', // Figma's whole focus style: no ring, no outline, no fill
  disabled: 'text-light',
  /**
   * Figma oddity kept: at 13 and 14px the left icon stays text/primary on press
   * and focus while the label and right icon turn blue. 10 and 12px turn blue.
   */
  leftIconPressedFocusMdLg: 'text-primary',
} as const

/** When the label is underlined, per underline mode (Figma "Underline": Never / On hover / Yes). */
const TEXT_BUTTON_UNDERLINE: Record<TextButtonUnderline, Record<TextButtonState, boolean>> = {
  never: { rest: false, hover: false, pressed: false, focus: false, disabled: false },
  hover: { rest: false, hover: true, pressed: true, focus: false, disabled: false },
  always: { rest: true, hover: true, pressed: true, focus: true, disabled: true },
}

/** Underline: solid, offset 10% of the font size, auto thickness, skip ink, text colour. */
const TEXT_BUTTON_UNDERLINE_STYLE = { offset: '10%', thickness: 'auto', skipInk: true } as const

const TEXT_BUTTON_LAYOUT: Record<
  TextButtonSize,
  {
    font: number
    lineHeight: number
    style: string
    leftIcon: number
    rightIcon: number
    avatar: boolean
  }
> = {
  xs: {
    font: 10,
    lineHeight: 16,
    style: 'Inter/Caption/S',
    leftIcon: 10,
    rightIcon: 10,
    avatar: false,
  },
  sm: {
    font: 12,
    lineHeight: 19.2,
    style: 'Inter/Body/xS',
    leftIcon: 10,
    rightIcon: 10,
    avatar: false,
  },
  md: {
    font: 13,
    lineHeight: 19.5,
    style: 'Inter/Body/S',
    leftIcon: 11,
    rightIcon: 10,
    avatar: true,
  },
  lg: {
    font: 14,
    lineHeight: 21,
    style: 'Inter/Body/L',
    leftIcon: 12,
    rightIcon: 12,
    avatar: true,
  },
}

/**
 * Shared layout: gap 2, text trimmed to cap height (so the button is as tall as
 * its icons: 10px at xs/sm, 12px at md/lg). Regular weight, Medium when bold.
 * Avatar: 12px in a 13×12 wrapper (1px right padding).
 * Wrapped: 6px padding all round; on hover a bg/Transparent/light fill with a
 * 4px radius. No fill on press, focus or disabled.
 */
const TEXT_BUTTON_SHARED = {
  gap: 2,
  avatar: { size: 12, wrapperWidth: 13 },
  wrapped: { padding: 6, hoverRadius: 4, hoverBg: 'bg-transparent-light' },
  weights: { regular: 400, bold: 500 },
} as const

/** Prototype: hover in 100ms ease in, out 100ms ease out, press 100ms ease in. */
const TEXT_BUTTON_MOTION = {
  hoverIn: { ms: 100, easing: 'ease-in' },
  hoverOut: { ms: 100, easing: 'ease-out' },
  press: { ms: 100, easing: 'ease-in' },
} as const

export {
  TEXT_BUTTON_FIGMA,
  TEXT_BUTTON_LAYOUT,
  TEXT_BUTTON_MOTION,
  TEXT_BUTTON_SHARED,
  TEXT_BUTTON_UNDERLINE,
  TEXT_BUTTON_UNDERLINE_STYLE,
}
export type { TextButtonState }
