'use client'

import { InformationCircle } from '../icons'
import { RadioButton } from '../selection-controls/radio-button'

interface ListItemRadioSelectionProps {
  label: string
  value: string
  selected?: boolean
  disabled?: boolean
  infoIcon?: boolean
  onSelect?: (value: string) => void
  className?: string
}

/**
 * A two-line radio row (small label line + larger value line) purpose-built
 * for "pick one of these suggested values" flows like address confirmation —
 * not for plain one-line choices, that's RadioButton on its own.
 */
function ListItemRadioSelection({
  label,
  value,
  selected = false,
  disabled = false,
  infoIcon = false,
  onSelect,
  className = '',
}: ListItemRadioSelectionProps) {
  const classes = [
    'flex w-full items-start gap-[8px] rounded-xl-14 border p-[4px] transition-colors',
    disabled
      ? 'cursor-not-allowed border-border-input-disabled bg-bg-input-disabled opacity-40'
      : selected
        ? 'cursor-pointer border-transparent hover:bg-bg-input-hover'
        : 'cursor-pointer border-transparent hover:border-border-input-hover hover:bg-bg-input-hover',
    className,
  ].join(' ')

  return (
    <div
      className={classes}
      onClick={() => !disabled && onSelect?.(value)}
      role="presentation"
    >
      <RadioButton
        textPosition="none"
        checked={selected}
        disabled={disabled}
        onChange={() => onSelect?.(value)}
        aria-label={`${label} ${value}`}
      />
      <span className="flex min-w-0 flex-1 flex-col pt-[4px]">
        <span className="inline-flex items-center gap-[4px] text-[12px] leading-[16px] text-text-secondary">
          {label}
          {infoIcon && <InformationCircle className="size-[12px] shrink-0" />}
        </span>
        <span className="text-[13px] leading-[19.5px] font-medium text-text-primary">{value}</span>
      </span>
    </div>
  )
}

export { ListItemRadioSelection }
export type { ListItemRadioSelectionProps }
