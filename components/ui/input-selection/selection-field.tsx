'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type SelectionFieldSize = 'sm' | 'md' | 'lg'
type SelectionFieldState = 'placeholder' | 'hover' | 'focus' | 'filled' | 'disabled' | 'error'

interface SelectionFieldProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'value' | 'prefix'
> {
  size?: SelectionFieldSize
  state?: SelectionFieldState
  showPrefixIcon?: boolean
  prefixIcon?: ReactNode
  /** Leading visual (e.g. the selected country's flag) shown before the value. */
  leadingVisual?: ReactNode
  withSelection?: boolean
  tags?: ReactNode[]
  placeholder?: string
  value?: string
}

const sizeConfig: Record<
  SelectionFieldSize,
  { height: string; padding: string; radius: string; icon: string }
> = {
  sm: {
    height: 'h-[25px]',
    padding: 'px-[8px]',
    radius: 'rounded-sm-7',
    icon: 'h-[12px] w-[12px]',
  },
  md: {
    height: 'h-[32px]',
    padding: 'px-[8px]',
    radius: 'rounded-sm-8',
    icon: 'h-[14px] w-[14px]',
  },
  lg: {
    height: 'h-[40px]',
    padding: 'px-[12px]',
    radius: 'rounded-lg-10',
    icon: 'h-[14px] w-[14px]',
  },
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const SelectionField = forwardRef<HTMLButtonElement, SelectionFieldProps>(function SelectionField(
  {
    size = 'md',
    state,
    showPrefixIcon = false,
    prefixIcon,
    leadingVisual,
    withSelection = false,
    tags,
    placeholder,
    value,
    disabled,
    className = '',
    ...props
  },
  ref,
) {
  const config = sizeConfig[size]
  const isError = state === 'error'
  const hasValue = !!value || (withSelection && !!tags?.length)

  const classes = [
    'inline-flex items-center gap-[4px] w-full border transition-colors text-left',
    config.height,
    config.padding,
    config.radius,
    isError
      ? 'bg-bg-input-error border-border-input-error'
      : disabled
        ? 'bg-bg-input-disabled border-border-input-disabled pointer-events-none opacity-60'
        : 'bg-bg-input-placeholder border-border-input-placeholder hover:border-border-input-hover focus-visible:border-border-input-focus! focus-visible:outline-none cursor-pointer',
    className,
  ].join(' ')

  return (
    <button ref={ref} type="button" disabled={disabled} className={classes} {...props}>
      {showPrefixIcon && prefixIcon && (
        <span
          className={`inline-flex ${config.icon} items-center justify-center shrink-0 text-text-input-icon-rest`}
          aria-hidden="true"
        >
          {prefixIcon}
        </span>
      )}
      {withSelection ? (
        <span className="flex-1 inline-flex items-center gap-[2px] min-w-0 overflow-hidden">
          {tags?.length ? (
            tags
          ) : (
            <span className="text-body-m text-text-input-placeholder truncate">{placeholder}</span>
          )}
        </span>
      ) : (
        <span className="flex flex-1 items-center gap-[8px] min-w-0">
          {value && leadingVisual && (
            <span className="inline-flex shrink-0 items-center">{leadingVisual}</span>
          )}
          <span
            className={`flex-1 truncate text-body-m ${hasValue ? 'text-text-input-filled' : 'text-text-input-placeholder'}`}
          >
            {value || placeholder}
          </span>
        </span>
      )}
      <ChevronDown className={`${config.icon} shrink-0 text-text-input-icon-rest`} />
    </button>
  )
})

export { SelectionField }
export type { SelectionFieldProps, SelectionFieldSize, SelectionFieldState }
