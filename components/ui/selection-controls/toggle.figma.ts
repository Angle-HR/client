// Toggle, copied from Figma (Open HR › Selection Controls/Toggle, node
// 1270:41378, 12 variants). Values are the token names Figma binds, as CSS
// variable suffixes. Tests check toggle.tsx against this.

import type { ToggleSize } from './toggle'

type ToggleState = 'rest' | 'hoverFocus' | 'disabled'

interface ToggleStateSpec {
  track: string
  /** Inside stroke, if any. */
  stroke?: { token: string; width: number }
  thumb: string
  opacity?: number
}

/**
 * Figma's Hover state is a hairline stroke on the track (it was called
 * "Hover/ Focus" until 2026-11-24). State=Focus is that stroke plus a 1px blue
 * ring 2px outside the track (see focus.ts). `hoverFocus` below is both.
 */
const TOGGLE_FIGMA: Record<'off' | 'on', Record<ToggleState, ToggleStateSpec>> = {
  off: {
    rest: { track: 'bg-transparent-strong', thumb: 'bg-primary' },
    // 16px uses border/Transparent/light; 20px uses lighter (see TOGGLE_OFF_HOVER_STROKE).
    hoverFocus: {
      track: 'bg-transparent-strong',
      stroke: { token: 'border-transparent-light', width: 0.5 },
      thumb: 'bg-primary',
    },
    disabled: {
      track: 'bg-transparent-light',
      stroke: { token: 'border-transparent-lighter', width: 1 },
      thumb: 'bg-transparent-medium',
    },
  },
  on: {
    rest: { track: 'bg-selection-controls-selected', thumb: 'bg-primary' },
    hoverFocus: {
      track: 'bg-selection-controls-selected',
      stroke: { token: 'border-transparent-medium', width: 0.5 },
      thumb: 'bg-primary',
    },
    disabled: { track: 'bg-selection-controls-selected', thumb: 'bg-primary', opacity: 0.4 },
  },
}

/** Figma oddity kept: the off hover/focus stroke is a different token per size. */
const TOGGLE_OFF_HOVER_STROKE: Record<ToggleSize, string> = {
  sm: 'border-transparent-light',
  md: 'border-transparent-lighter',
}

/**
 * Figma's "size" names: 16px is `sm`, 20px is `md`. The 16px toggle is really
 * 22×14 (a Figma naming slip). Padding 2 all round, fully round, thumb slides
 * to the far end when on. No shadow on the thumb.
 */
const TOGGLE_LAYOUT: Record<
  ToggleSize,
  { width: number; height: number; thumb: number; travel: number }
> = {
  sm: { width: 22, height: 14, thumb: 10, travel: 8 },
  md: { width: 32, height: 20, thumb: 16, travel: 12 },
}

/** Prototype: toggling on and off is 50ms ease out. Hover has no transition (instant). */
const TOGGLE_MOTION = { toggle: { ms: 50, easing: 'ease-out' } } as const

export { TOGGLE_FIGMA, TOGGLE_LAYOUT, TOGGLE_MOTION, TOGGLE_OFF_HOVER_STROKE }
export type { ToggleState, ToggleStateSpec }
