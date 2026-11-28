'use client'

import { useState, type ReactElement } from 'react'

import { MoveToMenu } from '@/components/applications/move-to-menu'
import { TextButton } from '@/components/ui'

import type { MoveToOption } from '@/components/applications/move-to-menu'
import type { PipelineStage } from '@/lib/applications/pipeline'

interface BulkBarProps {
  count: number
  options: MoveToOption[]
  pending: boolean
  disabled: boolean
  onPick: (stage: PipelineStage) => void
  onClear: () => void
}

/** Shown while rows are ticked: how many, a Move to menu for all of them, and Clear. */
function BulkBar({
  count,
  options,
  pending,
  disabled,
  onPick,
  onClear,
}: BulkBarProps): ReactElement {
  const [open, setOpen] = useState(false)
  return (
    <div
      role="region"
      aria-label="Selected candidates"
      className="flex items-center gap-[12px] rounded-lg-10 bg-bg-transparent-lighter px-[12px] py-[6px]"
    >
      <p className="text-body-s leading-19_5 font-medium text-text-primary">{count} selected</p>
      <MoveToMenu
        open={open}
        onOpenChange={setOpen}
        options={options}
        onPick={onPick}
        disabled={disabled || pending}
      />
      <TextButton size="sm" onClick={onClear}>
        Clear
      </TextButton>
    </div>
  )
}

export { BulkBar }
export type { BulkBarProps }
