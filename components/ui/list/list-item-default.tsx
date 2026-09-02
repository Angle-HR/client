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
  /** A leading visual (e.g. a flag) rendered before the content, outside the
   * square icon slot so non-square artwork isn't clipped. */
  leadingVisual?: ReactNode
  danger?: boolean
  state?: ListItemDefaultState
  disabled?: boolean
  /** Reflected as aria-selected — set alongside state="hover" when this row
   * represents the current value in a listbox. */
  selected?: boolean
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
    leadingVisual,
    danger = false,
    state,
    disabled = false,
    selected = false,
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
    leadingVisual ? 'gap-[8px]' : '',
    resolvedState === 'disabled' ? 'opacity-40 pointer-events-none' : '',
    bgClass,
    className,
  ].join(' ')

  return (
    <li
      ref={ref}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={classes}
    >
      {leadingVisual && <span className="inline-flex shrink-0 items-center">{leadingVisual}</span>}
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
