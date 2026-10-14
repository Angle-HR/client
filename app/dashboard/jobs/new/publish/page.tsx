'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState } from 'react'

import { JobFlowHeader } from '@/components/jobs/create/job-flow-header'
import { JobPublishedModal } from '@/components/jobs/create/job-published-modal'
import { JobTeamAvatars } from '@/components/jobs/create/job-team-avatars'
import { PublishStep } from '@/components/jobs/create/publish-step'
import { JobToast } from '@/components/jobs/job-toast'
import { apiMessage } from '@/lib/jobs/api'
import { toAccessMembers } from '@/lib/jobs/permissions-step'
import { canPublish, complianceView, headerTeam } from '@/lib/jobs/publish-step'
import { useJob, useJobMembers, usePeople, usePublishCheck } from '@/lib/queries'
import { queryKeys } from '@/lib/query-keys'
import { requests } from '@/lib/requests'

import type { JobToastState } from '@/components/jobs/job-toast'
import type { ApiJobMember } from '@/lib/jobs/api-types'
import type { JobManager } from '@/lib/jobs/types'

/**
 * The "Publish" step of job creation. Figma: "Publish Job" 9270:377288, with
 * the "Job published" modal 9270:377331.
 *
 * `?job=<id>` is the job being published. Publishing is the API's publish
 * call; a blocked job is refused and the check is read again to show why.
 */

const NO_PEOPLE: JobManager[] = []
const NO_MEMBERS: ApiJobMember[] = []

/**
 * The job's public link. The app has no base address for careers pages, so
 * the link is not built: the modal's link row stays empty and Copy stays off.
 */
const PUBLIC_JOB_URL: string | null = null

function PublishPage() {
  const router = useRouter()
  const params = useSearchParams()
  const queryClient = useQueryClient()
  const jobId = params.get('job')
  const backHref = jobId
    ? `/dashboard/jobs/new/permissions?job=${encodeURIComponent(jobId)}`
    : '/dashboard/jobs/new/permissions'

  const job = useJob(jobId).data
  const check = usePublishCheck(jobId).data
  const people = usePeople().data ?? NO_PEOPLE
  const teamRows = useJobMembers(jobId).data ?? NO_MEMBERS
  const creatorId = job?.created_by

  const creator = creatorId ? (people.find((person) => person.id === creatorId) ?? null) : null
  const members = useMemo(() => toAccessMembers(teamRows, creatorId), [teamRows, creatorId])
  const team = useMemo(() => headerTeam(creator, members), [creator, members])
  const view = useMemo(() => complianceView(check), [check])
  const publishable = Boolean(jobId) && canPublish(view)
  const jobTitle = job?.title?.trim() || 'Untitled job'

  // Local choices for the publishing settings: the API has no field for them yet.
  const [indexing, setIndexing] = useState(true)
  const [autoPublish, setAutoPublish] = useState(false)
  const [publishing, setPublishing] = useState(false)
  // The title of the job that was just published; null while the modal is closed.
  const [published, setPublished] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState<JobToastState | null>(null)

  async function publish() {
    if (!jobId || publishing || !publishable) return
    setPublishing(true)
    try {
      await requests.publishJob(jobId, job?.revision)
      await queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      await queryClient.invalidateQueries({ queryKey: queryKeys.job(jobId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.publishCheck(jobId) })
      setCopied(false)
      setPublished(jobTitle)
    } catch (error) {
      setToast({ id: Date.now(), kind: 'error', message: apiMessage(error) })
      // The refused publish left the job as it was: read the check again so the status shows why.
      await queryClient.invalidateQueries({ queryKey: queryKeys.publishCheck(jobId) })
    } finally {
      setPublishing(false)
    }
  }

  async function copyUrl() {
    if (!PUBLIC_JOB_URL) return
    try {
      await navigator.clipboard.writeText(PUBLIC_JOB_URL)
      setCopied(true)
    } catch (error) {
      setToast({ id: Date.now(), kind: 'error', message: apiMessage(error) })
    }
  }

  // Done, View job and the close button all leave for the job list: there is no job page yet.
  function leave() {
    router.push('/dashboard/jobs')
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Save as draft leaves the flow for the job list, as on the earlier steps. */}
      <JobFlowHeader
        current="Publish"
        mode="create"
        onSave={() => router.push('/dashboard/jobs?saved=draft')}
        avatars={<JobTeamAvatars team={team} />}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* A 560px column inside 40px padding, as 9270:377288 lays it out. */}
        <div className="w-[640px] max-w-full p-[40px]">
          <PublishStep
            backHref={backHref}
            view={view}
            publishDisabled={!publishable || publishing}
            indexing={indexing}
            onIndexingChange={setIndexing}
            autoPublish={autoPublish}
            onAutoPublishChange={setAutoPublish}
            onPublish={() => void publish()}
          />
        </div>
      </div>

      <JobPublishedModal
        open={published !== null}
        jobTitle={published ?? ''}
        url={PUBLIC_JOB_URL}
        copied={copied}
        onCopy={() => void copyUrl()}
        onDone={leave}
        onViewJob={leave}
        onClose={leave}
      />

      {toast ? <JobToast toast={toast} onDismiss={() => setToast(null)} /> : null}
    </div>
  )
}

/** `useSearchParams` needs a Suspense boundary to keep the route statically renderable. */
function PublishRoute() {
  return (
    <Suspense fallback={null}>
      <PublishPage />
    </Suspense>
  )
}

export default PublishRoute
