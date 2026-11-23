import type { ApplicationStatus } from './api'

/**
 * The stages the candidates design draws. Only some have a server status:
 * Shortlisted, Interview and Offer have none yet, so nothing is filed under
 * them. Change `STATUS_STAGE`, `STAGE_STATUSES` and `STAGE_TRANSITIONS` when
 * the backend gains stages.
 */
type DesignStage = 'applied' | 'shortlisted' | 'interview' | 'offer' | 'hired' | 'disqualified'

/** The tabs of the candidates table: every applicant, or one stage. */
type StageTab = 'all' | DesignStage

interface StageOption {
  key: DesignStage
  label: string
}

/** Order of the stages in the Move to menu. */
const DESIGN_STAGES: ReadonlyArray<StageOption> = [
  { key: 'applied', label: 'Applied' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'hired', label: 'Hired' },
  { key: 'disqualified', label: 'Disqualified' },
]

/** Tab order in the candidates table. The design has no Applied tab. */
const STAGE_TABS: ReadonlyArray<{ key: StageTab; label: string }> = [
  { key: 'all', label: 'All Applicants' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'hired', label: 'Hired' },
  { key: 'disqualified', label: 'Disqualified' },
]

/**
 * The stage an application shows in its Stage cell. `in_review` and `flagged`
 * are still waiting for a decision, which is what Applied means in the design,
 * so they show Applied. `withdrawn` has no drawn stage and shows nothing.
 */
const STATUS_STAGE: Record<ApplicationStatus, DesignStage | null> = {
  received: 'applied',
  in_review: 'applied',
  flagged: 'applied',
  hired: 'hired',
  rejected: 'disqualified',
  withdrawn: null,
}

/** The server statuses a tab filters by. `all` has no filter. */
const STAGE_STATUSES: Record<DesignStage, ApplicationStatus[]> = {
  applied: ['received'],
  shortlisted: [],
  interview: [],
  offer: [],
  hired: ['hired'],
  disqualified: ['rejected'],
}

/**
 * The moves the Move to menu can make: the status a stage moves to, and the
 * statuses it can move from. Only real server transitions are listed; every
 * other stage is shown disabled.
 */
const STAGE_TRANSITIONS: Partial<
  Record<DesignStage, { target: ApplicationStatus; from: ApplicationStatus[] }>
> = {
  hired: { target: 'hired', from: ['in_review'] },
}

type DisqualifyPlan = { kind: 'review' } | { kind: 'status'; steps: ApplicationStatus[] }

function stageOfStatus(status: ApplicationStatus): DesignStage | null {
  return STATUS_STAGE[status]
}

function stageLabel(stage: DesignStage): string {
  return DESIGN_STAGES.find((option) => option.key === stage)?.label ?? ''
}

/** How many applicants a tab counts, from the job-wide counts the list returns. */
function tabCount(tab: StageTab, counts: Record<string, number>): number {
  const statuses =
    tab === 'all' ? (Object.keys(counts) as ApplicationStatus[]) : STAGE_STATUSES[tab]
  return statuses.reduce((sum, status) => sum + (counts[status] ?? 0), 0)
}

/** The server statuses a tab's list is filtered to, or undefined for All. */
function statusesForTab(tab: StageTab): ApplicationStatus[] | undefined {
  return tab === 'all' ? undefined : STAGE_STATUSES[tab]
}

/** Whether the Move to menu can take an application at this status to this stage. */
function canMoveTo(stage: DesignStage, status: ApplicationStatus): boolean {
  return STAGE_TRANSITIONS[stage]?.from.includes(status) ?? false
}

/** The server status a stage moves an application to, or null when no move exists. */
function moveTarget(stage: DesignStage): ApplicationStatus | null {
  return STAGE_TRANSITIONS[stage]?.target ?? null
}

/**
 * How an application is disqualified (rejected), or null when it cannot be.
 * A received one must go to in review first; a flagged one is rejected through
 * its review, and only by the person who opened it last.
 */
function disqualifyPlan(status: ApplicationStatus, canDecide: boolean): DisqualifyPlan | null {
  if (status === 'flagged') return canDecide ? { kind: 'review' } : null
  if (status === 'received') return { kind: 'status', steps: ['in_review', 'rejected'] }
  if (status === 'in_review') return { kind: 'status', steps: ['rejected'] }
  return null
}

export {
  DESIGN_STAGES,
  STAGE_TABS,
  canMoveTo,
  disqualifyPlan,
  moveTarget,
  stageLabel,
  stageOfStatus,
  statusesForTab,
  tabCount,
}
export type { DesignStage, DisqualifyPlan, StageTab }
