'use client'

import { type MouseEventHandler, type ReactNode } from 'react'

import { ChipRemoveButton } from './chip-remove-button'

import type { ChipFill, ChipState } from './chip.figma'

/** Label colour. `secondary` (grey) is not in Figma; it's used for metadata chips. */
type ChipTone = 'primary' | 'secondary'

interface ChipProps {
  label: string
  /** Figma's "🎨 Fill". */
  fill?: ChipFill
  /**
   * Pins a Figma state. Hover normally follows the pointer; `placeholder`
   * greys the label; `loading` shows a skeleton instead of the chip.
   */
  state?: ChipState
  removable?: boolean
  /** Figma's "Bold-text": Medium instead of Regular. */
  boldText?: boolean
  tone?: ChipTone
  /** Figma's "With icon". Needs `icon`. */
  withIcon?: boolean
  /** Figma's "With Text". When false only the icon shows; the label is kept for screen readers. */
  withText?: boolean
  /** A 14px avatar or glyph. */
  icon?: ReactNode
  onRemove?: () => void
  onClick?: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  'aria-label'?: string
  className?: string
}

// All values from chip.figma.ts (Figma node 2363:70402).
const fillClasses: Record<
  ChipFill,
  { rest: string; hover: string; pinned: string; disabled: string }
> = {
  default: {
    rest: 'bg-bg-transparent-light',
    hover: 'hover:bg-bg-transparent-medium',
    pinned: 'bg-bg-transparent-medium',
    disabled: 'bg-bg-transparent-lighter',
  },
  accent: {
    rest: 'bg-bg-transparent-blue-accent-light',
    hover: 'hover:bg-bg-transparent-blue-accent-medium',
    pinned: 'bg-bg-transparent-blue-accent-medium',
    // Figma oddity: disabled Accent keeps the rest fill.
    disabled: 'bg-bg-transparent-blue-accent-light',
  },
  green: {
    rest: 'bg-bg-transparent-green-accent-light',
    hover: 'hover:bg-bg-transparent-green-accent-medium',
    pinned: 'bg-bg-transparent-green-accent-medium',
    disabled: 'bg-bg-transparent-green-accent-lighter',
  },
  transparent: {
    rest: 'bg-transparent',
    hover: '',
    pinned: 'bg-transparent',
    disabled: 'bg-transparent',
  },
}

// Not in Figma: keyboard focus ring, like the selection controls. It goes round
// the whole chip while the chip's main button has keyboard focus.
const CHIP_FOCUS_RING =
  'has-[[data-chip-main]:focus-visible]:outline-solid has-[[data-chip-main]:focus-visible]:outline-1 has-[[data-chip-main]:focus-visible]:outline-bg-selection-controls-selected'

function Chip({
  label,
  fill = 'default',
  state = 'rest',
  removable = false,
  boldText = false,
  tone = 'primary',
  withIcon = true,
  withText = true,
  icon,
  onRemove,
  onClick,
  disabled = false,
  className = '',
  ...props
}: ChipProps) {
  const resolved: ChipState = disabled ? 'disabled' : state

  // Loading: Figma swaps the whole chip for a gradient bar, 3px in from each side.
  if (resolved === 'loading') {
    return (
      <span
        role="status"
        aria-label={props['aria-label'] ?? label}
        className={`inline-flex h-[20px] shrink-0 items-center rounded-sm-7 px-[3px] ${className}`}
      >
        <span className="relative h-[14px] w-[60.09px] overflow-hidden rounded-xs-4 bg-linear-to-r from-bg-gradient-transparent-light to-bg-gradient-transparent-lighter">
          {/* Not in Figma: a soft highlight sweeps across while loading (off with reduced motion). */}
          <span
            aria-hidden
            className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-bg-transparent-light to-transparent motion-reduce:hidden"
          />
        </span>
      </span>
    )
  }

  const f = fillClasses[fill]
  const muted = resolved === 'placeholder' || resolved === 'disabled'
  const bg =
    resolved === 'disabled' ? f.disabled : resolved === 'hover' ? f.pinned : `${f.rest} ${f.hover}`

  const clickable = Boolean(onClick)

  const containerClasses = [
    'group/chip inline-flex h-[20px] shrink-0 items-center rounded-sm-7',
    // Figma: hover fades in over 50ms (ease in) and out over 50ms (ease out).
    'transition-colors duration-[50ms] ease-figma-out hover:ease-figma-in',
    bg,
    resolved === 'disabled' && 'cursor-not-allowed',
    // Not in Figma: keyboard focus ring round the whole chip when its main button has focus.
    clickable && CHIP_FOCUS_RING,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // The icon and label. On a clickable chip this is its own button, so the
  // remove button sits beside it rather than inside it.
  const mainClasses = [
    'inline-flex h-full min-w-0 items-center pl-[3px]',
    // Figma oddity: Placeholder Accent and Green (Regular) put 3px between icon and label.
    resolved === 'placeholder' &&
      !boldText &&
      (fill === 'accent' || fill === 'green') &&
      'gap-[3px]',
    clickable && 'outline-none',
    clickable && (removable ? 'rounded-l-sm-7' : 'rounded-sm-7'),
    clickable && resolved !== 'disabled' && 'cursor-pointer',
    clickable && resolved === 'disabled' && 'cursor-not-allowed',
  ]
    .filter(Boolean)
    .join(' ')

  // Figma oddity: disabled with Medium text shows no icon, but keeps its space.
  const showIcon = withIcon && icon
  const hideIconGlyph = resolved === 'disabled' && boldText

  const labelClasses = [
    'min-w-0 overflow-x-clip text-ellipsis whitespace-nowrap text-trim-cap text-body-s pl-[1px]',
    removable ? 'pr-[2px]' : 'pr-[4px]',
    muted ? 'text-text-light' : tone === 'secondary' ? 'text-text-secondary' : 'text-text-primary',
    boldText ? 'font-medium' : 'font-regular',
  ].join(' ')

  const main = (
    <>
      {showIcon && (
        <span className="inline-flex shrink-0 pr-[3px]">
          <span className="inline-flex size-[14px] items-center justify-center overflow-hidden rounded-xs-4">
            {!hideIconGlyph && icon}
          </span>
        </span>
      )}
      {withText ? (
        <span className={labelClasses}>{label}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </>
  )

  return (
    <span
      className={containerClasses}
      {...(!clickable && resolved === 'disabled' ? { 'aria-disabled': true } : {})}
      {...(!clickable ? props : {})}
    >
      {clickable ? (
        <button
          type="button"
          data-chip-main=""
          onClick={onClick}
          disabled={resolved === 'disabled'}
          className={mainClasses}
          {...props}
        >
          {main}
        </button>
      ) : (
        <span className={mainClasses}>{main}</span>
      )}
      {removable && (
        <ChipRemoveButton
          color={fill === 'accent' ? 'accent' : 'empty'}
          aria-label={`Remove ${label}`}
          onClick={(e) => {
            // Keep the click from reaching a parent, e.g. a picker that opens on click.
            e.stopPropagation()
            onRemove?.()
          }}
        />
      )}
    </span>
  )
}

export { Chip }
export type { ChipTone, ChipProps, ChipFill, ChipState }
