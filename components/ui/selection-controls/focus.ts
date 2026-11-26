// Keyboard focus for selection controls: Figma's State=Focus on the Checkbox,
// Radio Button and Toggle. Figma had no focus state for the Checkbox or Radio
// (and only a faint stroke on the Toggle), so it was designed in code first and
// added to Figma on 2026-11-24 to match.
//
// It follows the buttons' focus look: a 1px ring in the blue the buttons use
// for focus (bg/selection-controls/selected is the same blue-8), plus the
// control's own hover fill (Checkbox, Radio) or hover stroke (Toggle). Shown on
// keyboard focus only (:focus-visible).
//
// The input is visually hidden inside the <label>, so the ring is drawn on
// the hover area (or the box) when the label contains a focused input.

/** Ring colour token (Tailwind colour name). */
const SELECTION_FOCUS_TOKEN = 'bg-selection-controls-selected'

/** Checkbox with a hover area: ring on the area's edge. */
const CHECKBOX_FOCUS_RING_AREA =
  'group-has-[:focus-visible]/checkbox:outline-1 group-has-[:focus-visible]/checkbox:outline-bg-selection-controls-selected'

/** Checkbox without a hover area: ring 2px outside the box. */
const CHECKBOX_FOCUS_RING_BOX =
  'group-has-[:focus-visible]/checkbox:outline-1 group-has-[:focus-visible]/checkbox:outline-offset-2 group-has-[:focus-visible]/checkbox:outline-bg-selection-controls-selected'

/** Radio: ring on the round area's edge. */
const RADIO_FOCUS_RING =
  'group-has-[:focus-visible]/radio:outline-1 group-has-[:focus-visible]/radio:outline-bg-selection-controls-selected'

/** Toggle: ring 2px outside the track (so it shows against the blue "on" track). */
const TOGGLE_FOCUS_RING =
  'outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected'

export {
  TOGGLE_FOCUS_RING,
  CHECKBOX_FOCUS_RING_AREA,
  CHECKBOX_FOCUS_RING_BOX,
  RADIO_FOCUS_RING,
  SELECTION_FOCUS_TOKEN,
}
