'use client'

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

type GroupInputFieldSize = 'sm' | 'md' | 'lg'
type GroupInputFieldPosition = 'left' | 'center' | 'right'
type GroupInputFieldSuffix = 'none' | 'icon' | 'button'

interface GroupInputFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'prefix'
> {
  size?: GroupInputFieldSize
  position?: GroupInputFieldPosition
  showPrefix?: boolean
  prefixIcon?: ReactNode
  suffix?: GroupInputFieldSuffix
  suffixIcon?: ReactNode
  suffixButton?: ReactNode
  'aria-invalid'?: boolean | 'true' | 'false'
}

const sizeConfig: Record<GroupInputFieldSize, { height: string; padding: string; icon: string }> = {
  sm: { height: 'h-[25px]', padding: 'px-[8px]', icon: 'h-[12px] w-[12px]' },
  md: { height: 'h-[32px]', padding: 'px-[8px]', icon: 'h-[14px] w-[14px]' },
  lg: { height: 'h-[40px]', padding: 'px-[12px]', icon: 'h-[14px] w-[14px]' },
}

const positionRadius: Record<GroupInputFieldPosition, string> = {
  left: 'rounded-r-sm-7 rounded-l-none',
  center: 'rounded-none',
  right: 'rounded-l-sm-7 rounded-r-none',
}

const GroupInputField = forwardRef<HTMLInputElement, GroupInputFieldProps>(function GroupInputField(
  {
    size = 'md',
    position = 'right',
    showPrefix = true,
    prefixIcon,
    suffix = 'none',
    suffixIcon,
    suffixButton,
    disabled,
    className = '',
    ...props
  },
  ref,
) {
  const config = sizeConfig[size]
  const isError = props['aria-invalid'] === true || props['aria-invalid'] === 'true'

  const containerClasses = [
    'flex-1 inline-flex items-center gap-[4px] border transition-colors',
    config.height,
    config.padding,
    positionRadius[position],
    'bg-bg-input-placeholder border-border-input-placeholder',
    'hover:border-border-input-hover',
    'focus-within:border-border-input-focus focus-within:bg-bg-input-focus',
    isError ? 'border-border-input-error' : '',
    disabled
      ? 'bg-bg-input-disabled border-border-input-disabled pointer-events-none opacity-60'
      : '',
    className,
  ].join(' ')

  return (
    <div className={containerClasses}>
      {showPrefix && prefixIcon && (
        <span
          className={`inline-flex ${config.icon} items-center justify-center shrink-0 text-text-input-icon-rest`}
          aria-hidden="true"
        >
          {prefixIcon}
        </span>
      )}
      <input
        ref={ref}
        disabled={disabled}
        className="flex-1 bg-transparent text-body-s text-text-input-filled placeholder:text-text-input-placeholder outline-none min-w-0 disabled:text-text-input-disabled"
        {...props}
      />
      {suffix === 'icon' && suffixIcon && (
        <span
          className={`inline-flex ${config.icon} items-center justify-center shrink-0 ${isError ? 'text-text-input-icon-suffix-error' : 'text-text-input-icon-suffix'}`}
        >
          {suffixIcon}
        </span>
      )}
      {suffix === 'button' && suffixButton && (
        <span className="inline-flex items-center shrink-0">{suffixButton}</span>
      )}
    </div>
  )
})

export { GroupInputField }
export type {
  GroupInputFieldProps,
  GroupInputFieldSize,
  GroupInputFieldPosition,
  GroupInputFieldSuffix,
}
