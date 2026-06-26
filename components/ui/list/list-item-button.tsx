'use client'

import { forwardRef, type ReactNode, type MouseEventHandler } from 'react'

import { ListItemContent, type SubTextAlignment } from './list-item-content'

type ListItemButtonType = 'list-item' | 'tag'
type ListItemButtonCount = 'one' | 'two'
type ListItemButtonState = 'rest' | 'hover' | 'disabled'

interface ListItemButtonProps {
  type?: ListItemButtonType
  button?: ListItemButtonCount
  mainText?: string
  subText?: string
  subTextAlignment?: SubTextAlignment
  withIcon?: boolean
  iconContainer?: boolean
  icon?: ReactNode
  tagLabel?: string
  tagColor?: string
  alwaysShowButton?: boolean
  trailingButton?: ReactNode
  trailingButton2?: ReactNode
  state?: ListItemButtonState
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLLIElement>
  className?: string
}

const ListItemButton = forwardRef<HTMLLIElement, ListItemButtonProps>(function ListItemButton(
  {
    button = 'one',
    mainText = '',
    subText,
    subTextAlignment = 'none',
    withIcon = true,
    iconContainer = false,
    icon,
    alwaysShowButton = false,
    trailingButton,
    trailingButton2,
    state,
    disabled = false,
    onClick,
    className = '',
  },
  ref,
) {
  const resolvedState = disabled ? 'disabled' : state || 'rest'

  const classes = [
    'flex items-center justify-between w-[200px] h-[32px] rounded-sm-8 px-[6px] pr-[4px] transition-colors cursor-pointer group',
    resolvedState === 'disabled' ? 'opacity-40 pointer-events-none' : '',
    resolvedState === 'hover' ? 'bg-bg-transparent-light' : 'hover:bg-bg-transparent-light',
    className,
  ].join(' ')

  const buttonVisibility = alwaysShowButton
    ? 'opacity-100'
    : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity'

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
      <span className={`inline-flex items-center gap-[2px] shrink-0 ${buttonVisibility}`}>
        {trailingButton && (
          <span className="inline-flex h-[24px] w-[24px] items-center justify-center">
            {trailingButton}
          </span>
        )}
        {button === 'two' && trailingButton2 && (
          <span className="inline-flex h-[24px] w-[24px] items-center justify-center">
            {trailingButton2}
          </span>
        )}
      </span>
    </li>
  )
})

export { ListItemButton }
export type { ListItemButtonProps, ListItemButtonType, ListItemButtonCount, ListItemButtonState }
