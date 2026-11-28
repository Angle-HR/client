import type { ApplicationStatus } from './api'
import type { PipelineStage, StageKind } from './pipeline'

/**
 * The stages are the job's own (`GET /jobs/{id}/stages`): the six every job is
 * seeded with, plus any a company added. A tab, a chip and a Move to option
 * each stand for one of them, by id. Only the glyphs belong to the kind.
 */

/** The tabs of the candidates table: every applicant, or the stage with this id. */
type StageTab = string

const ALL_TAB = 'all'

interface StageTabItem {
  key: StageTab
  label: string
  count: number
}

/**
 * Tab order in the candidates table: All Applicants, then the stages in their
 * order. The design has no Applied tab: what waits there shows under All.
 */
function stageTabs(
  stages: ReadonlyArray<PipelineStage>,
  stageCounts: Record<string, number>,
  total: number,
): StageTabItem[] {
  return [
    { key: ALL_TAB, label: 'All Applicants', count: total },
    ...stages
      .filter((stage) => stage.kind !== 'applied')
      .map((stage) => ({
        key: stage.id,
        label: stage.name,
        count: stageCounts[stage.id] ?? stage.count,
      })),
  ]
}

/** The stage id a tab filters the list by, or undefined for All. */
function stageForTab(tab: StageTab): string | undefined {
  return tab === ALL_TAB ? undefined : tab
}

/** The stage with this id, or undefined while stages load or after one is removed. */
function findStage(
  stages: ReadonlyArray<PipelineStage>,
  id: string | undefined,
): PipelineStage | undefined {
  return id ? stages.find((stage) => stage.id === id) : undefined
}

/** The stage of a kind. Every job has Applied, Hired and Disqualified. */
function stageOfKind(
  stages: ReadonlyArray<PipelineStage>,
  kind: StageKind,
): PipelineStage | undefined {
  return stages.find((stage) => stage.kind === kind)
}

/** Whether a stage of this kind ends the application. */
function isFinalKind(kind: StageKind): boolean {
  return kind === 'hired' || kind === 'disqualified'
}

type DisqualifyPlan = { kind: 'review' } | { kind: 'move' }

/** The candidate a stage decision is made for: what the disqualify plan and the toasts need. */
interface CandidateTarget {
  id: string
  name: string
  status: ApplicationStatus
  stageId: string
  /** Only the person who opened a flagged application can decide it. */
  canDecide: boolean
}

/**
 * How an application is disqualified, or null when it cannot be. A flagged one
 * is rejected through its review, and only by the person who opened it last;
 * one still open moves to Disqualified; a decided one never moves.
 */
function disqualifyPlan(status: ApplicationStatus, canDecide: boolean): DisqualifyPlan | null {
  if (status === 'flagged') return canDecide ? { kind: 'review' } : null
  if (status === 'received' || status === 'in_review') return { kind: 'move' }
  return null
}

/** Whether an application at this status can be moved to another stage. */
function canMove(status: ApplicationStatus): boolean {
  return status === 'received' || status === 'in_review'
}

interface MoveOption {
  stage: PipelineStage
  enabled: boolean
}

/**
 * The Move to options for an application: every stage but Applied, in order.
 * A stage is disabled when the person may not decide, when the application has
 * ended or waits on its review, and for the stage it is already in.
 */
function moveOptionsFor(
  stages: ReadonlyArray<PipelineStage>,
  target: Pick<CandidateTarget, 'status' | 'stageId'>,
  canDecide: boolean,
): MoveOption[] {
  return stages
    .filter((stage) => stage.kind !== 'applied')
    .map((stage) => ({
      stage,
      enabled:
        canDecide &&
        stage.id !== target.stageId &&
        (stage.kind === 'disqualified'
          ? disqualifyPlan(target.status, true) !== null
          : canMove(target.status)),
    }))
}

/**
 * The note the server keeps beside a disqualification. The reason is its own
 * field now, so this is only the note's text.
 */
function disqualifyNote(note: string): string {
  return note.trim()
}

/** The first word of a candidate's name, for the toasts ("Liam Disqualified"). */
function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? ''
}

export {
  ALL_TAB,
  canMove,
  disqualifyNote,
  disqualifyPlan,
  findStage,
  firstName,
  isFinalKind,
  moveOptionsFor,
  stageForTab,
  stageOfKind,
  stageTabs,
}
export type { CandidateTarget, DisqualifyPlan, MoveOption, StageTab, StageTabItem }
