// Text area, copied from Figma (Open HR):
// - the field: .Subcomponents/Input/Text-area, node 946:25327, 7 variants
//   (State = Place holder, Hover, Focus, Selected, Filled, Error, Disabled)
// - the labelled field: Inputs/Text Area 📝, node 1053:47776, 7 variants
// - toolbar items: .Subcomponents/Text-Editor-Toolbar-items, node 945:25028
//   (state = rest, Hover/Selected)
// - scrollbar: 🖱️ List Item/.Subcomponents/scrollbar, node 3478:17263
//   (see components/ui/list/scrollbar.figma.ts)
// Values are the token names Figma binds, as CSS variable suffixes. Tests
// check textarea-field.tsx and textarea.tsx against this.

type TextareaState =
  | 'placeholder'
  | 'hover'
  | 'focus'
  | 'selected'
  | 'filled'
  | 'error'
  | 'disabled'

/**
 * The field: a column with 12px padding and a 12px gap, 8px corners and a 1px
 * inside border. It hugs its text between 80px and 500px tall.
 */
const TEXTAREA_LAYOUT = {
  padding: 12,
  gap: 12,
  radius: 8,
  border: 1,
  minHeight: 80,
  maxHeight: 500,
  /**
   * The "Text box" frame round the text: 4px above, 12px below. The text is
   * Inter/Body/S/Regular (13/19.5) trimmed to its cap height, so one line is
   * 9px tall and each extra line adds 19.5px.
   */
  textBox: { paddingTop: 4, paddingBottom: 12 },
  text: { style: 'Inter/Body/S/Regular', fontSize: 13, lineHeight: 19.5, utility: 'text-body-s' },
} as const

/** Five 20px buttons edge to edge (no gap): 4px padding round a 12px icon. */
const TEXTAREA_TOOLBAR = {
  item: { size: 20, padding: 4, icon: 12, radius: 0 },
  gap: 0,
  items: [
    { format: 'bold', label: 'Bold', icon: 'bold-solid' },
    { format: 'italic', label: 'Italic', icon: 'italic-solid' },
    { format: 'underline', label: 'Underline', icon: 'underline-solid' },
    { format: 'bulletList', label: 'Bulleted list', icon: 'list-bullet-solid' },
    { format: 'numberedList', label: 'Numbered list', icon: 'numbered-list-solid' },
  ],
  /** No fill in either state; only the icon changes. No prototype motion. */
  rest: { icon: 'text-input-icon-rest' },
  hoverSelected: { icon: 'text-input-icon-hover' },
} as const

/**
 * Figma's ✨ show-sec_actions: one Button (24px, Tertiary, Blue) pinned to the
 * top right, 10px in, swappable through 🔄 Swap-buttons. Hidden by default.
 */
const TEXTAREA_ACTION = {
  top: 10,
  right: 10,
  button: { size: 'sm', variant: 'tertiary', accent: 'blue' },
} as const

/** Per state: the field's fill and border, the text colour, and the Text box fill. */
const TEXTAREA_STATES: Record<
  TextareaState,
  { bg: string; border: string; text: string; textBox?: string }
> = {
  placeholder: {
    bg: 'bg-input-placeholder',
    border: 'border-input-placeholder',
    text: 'text-input-placeholder',
  },
  hover: { bg: 'bg-input-hover', border: 'border-input-hover', text: 'text-input-hover' },
  focus: { bg: 'bg-input-focus', border: 'border-input-focus', text: 'text-input-focus' },
  // Selected text: Focus plus a 22% blue fill (17% in dark) on the Text box.
  selected: {
    bg: 'bg-input-focus',
    border: 'border-input-focus',
    text: 'text-input-focus',
    textBox: 'bg-input-highlighted',
  },
  filled: { bg: 'bg-input-filled', border: 'border-input-filled', text: 'text-input-filled' },
  error: { bg: 'bg-input-error', border: 'border-input-error', text: 'text-input-error' },
  // The token is 20% black / white; no extra opacity on the field.
  disabled: {
    bg: 'bg-input-disabled',
    border: 'border-input-disabled',
    text: 'text-input-disabled',
  },
}

/**
 * Prototype: Place holder → Hover on mouse enter (Dissolve 100ms, ease in),
 * back on leave (ease out); click → Focus (100ms, ease out). Filled has no
 * hover.
 */
const TEXTAREA_MOTION = { duration: 100, hoverIn: 'ease-figma-in', out: 'ease-figma-out' } as const

/**
 * The labelled Text Area: label, field and helper 6px apart. The label is the
 * shared label-wrapper (Prod = No). The helper is Helper-Text with
 * "with Padding ?" = no, so it isn't inset like the text input's. The field
 * has its toolbar switched off.
 */
const TEXT_AREA_FIGMA = {
  gap: 6,
  label: 'label-wrapper',
  helper: { inset: false, neutral: 'text-light', error: 'text-error' },
  toolbar: false,
} as const

/*
 * Figma oddities, kept:
 * - The labelled Text Area turns the toolbar off; the field alone has it on.
 * - The toolbar in the Place holder variant shows Underline in its
 *   Hover/Selected look (blue) in every state, including Disabled. The code
 *   shows it at rest until it's pressed.
 * - Disabled keeps the toolbar icons at rest colour.
 * - The prototype goes Focus → Filled on click and Filled → Focus on mouse
 *   leave; the code follows real focus instead: focused while typing, filled
 *   after.
 * - The scrollbar (Show Scroll bar) is off in every variant; it's only on
 *   Focus, Selected and Filled, over the field's whole right edge.
 *
 * Not in Figma, kept in code:
 * - The toolbar really formats: with it on, the field is a rich-text editor
 *   (contenteditable) and its value is HTML; pasted text comes in plain. Each
 *   button shows as selected while the cursor sits in that format.
 * - A drag handle in the bottom-right corner makes the field taller (never
 *   under 80px, and past the 500px cap); a double-click puts it back.
 * - Keyboard focus on a toolbar button: the selection controls' 1px blue ring.
 * - The scrollbar shows whenever the text overflows (500px).
 * - Without the toolbar, the action button gets a row of its own above the
 *   text (Figma lays it over the text, which hides the first line's end).
 * - 16px text below the md breakpoint, so iOS Safari doesn't zoom on focus.
 */

export {
  TEXT_AREA_FIGMA,
  TEXTAREA_ACTION,
  TEXTAREA_LAYOUT,
  TEXTAREA_MOTION,
  TEXTAREA_STATES,
  TEXTAREA_TOOLBAR,
}
export type { TextareaState }
