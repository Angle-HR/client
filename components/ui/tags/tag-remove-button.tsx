'use client'

import { forwardRef, type MouseEventHandler } from 'react'

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

interface TagRemoveButtonProps {
  color?: TagColor
  onClick?: MouseEventHandler<HTMLButtonElement>
  'aria-label': string
  className?: string
}

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
        className={`inline-flex h-[20px] w-[20px] items-center justify-center shrink-0 rounded-sm-7 transition-colors hover:bg-bg-tags-remove-btn focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected ${iconColorMap[color]} ${className}`}
        {...props}
      >
        <svg className="h-[14px] w-[14px]" viewBox="0 0 14 14" fill="none">
          <path
            d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      </button>
    )
  },
)

export { TagRemoveButton }
export type { TagRemoveButtonProps, TagColor }
