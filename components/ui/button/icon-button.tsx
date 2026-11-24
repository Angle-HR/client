'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type IconButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'light' | 'light-w-hover' | 'error'
type IconButtonSize = 'xs' | 'sm' | 'md'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual hierarchy. `light` is a bare grey icon with no fill in any state;
   * `light-w-hover` adds a faint fill on hover and press; `error` is a red icon
   * for destructive actions such as delete.
   */
  variant?: IconButtonVariant
  /** `xs` = 16×16px (10px icon) for dense inline controls, `sm` = 24×24px for toolbars and table rows, `md` = 32×32px everywhere else. */
  size?: IconButtonSize
  /** The icon, drawn in a 14×14px box (10px at `xs`). Use `MaskIcon` with a file from `public/dashboard/icons`. Children aren't rendered. */
  icon: ReactNode
  /** Icon box size in px. Defaults to 14, or 10 at `xs` (Figma spec); some
   * contexts (e.g. social footers) use a larger 20px glyph. */
  iconSize?: number
  /** Shows the numeric badge in the top-right corner. Needs `counter`. */
  showCounter?: boolean
  /** Badge value. Shown as `99+` above 99, hidden at 0. */
  counter?: number
  /** Names the action, verb first, e.g. "Close dialog". Required: there's no visible label. */
  'aria-label': string
}

const sizeClasses: Record<IconButtonSize, string> = {
  // xs and sm use explicit 5px padding all sides; md centres the icon via auto-layout.
  xs: 'h-[16px] w-[16px] p-[5px] rounded-xs-4',
  sm: 'h-[24px] w-[24px] p-[5px] rounded-sm-7',
  md: 'h-[32px] w-[32px] rounded-sm-7',
}

const defaultIconSize: Record<IconButtonSize, number> = { xs: 10, sm: 14, md: 14 }

function getIconButtonColors(variant: IconButtonVariant): string {
  switch (variant) {
    case 'primary':
      return [
        'bg-bg-btn-default-pri-rest hover:bg-bg-btn-default-pri-hover active:bg-bg-btn-default-pri-pressed',
        'border-border-btn-default-pri-rest hover:border-border-btn-default-pri-hover',
        'focus-visible:border-border-btn-default-pri-focus focus-visible:bg-bg-btn-default-pri-focus',
        'text-text-btn-default-primary disabled:text-text-btn-default-disabled disabled:bg-bg-btn-default-pri-disabled disabled:border-border-btn-default-pri-disabled',
      ].join(' ')
    case 'secondary':
      return [
        'bg-bg-btn-default-sec-rest hover:bg-bg-btn-default-sec-hover active:bg-bg-btn-default-sec-pressed',
        'border-border-btn-default-sec-rest hover:border-border-btn-default-sec-hover',
        'focus-visible:border-border-btn-default-sec-focus focus-visible:bg-bg-btn-default-sec-focus',
        'text-text-btn-default-secondary disabled:text-text-btn-default-disabled disabled:bg-bg-btn-default-sec-disabled disabled:border-border-btn-default-sec-disabled',
      ].join(' ')
    case 'tertiary':
      return [
        'bg-bg-btn-default-tet-rest hover:bg-bg-btn-default-tet-hover active:bg-bg-btn-default-tet-pressed',
        'border-border-btn-default-tet-rest',
        'focus-visible:border-border-btn-default-tet-focus focus-visible:bg-bg-btn-default-tet-focus',
        'text-text-btn-default-tertiary disabled:text-text-btn-default-disabled',
      ].join(' ')
    case 'light':
      // Figma: no fill or border in any state, just a tertiary-grey icon.
      return [
        'bg-bg-btn-default-tet-rest border-border-btn-default-tet-rest',
        'text-text-tertiary disabled:text-text-btn-default-disabled disabled:bg-bg-btn-default-tet-disabled',
      ].join(' ')
    case 'light-w-hover':
      return [
        'bg-bg-btn-default-tet-rest border-border-btn-default-tet-rest',
        'hover:bg-bg-transparent-light hover:border-transparent active:bg-bg-transparent-light',
        'text-text-tertiary disabled:text-text-btn-default-disabled disabled:bg-bg-btn-default-tet-disabled disabled:border-transparent',
      ].join(' ')
    case 'error':
      return [
        'bg-bg-btn-default-tet-rest border-border-btn-default-tet-rest',
        'hover:bg-bg-btn-red-tet-hover hover:border-transparent active:bg-bg-btn-red-tet-pressed',
        'focus-visible:bg-bg-btn-default-pri-focus focus-visible:border-border-btn-red-pri-focus',
        'text-text-error disabled:text-text-btn-default-disabled disabled:bg-bg-btn-default-sec-disabled disabled:border-border-btn-default-sec-disabled',
      ].join(' ')
  }
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    variant = 'primary',
    size = 'md',
    icon,
    iconSize,
    showCounter = false,
    counter,
    disabled,
    className = '',
    type = 'button',
    ...props
  },
  ref,
) {
  const badgeVisible = showCounter && counter !== undefined && counter > 0
  const iconBox = iconSize ?? defaultIconSize[size]
  const displayCounter = counter !== undefined && counter > 99 ? '99+' : counter

  const classes = [
    'relative inline-flex items-center justify-center border',
    // Figma: hover fades in over 100ms (ease in) and out over 100ms (ease out); press takes 50ms.
    'transition-colors duration-100 ease-out hover:ease-in active:duration-[50ms]',
    // Figma has no focus state for `light` or `light-w-hover`, but every variant needs a visible focus ring for keyboard users.
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected',
    'disabled:cursor-not-allowed',
    sizeClasses[size],
    getIconButtonColors(variant),
    className,
  ].join(' ')

  return (
    <button ref={ref} type={type} disabled={disabled} className={classes} {...props}>
      <span
        className="inline-flex items-center justify-center"
        style={{ height: iconBox, width: iconBox }}
      >
        {icon}
      </span>
      {badgeVisible && (
        // Figma: 12px pill at the top-left corner, 9px medium text, 3px side padding.
        <span className="absolute -top-[6.7px] -left-[6.7px] flex h-[12px] min-w-[12px] items-center justify-center rounded-full bg-bg-btn-blue-pri-focus px-[3px] text-[9px] font-medium leading-none text-text-inverted">
          {displayCounter}
        </span>
      )}
    </button>
  )
})

export { IconButton }
export type { IconButtonProps, IconButtonVariant, IconButtonSize }
