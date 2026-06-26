'use client'

import { forwardRef, type ReactNode, type ElementType, type ComponentPropsWithRef } from 'react'

type TextButtonSize = 'sm' | 'md' | 'lg'

type TextButtonOwnProps = {
  size?: TextButtonSize
  bold?: boolean
  underline?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  avatar?: ReactNode
  href?: string
  as?: ElementType
  className?: string
}

type TextButtonProps = TextButtonOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof TextButtonOwnProps> &
  Omit<ComponentPropsWithRef<'a'>, keyof TextButtonOwnProps>

const sizeClasses: Record<TextButtonSize, string> = {
  sm: 'text-body-xs gap-[2px]',
  md: 'text-body-s gap-[2px]',
  lg: 'text-body-l gap-[2px]',
}

// Icon sizes scale with text size (from Figma). Left and right differ at md.
const leftIconSize: Record<TextButtonSize, string> = {
  sm: 'h-[10px] w-[10px]',
  md: 'h-[11px] w-[11px]',
  lg: 'h-[12px] w-[12px]',
}

const rightIconSize: Record<TextButtonSize, string> = {
  sm: 'h-[10px] w-[10px]',
  md: 'h-[10px] w-[10px]',
  lg: 'h-[12px] w-[12px]',
}

const TextButton = forwardRef<HTMLElement, TextButtonProps>(function TextButton(
  {
    size = 'md',
    bold = false,
    underline = false,
    iconLeft,
    iconRight,
    avatar,
    href,
    as,
    children,
    className = '',
    ...props
  },
  ref,
) {
  const Component = as || (href ? 'a' : 'button')

  const classes = [
    'inline-flex items-center transition-colors',
    'text-text-blue-accent hover:text-text-primary',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected rounded-xs-2',
    'disabled:text-text-btn-default-disabled disabled:cursor-not-allowed',
    sizeClasses[size],
    bold ? 'font-medium' : 'font-regular',
    underline ? 'underline underline-offset-2' : '',
    className,
  ].join(' ')

  const componentProps: Record<string, unknown> = {
    ref,
    className: classes,
    ...props,
  }

  if (href) componentProps.href = href
  if (Component === 'button' && !props.type) componentProps.type = 'button'

  const showAvatar = avatar && size !== 'sm'

  return (
    <Component {...componentProps}>
      {showAvatar && (
        <span className="inline-flex h-[12px] w-[12px] pr-[1px] items-center justify-center shrink-0">
          {avatar}
        </span>
      )}
      {iconLeft && (
        <span className={`inline-flex ${leftIconSize[size]} items-center justify-center shrink-0`}>
          {iconLeft}
        </span>
      )}
      {children && <span>{children}</span>}
      {iconRight && (
        <span className={`inline-flex ${rightIconSize[size]} items-center justify-center shrink-0`}>
          {iconRight}
        </span>
      )}
    </Component>
  )
})

export { TextButton }
export type { TextButtonProps, TextButtonSize }
