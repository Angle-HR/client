'use client'

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

type InputSize = 'sm' | 'md' | 'lg'
type InputSuffix = 'none' | 'icon' | 'button'
type InputStatus = 'error' | 'success'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize
  showPrefixIcon?: boolean
  prefixIcon?: ReactNode
  suffix?: InputSuffix
  suffixIcon?: ReactNode
  /** Figma's suffix is a light IconButton: size="md" in md/lg fields, "sm" in sm. */
  suffixButton?: ReactNode
  /** Error also follows aria-invalid. Success is a green border and suffix icon. */
  status?: InputStatus
  'aria-invalid'?: boolean | 'true' | 'false'
  'aria-required'?: boolean
}

// All values from input.figma.ts (Figma node 840:39704). Class strings are
// spelled out so Tailwind can see them. Padding is Figma's minus the 1px
// border, which Figma draws inside its padding.
const sizeConfig: Record<
  InputSize,
  {
    height: string
    padding: string
    buttonPadding: string
    buttonSlot: string
    radius: string
    icon: string
    text: string
  }
> = {
  sm: {
    height: 'h-[25px]',
    padding: 'px-[7px]',
    buttonPadding: 'pl-[7px] pr-0',
    buttonSlot: '',
    radius: 'rounded-sm-7',
    icon: 'size-[12px]',
    text: 'md:text-body-s',
  },
  md: {
    height: 'h-[32px]',
    padding: 'px-[7px]',
    // Figma: right padding 0, so the 32px button sits over the border.
    buttonPadding: 'pl-[7px] pr-0',
    buttonSlot: '-mr-[1px]',
    radius: 'rounded-sm-8',
    icon: 'size-[14px]',
    text: 'md:text-body-m',
  },
  lg: {
    height: 'h-[40px]',
    padding: 'px-[11px]',
    buttonPadding: 'pl-[11px] pr-[3px]',
    buttonSlot: '',
    radius: 'rounded-lg-10',
    icon: 'size-[14px]',
    text: 'md:text-body-l',
  },
}

// "Filled" is a field whose input has text; "empty" shows its placeholder.
// Figma only hovers an empty field.
const FIELD_STATES = {
  default:
    'bg-bg-input-placeholder border-border-input-placeholder ' +
    'has-[input:not(:placeholder-shown)]:bg-bg-input-filled has-[input:not(:placeholder-shown)]:border-border-input-filled ' +
    'has-[input:placeholder-shown]:hover:bg-bg-input-hover has-[input:placeholder-shown]:hover:border-border-input-hover has-[input:placeholder-shown]:hover:ease-figma-in ' +
    'focus-within:bg-bg-input-focus! focus-within:border-border-input-focus! focus-within:ease-figma-out!',
  error: 'bg-bg-input-error border-border-input-error',
  success: 'bg-bg-input-filled border-border-input-success',
  disabled: 'pointer-events-none bg-bg-input-disabled border-border-input-disabled',
} as const

const PREFIX_STATES = {
  default:
    'text-text-input-placeholder group-has-[input:not(:placeholder-shown)]/input:text-text-input-filled group-focus-within/input:text-text-input-focus',
  error: 'text-text-input-error',
  success: 'text-text-input-error',
  disabled: 'text-text-input-disabled',
} as const

const SUFFIX_STATES = {
  default: 'text-text-input-icon-suffix',
  error: 'text-text-error',
  success: 'text-text-success',
  disabled: 'text-text-input-icon-suffix',
} as const

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'md',
    showPrefixIcon = true,
    prefixIcon,
    suffix = 'none',
    suffixIcon,
    suffixButton,
    status,
    disabled,
    readOnly,
    placeholder,
    className = '',
    ...props
  },
  ref,
) {
  const config = sizeConfig[size]
  const isError =
    status === 'error' || props['aria-invalid'] === true || props['aria-invalid'] === 'true'
  const state = disabled
    ? 'disabled'
    : isError
      ? 'error'
      : status === 'success'
        ? 'success'
        : 'default'
  const withButton = suffix === 'button' && suffixButton

  const containerClasses = [
    'group/input inline-flex w-full items-center gap-[4px] border transition-colors duration-100 ease-figma-out',
    config.height,
    withButton ? config.buttonPadding : config.padding,
    config.radius,
    FIELD_STATES[state],
    className,
  ].join(' ')

  return (
    <div className={containerClasses}>
      {showPrefixIcon && prefixIcon && (
        <span
          className={`inline-flex ${config.icon} shrink-0 items-center justify-center transition-colors duration-100 ease-figma-out ${PREFIX_STATES[state]}`}
        >
          {prefixIcon}
        </span>
      )}
      <input
        ref={ref}
        disabled={disabled}
        readOnly={readOnly}
        // A blank placeholder keeps :placeholder-shown working, which is how
        // the field knows it is empty (Figma's Placeholder vs Filled).
        placeholder={placeholder ?? ' '}
        // text-[1rem] (16px) below md: iOS Safari zooms the viewport on
        // focus for any text input under 16px. From md up, Figma's size.
        className={`h-full min-w-0 flex-1 bg-transparent text-[1rem] leading-none text-text-input-filled outline-none placeholder:text-text-input-placeholder disabled:text-text-input-disabled disabled:placeholder:text-text-input-disabled ${config.text}`}
        {...props}
      />
      {suffix === 'icon' && suffixIcon && (
        <span
          className={`inline-flex ${config.icon} shrink-0 items-center justify-center ${SUFFIX_STATES[state]}`}
        >
          {suffixIcon}
        </span>
      )}
      {withButton && (
        <span className={`inline-flex shrink-0 items-center ${config.buttonSlot}`}>
          {suffixButton}
        </span>
      )}
    </div>
  )
})

// Shared with the group input's field, which is the same field in Figma.
export { Input, FIELD_STATES as INPUT_FIELD_STATES, PREFIX_STATES as INPUT_PREFIX_STATES }
export type { InputProps, InputSize, InputStatus, InputSuffix }
