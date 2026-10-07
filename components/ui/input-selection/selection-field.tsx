'use client'

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react'

import { ChevronDown } from '../icons'

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

  // Boolean() rather than a comparison: TypeScript would narrow `tags` through
  // a compared alias, and both branches below render the same children.
  const tagMode = Boolean(tags)

  return (
    // With removable tags inside, the trigger cannot be a <button>: the tags'
    // own remove buttons would be nested in it, which is invalid HTML. It
    // becomes a focusable combobox div that answers Enter and Space instead.
    tagMode ? (
      <div
        ref={ref as unknown as Ref<HTMLDivElement>}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        className={`${classes} cursor-pointer`}
        {...(props as unknown as HTMLAttributes<HTMLDivElement>)}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            event.currentTarget.click()
          }
        }}
      >
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
              <span className="text-body-m text-text-input-placeholder truncate">
                {placeholder}
              </span>
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
      </div>
    ) : (
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
              <span className="text-body-m text-text-input-placeholder truncate">
                {placeholder}
              </span>
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
  )
})

export { SelectionField }
export type { SelectionFieldProps, SelectionFieldSize, SelectionFieldState }
