'use client'

import { forwardRef, type MouseEventHandler } from 'react'

import { MaskIcon } from '../icons/mask-icon'

import type { TagColor } from './tag.figma'

interface TagRemoveButtonProps {
  color?: TagColor
  onClick?: MouseEventHandler<HTMLButtonElement>
  'aria-label': string
  className?: string
}

// All values from tag.figma.ts (Figma node 910:21136). The icon takes the
// tag's text colour.
const iconColorMap: Record<TagColor, string> = {
  empty: 'text-text-tags-empty',
  red: 'text-text-tags-red',
  green: 'text-text-tags-green',
  teal: 'text-text-tags-teal',
  aqua: 'text-text-tags-aqua',
  blue: 'text-text-tags-blue',
  purple: 'text-text-tags-purple',
  grey: 'text-text-tags-grey',
  yellow: 'text-text-tags-yellow',
  fuchsia: 'text-text-tags-fuchsia',
  orange: 'text-text-tags-orange',
}

const TagRemoveButton = forwardRef<HTMLButtonElement, TagRemoveButtonProps>(
  function TagRemoveButton({ color = 'empty', onClick, className = '', ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={[
          // Figma: 20×20, rounded on the right only (0/7/7/0).
          'inline-flex size-[20px] shrink-0 items-center justify-center rounded-r-sm-7',
          // Figma: hover fades in over 150ms (ease out).
          'transition-colors duration-150 ease-figma-out hover:bg-bg-tags-remove-btn',
          // Not in Figma: keyboard focus ring, like the selection controls.
          'outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-bg-selection-controls-selected',
          iconColorMap[color],
          className,
        ].join(' ')}
        {...props}
      >
        <MaskIcon src="/dashboard/icons/x-mark-outline.svg" size={14} />
      </button>
    )
  },
)

export { TagRemoveButton }
export type { TagRemoveButtonProps, TagColor }
