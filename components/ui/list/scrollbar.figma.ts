// Scrollbar, copied from Figma (Open HR):
// - 🖱️ List Item/.Subcomponents/scrollbar, node 3478:17263, 2 variants
//   (State = rest, Hover/Click).
// - Placed absolute over the scrolling area: right edge, full height
//   (constraints Right + Top & Bottom), as in the Text-area and Floating
//   Input.
// Values are the token names Figma binds, as CSS variable suffixes. Tests
// check scrollbar.tsx against this.

type ScrollbarState = 'rest' | 'hover'

/** The track: 12px wide, the thumb 6px from its top and bottom and 4px from its right. */
const SCROLLBAR_LAYOUT = {
  trackWidth: 12,
  paddingY: 6,
  paddingRight: 4,
  radius: 99,
} as const

/**
 * Rest: no track fill, a 2px thumb in text/input/hover (#b3b3b3; #4c4c4c dark).
 * Hover/Click: a 4% track fill (6% white in dark), the thumb 4px in
 * text/light (#b3b3b3; #666 dark). The thumb keeps its right edge and grows
 * to the left.
 */
const SCROLLBAR_STATES: Record<
  ScrollbarState,
  { track?: string; thumb: string; thumbWidth: number }
> = {
  rest: { thumb: 'text-input-hover', thumbWidth: 2 },
  hover: { track: 'bg-transparent-light', thumb: 'text-light', thumbWidth: 4 },
}

/** Prototype: rest → Hover/Click on mouse enter, Smart animate 100ms ease in; back on leave, 50ms ease in. */
const SCROLLBAR_MOTION = { enter: 100, leave: 50, easing: 'ease-figma-in' } as const

/*
 * Figma oddities, kept:
 * - Leaving uses ease in too, and is twice as fast as entering.
 * - Hover and Click are one state: dragging the thumb keeps the hover look.
 *
 * Not in Figma, kept in code:
 * - The thumb's length and position follow the content (Figma shows one
 *   example length); it's never shorter than 24px so it stays easy to grab.
 * - The bar only shows when the content overflows.
 * - Clicking the track jumps to that point; the wheel, keyboard and touch
 *   scroll natively (the browser's own bar is hidden, not replaced).
 */

export { SCROLLBAR_LAYOUT, SCROLLBAR_MOTION, SCROLLBAR_STATES }
export type { ScrollbarState }
