'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState } from 'react'

import { ApplicationFormBuilder } from '@/components/jobs/create/application-form-builder'
import { ApplicationPreview } from '@/components/jobs/create/application-preview'
import { JobFlowHeader } from '@/components/jobs/create/job-flow-header'
import { defaultApplicationForm } from '@/lib/jobs/application-form'
import { previewJobFrom } from '@/lib/jobs/application-preview'
import { useHiringMe, useJob } from '@/lib/queries'

import type { PreviewTab } from '@/components/jobs/create/application-preview'
import type { ApplicationForm } from '@/lib/jobs/application-form'

/**
 * The "Application form" step of job creation. Figma: "Job Creation/Application
 * form" section 9270:393564.
 *
 * `?job=<id>` is the job being set up; Back returns to its job details. The
 * form lives here so the right-hand phone preview shows the questions as they
 * are edited.
 */
function ApplicationFormPage() {
  const params = useSearchParams()
  const jobId = params.get('job')
  const backHref = jobId
    ? `/dashboard/jobs/new?job=${encodeURIComponent(jobId)}`
    : '/dashboard/jobs/new'
  const [form, setForm] = useState<ApplicationForm>(defaultApplicationForm)
  const [previewTab, setPreviewTab] = useState<PreviewTab>('application')
  const job = useJob(jobId).data
  const companyName = useHiringMe().data?.company_name ?? ''
  // Null until the job loads: the preview shows its loading card.
  const previewJob = useMemo(
    () => (job ? previewJobFrom(job, companyName) : null),
    [job, companyName],
  )

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* No save or preview behind these buttons yet, so the header has no handler. */}
      <JobFlowHeader current="Application form" mode="create" />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full">
          <div className="w-[640px] max-w-full shrink-0 p-[40px]">
            <ApplicationFormBuilder backHref={backHref} form={form} onFormChange={setForm} />
          </div>
          {/* Figma 9270:375985: the phone preview sits beside the form on wide screens only. */}
          <aside className="ml-[95px] hidden w-[283px] shrink-0 pt-[80px] xl:block">
            <ApplicationPreview
              job={previewJob}
              questions={form.questions}
              tab={previewTab}
              onTabChange={setPreviewTab}
            />
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
