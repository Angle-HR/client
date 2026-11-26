'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'

import { MaskIcon } from '../icons/mask-icon'

import { useGroupInput } from './group-input-context'
import { CURRENCY_TEXT, LEFT_PANEL, PANEL_BASE, PANEL_FOCUS } from './group-input-panel'

import type { GroupInputSize } from './group-input.figma'

type GroupInputLeftCurrencySize = GroupInputSize

interface GroupInputLeftCurrencyProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  /** The currency code shown, e.g. `USD`. */
  value: string
  /** Inside a GroupInput, defaults to the group's size. */
  size?: GroupInputLeftCurrencySize
  'aria-expanded'?: boolean
  'aria-haspopup'?: 'listbox' | 'true' | 'dialog' | 'menu' | 'grid' | 'tree'
}

/** A currency picker before the field. Figma: .Subcomponents/Group-input/Left/Currency. */
const GroupInputLeftCurrency = forwardRef<HTMLButtonElement, GroupInputLeftCurrencyProps>(
  function GroupInputLeftCurrency(
    { value, size: sizeProp, className = '', disabled, ...props },
    ref,
  ) {
    const group = useGroupInput()
    const size = sizeProp ?? group?.size ?? 'md'
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled ?? group?.disabled}
        aria-label={`Currency: ${value}`}
        className={`${PANEL_BASE} ${LEFT_PANEL[size]} ${CURRENCY_TEXT[size]} ${PANEL_FOCUS} ${className}`}
        {...props}
      >
        {value}
        <MaskIcon src="/dashboard/icons/chevron-down-outline.svg" size={12} />
      </button>
    )
  },
)

export { GroupInputLeftCurrency }
export type { GroupInputLeftCurrencyProps, GroupInputLeftCurrencySize }
