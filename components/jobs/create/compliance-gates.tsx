'use client'

import { Checkbox } from '@/components/ui'

import type { ApiGate } from '@/lib/compliance/api-types'
import type { ReactElement } from 'react'

interface ComplianceGatesProps {
  gates: readonly ApiGate[]
  /** The gate being saved, so its box is held while the request runs. */
  pendingId?: string
  onChange: (gate: ApiGate, confirmed: boolean) => void
}

/**
 * The gates the job's markets, special categories and screening raise. A gate
 * the server answers itself (`auto`) has nothing to tick; a confirmation made
 * against older wording (`stale`) no longer counts and is asked for again.
 */
function ComplianceGates({
  gates,
  pendingId,
  onChange,
}: ComplianceGatesProps): ReactElement | null {
  const asked = gates.filter((gate) => !gate.auto)
  if (asked.length === 0) return null

  return (
    <ul className="flex flex-col gap-[12px]">
      {asked.map((gate) => {
        const counts = Boolean(gate.confirmed) && !gate.stale
        return (
          <li key={gate.id} className="flex flex-col gap-[4px]">
            <Checkbox
              size="md"
              label={gate.requirement ?? ''}
              checked={counts}
              disabled={pendingId === gate.id}
              onChange={(event) => onChange(gate, event.target.checked)}
            />
            {gate.stale ? (
              <p className="pl-[28px] text-body-xs leading-19_2 text-yellow-4">
                The wording changed since you confirmed this. Confirm it again.
              </p>
            ) : null}
            {gate.detail ? (
              <p className="pl-[28px] text-body-xs leading-19_2 text-text-secondary">
                {gate.detail}
              </p>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export { ComplianceGates }
export type { ComplianceGatesProps }
