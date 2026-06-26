'use client'

import { type ReactNode } from 'react'

import { Toggle } from '../selection-controls/toggle'

import { ListItemContent, type SubTextAlignment } from './list-item-content'

interface ListItemToggleProps {
  mainText: string
  subText?: string
  subTextAlignment?: SubTextAlignment
  withIcon?: boolean
  iconContainer?: boolean
  icon?: ReactNode
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

function ListItemToggle({
  mainText,
  subText,
  subTextAlignment = 'none',
  withIcon = true,
  iconContainer = false,
  icon,
  checked = false,
  onChange,
  disabled = false,
  className = '',
}: ListItemToggleProps) {
  const classes = [
    'flex items-center justify-between w-[214px] h-[32px] px-[4px] transition-colors',
    'hover:bg-bg-transparent-light',
    disabled ? 'opacity-40 pointer-events-none' : '',
    className,
  ].join(' ')

  return (
    <div className={classes}>
      <span className="w-[160px]">
        <ListItemContent
          mainText={mainText}
          subText={subText}
          subTextAlignment={subTextAlignment}
          withIcon={withIcon}
          iconContainer={iconContainer}
          icon={icon}
        />
      </span>
      <Toggle
        size="sm"
        toggled={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={mainText}
      />
    </div>
  )
}

export { ListItemToggle }
export type { ListItemToggleProps }
