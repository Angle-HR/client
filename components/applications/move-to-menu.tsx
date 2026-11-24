'use client'

import { useEffect, useRef, type ReactElement } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Button } from '@/components/ui'

import type { DesignStage } from '@/lib/applications/stages'

interface MoveToOption {
  stage: DesignStage
  label: string
  enabled: boolean
}

interface MoveToMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  options: MoveToOption[]
  onPick: (stage: DesignStage) => void
  disabled: boolean
}

/** The Move to menu: every design stage, with the ones the server cannot reach disabled. */
function MoveToMenu({
  open,
  onOpenChange,
  options,
  onPick,
  disabled,
}: MoveToMenuProps): ReactElement {
  const wrapper = useRef<HTMLDivElement>(null)

  // A press outside the menu closes it.
  useEffect(() => {
    if (!open) return
    function handlePress(event: MouseEvent): void {
      if (!wrapper.current?.contains(event.target as Node)) onOpenChange(false)
    }
    document.addEventListener('mousedown', handlePress)
    return () => document.removeEventListener('mousedown', handlePress)
  }, [open, onOpenChange])

  return (
    <div ref={wrapper} className="relative">
      <Button
        variant="primary"
        accent="blue"
        size="sm"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        iconSuffix={<DashboardIcon name="chev-down-solid" size={10} />}
        onClick={() => onOpenChange(!open)}
      >
        Move to
      </Button>
      {open ? (
        <ul
          role="menu"
          className="absolute top-full right-0 z-10 mt-[4px] flex w-[180px] flex-col gap-[2px] rounded-lg-10 bg-bg-primary p-[4px] shadow-md outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium"
        >
          {options.map((option) => (
            <li key={option.stage} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={!option.enabled}
                onClick={() => {
                  onOpenChange(false)
                  onPick(option.stage)
                }}
                className="flex w-full items-center rounded-sm-7 px-[8px] py-[6px] text-left text-body-xs leading-19_2 text-text-primary transition-colors hover:bg-bg-transparent-light disabled:cursor-not-allowed disabled:text-text-tertiary disabled:hover:bg-transparent"
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export { MoveToMenu }
export type { MoveToMenuProps, MoveToOption }
