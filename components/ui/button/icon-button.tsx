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
  /** Shows the numeric badge over the top-left corner. Needs `counter`. */
  showCounter?: boolean
  /** Badge value. Shown as `99+` above 99, hidden at 0. */
  counter?: number
  /** Names the action, verb first, e.g. "Close dialog". Required: there's no visible label. */
  'aria-label': string
}

const sizeClasses: Record<IconButtonSize, string> = {
  // xs and sm use explicit 5px padding all sides; md centres the icon via auto-layout.
  xs: 'h-[16px] w-[16px] p-[5px]',
  sm: 'h-[24px] w-[24px] p-[5px]',
  md: 'h-[32px] w-[32px]',
}

const radiusClasses: Record<IconButtonSize, string> = {
  xs: 'rounded-xs-4',
  sm: 'rounded-sm-7',
  md: 'rounded-sm-7',
}

const defaultIconSize: Record<IconButtonSize, number> = { xs: 10, sm: 14, md: 14 }

// Built from icon-button.figma.ts; icon-button-figma.test.tsx checks each string against it.
const colorClasses: Record<IconButtonVariant, string> = {
  primary:
    'bg-bg-btn-default-pri-rest hover:bg-bg-btn-default-pri-hover active:bg-bg-btn-default-pri-pressed focus-visible:bg-bg-btn-default-pri-focus disabled:bg-bg-btn-default-pri-disabled border-border-btn-default-pri-rest hover:border-border-btn-default-pri-hover active:border-border-btn-default-pri-hover focus-visible:border-border-btn-red-pri-focus disabled:border-border-btn-default-pri-disabled text-text-secondary disabled:text-text-btn-default-disabled',
  secondary:
    'bg-bg-btn-default-sec-rest hover:bg-bg-btn-default-sec-hover active:bg-bg-btn-default-sec-pressed focus-visible:bg-bg-btn-default-pri-focus disabled:bg-bg-btn-default-pri-disabled border-border-btn-default-sec-rest hover:border-border-btn-default-sec-hover active:border-border-btn-default-sec-pressed focus-visible:border-border-btn-red-pri-focus disabled:border-border-btn-default-pri-disabled text-text-secondary disabled:text-text-btn-default-disabled',
  tertiary:
    'bg-bg-btn-default-tet-rest hover:bg-bg-btn-default-tet-hover active:bg-bg-btn-default-tet-pressed focus-visible:bg-bg-btn-default-pri-focus disabled:bg-bg-btn-default-sec-disabled border-border-btn-default-tet-rest hover:border-border-btn-default-tet-hover active:border-border-btn-default-tet-disabled focus-visible:border-border-btn-red-pri-focus disabled:border-transparent text-text-secondary disabled:text-text-btn-default-disabled',
  // Figma: no fill or border in any state and no focus variant, just a grey icon.
  light:
    'bg-bg-btn-default-tet-rest hover:bg-transparent active:bg-transparent disabled:bg-bg-btn-default-tet-disabled border-border-btn-default-tet-rest hover:border-transparent active:border-transparent disabled:border-transparent text-text-tertiary disabled:text-text-btn-default-disabled',
  // Figma: a faint fill on hover and press; no focus variant.
  'light-w-hover':
    'bg-bg-btn-default-tet-rest hover:bg-bg-transparent-light active:bg-bg-transparent-light disabled:bg-bg-btn-default-tet-disabled border-border-btn-default-tet-rest hover:border-transparent active:border-transparent disabled:border-transparent text-text-tertiary disabled:text-text-btn-default-disabled',
  error:
    'bg-bg-btn-default-tet-rest hover:bg-bg-btn-red-tet-hover active:bg-bg-btn-red-tet-pressed focus-visible:bg-bg-btn-default-pri-focus disabled:bg-bg-btn-default-sec-disabled border-border-btn-default-tet-rest hover:border-transparent active:border-transparent focus-visible:border-border-btn-red-pri-focus disabled:border-border-btn-default-sec-disabled text-text-error disabled:text-text-btn-default-disabled',
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
    // Figma: hover fades in over 100ms (ease in) and out over 100ms (ease out); press takes 50ms (ease out).
    'transition-colors duration-100 ease-figma-out hover:ease-figma-in active:duration-[50ms] active:ease-figma-out',
    // Focus is the blue border from Figma, drawn by the colour classes. No extra outline.
    'focus-visible:outline-none',
    'disabled:cursor-not-allowed',
    sizeClasses[size],
    // Figma oddity kept as-is: light-w-hover at 24px has a 6px radius (its fill only shows on hover and press).
    variant === 'light-w-hover' && size === 'sm' ? 'rounded-[6px]' : radiusClasses[size],
    colorClasses[variant],
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
        // Figma: 12px pill at the top-left corner, Inter Semi Bold 9px, 3px side padding.
        <span className="absolute -top-[6.7px] -left-[6.7px] flex h-[12px] min-w-[12px] items-center justify-center rounded-full bg-bg-btn-blue-pri-focus px-[3px] text-[9px] font-semibold leading-none text-text-inverted">
          {displayCounter}
        </span>
      )}
    </button>
  )
})

export { IconButton }
export type { IconButtonProps, IconButtonVariant, IconButtonSize }
