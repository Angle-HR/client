'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useRef, useState } from 'react'

import { exportJobs, statusChangeMessage, toIsoDate } from '@/lib/jobs/actions'
import { assignedMessage } from '@/lib/jobs/people'
import { useJobs } from '@/lib/queries'
import { queryKeys } from '@/lib/query-keys'

import type { ExportFormat, ExportScope } from '@/components/jobs/job-modals'
import type { JobToastState } from '@/components/jobs/job-toast'
import type { Job, JobManager, JobStatus } from '@/lib/jobs/types'

/**
 * Everything the jobs page can do to jobs, with its feedback.
 *
 * There is no jobs API yet, so each action edits the cached list and offers
 * Undo by restoring the list as it was. When the endpoints land, these become
 * mutations and the snapshots become optimistic-update rollbacks.
 */

type JobDialog =
  | { type: 'status'; jobIds: string[]; status: Exclude<JobStatus, 'open'> }
  | { type: 'delete'; jobIds: string[] }
  | { type: 'closing-date'; jobIds: string[] }
  | { type: 'export'; jobIds: string[]; single?: boolean }
  | { type: 'assign'; jobIds: string[] }

function download(filename: string, contents: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: mimeType }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const todayIso = () => toIsoDate(new Date())

function useJobsController() {
  const jobsQuery = useJobs()
  const queryClient = useQueryClient()
  const jobs = useMemo(() => jobsQuery.data ?? [], [jobsQuery.data])

  const [dialog, setDialog] = useState<JobDialog | null>(null)
  const [toast, setToast] = useState<JobToastState | null>(null)
  const toastId = useRef(0)

  const notify = useCallback((next: Omit<JobToastState, 'id'>) => {
    toastId.current += 1
    setToast({ ...next, id: toastId.current })
  }, [])

  /** Applies an edit to the cached list and returns a function that undoes it. */
  const edit = useCallback(
    (update: (current: Job[]) => Job[]) => {
      const before = queryClient.getQueryData<Job[]>(queryKeys.jobs) ?? []
      queryClient.setQueryData<Job[]>(queryKeys.jobs, update(before))
      return () => queryClient.setQueryData<Job[]>(queryKeys.jobs, before)
    },
    [queryClient],
  )

  const applyStatus = useCallback(
    (jobIds: string[], status: JobStatus) => {
      const ids = new Set(jobIds)
      const undo = edit((current) =>
        current.map((job) =>
          ids.has(job.id) ? { ...job, status, lastModifiedAt: todayIso() } : job,
        ),
      )
      notify({
        kind: 'undoable',
        message: statusChangeMessage(status, jobIds.length),
        onUndo: undo,
      })
    },
    [edit, notify],
  )

  /** Reopening happens straight away; every other status asks first. */
  const requestStatus = useCallback(
    (jobIds: string[], status: JobStatus) => {
      const changing = jobIds.filter((id) => jobs.find((job) => job.id === id)?.status !== status)
      if (changing.length === 0) return
      if (status === 'open') applyStatus(changing, status)
      else setDialog({ type: 'status', jobIds: changing, status })
    },
    [applyStatus, jobs],
  )

  const duplicate = useCallback(
    (jobIds: string[]) => {
      const ids = new Set(jobIds)
      const undo = edit((current) => {
        const copies = current
          .filter((job) => ids.has(job.id))
          .map((job, index) => ({
            ...job,
            id: `${job.id}-copy-${Date.now()}-${index}`,
            // A copy starts unpublished with no applicants of its own.
            status: 'draft' as const,
            totalApplicants: 0,
            newApplicants: 0,
            closingDate: undefined,
          }))
        return [...current, ...copies]
      })
      const count = jobIds.length
      notify({
        kind: 'undoable',
        message: `${count} ${count === 1 ? 'Job has' : 'Jobs have'} been duplicated`,
        onUndo: undo,
      })
    },
    [edit, notify],
  )

  const copyLinks = useCallback(
    async (jobIds: string[]) => {
      const links = jobIds.map((id) => `${window.location.origin}/jobs/${id}`)
      try {
        await navigator.clipboard.writeText(links.join('\n'))
        notify({
          kind: 'undoable',
          message:
            jobIds.length === 1
              ? 'Link copied to your clipboard'
              : `${jobIds.length} links copied to your clipboard`,
          // The design offers Undo here; undoing a copy means emptying the clipboard.
          onUndo: () => void navigator.clipboard.writeText(''),
        })
      } catch {
        notify({ kind: 'done', message: 'Could not copy the link' })
      }
    },
    [notify],
  )

  const confirmDialog = {
    status: () => {
      if (dialog?.type !== 'status') return
      applyStatus(dialog.jobIds, dialog.status)
      setDialog(null)
    },
    delete: () => {
      if (dialog?.type !== 'delete') return
      const ids = new Set(dialog.jobIds)
      edit((current) => current.filter((job) => !ids.has(job.id)))
      notify({
        kind: 'done',
        message: ids.size === 1 ? 'Job permanently deleted' : 'Jobs permanently deleted',
      })
      setDialog(null)
      return dialog.jobIds
    },
    closingDate: (isoDate: string) => {
      if (dialog?.type !== 'closing-date') return
      const ids = new Set(dialog.jobIds)
      // Only a published listing has a closing date to move.
      const undo = edit((current) =>
        current.map((job) =>
          ids.has(job.id) && job.status === 'open' ? { ...job, closingDate: isoDate } : job,
        ),
      )
      notify({ kind: 'undoable', message: 'Job closing date updated', onUndo: undo })
      setDialog(null)
    },
    assign: (people: JobManager[]) => {
      if (dialog?.type !== 'assign' || people.length === 0) return
      const ids = new Set(dialog.jobIds)
      const assigned = jobs.filter((job) => ids.has(job.id))
      edit((current) =>
        current.map((job) => (ids.has(job.id) ? { ...job, managers: people } : job)),
      )
      notify({
        kind: 'done',
        message: 'Job assigned',
        detail: assignedMessage(assigned, people),
      })
      setDialog(null)
    },
    export: (scope: ExportScope, format: ExportFormat) => {
      if (dialog?.type !== 'export') return
      const ids = new Set(dialog.jobIds)
      const chosen = scope === 'all' ? jobs : jobs.filter((job) => ids.has(job.id))
      setDialog(null)
      // The file is built in the browser, so the wait is only long enough for
      // the "Exporting" state the design shows to be seen.
      notify({ kind: 'progress', message: 'Exporting selection' })
      window.setTimeout(() => {
        download(
          `jobs.${format}`,
          exportJobs(chosen, format),
          format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json',
        )
        notify({ kind: 'done', message: 'Selection exported' })
      }, 900)
    },
  }

  return {
    jobsQuery,
    jobs,
    dialog,
    toast,
    notify,
    openDialog: setDialog,
    closeDialog: () => setDialog(null),
    dismissToast: useCallback(() => setToast(null), []),
    requestStatus,
    applyStatus,
    duplicate,
    copyLinks,
    confirmDialog,
  }
}

export { useJobsController }
export type { JobDialog }
