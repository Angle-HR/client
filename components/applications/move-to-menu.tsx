'use client'

import { useEffect, useRef, type ReactElement } from 'react'

import { StageAvatar } from '@/components/applications/stage-chip'
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
        iconSuffix={<DashboardIcon name="chev-down-solid" size={14} />}
        onClick={() => onOpenChange(!open)}
      >
        Move to
      </Button>
      {open ? (
        <ul
          role="menu"
          className="absolute top-full right-0 z-10 mt-[4px] flex w-[190px] flex-col rounded-lg-10 bg-bg-primary px-[1px] pt-[1px] pb-[5px] shadow-md outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium"
        >
          <li role="none" className="flex h-[29px] items-center gap-[2px] px-[2px]">
            <button
              type="button"
              aria-label="Back"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-[24px] w-[24px] items-center justify-center rounded-sm-7 text-text-secondary hover:bg-bg-transparent-light"
            >
              <DashboardIcon name="chevron-left-solid" size={14} />
            </button>
            <span className="text-body-xs leading-19_2 font-medium text-text-secondary">
              Move to stage
            </span>
          </li>
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
                className="flex h-[24px] w-full items-center gap-[6px] rounded-sm-7 px-[6px] text-left text-body-s leading-19_5 text-text-secondary transition-colors hover:bg-bg-transparent-light disabled:cursor-not-allowed disabled:text-text-tertiary disabled:hover:bg-transparent"
              >
                <StageAvatar stage={option.stage} menu />
                {option.label}
              </button>
            </li>
          ))}
          {/* No server stages to add, so this is drawn only. */}
          <li role="none">
            <button
              type="button"
              role="menuitem"
              disabled
              className="flex h-[24px] w-full items-center gap-[6px] rounded-sm-7 px-[6px] text-left text-body-s leading-19_5 text-text-tertiary"
            >
              <DashboardIcon name="plus-solid" size={13} />
              Add new stage
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}

export { MoveToMenu }
export type { MoveToMenuProps, MoveToOption }
