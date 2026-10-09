'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useRef, useState } from 'react'

import { statusChangeMessage } from '@/lib/jobs/actions'
import { BULK_ACTIONS, apiMessage, transitionFor } from '@/lib/jobs/api'
import { assignedMessage } from '@/lib/jobs/people'
import { useJobs } from '@/lib/queries'
import { queryKeys } from '@/lib/query-keys'
import { requests } from '@/lib/requests'

import type { ExportFormat, ExportScope } from '@/components/jobs/job-modals'
import type { JobToastState } from '@/components/jobs/job-toast'
import type { Job, JobManager, JobStatus } from '@/lib/jobs/types'

/**
 * Everything the jobs page can do to jobs, with its feedback.
 *
 * Each action calls the hiring API, then reloads the lists so the page shows
 * what the server now holds. Undo is a second call that reverses the first.
 * Where the API has a bulk endpoint it is used; everything else goes one job
 * at a time, and the jobs that could not be changed are reported.
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

/** Runs one call per item and sorts the items into those that worked and those that did not. */
async function each<T>(
  items: T[],
  call: (item: T) => Promise<unknown>,
): Promise<{ done: T[]; failed: { item: T; error: unknown }[] }> {
  const results = await Promise.allSettled(items.map(call))
  const done: T[] = []
  const failed: { item: T; error: unknown }[] = []
  results.forEach((result, index) => {
    const item = items[index] as T
    if (result.status === 'fulfilled') done.push(item)
    else failed.push({ item, error: result.reason })
  })
  return { done, failed }
}

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many)

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

  const reload = useCallback(
    () => queryClient.invalidateQueries({ queryKey: queryKeys.jobs }),
    [queryClient],
  )

  /** Says what could not be done, in the API's own words. */
  const reportFailures = useCallback(
    (failed: { error?: unknown; reason?: string }[]) => {
      const first = failed[0]
      if (!first) return
      notify({
        kind: 'error',
        message: plural(
          failed.length,
          '1 job could not be changed',
          `${failed.length} jobs could not be changed`,
        ),
        detail: first.reason ?? apiMessage(first.error),
      })
    },
    [notify],
  )

  /**
   * Moves jobs to a status and reports back which moved, with the status each
   * had before so the change can be undone.
   */
  const moveJobs = useCallback(async (targets: Job[], status: JobStatus) => {
    const moved: { job: Job; before: JobStatus }[] = []
    const failed: { error?: unknown; reason?: string }[] = []
    const bulkAction = BULK_ACTIONS[status]

    if (bulkAction && targets.length > 1) {
      try {
        const result = await requests.bulkJobs(
          bulkAction,
          targets.map((job) => job.id),
        )
        const done = new Set((result.done ?? []).map((item) => item.id))
        for (const job of targets) if (done.has(job.id)) moved.push({ job, before: job.status })
        for (const skipped of result.skipped ?? []) failed.push({ reason: skipped.reason })
      } catch (error) {
        failed.push({ error })
      }
      return { moved, failed }
    }

    const result = await each(targets, (job) => {
      const action = transitionFor(job.status, status)
      if (!action) return Promise.reject(new Error('No such change'))
      return requests.transitionJob(job.id, action, job.revision)
    })
    for (const job of result.done) moved.push({ job, before: job.status })
    failed.push(...result.failed)
    return { moved, failed }
  }, [])

  const applyStatus = useCallback(
    async (jobIds: string[], status: JobStatus) => {
      const ids = new Set(jobIds)
      const targets = jobs.filter((job) => ids.has(job.id))
      const { moved, failed } = await moveJobs(targets, status)
      await reload()

      if (moved.length > 0) {
        notify({
          kind: 'undoable',
          message: statusChangeMessage(status, moved.length),
          onUndo: () => {
            // Each job goes back to the status it had; the revision has moved
            // on, so it is left for the server to check.
            void each(moved, ({ job, before }) => {
              const action = transitionFor(status, before)
              return action ? requests.transitionJob(job.id, action) : Promise.resolve()
            }).then(({ failed: notUndone }) => {
              reportFailures(notUndone)
              return reload()
            })
          },
        })
      }
      if (failed.length > 0 && moved.length === 0) reportFailures(failed)
      else if (failed.length > 0) window.setTimeout(() => reportFailures(failed), 0)
    },
    [jobs, moveJobs, notify, reload, reportFailures],
  )

  /** Reopening happens straight away; every other status asks first. */
  const requestStatus = useCallback(
    (jobIds: string[], status: JobStatus) => {
      const changing = jobIds.filter((id) => jobs.find((job) => job.id === id)?.status !== status)
      if (changing.length === 0) return
      if (status === 'open') void applyStatus(changing, status)
      else setDialog({ type: 'status', jobIds: changing, status })
    },
    [applyStatus, jobs],
  )

  const duplicate = useCallback(
    async (jobIds: string[]) => {
      const copies: string[] = []
      const { failed } = await each(jobIds, async (id) => {
        copies.push(await requests.duplicateJob(id))
      })
      await reload()

      if (copies.length > 0) {
        notify({
          kind: 'undoable',
          message: `${copies.length} ${plural(copies.length, 'Job has', 'Jobs have')} been duplicated`,
          // A copy is a draft, and drafts can be deleted.
          onUndo: () => {
            void each(copies, (id) => requests.deleteJob(id)).then(({ failed: notUndone }) => {
              reportFailures(notUndone)
              return reload()
            })
          },
        })
      }
      if (failed.length > 0) reportFailures(failed)
    },
    [notify, reload, reportFailures],
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

  const selected = (jobIds: string[]) => {
    const ids = new Set(jobIds)
    return jobs.filter((job) => ids.has(job.id))
  }

  const confirmDialog = {
    status: () => {
      if (dialog?.type !== 'status') return
      void applyStatus(dialog.jobIds, dialog.status)
      setDialog(null)
    },
    delete: () => {
      if (dialog?.type !== 'delete') return
      const targets = selected(dialog.jobIds)
      setDialog(null)
      // The API deletes drafts only and refuses anything else, which is
      // reported back rather than hidden.
      void each(targets, (job) => requests.deleteJob(job.id, job.revision)).then(
        async ({ done, failed }) => {
          await reload()
          if (done.length > 0) {
            notify({
              kind: 'done',
              message: plural(done.length, 'Job permanently deleted', 'Jobs permanently deleted'),
            })
          }
          if (failed.length > 0) reportFailures(failed)
        },
      )
      return dialog.jobIds
    },
    closingDate: (isoDate: string) => {
      if (dialog?.type !== 'closing-date') return
      const targets = selected(dialog.jobIds)
      setDialog(null)
      void each(targets, (job) => requests.setJobClosingDate(job.id, isoDate, job.revision)).then(
        async ({ done, failed }) => {
          await reload()
          if (done.length > 0) {
            notify({
              kind: 'undoable',
              message: 'Job closing date updated',
              // Back to the date each job had; an empty one clears it.
              onUndo: () => {
                void each(done, (job) =>
                  requests.setJobClosingDate(job.id, job.closingDate ?? ''),
                ).then(({ failed: notUndone }) => {
                  reportFailures(notUndone)
                  return reload()
                })
              },
            })
          }
          if (failed.length > 0) reportFailures(failed)
        },
      )
    },
    assign: (people: JobManager[]) => {
      if (dialog?.type !== 'assign' || people.length === 0) return
      const targets = selected(dialog.jobIds)
      setDialog(null)
      void each(targets, (job) =>
        requests.setJobMembers(
          job.id,
          people
            // The creator already has access; the API refuses them in the list.
            .filter((person) => person.id && person.id !== job.createdBy.id)
            .map((person) => ({ userId: person.id as string, role: 'hiring_manager' as const })),
          job.revision,
        ),
      ).then(async ({ done, failed }) => {
        await reload()
        if (done.length > 0) {
          notify({ kind: 'done', message: 'Job assigned', detail: assignedMessage(done, people) })
        }
        if (failed.length > 0) reportFailures(failed)
      })
    },
    export: (scope: ExportScope, format: ExportFormat) => {
      if (dialog?.type !== 'export') return
      const ids = scope === 'all' ? undefined : dialog.jobIds
      setDialog(null)
      notify({ kind: 'progress', message: 'Exporting selection' })
      void requests.exportJobs({ ids, format }).then(
        (file) => {
          download(
            `jobs.${format}`,
            file,
            format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json',
          )
          notify({ kind: 'done', message: 'Selection exported' })
        },
        (error: unknown) =>
          notify({ kind: 'error', message: 'Export failed', detail: apiMessage(error) }),
      )
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
