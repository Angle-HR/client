'use client'

import { forwardRef, type MouseEventHandler } from 'react'

type ChipRemoveColor = 'empty' | 'blue'
type ChipRemoveState = 'transparent' | 'rest' | 'hover'

interface ChipRemoveButtonProps {
  color?: ChipRemoveColor
  state?: ChipRemoveState
  onClick?: MouseEventHandler<HTMLButtonElement>
  'aria-label': string
  className?: string
}

const ChipRemoveButton = forwardRef<HTMLButtonElement, ChipRemoveButtonProps>(
  function ChipRemoveButton(
    { color = 'empty', state = 'transparent', onClick, className = '', ...props },
    ref,
  ) {
    const iconColor = color === 'blue' ? 'text-text-blue-accent' : 'text-text-secondary'
    const iconOpacity = state === 'transparent' ? 'opacity-0' : 'opacity-100'
    const hoverBg =
      color === 'blue'
        ? 'hover:bg-bg-transparent-blue-accent-light'
        : 'hover:bg-bg-transparent-light'

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={`inline-flex h-[20px] w-[20px] items-center justify-center shrink-0 p-[3px] rounded-sm-7 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected ${hoverBg} ${className}`}
        {...props}
      >
        <svg
          className={`h-[14px] w-[14px] ${iconColor} ${iconOpacity} transition-opacity`}
          viewBox="0 0 14 14"
          fill="none"
        >
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

export { ChipRemoveButton }
export type { ChipRemoveButtonProps, ChipRemoveColor, ChipRemoveState }
