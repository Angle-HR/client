'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import { ApplicationFormBuilder } from '@/components/jobs/create/application-form-builder'
import { JobFlowHeader } from '@/components/jobs/create/job-flow-header'

/**
 * The "Application form" step of job creation. Figma: "Job Creation/Application
 * form" section 9270:393564.
 *
 * `?job=<id>` is the job being set up; Back returns to its job details. The
 * right-hand phone preview is only a placeholder until the preview is built.
 */
function ApplicationFormPage() {
  const params = useSearchParams()
  const jobId = params.get('job')
  const backHref = jobId
    ? `/dashboard/jobs/new?job=${encodeURIComponent(jobId)}`
    : '/dashboard/jobs/new'

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* No save or preview behind these buttons yet, so the header has no handler. */}
      <JobFlowHeader current="Application form" mode="create" />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full">
          <div className="w-[640px] max-w-full shrink-0 p-[40px]">
            <ApplicationFormBuilder backHref={backHref} />
          </div>
          {/* Placeholder for the phone preview, which is built in a later step. */}
          <aside
            aria-hidden="true"
            className="ml-[95px] hidden w-[283px] shrink-0 pt-[80px] xl:block"
          >
            <div className="h-[612px] rounded-[32px] border-[0.5px] border-border-transparent-medium" />
          </aside>
        </div>
      </div>
    </div>
  )
}

/** `useSearchParams` needs a Suspense boundary to keep the route statically renderable. */
function ApplicationFormRoute() {
  return (
    <Suspense fallback={null}>
      <ApplicationFormPage />
    </Suspense>
  )
}

export default ApplicationFormRoute
