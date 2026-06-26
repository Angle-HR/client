'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary'
type ButtonAccent = 'default' | 'blue' | 'red'
type ButtonSize = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  accent?: ButtonAccent
  size?: ButtonSize
  iconPrefix?: ReactNode
  iconSuffix?: ReactNode
  loading?: boolean
  'aria-label'?: string
  'aria-describedby'?: string
}

const colorClassMap: Record<`${ButtonAccent}-${ButtonVariant}`, string> = {
  'default-primary':
    'bg-bg-btn-default-pri-rest hover:bg-bg-btn-default-pri-hover active:bg-bg-btn-default-pri-pressed focus-visible:bg-bg-btn-default-pri-focus disabled:bg-bg-btn-default-pri-disabled border-border-btn-default-pri-rest hover:border-border-btn-default-pri-hover active:border-border-btn-default-pri-pressed focus-visible:border-border-btn-default-pri-focus disabled:border-border-btn-default-pri-disabled text-text-btn-default-primary disabled:text-text-btn-default-disabled',
  'default-secondary':
    'bg-bg-btn-default-sec-rest hover:bg-bg-btn-default-sec-hover active:bg-bg-btn-default-sec-pressed focus-visible:bg-bg-btn-default-sec-focus disabled:bg-bg-btn-default-sec-disabled border-border-btn-default-sec-rest hover:border-border-btn-default-sec-hover active:border-border-btn-default-sec-pressed focus-visible:border-border-btn-default-sec-focus disabled:border-border-btn-default-sec-disabled text-text-btn-default-secondary disabled:text-text-btn-default-disabled',
  'default-tertiary':
    'bg-bg-btn-default-tet-rest hover:bg-bg-btn-default-tet-hover active:bg-bg-btn-default-tet-pressed focus-visible:bg-bg-btn-default-tet-focus disabled:bg-bg-btn-default-tet-disabled border-border-btn-default-tet-rest hover:border-border-btn-default-tet-hover active:border-border-btn-default-tet-pressed focus-visible:border-border-btn-default-tet-focus disabled:border-border-btn-default-tet-disabled text-text-btn-default-tertiary disabled:text-text-btn-default-disabled',
  'blue-primary':
    'bg-bg-btn-blue-pri-rest hover:bg-bg-btn-blue-pri-hover active:bg-bg-btn-blue-pri-pressed focus-visible:bg-bg-btn-blue-pri-focus disabled:bg-bg-btn-blue-pri-disabled border-border-btn-blue-pri-rest hover:border-border-btn-blue-pri-hover active:border-border-btn-blue-pri-pressed focus-visible:border-border-btn-blue-pri-focus disabled:border-border-btn-blue-pri-disabled text-text-btn-blue-primary disabled:opacity-40',
  'blue-secondary':
    'bg-bg-btn-blue-sec-rest hover:bg-bg-btn-blue-sec-hover active:bg-bg-btn-blue-sec-pressed focus-visible:bg-bg-btn-blue-sec-focus disabled:bg-bg-btn-blue-sec-disabled border-border-btn-blue-sec-rest hover:border-border-btn-blue-sec-hover active:border-border-btn-blue-sec-pressed focus-visible:border-border-btn-blue-sec-focus disabled:border-border-btn-blue-sec-disabled text-text-btn-blue-secondary',
  'blue-tertiary':
    'bg-bg-btn-blue-tet-rest hover:bg-bg-btn-blue-tet-hover active:bg-bg-btn-blue-tet-pressed focus-visible:bg-bg-btn-blue-tet-focus disabled:bg-bg-btn-blue-tet-disabled border-border-btn-blue-tet-rest hover:border-border-btn-blue-tet-hover active:border-border-btn-blue-tet-pressed focus-visible:border-border-btn-blue-tet-focus disabled:border-border-btn-blue-tet-disabled text-text-btn-blue-tertiary',
  'red-primary':
    'bg-bg-btn-red-pri-rest hover:bg-bg-btn-red-pri-hover active:bg-bg-btn-red-pri-pressed focus-visible:bg-bg-btn-red-pri-focus disabled:bg-bg-btn-red-pri-disabled border-border-btn-red-pri-rest hover:border-border-btn-red-pri-hover active:border-border-btn-red-pri-pressed focus-visible:border-border-btn-red-pri-focus disabled:border-border-btn-red-pri-disabled text-text-btn-red-primary disabled:opacity-40',
  'red-secondary':
    'bg-bg-btn-red-sec-rest hover:bg-bg-btn-red-sec-hover active:bg-bg-btn-red-sec-pressed focus-visible:bg-bg-btn-red-sec-focus disabled:bg-bg-btn-red-sec-disabled border-border-btn-red-sec-rest hover:border-border-btn-red-sec-hover active:border-border-btn-red-sec-pressed focus-visible:border-border-btn-red-sec-focus disabled:border-border-btn-red-sec-disabled text-text-btn-red-secondary',
  'red-tertiary':
    'bg-bg-btn-red-tet-rest hover:bg-bg-btn-red-tet-hover active:bg-bg-btn-red-tet-pressed focus-visible:bg-bg-btn-red-tet-focus disabled:bg-bg-btn-red-tet-disabled border-border-btn-red-tet-rest hover:border-border-btn-red-tet-hover active:border-border-btn-red-tet-pressed focus-visible:border-border-btn-red-tet-focus disabled:border-border-btn-red-tet-disabled text-text-btn-red-tertiary',
}

function getColorClasses(variant: ButtonVariant, accent: ButtonAccent): string {
  return colorClassMap[`${accent}-${variant}`]
}

function Spinner() {
  return (
    <svg className="h-[14px] w-[14px] animate-spin" viewBox="0 0 16 16" fill="none">
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

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    accent = 'default',
    size = 'md',
    iconPrefix,
    iconSuffix,
    loading = false,
    disabled,
    children,
    className = '',
    type = 'button',
    ...props
  },
  ref,
) {
  const sizeClasses =
    size === 'sm'
      ? 'h-[24px] px-[8px] gap-[4px] text-body-s'
      : 'h-[32px] px-[8px] gap-[4px] text-body-s'

  const classes = [
    'inline-flex items-center justify-center font-medium rounded-sm-7 border transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected',
    'disabled:cursor-not-allowed',
    sizeClasses,
    getColorClasses(variant, accent),
    className,
  ].join(' ')

  const isLoading = loading && !disabled

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={isLoading || undefined}
      className={classes}
      {...props}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {iconPrefix && (
            <span className="inline-flex h-[14px] w-[14px] items-center justify-center shrink-0">
              {iconPrefix}
            </span>
          )}
          {children && <span>{children}</span>}
          {iconSuffix && (
            <span className="inline-flex h-[14px] w-[14px] items-center justify-center shrink-0">
              {iconSuffix}
            </span>
          )}
        </>
      )}
    </button>
  )
})

export { Button }
export type { ButtonProps, ButtonVariant, ButtonAccent, ButtonSize }
