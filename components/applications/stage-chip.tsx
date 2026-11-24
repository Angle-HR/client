'use client'

import { type ReactElement } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { stageLabel, type DesignStage } from '@/lib/applications/stages'

/** Icons and colours are unverified: Figma is view-only, so the closest existing glyph is used. */
const STAGE_GLYPH: Record<DesignStage, { icon: string; iconClass: string }> = {
  applied: { icon: 'document-text-solid', iconClass: 'text-blue-4' },
  shortlisted: { icon: 'star-solid', iconClass: 'text-yellow-4' },
  interview: { icon: 'chat-bubble-left-right-solid', iconClass: 'text-purple-4' },
  offer: { icon: 'paper-airplane-solid', iconClass: 'text-orange-4' },
  hired: { icon: 'check-circle-solid', iconClass: 'text-green-4' },
  disqualified: { icon: 'x-circle-solid', iconClass: 'text-red-4' },
}

interface StageChipProps {
  stage: DesignStage
}

/** A stage as the Stage column and the panel draw it: its glyph, then its label. */
function StageChip({ stage }: StageChipProps): ReactElement {
  const glyph = STAGE_GLYPH[stage]
  return (
    <span className="inline-flex items-center gap-[4px] text-body-xs leading-19_2 font-medium text-text-primary">
      <span className={`inline-flex ${glyph.iconClass}`}>
        <DashboardIcon name={glyph.icon} size={11} />
      </span>
      {stageLabel(stage)}
    </span>
  )
}

export { STAGE_GLYPH, StageChip }
export type { StageChipProps }
