// Avatar, copied from Figma (Open HR › avatar/avatar, node 674:46801, 362
// variants: Circular yes/no × 8 heights × Text (10 colours) + Icon (10
// colours) + Image (with/without border), plus Country at 12–20px). Values are
// the token names Figma binds, as CSS variable suffixes. Tests check
// avatar.tsx against this.

type AvatarSize = 12 | 14 | 16 | 18 | 20 | 24 | 32 | 44

type AvatarColour =
  | 'green'
  | 'purple'
  | 'aqua'
  | 'orange'
  | 'yellow'
  | 'blue'
  | 'fuchsia'
  | 'red'
  | 'grey'
  | 'teal'

const AVATAR_SIZES: AvatarSize[] = [12, 14, 16, 18, 20, 24, 32, 44]
const AVATAR_COLOURS: AvatarColour[] = [
  'green',
  'purple',
  'aqua',
  'orange',
  'yellow',
  'blue',
  'fuchsia',
  'red',
  'grey',
  'teal',
]

/**
 * Text and Icon avatars: fill bg/avatar/<colour>, letters or glyph in
 * text/avatar/<colour>, and a 0.5px inside stroke in border/avatar/text (black
 * 4%, white 1% in dark; the 4% is the variable's own alpha). Same for every
 * colour and size.
 */
const AVATAR_FIGMA = {
  bg: (c: AvatarColour) => `bg-avatar-${c}`,
  fg: (c: AvatarColour) => `text-avatar-${c}`,
  stroke: { token: 'border-avatar-text', width: 0.5, align: 'inside' },
  /** Image "with border": 0.5px inside, border/avatar/image (black 4%, white 8% in dark). */
  imageStroke: { token: 'border-avatar-image', width: 0.5, align: 'inside' },
  /** Country: the same stroke as Text. */
  countryStroke: { token: 'border-avatar-text', width: 0.5, align: 'inside' },
} as const

/** Square corner radius per size (Text, Icon and the outer frame of Image). Circular is fully round. */
const AVATAR_RADIUS: Record<AvatarSize, number> = {
  12: 3,
  14: 4,
  16: 4,
  18: 4,
  20: 4,
  24: 5,
  32: 7,
  44: 8,
}

/**
 * Square Image radius, which is the image's own corner (the frame doesn't
 * clip). Figma oddity: the 14px image is square-cornered with a border and 3px
 * without; every other size matches AVATAR_RADIUS.
 */
const AVATAR_IMAGE_RADIUS: Record<AvatarSize, { border: number; borderless: number }> = {
  12: { border: 3, borderless: 3 },
  14: { border: 0, borderless: 3 },
  16: { border: 4, borderless: 4 },
  18: { border: 4, borderless: 4 },
  20: { border: 4, borderless: 4 },
  24: { border: 5, borderless: 5 },
  32: { border: 7, borderless: 7 },
  44: { border: 8, borderless: 8 },
}

/** Initials: Inter Medium, trimmed to cap height, centred. */
const AVATAR_TEXT: Record<AvatarSize, { style: string; fontSize: number; utility: string }> = {
  12: { style: 'Inter/label/Medium', fontSize: 9, utility: 'text-label' },
  14: { style: 'Inter/Caption/S/Medium', fontSize: 10, utility: 'text-caption-s' },
  16: { style: 'Inter/Caption/M/Medium', fontSize: 11, utility: 'text-caption-m' },
  18: { style: 'Inter/Caption/M/Medium', fontSize: 11, utility: 'text-caption-m' },
  20: { style: 'Inter/Caption/M/Medium', fontSize: 11, utility: 'text-caption-m' },
  24: { style: 'Inter/Body/S/Medium', fontSize: 13, utility: 'text-body-s' },
  32: { style: 'Inter/Body/M/Medium', fontSize: 13.8, utility: 'text-body-m' },
  44: { style: 'Inter/Body/xL/Medium', fontSize: 15.9, utility: 'text-body-xl' },
}

/** Icon avatar: the glyph's box per size, centred. Default glyph: ellipsis-horizontal (solid). */
const AVATAR_ICON: Record<AvatarSize, number> = {
  12: 10,
  14: 10,
  16: 12,
  18: 13,
  20: 14,
  24: 17,
  32: 17,
  44: 20,
}

/**
 * Country (12–20px only): square is a 3:2 flag (width 1.5 × height), radius 2
 * at 12/14 and 3 at 16–20; circular crops the flag to a circle, centred.
 */
const AVATAR_COUNTRY: Partial<Record<AvatarSize, { width: number; radius: number }>> = {
  12: { width: 18, radius: 2 },
  14: { width: 21, radius: 2 },
  16: { width: 24, radius: 3 },
  18: { width: 27, radius: 3 },
  20: { width: 30, radius: 3 },
}

/**
 * Notification dot ("show 🔔 notifications"): red, placed at the avatar's
 * top-left corner, 1px outside (-1, -1). Small 4px at 12–16, Medium 5px at
 * 18–20, Large 8px at 24–32, xLarge 11px at 44.
 */
const AVATAR_NOTIFICATION: Record<AvatarSize, { size: 'sm' | 'md' | 'lg' | 'xl'; px: number }> = {
  12: { size: 'sm', px: 4 },
  14: { size: 'sm', px: 4 },
  16: { size: 'sm', px: 4 },
  18: { size: 'md', px: 5 },
  20: { size: 'md', px: 5 },
  24: { size: 'lg', px: 8 },
  32: { size: 'lg', px: 8 },
  44: { size: 'xl', px: 11 },
}

/*
 * Figma oddities, kept:
 * - The 14px square image has square corners with a border, 3px without.
 * - The notification dot sits top-left, not top-right.
 * - Country only exists at 12–20px.
 * - The 14px square Icon avatar's placeholder glyph is a plus; every other is
 *   an ellipsis. The glyph is a swap slot, so the code uses the ellipsis.
 * - Text avatars at 14–18px have 2–3px side padding; the box is fixed, so it
 *   only matters if the letters overflow. Not copied.
 *
 * Not in Figma, kept in code:
 * - Country at 24–44px (falls back to a square flag box).
 * - An image that fails to load shows the initials, or the icon if there are
 *   none.
 */

export {
  AVATAR_COLOURS,
  AVATAR_COUNTRY,
  AVATAR_FIGMA,
  AVATAR_ICON,
  AVATAR_IMAGE_RADIUS,
  AVATAR_NOTIFICATION,
  AVATAR_RADIUS,
  AVATAR_SIZES,
  AVATAR_TEXT,
}
export type { AvatarColour, AvatarSize }
