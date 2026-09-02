'use client'

import { forwardRef, type MouseEventHandler } from 'react'

// FLAGGED DUPLICATE: see ListItemRadioSelection (Figma node 1070:52459,
// layer "Radio selection") — near-identical radius/padding/radio+two-line
// anatomy to this component's own doc (node 2906:32286, layer "Location"),
// just different prop names and trailing icon (check vs info). Left both as
// built rather than merging unilaterally; flagging for a design decision.
type ListItemLocationState = 'rest' | 'hover' | 'selected' | 'selected-hover' | 'disabled'

interface ListItemLocationProps {
  title?: string
  address: string
  showTitle?: boolean
  showSubtext?: boolean
  showCheckMark?: boolean
  state?: ListItemLocationState
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLDivElement>
  className?: string
}

function CheckCircleIcon() {
  return (
    <svg
      className="h-[12px] w-[12px] text-text-blue-accent"
      viewBox="0 0 12 12"
      fill="currentColor"
    >
      <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm2.354 3.854l-3 3a.5.5 0 01-.708 0l-1.5-1.5a.5.5 0 11.708-.708L5 6.793l2.646-2.647a.5.5 0 01.708.708z" />
    </svg>
  )
}

const ListItemLocation = forwardRef<HTMLDivElement, ListItemLocationProps>(
  function ListItemLocation(
    {
      title = 'Suggested Address:',
      address,
      showTitle = true,
      showSubtext = true,
      showCheckMark = false,
      state = 'rest',
      disabled = false,
      onClick,
      className = '',
    },
    ref,
  ) {
    const resolvedState = disabled ? 'disabled' : state
    const isSelected = resolvedState === 'selected' || resolvedState === 'selected-hover'
    const isHovered = resolvedState === 'hover' || resolvedState === 'selected-hover'

    const classes = [
      'flex items-center gap-[4px] p-[4px] rounded-xl-14 transition-colors cursor-pointer',
      isHovered ? 'bg-bg-transparent-light' : '',
      resolvedState === 'disabled' ? 'opacity-40 pointer-events-none' : '',
      className,
    ].join(' ')

    const radioClasses = [
      'h-[16px] w-[16px] rounded-full border flex items-center justify-center shrink-0',
      isSelected
        ? 'bg-bg-selection-controls-selected border-bg-selection-controls-selected'
        : 'border-border-selection-controls-rest bg-bg-selection-controls-empty',
    ].join(' ')

    return (
      <div
        ref={ref}
        role="radio"
        aria-checked={isSelected}
        aria-disabled={disabled}
        onClick={disabled ? undefined : onClick}
        className={classes}
      >
        <span className="inline-flex h-[24px] w-[24px] items-center justify-center shrink-0">
          <span className={radioClasses}>
            {isSelected && <span className="h-[8px] w-[8px] rounded-full bg-text-inverted" />}
          </span>
        </span>
        <span className="flex flex-col py-[7px]">
          {showTitle && (
            <span className="inline-flex items-center gap-[2px]">
              <span className="text-body-xs text-text-secondary">{title}</span>
              {showCheckMark && isSelected && <CheckCircleIcon />}
            </span>
          )}
          {showSubtext && (
            <span className="text-body-s font-medium text-text-primary">{address}</span>
          )}
        </span>
      </div>
    )
  },
)

export { ListItemLocation }
export type { ListItemLocationProps, ListItemLocationState }
