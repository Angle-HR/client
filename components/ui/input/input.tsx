'use client'

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

type InputSize = 'sm' | 'md' | 'lg'
type InputSuffix = 'none' | 'icon' | 'button'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize
  showPrefixIcon?: boolean
  prefixIcon?: ReactNode
  suffix?: InputSuffix
  suffixIcon?: ReactNode
  suffixButton?: ReactNode
  'aria-invalid'?: boolean | 'true' | 'false'
  'aria-required'?: boolean
}

const sizeConfig: Record<
  InputSize,
  {
    height: string
    padding: string
    radius: string
    iconSize: string
  }
> = {
  sm: {
    height: 'h-[25px]',
    padding: 'px-[8px]',
    radius: 'rounded-sm-7',
    iconSize: 'h-[12px] w-[12px]',
  },
  md: {
    height: 'h-[32px]',
    padding: 'px-[8px]',
    radius: 'rounded-sm-8',
    iconSize: 'h-[14px] w-[14px]',
  },
  lg: {
    height: 'h-[40px]',
    padding: 'px-[12px]',
    radius: 'rounded-lg-10',
    iconSize: 'h-[14px] w-[14px]',
  },
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'md',
    showPrefixIcon = true,
    prefixIcon,
    suffix = 'none',
    suffixIcon,
    suffixButton,
    disabled,
    readOnly,
    className = '',
    ...props
  },
  ref,
) {
  const config = sizeConfig[size]
  const isError = props['aria-invalid'] === true || props['aria-invalid'] === 'true'

  const containerClasses = [
    'inline-flex items-center gap-[4px] w-full border transition-colors',
    config.height,
    config.padding,
    config.radius,
    isError
      ? 'bg-bg-input-error border-border-input-error'
      : disabled
        ? 'bg-bg-input-disabled border-border-input-disabled pointer-events-none opacity-60'
        : 'bg-bg-input-placeholder border-border-input-placeholder hover:border-border-input-hover hover:bg-bg-input-hover focus-within:border-border-input-focus! focus-within:bg-bg-input-focus!',
    className,
  ].join(' ')

  return (
    <div className={containerClasses}>
      {showPrefixIcon && prefixIcon && (
        <span
          className={`inline-flex ${config.iconSize} items-center justify-center shrink-0 text-text-input-icon-rest`}
        >
          {prefixIcon}
        </span>
      )}
      <input
        ref={ref}
        disabled={disabled}
        readOnly={readOnly}
        className="flex-1 bg-transparent text-body-m text-text-input-filled placeholder:text-text-input-placeholder outline-none min-w-0 disabled:text-text-input-disabled"
        {...props}
      />
      {suffix === 'icon' && suffixIcon && (
        <span
          className={`inline-flex ${config.iconSize} items-center justify-center shrink-0 text-text-input-icon-suffix ${isError ? 'text-text-input-icon-suffix-error' : ''}`}
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

export { Input }
export type { InputProps, InputSize, InputSuffix }
