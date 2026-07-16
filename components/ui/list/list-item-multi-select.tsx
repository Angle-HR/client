'use client'

import { forwardRef, type ReactNode } from 'react'

import { Tag, type TagColor } from '../tags/tag'

import { ListItemContent, type SubTextAlignment } from './list-item-content'

type ListItemMultiSelectType = 'list-item' | 'tag'
type ListItemMultiSelectState = 'rest' | 'hover'

interface ListItemMultiSelectProps {
  type?: ListItemMultiSelectType
  mainText?: string
  subText?: string
  subTextAlignment?: SubTextAlignment
  withIcon?: boolean
  iconContainer?: boolean
  icon?: ReactNode
  tagLabel?: string
  tagColor?: TagColor
  selected?: boolean
  withCheckbox?: boolean
  state?: ListItemMultiSelectState
  onChange?: (selected: boolean) => void
  className?: string
}

function CheckIcon() {
  return (
    <svg className="h-[9px] w-[9px]" viewBox="0 0 10 8" fill="none">
      <path
        d="M1 4L3.5 6.5L9 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const ListItemMultiSelect = forwardRef<HTMLLIElement, ListItemMultiSelectProps>(
  function ListItemMultiSelect(
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
      withCheckbox = true,
      state = 'rest',
      onChange,
      className = '',
    },
    ref,
  ) {
    const classes = [
      'flex items-center gap-[8px] w-full h-[32px] rounded-sm-8 px-[6px] transition-colors duration-[50ms] cursor-pointer',
      state === 'hover' ? 'bg-bg-transparent-light' : 'hover:bg-bg-transparent-light',
      className,
    ].join(' ')

    const checkboxClasses = [
      'h-[15px] w-[15px] rounded-sm-5 border flex items-center justify-center shrink-0 transition-colors duration-[50ms]',
      selected
        ? 'bg-bg-selection-controls-selected border-bg-selection-controls-selected text-text-inverted'
        : 'border-border-selection-controls-rest bg-bg-selection-controls-empty',
    ].join(' ')

    return (
      <li
        ref={ref}
        role="option"
        aria-selected={selected}
        onClick={() => onChange?.(!selected)}
        className={classes}
      >
        {withCheckbox && (
          <span className={checkboxClasses} aria-hidden="true">
            {selected && <CheckIcon />}
          </span>
        )}
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
      </li>
    )
  },
)

export { ListItemMultiSelect }
export type { ListItemMultiSelectProps, ListItemMultiSelectType, ListItemMultiSelectState }
