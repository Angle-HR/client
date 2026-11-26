// Tag, copied from Figma (Open HR › 🏷️ Tags, node 912:21312, 110 variants;
// remove button: 🏷️ Tags/.Subcomponents/Remove-button, node 910:21136, 22
// variants). Values are the token names Figma binds, as CSS variable
// suffixes. Tests check tag.tsx and tag-remove-button.tsx against this.

type TagColor =
  | 'empty'
  | 'red'
  | 'green'
  | 'teal'
  | 'aqua'
  | 'blue'
  | 'purple'
  | 'grey'
  | 'yellow'
  | 'fuchsia'
  | 'orange'

/** Figma's "Size": Large, Small, xSmall. */
type TagSize = 'lg' | 'sm' | 'xs'

const TAG_COLORS: TagColor[] = [
  'empty',
  'red',
  'green',
  'teal',
  'aqua',
  'blue',
  'purple',
  'grey',
  'yellow',
  'fuchsia',
  'orange',
]

/**
 * Every colour binds bg/tags/<colour> and text/tags/<colour>; the remove icon
 * uses the text colour. Only Empty has a stroke: 1px border/tags/empty,
 * dashed (2px dash, 2px gap), centred on the edge (half inside, half outside).
 */
const TAG_FIGMA = {
  bg: (c: TagColor) => `bg-tags-${c}`,
  text: (c: TagColor) => `text-tags-${c}`,
  emptyBorder: { token: 'border-tags-empty', width: 1, align: 'center', dash: [2, 2] },
  remove: {
    rest: { bg: 'transparent' },
    /** black 2% (white 3% in dark), the variable's own alpha. */
    hover: { bg: 'bg-tags-remove-btn' },
  },
} as const

const TAG_LAYOUT: Record<
  TagSize,
  {
    height: number
    /** Fixed height (Large, Small) or hugging the text (xSmall). */
    fixedHeight: boolean
    paddingX: number
    paddingY: number
    radius: number
    font: string
    fontSize: number
    removable: boolean
  }
> = {
  lg: {
    height: 20,
    fixedHeight: true,
    paddingX: 8,
    paddingY: 5.5,
    radius: 7,
    font: 'Inter/Body/S',
    fontSize: 13,
    removable: true,
  },
  sm: {
    height: 20,
    fixedHeight: true,
    paddingX: 6,
    paddingY: 5.5,
    radius: 7,
    font: 'Inter/Body/xS',
    fontSize: 12,
    removable: true,
  },
  xs: {
    height: 14,
    fixedHeight: false,
    paddingX: 4,
    paddingY: 3,
    radius: 4,
    font: 'Inter/Caption/M',
    fontSize: 11,
    removable: false,
  },
}

/**
 * Removable (Large and Small only): the label keeps its left padding and has
 * none on the right, then a 2px gap, then a 20×20 remove button rounded on the
 * right (0/7/7/0) with a 14px x-mark icon (outline, 7.93px glyph).
 */
const TAG_REMOVE_LAYOUT = { gap: 2, button: 20, radius: [0, 7, 7, 0], icon: 14 } as const

/** Prototype: the remove button's hover fades in over 150ms, ease out. */
const TAG_MOTION = { removeHover: { ms: 150, easing: 'ease-out' } } as const

/*
 * Not in Figma:
 * - Figma has no focus state for the remove button. The code keeps one for
 *   keyboard users: a 1px blue ring, like the selection controls.
 *
 * Figma oddities, kept:
 * - bg/tags/empty aliases bg/non, which is white (#171717 in dark), so the
 *   empty tag is filled, not see-through.
 * - The Small size is 20px tall like Large, only its padding and text are
 *   smaller.
 * - xSmall has no removable variant, so `removable` is ignored at `xs`.
 */

export { TAG_COLORS, TAG_FIGMA, TAG_LAYOUT, TAG_MOTION, TAG_REMOVE_LAYOUT }
export type { TagColor, TagSize }
