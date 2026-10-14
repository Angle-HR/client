'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState } from 'react'

import { ApplicationFormBuilder } from '@/components/jobs/create/application-form-builder'
import { ApplicationPreview } from '@/components/jobs/create/application-preview'
import { JobFlowHeader } from '@/components/jobs/create/job-flow-header'
import { JobToast } from '@/components/jobs/job-toast'
import { apiMessage } from '@/lib/jobs/api'
import { defaultApplicationForm, formFromApi, formToApi } from '@/lib/jobs/application-form'
import { previewJobFrom } from '@/lib/jobs/application-preview'
import { useApplicationForm, useHiringMe, useJob } from '@/lib/queries'
import { queryKeys } from '@/lib/query-keys'
import { requests } from '@/lib/requests'

import type { PreviewTab } from '@/components/jobs/create/application-preview'
import type { JobToastState } from '@/components/jobs/job-toast'
import type { ApplicationForm } from '@/lib/jobs/application-form'
import type { Dispatch, SetStateAction } from 'react'

/**
 * The "Application form" step of job creation. Figma: "Job Creation/Application
 * form" section 9270:393564.
 *
 * `?job=<id>` is the job being set up; Back returns to its job details. The
 * form is loaded for that job and saved back whole. The form lives here so the
 * right-hand phone preview shows the questions as they are edited.
 */
function ApplicationFormPage() {
  const router = useRouter()
  const params = useSearchParams()
  const queryClient = useQueryClient()
  const jobId = params.get('job')
  const backHref = jobId
    ? `/dashboard/jobs/new?job=${encodeURIComponent(jobId)}`
    : '/dashboard/jobs/new'

  const savedForm = useApplicationForm(jobId).data
  // Without a job there is no saved form to load, so the drawn rows stand in.
  const startingForm = useMemo<ApplicationForm | null>(() => {
    if (!jobId) return defaultApplicationForm()
    return savedForm ? formFromApi(savedForm) : null
  }, [jobId, savedForm])
  // Null until the user edits, so a form that loads late still fills the page.
  const [edited, setEdited] = useState<ApplicationForm | null>(null)
  const form = edited ?? startingForm
  const [previewTab, setPreviewTab] = useState<PreviewTab>('application')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<JobToastState | null>(null)

  const job = useJob(jobId).data
  const companyName = useHiringMe().data?.company_name ?? ''
  // Null until the job and its form load: the preview shows its loading card.
  const previewJob = useMemo(
    () => (job && form ? previewJobFrom(job, companyName) : null),
    [job, companyName, form],
  )

  // The builder updates the form the way useState does, from the latest edit.
  const setForm: Dispatch<SetStateAction<ApplicationForm>> = (update) => {
    setEdited((current) => {
      const base = current ?? startingForm
      if (!base) return current
      return typeof update === 'function' ? update(base) : update
    })
  }

  async function save() {
    if (saving || !jobId || !form) return
    setSaving(true)
    try {
      await requests.saveApplicationForm(jobId, formToApi(form))
      await queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      await queryClient.invalidateQueries({ queryKey: queryKeys.applicationForm(jobId) })
      // Permissions is the next step, not designed yet. Until it is, the list is shown.
      router.push('/dashboard/jobs?saved=draft')
    } catch (error) {
      setToast({ id: Date.now(), kind: 'error', message: apiMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  const saveDisabled = saving || !jobId || !form

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Save as draft and Save & continue both save the form. Preview has no screen yet. */}
      <JobFlowHeader
        current="Application form"
        mode="create"
        onSave={() => void save()}
        saveDisabled={saveDisabled}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full">
          <div className="w-[640px] max-w-full shrink-0 p-[40px]">
            {form ? (
              <ApplicationFormBuilder
                backHref={backHref}
                form={form}
                onFormChange={setForm}
                onSave={() => void save()}
                saveDisabled={saveDisabled}
                onBack={() => router.push(backHref)}
              />
            ) : null}
          </div>
          {/* Figma 9270:375985: the phone preview sits beside the form on wide screens only. */}
          <aside className="ml-[95px] hidden w-[283px] shrink-0 pt-[80px] xl:block">
            <ApplicationPreview
              job={previewJob}
              questions={form?.questions ?? []}
              tab={previewTab}
              onTabChange={setPreviewTab}
            />
          </aside>
        </div>
      </div>

      {toast ? <JobToast toast={toast} onDismiss={() => setToast(null)} /> : null}
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
