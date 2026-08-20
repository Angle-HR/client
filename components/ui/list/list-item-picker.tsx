'use client'

import { forwardRef, type ReactNode, type MouseEventHandler } from 'react'

type ListItemPickerLayout = 'horizontal' | 'vertical'
type ListItemPickerState = 'rest' | 'hover' | 'selected' | 'selected-hover' | 'disabled'

interface ListItemPickerProps {
  title?: string
  subText?: string
  showTitle?: boolean
  showSubtext?: boolean
  layout?: ListItemPickerLayout
  state?: ListItemPickerState
  selected?: boolean
  disabled?: boolean
  icon?: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
  'aria-label'?: string
  className?: string
}

// Card border/background/text per state (tokens read from the Figma spec).
const stateClasses: Record<ListItemPickerState, string> = {
  rest: 'bg-transparent border-border-input-placeholder text-text-secondary hover:bg-bg-input-hover hover:border-border-input-hover',
  hover: 'bg-bg-input-hover border-border-input-hover text-text-secondary',
  selected:
    'bg-bg-input-focus border-border-input-focus text-text-blue-accent hover:bg-bg-input-focus-hover',
  'selected-hover': 'bg-bg-input-focus-hover border-border-input-focus text-text-blue-accent',
  disabled: 'bg-bg-input-disabled border-border-input-disabled text-text-light pointer-events-none',
}

const ListItemPicker = forwardRef<HTMLButtonElement, ListItemPickerProps>(function ListItemPicker(
  {
    title = 'List item',
    subText = '',
    showTitle = true,
    showSubtext = true,
    layout = 'horizontal',
    state,
    selected = false,
    disabled = false,
    icon,
    onClick,
    className = '',
    ...props
  },
  ref,
) {
  const resolvedState: ListItemPickerState = disabled
    ? 'disabled'
    : state || (selected ? 'selected' : 'rest')

  const layoutClasses =
    layout === 'horizontal'
      ? 'flex-col items-center text-center w-[120px] py-[18px] gap-[12px]'
      : 'flex-row items-start w-[188px] px-[18px] py-[14px] gap-[8px]'

  const classes = [
    'inline-flex border rounded-lg-12 overflow-clip transition-colors',
    layoutClasses,
    stateClasses[resolvedState],
    disabled ? '' : 'cursor-pointer',
    className,
  ].join(' ')

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={resolvedState === 'selected' || resolvedState === 'selected-hover'}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={classes}
      {...props}
    >
      {icon && (
        <span
          className="inline-flex h-[17px] w-[17px] items-center justify-center shrink-0"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <span className={`flex flex-col py-[4px] ${layout === 'vertical' ? 'gap-[12px]' : ''}`}>
        {showTitle && <span className="body-xs-semibold">{title}</span>}
        {layout === 'vertical' && showSubtext && subText && (
          <span
            className={`text-body-xs w-[127px] font-regular ${
              resolvedState === 'selected' || resolvedState === 'selected-hover'
                ? 'text-inherit'
                : 'text-text-secondary'
            }`}
          >
            {subText}
          </span>
        )}
      </span>
    </button>
  )
})

export { ListItemPicker }
export type { ListItemPickerProps, ListItemPickerLayout, ListItemPickerState }
