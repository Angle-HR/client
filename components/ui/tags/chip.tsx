'use client'

import { useState, type MouseEventHandler, type ReactNode } from 'react'

import { ChipRemoveButton } from './chip-remove-button'

type ChipFill = 'default' | 'accent' | 'transparent'
type ChipState = 'rest' | 'hover' | 'placeholder' | 'disabled' | 'loading'

interface ChipProps {
  label: string
  fill?: ChipFill
  state?: ChipState
  removable?: boolean
  boldText?: boolean
  withIcon?: boolean
  icon?: ReactNode
  onRemove?: () => void
  onClick?: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  'aria-label'?: string
  className?: string
}

const fillClasses: Record<ChipFill, { rest: string; hover: string; disabled: string }> = {
  default: {
    rest: 'bg-bg-transparent-light',
    hover: 'bg-bg-transparent-medium',
    disabled: 'bg-bg-transparent-lighter',
  },
  accent: {
    rest: 'bg-bg-transparent-blue-accent-light',
    hover: 'bg-bg-transparent-blue-accent-medium',
    disabled: 'bg-bg-transparent-blue-accent-light',
  },
  transparent: {
    rest: 'bg-transparent',
    hover: 'bg-transparent',
    disabled: 'bg-transparent',
  },
}

function Spinner() {
  return (
    <svg
      className="h-[12px] w-[12px] animate-spin text-text-secondary"
      viewBox="0 0 16 16"
      fill="none"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="28"
        strokeDashoffset="8"
      />
    </svg>
  )
}

function Chip({
  label,
  fill = 'default',
  state: controlledState,
  removable = false,
  boldText = false,
  withIcon = true,
  icon,
  onRemove,
  onClick,
  disabled = false,
  className = '',
  ...props
}: ChipProps) {
  const [isHovered, setIsHovered] = useState(false)

  const resolvedState = disabled ? 'disabled' : controlledState || (isHovered ? 'hover' : 'rest')
  const isLoading = resolvedState === 'loading'
  const isPlaceholder = resolvedState === 'placeholder'
  const isDisabled = resolvedState === 'disabled'

  const bgClass = isDisabled
    ? fillClasses[fill].disabled
    : isHovered && !isDisabled
      ? fillClasses[fill].hover
      : fillClasses[fill].rest

  const containerClasses = [
    'inline-flex items-center h-[20px] rounded-sm-7 pl-[3px] transition-colors',
    bgClass,
    isDisabled ? 'cursor-not-allowed' : onClick ? 'cursor-pointer' : '',
    isPlaceholder ? 'opacity-40' : '',
    className,
  ].join(' ')

  const removeButtonColor = fill === 'accent' ? ('blue' as const) : ('empty' as const)
  const removeButtonState = isHovered ? ('rest' as const) : ('transparent' as const)

  const Component = onClick ? 'button' : 'span'

  const containerProps: Record<string, unknown> = {
    className: containerClasses,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    ...(isDisabled ? { 'aria-disabled': true } : {}),
    ...props,
  }

  if (onClick && Component === 'button') {
    containerProps.type = 'button'
    containerProps.onClick = onClick
    containerProps.disabled = isDisabled
  }

  return (
    <Component {...(containerProps as Record<string, unknown>)}>
      {isLoading ? (
        <span className="inline-flex items-center gap-[3px] px-[3px]">
          <Spinner />
          <span className="text-body-xs text-text-secondary pl-[1px]">{label}</span>
        </span>
      ) : (
        <>
          <span className="inline-flex items-center gap-[2px]">
            {withIcon && icon && (
              <span className="inline-flex h-[14px] w-[14px] items-center justify-center shrink-0 rounded-xs-4 overflow-hidden">
                {icon}
              </span>
            )}
            <span
              className={`text-body-xs text-text-primary pl-[1px] ${boldText ? 'font-medium' : ''} ${removable && !isHovered ? 'pr-[4px]' : removable ? 'pr-0' : 'pr-[4px]'}`}
            >
              {label}
            </span>
          </span>
          {removable && (
            <ChipRemoveButton
              color={removeButtonColor}
              state={removeButtonState}
              aria-label={`Remove ${label}`}
              onClick={(e) => {
                e.stopPropagation()
                onRemove?.()
              }}
            />
          )}
        </>
      )}
    </Component>
  )
}

export { Chip }
export type { ChipProps, ChipFill, ChipState }
