'use client'

import { forwardRef, type ReactNode, type MouseEventHandler } from 'react'

import { Tag, type TagColor } from '../tags/tag'

import { ListItemContent, type SubTextAlignment } from './list-item-content'

type ListItemSelectedType = 'list-item' | 'tag'
type ListItemSelectedState = 'rest' | 'hover'

interface ListItemSelectedProps {
  type?: ListItemSelectedType
  mainText?: string
  subText?: string
  subTextAlignment?: SubTextAlignment
  withIcon?: boolean
  iconContainer?: boolean
  icon?: ReactNode
  tagLabel?: string
  tagColor?: TagColor
  selected?: boolean
  state?: ListItemSelectedState
  onClick?: MouseEventHandler<HTMLLIElement>
  className?: string
}

function CheckIcon() {
  return (
    <svg className="h-[14px] w-[14px] text-text-secondary" viewBox="0 0 14 14" fill="none">
      <path
        d="M2.5 7.5L5.5 10.5L11.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const ListItemSelected = forwardRef<HTMLLIElement, ListItemSelectedProps>(function ListItemSelected(
  {
    type = 'list-item',
    mainText,
    subText,
    subTextAlignment = 'none',
    withIcon = true,
    iconContainer = false,
    icon,
    tagLabel,
    tagColor = 'empty',
    selected = false,
    state = 'rest',
    onClick,
    className = '',
  },
  ref,
) {
  const classes = [
    'flex items-center justify-between w-[200px] h-[32px] rounded-sm-8 pl-[6px] pr-[8px] transition-colors cursor-pointer',
    state === 'hover' ? 'bg-bg-transparent-light' : 'hover:bg-bg-transparent-light',
    className,
  ].join(' ')

  return (
    <li ref={ref} role="option" aria-selected={selected} onClick={onClick} className={classes}>
      {type === 'list-item' && mainText && (
        <ListItemContent
          mainText={mainText}
          subText={subText}
          subTextAlignment={subTextAlignment}
          withIcon={withIcon}
          iconContainer={iconContainer}
          icon={icon}
        />
      )}
      {type === 'tag' && tagLabel && <Tag label={tagLabel} color={tagColor} />}
      {selected && (
        <span className="inline-flex items-center ml-[8px] shrink-0" aria-hidden="true">
          <CheckIcon />
        </span>
      )}
    </li>
  )
})

export { ListItemSelected }
export type { ListItemSelectedProps, ListItemSelectedType, ListItemSelectedState }
