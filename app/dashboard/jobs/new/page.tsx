'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { JobDetailsForm } from '@/components/jobs/create/job-details-form'
import { JobFlowHeader } from '@/components/jobs/create/job-flow-header'
import { Button, Divider, ListItemToggle, TextButton } from '@/components/ui'
import { EMPTY_DRAFT, draftToJob, validateDraft } from '@/lib/jobs/draft'
import { useMe } from '@/lib/queries'
import { queryKeys } from '@/lib/query-keys'
import { requests } from '@/lib/requests'

import type { DraftErrors, JobDraft } from '@/lib/jobs/draft'
import type { Job } from '@/lib/jobs/types'

/**
 * Job creation, step one: "Job details". Figma: "First time user Job
 * Creation/Job details/" (8974:29644).
 *
 * The later steps (Application form, Permissions, Publish) are not designed
 * yet, so both Save as draft and Save & continue store the job as a draft and
 * return to the list.
 */
function NewJobPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const me = useMe()
  const [draft, setDraft] = useState<JobDraft>(EMPTY_DRAFT)
  const [errors, setErrors] = useState<DraftErrors>({})

  function change(patch: Partial<JobDraft>) {
    setDraft((current) => ({ ...current, ...patch }))
    // Clear a field's error as soon as the user edits that field.
    setErrors((current) => {
      const next = { ...current }
      if ('title' in patch) delete next.title
      if ('team' in patch) delete next.team
      if ('closingDate' in patch) delete next.closingDate
      if ('payMin' in patch || 'payMax' in patch || 'payType' in patch) delete next.pay
      return next
    })
  }

  async function save(requireComplete: boolean) {
    const found = validateDraft(draft, new Date())
    // A draft only needs a usable title; moving on needs everything valid.
    const blocking: DraftErrors = requireComplete ? found : { title: found.title }
    if (Object.values(blocking).some(Boolean)) {
      setErrors(blocking)
      document
        .querySelector('[aria-invalid="true"], [role="alert"]')
        ?.scrollIntoView({ block: 'center' })
      return
    }

    // No jobs API yet: the new job is added to the cached list.
    const existing =
      queryClient.getQueryData<Job[]>(queryKeys.jobs) ??
      (await queryClient.fetchQuery({ queryKey: queryKeys.jobs, queryFn: requests.getJobs }))
    const name = me.data?.first_name || me.data?.legal_full_name || me.data?.email || 'You'
    const job = draftToJob(draft, `job-${Date.now()}`, { name, colour: 'blue' }, new Date())
    queryClient.setQueryData<Job[]>(queryKeys.jobs, [...(existing ?? []), job])
    router.push('/dashboard/jobs?saved=draft')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <JobFlowHeader current="Job details" onSaveDraft={() => void save(false)} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            void save(true)
          }}
          className="flex w-[693px] max-w-full flex-col gap-[40px] p-[40px]"
        >
          <div className="flex h-[24px] items-center justify-between">
            <TextButton
              size="md"
              className="text-text-primary!"
              iconLeft={<DashboardIcon name="chevron-left-solid" size={11} />}
              onClick={() => router.push('/dashboard/jobs')}
            >
              Back
            </TextButton>
            {/* Templates are a separate flow that is not built yet. */}
            <Button
              variant="tertiary"
              accent="default"
              size="sm"
              disabled
              iconPrefix={<DashboardIcon name="rectangle-group-solid" size={14} />}
            >
              Use templates
            </Button>
          </div>

          <div className="flex w-[488px] max-w-full flex-col gap-[16px]">
            <h1 className="-my-[9px] text-[21.1px] leading-[33.1px] font-semibold text-text-primary">
              About the role
            </h1>
            <p className="-my-[5px] text-body-xs leading-19_2 font-medium text-text-secondary">
              Give applicants everything they need to decide if this is the right fit.
            </p>
          </div>

          <div className="flex h-[4px] shrink-0 items-center">
            <Divider />
          </div>

          <JobDetailsForm draft={draft} errors={errors} onChange={change} />

          {/* One block in the design: the toggle, then the actions 10px below. */}
          <div className="flex flex-col items-start gap-[10px] pt-[10px] pb-[32px]">
            <ListItemToggle
              mainText="Save as template"
              // The design sets this row flush with the form edge, at its own width.
              className="w-[138px]! px-0!"
              checked={draft.saveAsTemplate}
              onChange={(saveAsTemplate) => change({ saveAsTemplate })}
            />
            <div className="flex gap-[12px]">
              <Button
                type="button"
                variant="secondary"
                accent="blue"
                size="md"
                iconPrefix={<DashboardIcon name="arrow-left-solid" size={14} />}
                onClick={() => router.push('/dashboard/jobs')}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                accent="blue"
                size="md"
                iconSuffix={<DashboardIcon name="check-circle-solid" size={14} />}
              >
                Save &amp; continue
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewJobPage
