// Label Button, copied from Figma (Open HR › Button/ Label Button, node 4266:17775).
// Values are the token names Figma binds, as CSS variable suffixes. Tests check
// label-button.tsx against this.

type LabelButtonState = 'rest' | 'hover' | 'selected' | 'focus' | 'disabled'

interface LabelStateSpec {
  bg: string
  border: string
  /** Label and icon colour. */
  text: string
}

const LABEL_BUTTON_FIGMA: Record<LabelButtonState, LabelStateSpec> = {
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
  selected: {
    bg: 'bg-transparent-blue-accent-light',
    border: 'border-btn-default-pri-focus',
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
}

/** 24px tall, 8px sides (from the outer edge; 1px inside stroke), gap 4, radius 7, Inter Medium 13/19.5, 14px icons. */
const LABEL_BUTTON_LAYOUT = {
  height: 24,
  paddingX: 8,
  gap: 4,
  radius: 7,
  icon: 14,
  font: 'Inter/Body/S/Medium',
} as const

/** Prototype: hover in 100ms ease in, out 100ms ease out; click selects over 50ms ease out; clicking again deselects instantly. */
const LABEL_BUTTON_MOTION = {
  hoverIn: { ms: 100, easing: 'ease-in' },
  hoverOut: { ms: 100, easing: 'ease-out' },
  select: { ms: 50, easing: 'ease-out' },
  deselect: { ms: 0 },
} as const

export { LABEL_BUTTON_FIGMA, LABEL_BUTTON_LAYOUT, LABEL_BUTTON_MOTION }
export type { LabelButtonState, LabelStateSpec }
