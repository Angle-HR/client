'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type IconButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'light'
type IconButtonSize = 'sm' | 'md'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant
  size?: IconButtonSize
  icon: ReactNode
  showCounter?: boolean
  counter?: number
  'aria-label': string
}

const sizeClasses: Record<IconButtonSize, string> = {
  // sm uses explicit 5px padding all sides; md centres the icon via auto-layout.
  sm: 'h-[24px] w-[24px] p-[5px]',
  md: 'h-[32px] w-[32px]',
}

function getIconButtonColors(variant: IconButtonVariant): string {
  switch (variant) {
    case 'primary':
      return [
        'bg-bg-btn-default-pri-rest hover:bg-bg-btn-default-pri-hover active:bg-bg-btn-default-pri-pressed',
        'border-border-btn-default-pri-rest hover:border-border-btn-default-pri-hover',
        'focus-visible:border-border-btn-default-pri-focus focus-visible:bg-bg-btn-default-pri-focus',
        'text-text-btn-default-primary disabled:text-text-btn-default-disabled disabled:bg-bg-btn-default-pri-disabled disabled:border-border-btn-default-pri-disabled',
      ].join(' ')
    case 'secondary':
      return [
        'bg-bg-btn-default-sec-rest hover:bg-bg-btn-default-sec-hover active:bg-bg-btn-default-sec-pressed',
        'border-border-btn-default-sec-rest hover:border-border-btn-default-sec-hover',
        'focus-visible:border-border-btn-default-sec-focus focus-visible:bg-bg-btn-default-sec-focus',
        'text-text-btn-default-secondary disabled:text-text-btn-default-disabled disabled:bg-bg-btn-default-sec-disabled disabled:border-border-btn-default-sec-disabled',
      ].join(' ')
    case 'tertiary':
      return [
        'bg-bg-btn-default-tet-rest hover:bg-bg-btn-default-tet-hover active:bg-bg-btn-default-tet-pressed',
        'border-border-btn-default-tet-rest',
        'focus-visible:border-border-btn-default-tet-focus focus-visible:bg-bg-btn-default-tet-focus',
        'text-text-btn-default-tertiary disabled:text-text-btn-default-disabled',
      ].join(' ')
    case 'light':
      return [
        'bg-bg-transparent-lighter hover:bg-bg-transparent-light active:bg-bg-transparent-medium',
        'border-transparent',
        'text-text-secondary disabled:text-text-btn-default-disabled',
      ].join(' ')
  }
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    variant = 'primary',
    size = 'md',
    icon,
    showCounter = false,
    counter,
    disabled,
    className = '',
    type = 'button',
    ...props
  },
  ref,
) {
  const badgeVisible = showCounter && counter !== undefined && counter > 0
  const displayCounter = counter !== undefined && counter > 99 ? '99+' : counter

  const classes = [
    'relative inline-flex items-center justify-center rounded-sm-7 border transition-colors',
    variant !== 'light'
      ? 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected'
      : '',
    'disabled:cursor-not-allowed',
    sizeClasses[size],
    getIconButtonColors(variant),
    className,
  ].join(' ')

  return (
    <button ref={ref} type={type} disabled={disabled} className={classes} {...props}>
      <span className="inline-flex h-[14px] w-[14px] items-center justify-center">{icon}</span>
      {badgeVisible && (
        <span className="absolute -top-[2px] -right-[2px] flex h-[12px] min-w-[12px] items-center justify-center rounded-full bg-bg-notification px-[2px] text-[8px] font-medium leading-none text-text-inverted">
          {displayCounter}
        </span>
      )}
    </button>
  )
})

export { IconButton }
export type { IconButtonProps, IconButtonVariant, IconButtonSize }
