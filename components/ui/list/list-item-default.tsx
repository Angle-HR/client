'use client'

import { forwardRef, type ReactNode, type MouseEventHandler } from 'react'

import { ListItemContent, type SubTextAlignment } from './list-item-content'

type ListItemDefaultState = 'rest' | 'hover' | 'disabled'

interface ListItemDefaultProps {
  mainText: string
  subText?: string
  subTextAlignment?: SubTextAlignment
  withIcon?: boolean
  iconContainer?: boolean
  icon?: ReactNode
  danger?: boolean
  state?: ListItemDefaultState
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLLIElement>
  className?: string
}

const ListItemDefault = forwardRef<HTMLLIElement, ListItemDefaultProps>(function ListItemDefault(
  {
    mainText,
    subText,
    subTextAlignment = 'none',
    withIcon = true,
    iconContainer = false,
    icon,
    danger = false,
    state,
    disabled = false,
    onClick,
    className = '',
  },
  ref,
) {
  const resolvedState = disabled ? 'disabled' : state || 'rest'

  // Full literal class names — Tailwind's JIT scanner cannot see interpolated strings.
  const bgClass = danger
    ? resolvedState === 'hover'
      ? 'bg-bg-danger'
      : 'hover:bg-bg-danger'
    : resolvedState === 'hover'
      ? 'bg-bg-transparent-light'
      : 'hover:bg-bg-transparent-light'

  const classes = [
    'flex items-center w-[200px] h-[32px] rounded-sm-8 px-[6px] transition-colors cursor-pointer',
    resolvedState === 'disabled' ? 'opacity-40 pointer-events-none' : '',
    bgClass,
    className,
  ].join(' ')

  return (
    <li
      ref={ref}
      role="option"
      aria-selected={false}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={classes}
    >
      <ListItemContent
        mainText={mainText}
        subText={subText}
        subTextAlignment={subTextAlignment}
        withIcon={withIcon}
        iconContainer={iconContainer}
        icon={icon}
        danger={danger}
      />
    </li>
  )
})

export { ListItemDefault }
export type { ListItemDefaultProps, ListItemDefaultState }
