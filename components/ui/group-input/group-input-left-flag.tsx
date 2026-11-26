'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'

import { CountryFlag } from '../avatar/country-flag'
import { MaskIcon } from '../icons/mask-icon'

import { useGroupInput } from './group-input-context'
import { LEFT_PANEL, PANEL_BASE, PANEL_FOCUS } from './group-input-panel'

import type { GroupInputSize } from './group-input.figma'

type GroupInputLeftFlagSize = GroupInputSize

interface GroupInputLeftFlagProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  /** ISO country code, e.g. `NG`. */
  countryCode: string
  /** The country's name, read out in the button's label. Defaults to the code. */
  countryName?: string
  /** Inside a GroupInput, defaults to the group's size. */
  size?: GroupInputLeftFlagSize
  'aria-expanded'?: boolean
  'aria-haspopup'?: 'listbox' | 'true' | 'dialog' | 'menu' | 'grid' | 'tree'
}

/** A country picker before the field. Figma: .Subcomponents/Group-input/Left/Flag. */
const GroupInputLeftFlag = forwardRef<HTMLButtonElement, GroupInputLeftFlagProps>(
  function GroupInputLeftFlag(
    { countryCode, countryName, size: sizeProp, className = '', disabled, ...props },
    ref,
  ) {
    const group = useGroupInput()
    const size = sizeProp ?? group?.size ?? 'md'
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled ?? group?.disabled}
        aria-label={`Country: ${countryName ?? countryCode}`}
        className={`${PANEL_BASE} ${LEFT_PANEL[size]} ${PANEL_FOCUS} ${className}`}
        {...props}
      >
        {/* Decorative: the button's label already names the country. */}
        <CountryFlag
          code={countryCode}
          width={18}
          height={12}
          decorative
          className="rounded-xs-2"
        />
        <MaskIcon src="/dashboard/icons/chevron-down-outline.svg" size={12} />
      </button>
    )
  },
)

export { GroupInputLeftFlag }
export type { GroupInputLeftFlagProps, GroupInputLeftFlagSize }
