// Avatar stack, copied from Figma (Open HR › avatar/avatar-stack, node
// 709:48349, 64 variants: 8 sizes × Tight no/yes × "with more" no/yes × 2 or 4
// avatars). Tests check avatar-stack.tsx against this.

import type { AvatarSize } from './avatar.figma'

type StackDensity = 'standard' | 'tight'

/**
 * Overlap between neighbours: the auto-layout's negative gap, in px. Every
 * avatar is a full-size circular Avatar; nothing is drawn between them (no
 * ring or cut-out).
 */
const AVATAR_STACK_OVERLAP: Record<StackDensity, Record<AvatarSize, number>> = {
  standard: { 12: 4, 14: 4, 16: 4, 18: 4, 20: 6, 24: 8, 32: 14, 44: 16 },
  tight: { 12: 6, 14: 6, 16: 8, 18: 8, 20: 10, 24: 12, 32: 16, 44: 24 },
}

/**
 * The "more" tile: a circular Icon Avatar, Blue, the stack's size, with its
 * default ellipsis glyph (the same glyph box as AVATAR_ICON).
 */
const AVATAR_STACK_MORE = { type: 'icon', colour: 'blue', circular: true } as const

/**
 * Stacking order. With the "more" tile, each later avatar sits on top of the
 * one before and the tile is on top of all. Without it, the order reverses:
 * the first avatar is on top.
 */
const AVATAR_STACK_ORDER = { withMore: 'later-on-top', withoutMore: 'first-on-top' } as const

/*
 * Figma oddities, kept:
 * - The stacking order flips depending on whether the "more" tile is shown.
 * - "4 avatar" with more shows 3 faces + the tile, but "2 avatar" with more
 *   shows 2 faces + the tile. The code counts faces (maxVisible), so either
 *   layout is one prop away.
 *
 * Not in Figma, kept in code:
 * - The tile appears only when there are more people than maxVisible, and
 *   names the hidden count for screen readers ("3 more").
 */

export { AVATAR_STACK_MORE, AVATAR_STACK_ORDER, AVATAR_STACK_OVERLAP }
export type { StackDensity }
