// Flow Button, copied from Figma (Open HR › Button/⦿ Flow Button, node 1985:48157).
// Values are the token names Figma binds, as CSS variable suffixes. `transparent`
// means Figma has no fill/stroke there (or a hidden one). Colours are the same
// at every height unless noted. Tests check flow-button.tsx against this.

import type { FlowButtonPosition, FlowButtonSize, FlowButtonVariant } from './flow-button'

type FlowButtonState = 'rest' | 'hover' | 'pressed' | 'focus' | 'disabled'

interface FlowStateSpec {
  bg: string
  border: string
  text: string
  /** Layer opacity. */
  opacity?: number
}

const FLOW_BUTTON_FIGMA: Record<FlowButtonVariant, Record<FlowButtonState, FlowStateSpec>> = {
  primary: {
    rest: {
      bg: 'bg-flow-btn-pri-rest',
      border: 'border-flow-btn-pri-rest',
      text: 'text-flow-btn-primary',
    },
    hover: {
      bg: 'bg-flow-btn-pri-hover',
      border: 'border-flow-btn-pri-hover',
      text: 'text-flow-btn-primary',
    },
    pressed: {
      bg: 'bg-flow-btn-pri-pressed',
      border: 'border-flow-btn-pri-pressed',
      text: 'text-flow-btn-primary',
    },
    // 40px. At 25 and 32px Figma uses bg/btn-blue/pri-focus and hides the stroke; see FLOW_PRIMARY_FOCUS_SMALL.
    focus: {
      bg: 'bg-flow-btn-pri-focus',
      border: 'border-flow-btn-pri-focus',
      text: 'text-flow-btn-primary',
    },
    // Figma binds the blue Button's disabled tokens here, with the layer at 24%.
    disabled: {
      bg: 'bg-btn-blue-pri-disabled',
      border: 'border-btn-blue-pri-disabled',
      text: 'text-flow-btn-primary',
      opacity: 0.24,
    },
  },
  secondary: {
    rest: {
      bg: 'bg-flow-btn-sec-rest',
      border: 'border-flow-btn-sec-rest',
      text: 'text-flow-btn-secondary',
    },
    hover: {
      bg: 'bg-flow-btn-sec-hover',
      border: 'border-flow-btn-sec-hover',
      text: 'text-flow-btn-secondary',
    },
    pressed: {
      bg: 'bg-flow-btn-sec-pressed',
      border: 'border-flow-btn-sec-pressed',
      text: 'text-flow-btn-secondary',
    },
    focus: {
      bg: 'bg-flow-btn-sec-focus',
      border: 'border-flow-btn-sec-focus',
      text: 'text-flow-btn-secondary',
    },
    disabled: {
      bg: 'bg-flow-btn-sec-disabled',
      border: 'border-flow-btn-sec-disabled',
      text: 'text-flow-btn-sec-disabled',
    },
  },
  tertiary: {
    rest: { bg: 'bg-flow-btn-tet-rest', border: 'transparent', text: 'text-flow-btn-tertiary' },
    hover: { bg: 'bg-flow-btn-tet-hover', border: 'transparent', text: 'text-flow-btn-tertiary' },
    pressed: {
      bg: 'bg-flow-btn-tet-pressed',
      border: 'transparent',
      text: 'text-flow-btn-tertiary',
    },
    // Figma oddity kept: tertiary borrows the secondary focus border.
    focus: {
      bg: 'bg-flow-btn-tet-focus',
      border: 'border-flow-btn-sec-focus',
      text: 'text-flow-btn-tertiary',
    },
    disabled: {
      bg: 'bg-flow-btn-tet-disabled',
      border: 'transparent',
      text: 'text-flow-btn-tet-disabled',
    },
  },
}

/** Primary focus at 25 and 32px: same blue, different token, no visible stroke. */
const FLOW_PRIMARY_FOCUS_SMALL: FlowStateSpec = {
  bg: 'bg-btn-blue-pri-focus',
  border: 'transparent',
  text: 'text-flow-btn-primary',
}

/**
 * Which states carry the flow-btn shadow (0 1px 1px black/13 + 0 0 1px black/9).
 * Attached buttons (position right) never have it.
 */
function flowShadowStates(
  variant: FlowButtonVariant,
  size: FlowButtonSize,
  position: FlowButtonPosition,
): FlowButtonState[] {
  if (position === 'right') return []
  if (variant === 'secondary') return ['rest', 'hover', 'pressed', 'focus']
  if (variant === 'tertiary') return ['rest', 'focus']
  return size === 'md' ? ['rest', 'hover', 'pressed', 'focus'] : []
}

const FLOW_BUTTON_LAYOUT: Record<
  FlowButtonSize,
  { height: number; paddingX: number; gap: number; radius: number; font: string }
> = {
  xs: { height: 25, paddingX: 8, gap: 4, radius: 7, font: 'Inter/Body/S/Medium 13/19.5' },
  sm: { height: 32, paddingX: 10, gap: 8, radius: 10, font: 'Inter/Body/L/Medium 14/21' },
  md: { height: 40, paddingX: 12, gap: 8, radius: 10, font: 'Inter/Body/L/Medium 14/21' },
}
/** Figma: the 32px primary (not attached) is 7px round, not 10. Attached buttons square their left corners. */
const FLOW_PRIMARY_SM_RADIUS = 7
const FLOW_ICONS = { prefix: 14, suffix: 15 } as const

/** Prototype: hover in 50ms (secondary and tertiary at 25/32px) or 100ms (primary, and everything at 40px), ease in; out 100ms ease out; press 50ms ease out. */
function flowHoverInMs(variant: FlowButtonVariant, size: FlowButtonSize) {
  return variant === 'primary' || size === 'md' ? 100 : 50
}

export {
  FLOW_BUTTON_FIGMA,
  FLOW_BUTTON_LAYOUT,
  FLOW_ICONS,
  FLOW_PRIMARY_FOCUS_SMALL,
  FLOW_PRIMARY_SM_RADIUS,
  flowHoverInMs,
  flowShadowStates,
}
export type { FlowButtonState, FlowStateSpec }
