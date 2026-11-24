'use client'

import { forwardRef, type ReactNode, type ElementType, type ComponentPropsWithRef } from 'react'

type TextButtonSize = 'xs' | 'sm' | 'md' | 'lg'
type TextButtonUnderline = 'hover' | 'always' | 'never'

type TextButtonOwnProps = {
  /** Text size: `xs` = 10px, `sm` = 12px, `md` = 13px, `lg` = 14px. Match the surrounding copy. */
  size?: TextButtonSize
  /** Medium weight instead of regular. For standalone links, not mid-sentence. */
  bold?: boolean
  /**
   * When the underline shows. `hover` (default) underlines on hover and press;
   * `always` keeps it at rest too; `never` drops it and starts in the softer
   * secondary grey instead. `true` and `false` still work and mean `always` and `hover`.
   */
  underline?: TextButtonUnderline | boolean
  /** Adds 6px padding and a faint fill on hover, so the button reads as a target on its own. Pair with `underline="never"`. */
  wrapped?: boolean
  /** Icon before the label: 10px (`xs`, `sm`), 11px (`md`) or 12px (`lg`). */
  iconLeft?: ReactNode
  /** Icon after the label: 10px (`xs`, `sm`, `md`) or 12px (`lg`). Use the external-link icon for links that leave the app. */
  iconRight?: ReactNode
  /** Avatar between the left icon and the label, 12px. Ignored at `xs` and `sm`. */
  avatar?: ReactNode
  /** Renders an `<a>` instead of a `<button>`. */
  href?: string
  /** Overrides the root element, e.g. Next.js `Link` for client-side navigation. */
  as?: ElementType
  /** Layout only (width, margin). Don't override the colours here. */
  className?: string
}

type TextButtonProps = TextButtonOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof TextButtonOwnProps> &
  Omit<ComponentPropsWithRef<'a'>, keyof TextButtonOwnProps>

const sizeClasses: Record<TextButtonSize, string> = {
  xs: 'text-caption-s leading-16 gap-[2px]',
  sm: 'text-body-xs leading-[19.2px] gap-[2px]',
  md: 'text-body-s gap-[2px]',
  lg: 'text-body-l gap-[2px]',
}

// Icon sizes scale with text size (from Figma). Left and right differ at md.
const leftIconSize: Record<TextButtonSize, string> = {
  xs: 'h-[10px] w-[10px]',
  sm: 'h-[10px] w-[10px]',
  md: 'h-[11px] w-[11px]',
  lg: 'h-[12px] w-[12px]',
}

const rightIconSize: Record<TextButtonSize, string> = {
  xs: 'h-[10px] w-[10px]',
  sm: 'h-[10px] w-[10px]',
  md: 'h-[10px] w-[10px]',
  lg: 'h-[12px] w-[12px]',
}

const TextButton = forwardRef<HTMLElement, TextButtonProps>(function TextButton(
  {
    size = 'md',
    bold = false,
    underline = 'hover',
    wrapped = false,
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
  const underlineMode: TextButtonUnderline =
    underline === true ? 'always' : underline === false ? 'hover' : underline

  const classes = [
    'group/text-button inline-flex items-center',
    // Figma: hover and press fade in over 100ms (ease in), out over 100ms (ease out).
    'transition-[color,text-decoration-color,background-color] duration-100 ease-figma-out hover:ease-figma-in active:ease-figma-in',
    // Figma: grey at rest, darker grey on hover, blue accent on press and focus.
    underlineMode === 'never' ? 'text-text-secondary' : 'text-text-primary',
    'hover:text-text-primary active:text-text-blue-accent focus-visible:text-text-blue-accent',
    // Figma's focus is the blue text alone: no ring or outline.
    'focus-visible:outline-none',
    // Figma: 6px padding; a faint 4px-round fill on hover only.
    wrapped && 'p-[6px] rounded-xs-4 hover:bg-bg-transparent-light active:bg-transparent',
    'disabled:text-text-light disabled:cursor-not-allowed disabled:bg-transparent',
    sizeClasses[size],
    bold ? 'font-medium' : 'font-regular',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const componentProps: Record<string, unknown> = {
    ref,
    className: classes,
    ...props,
  }

  if (href) componentProps.href = href
  if (Component === 'button' && !props.type) componentProps.type = 'button'

  const showAvatar = avatar && size !== 'sm' && size !== 'xs'

  return (
    <Component {...componentProps}>
      {iconLeft && (
        <span
          className={[
            'inline-flex items-center justify-center shrink-0',
            leftIconSize[size],
            // Figma oddity kept: at md and lg the left icon stays primary grey on press and focus.
            (size === 'md' || size === 'lg') &&
              'group-active/text-button:text-text-primary group-focus-visible/text-button:text-text-primary',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {iconLeft}
        </span>
      )}
      {showAvatar && (
        // Figma: a 12px avatar plus 1px right padding, after the left icon.
        <span className="inline-flex h-[12px] w-[13px] pr-[1px] items-center justify-center shrink-0">
          {avatar}
        </span>
      )}
      {children && (
        // Figma trims the text to its cap height and never wraps it, so the button is as tall as
        // its icons (10px at xs/sm, 12px at md/lg; 22–24px wrapped). A line
        // height equal to the cap height (0.727em in Inter) does the same.
        // The underline goes on the label only, so it never runs under the avatar or icons.
        // Figma: offset 10% of the font size; no underline on focus or when disabled.
        <span
          className={[
            'leading-[0.727em] underline-offset-[10%] whitespace-nowrap',
            underlineMode === 'hover' &&
              'group-[:hover:not(:disabled)]/text-button:underline group-[:active:not(:disabled)]/text-button:underline',
            underlineMode === 'always' && 'underline',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </span>
      )}
      {iconRight && (
        <span className={`inline-flex ${rightIconSize[size]} items-center justify-center shrink-0`}>
          {iconRight}
        </span>
      )}
    </Component>
  )
})

export { TextButton }
export type { TextButtonProps, TextButtonSize, TextButtonUnderline }
