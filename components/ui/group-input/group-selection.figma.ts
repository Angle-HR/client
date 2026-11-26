// Group selection, copied from Figma (Open HR):
// - the field: .Subcomponents/Group-selection, node 1061:49770, 108 variants
//   (state × 🏗️ Height × with-selection × ⛔ Position)
// - the labelled group: Inputs/Select Group input 🔽, node 1066:50424,
//   6 variants (⛔ Position = Right, Center, Left × Height = Medium, Small)
// The side panels are the group input's (see group-input.figma.ts). Fill,
// border and text tokens are the selection field's (selection-field.figma.ts).
// Tests check group-selection-field.tsx against this.

import type { GroupFieldPosition, GroupInputSize } from './group-input.figma'
import type { SelectionState } from '../input-selection/selection-field.figma'

/**
 * The field: a row with a 4px gap and a 1px inside border, corners only on
 * the outer side (see GROUP_FIELD_CORNERS). Padding includes the border, so
 * CSS uses one less.
 */
const GROUP_SELECTION_LAYOUT: Record<
  GroupInputSize,
  {
    figmaSize: string
    height: number
    paddingX: number
    radius: number
    icon: number
    text: { style: string; utility: string }
  }
> = {
  // Figma calls it 24px; the frame is 25px tall, like every other 25px field.
  sm: {
    figmaSize: '24px',
    height: 25,
    paddingX: 8,
    radius: 7,
    icon: 12,
    text: { style: 'Inter/Body/S/Regular', utility: 'text-body-s' },
  },
  md: {
    figmaSize: '32px',
    height: 32,
    paddingX: 8,
    radius: 8,
    icon: 14,
    text: { style: 'Inter/Body/M/Regular', utility: 'text-body-m' },
  },
  // 7px, not the 10px of the text group input and the selection field.
  lg: {
    figmaSize: '40 px',
    height: 40,
    paddingX: 12,
    radius: 7,
    icon: 14,
    text: { style: 'Inter/Body/L/Regular', utility: 'text-body-l' },
  },
}

const GROUP_SELECTION_GAP = 4

/**
 * Per state: fill, border, text, prefix icon (with-selection = No only) and
 * the chevron-down suffix. The same tokens as the selection field.
 */
const GROUP_SELECTION_STATES: Record<
  SelectionState,
  { bg: string; border: string; text: string; prefix: string; chevron: string }
> = {
  placeholder: {
    bg: 'bg-input-placeholder',
    border: 'border-input-placeholder',
    text: 'text-input-placeholder',
    prefix: 'text-input-placeholder',
    chevron: 'text-input-icon-suffix',
  },
  hover: {
    bg: 'bg-input-hover',
    border: 'border-input-hover',
    text: 'text-input-hover',
    prefix: 'text-input-hover',
    chevron: 'text-input-icon-suffix',
  },
  focus: {
    bg: 'bg-input-focus',
    border: 'border-input-focus',
    text: 'text-input-focus',
    prefix: 'text-input-focus',
    chevron: 'text-input-icon-suffix',
  },
  filled: {
    bg: 'bg-input-filled',
    border: 'border-input-filled',
    text: 'text-input-filled',
    prefix: 'text-input-filled',
    chevron: 'text-input-icon-suffix',
  },
  disabled: {
    bg: 'bg-input-disabled',
    border: 'border-input-disabled',
    text: 'text-input-disabled',
    prefix: 'text-input-disabled',
    chevron: 'text-input-icon-suffix',
  },
  error: {
    bg: 'bg-input-error',
    border: 'border-input-error',
    text: 'text-input-error',
    prefix: 'text-input-error',
    chevron: 'text-input-icon-suffix-error',
  },
}

/**
 * with-selection = Yes: no prefix icon. Empty (Place holder), the text is
 * text/input with tags/place-holder (#999, #818181 dark), a step darker than
 * the plain placeholder. Every other state shows a row of Large tags (20px)
 * 2px apart: Aqua "Tag", Green "Tag", Green "+4".
 */
const GROUP_SELECTION_TAGS = {
  gap: 2,
  tagHeight: 20,
  colour: 'green',
  prefix: false,
  placeholder: 'text-input-with-tags-placeholder',
} as const

/**
 * Prototype: Place holder ↔ Hover on mouse enter / leave and click → Focus,
 * Smart animate 100ms, ease out every way (the selection field enters hover
 * with ease in).
 */
const GROUP_SELECTION_MOTION = { duration: 100, easing: 'ease-figma-out' } as const

/**
 * The labelled group: label-wrapper, the row and Helper-Text 6px apart. The
 * helper has "with Padding ?" = no, so it isn't inset (the text group
 * input's is). Compositions:
 * - Right:  Flag + field
 * - Center: Flag + field + Right text
 * - Left:   field + Right text
 * Heights: Medium (32px) and Small (25px).
 */
const GROUP_SELECTION_FIGMA = {
  gap: 6,
  helper: { inset: false },
  compositions: {
    right: ['left-flag', 'field'],
    center: ['left-flag', 'field', 'right-text'],
    left: ['field', 'right-text'],
  } satisfies Record<GroupFieldPosition, string[]>,
  sizes: ['md', 'sm'] satisfies GroupInputSize[],
} as const

/*
 * Figma oddities, kept:
 * - The 40px field has 7px corners; the 25px one is named "24px".
 * - Hover enters with ease out; the selection field uses ease in.
 * - The Small labelled variants use the 32px field instance resized to 25.
 * - The helper isn't inset, unlike the text group input's.
 *
 * Not in Figma, kept in code:
 * - The open list, search and removable tags: the selection field's.
 * - Keyboard focus shows the Focus state, as on the selection field.
 */

export {
  GROUP_SELECTION_FIGMA,
  GROUP_SELECTION_GAP,
  GROUP_SELECTION_LAYOUT,
  GROUP_SELECTION_MOTION,
  GROUP_SELECTION_STATES,
  GROUP_SELECTION_TAGS,
}
