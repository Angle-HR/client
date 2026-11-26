'use client'

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

import { IconButton } from '../button/icon-button'
import { INPUT_FIELD_STATES, INPUT_PREFIX_STATES } from '../input/input'

import { useGroupInput } from './group-input-context'

import type { GroupFieldPosition, GroupInputSize } from './group-input.figma'

type GroupInputFieldSize = GroupInputSize
type GroupInputFieldPosition = GroupFieldPosition
type GroupInputFieldSuffix = 'none' | 'icon' | 'button'

interface GroupInputFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'prefix'
> {
  /** 25, 32 or 40px. Inside a GroupInput, defaults to the group's size. */
  size?: GroupInputFieldSize
  /**
   * Figma's ⛔ Position: where the field sits in the group. `right` ends the
   * group (right corners rounded), `left` starts it, `center` has panels on
   * both sides.
   */
  position?: GroupInputFieldPosition
  showPrefix?: boolean
  /** A 12px (sm) or 14px icon, e.g. `<MaskIcon src=… size={14} />`. It takes the text's colour. */
  prefixIcon?: ReactNode
  suffix?: GroupInputFieldSuffix
  /** A 12px (sm) or 14px icon, grey (red with an error). */
  suffixIcon?: ReactNode
  /** Figma's ✅ Button: a light Icon Button at the field's right edge. */
  suffixButton?: { icon: ReactNode; 'aria-label': string; onClick?: () => void }
  'aria-invalid'?: boolean | 'true' | 'false'
}

// All values from group-input.figma.ts (Figma node 991:22214). Padding is
// Figma's minus the 1px border, which Figma draws inside its padding.
const sizeConfig: Record<
  GroupInputFieldSize,
  {
    height: string
    padding: string
    buttonPadding: string
    buttonSlot: string
    icon: string
    text: string
  }
> = {
  sm: {
    height: 'h-[25px]',
    padding: 'px-[7px]',
    buttonPadding: 'pl-[7px] pr-0',
    buttonSlot: '',
    icon: 'size-[12px]',
    text: 'md:text-body-s',
  },
  md: {
    height: 'h-[32px]',
    padding: 'px-[7px]',
    // Figma: right padding 0, so the 32px button sits over the border.
    buttonPadding: 'pl-[7px] pr-0',
    buttonSlot: '-mr-[1px]',
    icon: 'size-[14px]',
    text: 'md:text-body-m',
  },
  lg: {
    height: 'h-[40px]',
    padding: 'px-[11px]',
    buttonPadding: 'px-[11px]',
    buttonSlot: '',
    icon: 'size-[14px]',
    text: 'md:text-body-l',
  },
}

const RADIUS: Record<GroupInputFieldPosition, Record<GroupInputFieldSize, string>> = {
  right: { sm: 'rounded-r-sm-7', md: 'rounded-r-sm-8', lg: 'rounded-r-lg-10' },
  center: { sm: 'rounded-none', md: 'rounded-none', lg: 'rounded-none' },
  left: { sm: 'rounded-l-sm-7', md: 'rounded-l-sm-8', lg: 'rounded-l-lg-10' },
}

const SUFFIX_STATES = {
  default: 'text-text-input-icon-suffix',
  error: 'text-text-input-icon-suffix-error',
  disabled: 'text-text-input-icon-suffix',
} as const

/**
 * The text field inside a group input. Figma: .Subcomponents/Group-input.
 * The same field as the text input, with corners only on its outer side.
 */
const GroupInputField = forwardRef<HTMLInputElement, GroupInputFieldProps>(function GroupInputField(
  {
    size: sizeProp,
    position = 'right',
    showPrefix = true,
    prefixIcon,
    suffix = 'none',
    suffixIcon,
    suffixButton,
    disabled: disabledProp,
    placeholder,
    className = '',
    id,
    'aria-invalid': ariaInvalidProp,
    ...props
  },
  ref,
) {
  const group = useGroupInput()
  const size = sizeProp ?? group?.size ?? 'md'
  const config = sizeConfig[size]
  const disabled = disabledProp ?? group?.disabled ?? false
  const ariaInvalid = ariaInvalidProp ?? (group?.invalid || undefined)
  const isError = ariaInvalid === true || ariaInvalid === 'true'
  const state = disabled ? 'disabled' : isError ? 'error' : 'default'
  const withButton = suffix === 'button' && suffixButton

  const containerClasses = [
    'group/input inline-flex w-full min-w-0 flex-1 items-center gap-[4px] border transition-colors duration-100 ease-figma-out',
    config.height,
    withButton ? config.buttonPadding : config.padding,
    RADIUS[position][size],
    INPUT_FIELD_STATES[state],
    className,
  ].join(' ')

  return (
    <div className={containerClasses}>
      {showPrefix && prefixIcon && (
        <span
          aria-hidden="true"
          className={`inline-flex ${config.icon} shrink-0 items-center justify-center transition-colors duration-100 ease-figma-out ${INPUT_PREFIX_STATES[state]}`}
        >
          {prefixIcon}
        </span>
      )}
      <input
        ref={ref}
        id={id ?? group?.fieldId}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        aria-describedby={group?.describedBy}
        aria-required={group?.required || undefined}
        // A blank placeholder keeps :placeholder-shown working, which is how
        // the field knows it is empty (Figma's Place-holder vs Filled).
        placeholder={placeholder ?? ' '}
        // text-[1rem] (16px) below md: iOS Safari zooms the viewport on
        // focus for any text input under 16px. From md up, Figma's size.
        className={`h-full min-w-0 flex-1 bg-transparent text-[1rem] leading-none text-text-input-filled outline-none placeholder:text-text-input-placeholder disabled:text-text-input-disabled disabled:placeholder:text-text-input-disabled ${config.text}`}
        {...props}
      />
      {suffix === 'icon' && suffixIcon && (
        <span
          aria-hidden="true"
          className={`inline-flex ${config.icon} shrink-0 items-center justify-center ${SUFFIX_STATES[state]}`}
        >
          {suffixIcon}
        </span>
      )}
      {withButton && (
        <span className={`inline-flex shrink-0 items-center ${config.buttonSlot}`}>
          <IconButton
            variant="light"
            size={size === 'sm' ? 'sm' : 'md'}
            icon={suffixButton.icon}
            aria-label={suffixButton['aria-label']}
            onClick={suffixButton.onClick}
            disabled={disabled}
            // Figma binds text/btn-default/light here, not the light Icon
            // Button's own text/tertiary.
            className="text-text-btn-default-light!"
          />
        </span>
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
