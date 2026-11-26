'use client'

import { forwardRef, type MouseEventHandler } from 'react'

import { MaskIcon } from '../icons/mask-icon'

/**
 * Figma's "🎨 color": `empty` (grey x) or `blue`. `accent` is what an Accent
 * chip uses: grey at rest, blue while the chip is hovered (a Figma oddity).
 */
type ChipRemoveColor = 'empty' | 'blue' | 'accent'
/** Figma's "state". Chips use `rest`; `transparent` hides the button; `hover` pins hover. */
type ChipRemoveState = 'transparent' | 'rest' | 'hover'

interface ChipRemoveButtonProps {
  color?: ChipRemoveColor
  state?: ChipRemoveState
  onClick?: MouseEventHandler<HTMLButtonElement>
  'aria-label': string
  className?: string
}

// All values from chip.figma.ts (Figma node 2351:69361).
const colourClasses: Record<ChipRemoveColor, { rest: string; hover: string; pinned: string }> = {
  empty: {
    rest: 'text-text-tertiary',
    hover: 'hover:bg-bg-transparent-light hover:text-text-secondary',
    pinned: 'bg-bg-transparent-light text-text-secondary',
  },
  blue: {
    rest: 'text-text-blue-accent',
    hover: 'hover:bg-bg-transparent-blue-accent-light',
    pinned: 'bg-bg-transparent-blue-accent-light text-text-blue-accent',
  },
  accent: {
    rest: 'text-text-tertiary group-hover/chip:text-text-blue-accent',
    hover: 'hover:bg-bg-transparent-blue-accent-light',
    pinned: 'bg-bg-transparent-blue-accent-light text-text-blue-accent',
  },
}

const ChipRemoveButton = forwardRef<HTMLButtonElement, ChipRemoveButtonProps>(
  function ChipRemoveButton(
    { color = 'empty', state = 'rest', onClick, className = '', ...props },
    ref,
  ) {
    const c = colourClasses[color]
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={[
          // Figma: 20×20, 3px padding, rounded on the right only (0/7/7/0).
          'inline-flex size-[20px] shrink-0 items-center justify-center p-[3px] rounded-r-sm-7',
          // Figma: hover fades in over 150ms (ease out).
          'transition-colors duration-150 ease-figma-out',
          // Not in Figma: keyboard focus ring, like the selection controls.
          'outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-bg-selection-controls-selected',
          state === 'hover' ? c.pinned : `${c.rest} ${c.hover}`,
          state === 'transparent' && 'opacity-0',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <MaskIcon src="/dashboard/icons/x-mark-solid.svg" size={14} />
      </button>
    )
  },
)

export { ChipRemoveButton }
export type { ChipRemoveButtonProps, ChipRemoveColor, ChipRemoveState }
