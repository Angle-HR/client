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
      ? // 17px + the 1px border = the design's 18px inset from a 74px card.
        'flex-col items-center text-center w-[120px] py-[17px] gap-[12px]'
      : // Figma's "vertical" layout is a row: icon left, text stacked and left-aligned
        // (buttons centre text by default, so reset it). Padding is Figma's 18/14
        // minus the 1px border, which Figma draws inside its padding.
        'flex-row items-start text-left w-[188px] px-[17px] py-[13px] gap-[8px]'

  const classes = [
    // Figma: hover and select fade over 100ms with its "Ease out" curve.
    'inline-flex border rounded-lg-12 overflow-clip transition-colors duration-100 ease-[cubic-bezier(0,0,0.58,1)]',
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
      {/* Figma trims text to its cap height: 9px for the title, which is what
          makes the stacked card 74px tall and the row card 85px. */}
      <span className={`flex flex-col ${layout === 'vertical' ? 'gap-[12px] py-[4px]' : ''}`}>
        {showTitle && (
          <span
            className={`body-xs-semibold ${layout === 'horizontal' ? 'flex h-[9px] items-center leading-none' : '[text-box:trim-both_cap_alphabetic]'}`}
          >
            {title}
          </span>
        )}
        {layout === 'vertical' && showSubtext && subText && (
          <span
            // Figma trims the text to its cap height (top and bottom) but keeps
            // the 19.2px spacing between lines.
            className={`text-body-xs w-[127px] font-regular leading-[19.2px] [text-box:trim-both_cap_alphabetic] ${
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
