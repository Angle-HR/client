'use client'

import { type ReactElement } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'

import type { StageKind } from '@/lib/applications/pipeline'

type StageTint = 'grey' | 'aqua' | 'purple' | 'blue' | 'green' | 'red'

/** Each tint's avatar and glyph colours, as the design's avatar colour variants. Literal classes, so Tailwind sees them. */
const TINT_CLASS: Record<StageTint, string> = {
  grey: 'bg-bg-avatar-grey text-text-avatar-grey',
  aqua: 'bg-bg-avatar-aqua text-text-avatar-aqua',
  purple: 'bg-bg-avatar-purple text-text-avatar-purple',
  blue: 'bg-bg-avatar-blue text-text-avatar-blue',
  green: 'bg-bg-avatar-green text-text-avatar-green',
  red: 'bg-bg-avatar-red text-text-avatar-red',
}

/** A stage's glyph in the Stage chip (Figma 🟧 Chips/job-stage) and in the Move to menus. */
interface StageGlyph {
  tint: StageTint
  /** The icon in the table and panel chips. */
  icon: string
  /** The icon in the Move to menus, where Interview has its own glyph. */
  menuIcon: string
}

const STAGE_GLYPH: Record<StageKind, StageGlyph> = {
  applied: { tint: 'grey', icon: 'document-check-solid', menuIcon: 'document-check-solid' },
  shortlisted: { tint: 'purple', icon: 'bolt-solid', menuIcon: 'bolt-solid' },
  interview: { tint: 'aqua', icon: 'calendar-solid', menuIcon: 'phone-arrow-down-left-solid' },
  offer: { tint: 'blue', icon: 'briefcase-solid', menuIcon: 'briefcase-solid' },
  hired: { tint: 'green', icon: 'check-circle-solid', menuIcon: 'check-circle-solid' },
  disqualified: { tint: 'red', icon: 'minus-circle-solid', menuIcon: 'minus-circle-solid' },
  custom: { tint: 'grey', icon: 'flag-solid', menuIcon: 'flag-solid' },
}

/** The 14px tinted square with a 10px glyph that marks a stage. */
function StageAvatar({ kind, menu = false }: { kind: StageKind; menu?: boolean }): ReactElement {
  const glyph = STAGE_GLYPH[kind]
  return (
    <span
      className={`inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-xs-4 ${TINT_CLASS[glyph.tint]}`}
    >
      <DashboardIcon name={menu ? glyph.menuIcon : glyph.icon} size={10} />
    </span>
  )
}

interface StageChipProps {
  kind: StageKind
  /** The stage's own name: companies reword them. */
  name: string
}

/** A stage as the Stage column and the panel draw it: its tinted glyph, then its name. */
function StageChip({ kind, name }: StageChipProps): ReactElement {
  return (
    <span className="inline-flex min-w-0 items-center gap-[4px] text-body-s text-text-secondary">
      <StageAvatar kind={kind} />
      <span className="truncate">{name}</span>
    </span>
  )
}

export { STAGE_GLYPH, StageAvatar, StageChip }
export type { StageChipProps }
