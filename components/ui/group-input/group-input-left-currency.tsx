'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'

type GroupInputLeftCurrencySize = 'sm' | 'md' | 'lg'

interface GroupInputLeftCurrencyProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  value: string
  height?: GroupInputLeftCurrencySize
  'aria-expanded'?: boolean
  'aria-haspopup'?: 'listbox' | 'true' | 'dialog' | 'menu' | 'grid' | 'tree'
  className?: string
}

const sizeConfig: Record<GroupInputLeftCurrencySize, { panel: string; padding: string }> = {
  sm: { panel: 'h-[25px]', padding: 'pl-[8px] pr-[4px]' },
  md: { panel: 'h-[32px]', padding: 'pl-[8px] pr-[4px]' },
  lg: { panel: 'h-[40px]', padding: 'pl-[12px] pr-[6px]' },
}

const GroupInputLeftCurrency = forwardRef<HTMLButtonElement, GroupInputLeftCurrencyProps>(
  function GroupInputLeftCurrency({ value, height = 'md', className = '', ...props }, ref) {
    const config = sizeConfig[height]

    return (
      <button
        ref={ref}
        type="button"
        className={`inline-flex items-center gap-[3px] ${config.panel} ${config.padding} bg-bg-input-placeholder border border-border-input-placeholder rounded-l-sm-7 rounded-r-none hover:bg-bg-input-hover-group-items hover:border-border-input-hover-group-items transition-colors ${className}`}
        aria-label={props['aria-label'] || 'Select currency'}
        {...props}
      >
        <span className="text-body-s font-medium text-text-primary">{value}</span>
        <svg
          className="h-[12px] w-[12px] text-text-secondary shrink-0"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    )
  },
)

export { GroupInputLeftCurrency }
export type { GroupInputLeftCurrencyProps, GroupInputLeftCurrencySize }
