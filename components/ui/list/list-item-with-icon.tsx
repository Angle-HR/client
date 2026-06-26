'use client'

import { forwardRef, type ReactNode, type MouseEventHandler } from 'react'

import { ListItemContent, type SubTextAlignment } from './list-item-content'

type ListItemWithIconState = 'rest' | 'hover' | 'disabled'

interface ListItemWithIconProps {
  mainText: string
  subText?: string
  subTextAlignment?: SubTextAlignment
  withIcon?: boolean
  iconContainer?: boolean
  icon?: ReactNode
  trailingIcon?: ReactNode
  state?: ListItemWithIconState
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLLIElement>
  className?: string
}

function DefaultTrailingIcon() {
  return (
    <svg className="h-[14px] w-[14px] text-text-tertiary" viewBox="0 0 14 14" fill="currentColor">
      <path d="M7 1.75a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5zM4.375 7.875a.875.875 0 111.75 0 .875.875 0 01-1.75 0zm3.5 0a.875.875 0 111.75 0 .875.875 0 01-1.75 0zM6.125 5.25l1.75-2.625L9.625 5.25h-3.5z" />
    </svg>
  )
}

const ListItemWithIcon = forwardRef<HTMLLIElement, ListItemWithIconProps>(function ListItemWithIcon(
  {
    mainText,
    subText,
    subTextAlignment = 'none',
    withIcon = true,
    iconContainer = false,
    icon,
    trailingIcon,
    state,
    disabled = false,
    onClick,
    className = '',
  },
  ref,
) {
  const resolvedState = disabled ? 'disabled' : state || 'rest'

  const classes = [
    'flex items-center justify-between w-full h-[32px] rounded-sm-8 pl-[6px] pr-[8px] transition-colors cursor-pointer',
    resolvedState === 'disabled' ? 'opacity-40 pointer-events-none' : '',
    resolvedState === 'hover' ? 'bg-bg-transparent-light' : 'hover:bg-bg-transparent-light',
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
      />
      <span className="inline-flex h-[14px] w-[14px] items-center justify-center shrink-0 ml-[8px]">
        {trailingIcon || <DefaultTrailingIcon />}
      </span>
    </li>
  )
})

export { ListItemWithIcon }
export type { ListItemWithIconProps, ListItemWithIconState }
