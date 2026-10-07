'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { JobDetailsForm } from '@/components/jobs/create/job-details-form'
import { JobFlowHeader } from '@/components/jobs/create/job-flow-header'
import { ChooseTemplateModal } from '@/components/jobs/create/start-modals'
import { JobToast } from '@/components/jobs/job-toast'
import { Button, Divider, ListItemToggle, TextButton } from '@/components/ui'
import { toIsoDate } from '@/lib/jobs/actions'
import {
  EMPTY_DRAFT,
  applyDraftToJob,
  draftFromJob,
  draftToJob,
  validateDraft,
} from '@/lib/jobs/draft'
import { markTemplateUsed } from '@/lib/jobs/templates'
import { useJobTemplates, useJobs, useMe } from '@/lib/queries'
import { queryKeys } from '@/lib/query-keys'

import type { JobToastState } from '@/components/jobs/job-toast'
import type { AiAccess } from '@/lib/jobs/ai-description'
import type { DraftErrors, JobDraft } from '@/lib/jobs/draft'
import type { JobTemplate } from '@/lib/jobs/templates'
import type { Job, JobManager } from '@/lib/jobs/types'

/**
 * The "Job details" form, in its three uses. Figma: 8973:613907 for the form,
 * 7964:213397 for editing a job, 8928:542035 for editing a template and
 * 8928:541168 for a job started from a template.
 *
 * - `/dashboard/jobs/new` creates a job.
 * - `?template=<id>` starts it from a template.
 * - `?job=<id>` edits an existing job.
 * - `?template=<id>&mode=edit` edits the template itself.
 *
 * The later steps (Application form, Permissions, Publish) are not designed
 * yet, so a new job is stored as a draft and the list is shown again.
 */
function NewJobPage() {
  const router = useRouter()
  const params = useSearchParams()
  const queryClient = useQueryClient()
  const me = useMe()

  const jobId = params.get('job')
  const templateId = params.get('template')
  const mode = jobId
    ? 'edit-job'
    : templateId && params.get('mode') === 'edit'
      ? 'edit-template'
      : 'create'

  const jobs = useJobs().data
  const templates = useJobTemplates().data
  const job = jobId ? jobs?.find((item) => item.id === jobId) : undefined
  const template = templateId ? templates?.find((item) => item.id === templateId) : undefined

  const startingDraft = useMemo<JobDraft>(() => {
    if (job) return draftFromJob(job)
    if (template) {
      return {
        ...EMPTY_DRAFT,
        title: template.title,
        team: template.department,
        employmentType: template.employmentType,
      }
    }
    return EMPTY_DRAFT
  }, [job, template])
  // Null until the user edits, so data that loads late still fills the form.
  const [edited, setEdited] = useState<JobDraft | null>(null)
  const draft = edited ?? startingDraft
  const [errors, setErrors] = useState<DraftErrors>({})
  const [choosingTemplate, setChoosingTemplate] = useState(false)
  const [toast, setToast] = useState<JobToastState | null>(null)
  // There is no AI service yet, so access starts as "may connect one". `?ai=`
  // reaches the other states: unavailable, restricted, connected, and the
  // three ways connecting can fail (fails, bad-key, down).
  const aiParam = params.get('ai')
  const [aiAccess, setAiAccess] = useState<AiAccess>(
    aiParam === 'unavailable' || aiParam === 'restricted' || aiParam === 'connected'
      ? aiParam
      : 'disconnected',
  )

  // Say which template the form was started from, once per template.
  const announcedTemplate = useRef<string | null>(null)
  useEffect(() => {
    if (mode !== 'create' || !template || announcedTemplate.current === template.id) return
    announcedTemplate.current = template.id
    setToast({ id: Date.now(), kind: 'done', message: `${template.title} template in use` })
  }, [mode, template])

  const owner: JobManager = {
    name: me.data?.first_name || me.data?.legal_full_name || me.data?.email || 'You',
    colour: 'blue',
  }

  function change(patch: Partial<JobDraft>) {
    setEdited((current) => ({ ...(current ?? startingDraft), ...patch }))
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

  function save(requireComplete: boolean) {
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

    const today = new Date()
    // No jobs API yet: edits are applied to the cached lists.
    if (mode === 'edit-template' && template) {
      queryClient.setQueryData<JobTemplate[]>(queryKeys.jobTemplates, (current) =>
        current?.map((item) =>
          item.id === template.id
            ? {
                ...item,
                title: draft.title.trim(),
                department: draft.team || item.department,
                employmentType: draft.employmentType || item.employmentType,
              }
            : item,
        ),
      )
      router.push('/dashboard/jobs?tab=templates&saved=changes')
      return
    }

    if (mode === 'edit-job' && job) {
      queryClient.setQueryData<Job[]>(queryKeys.jobs, (current) =>
        current?.map((item) => (item.id === job.id ? applyDraftToJob(item, draft, today) : item)),
      )
      router.push('/dashboard/jobs?saved=changes')
      return
    }

    queryClient.setQueryData<Job[]>(queryKeys.jobs, (current) => [
      ...(current ?? jobs ?? []),
      draftToJob(draft, `job-${today.getTime()}`, owner, today),
    ])
    queryClient.setQueryData<JobTemplate[]>(queryKeys.jobTemplates, (current) => {
      const list = (current ?? templates ?? []).map((item) =>
        // Starting from a template counts as a use of it.
        item.id === template?.id ? markTemplateUsed(item, today) : item,
      )
      if (!draft.saveAsTemplate) return list
      return [
        ...list,
        {
          id: `tpl-${today.getTime()}`,
          title: draft.title.trim(),
          department: draft.team || 'Unassigned',
          employmentType: draft.employmentType || 'Full-time',
          createdBy: owner,
          visibility: 'Just me',
          timesUsed: 0,
          lastUsedAt: toIsoDate(today),
          pinned: false,
          ownedByMe: true,
        },
      ]
    })
    router.push(`/dashboard/jobs?saved=${draft.saveAsTemplate ? 'draft-template' : 'draft'}`)
  }

  const backHref = mode === 'edit-template' ? '/dashboard/jobs?tab=templates' : '/dashboard/jobs'

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <JobFlowHeader current="Job details" mode={mode} onSave={() => save(false)} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            save(true)
          }}
          className="flex w-[693px] max-w-full flex-col gap-[40px] p-[40px]"
        >
          <div className="flex h-[24px] items-center justify-between">
            <TextButton
              size="md"
              className="text-text-primary!"
              iconLeft={<DashboardIcon name="chevron-left-solid" size={11} />}
              onClick={() => router.push(backHref)}
            >
              Back
            </TextButton>
            {mode === 'create' ? (
              <Button
                type="button"
                variant="tertiary"
                accent="default"
                size="sm"
                iconPrefix={<DashboardIcon name="rectangle-group-solid" size={14} />}
                onClick={() => setChoosingTemplate(true)}
              >
                {template ? 'Change template' : 'Use templates'}
              </Button>
            ) : null}
            {mode === 'edit-job' ? (
              // Writing with AI is still being designed.
              <Button
                type="button"
                variant="tertiary"
                accent="default"
                size="sm"
                disabled
                iconPrefix={<DashboardIcon name="sparkles-solid" size={14} />}
              >
                Write with AI
              </Button>
            ) : null}
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

          <JobDetailsForm
            draft={draft}
            errors={errors}
            onChange={change}
            ai={{
              access: aiAccess,
              onAccessChange: setAiAccess,
              workspace: me.data?.legal_full_name || me.data?.first_name || 'workspace',
              connectError:
                aiParam === 'fails'
                  ? 'general'
                  : aiParam === 'bad-key'
                    ? 'key'
                    : aiParam === 'down'
                      ? 'server'
                      : undefined,
            }}
            onToast={(next) => setToast({ ...next, id: Date.now() })}
          />

          {/* One block in the design: the toggle, then the actions 10px below. */}
          <div className="flex flex-col items-start gap-[10px] pt-[10px] pb-[32px]">
            {mode === 'create' ? (
              <ListItemToggle
                mainText="Save as template"
                // The design sets this row flush with the form edge, at its own width.
                className="w-[138px]! px-0!"
                checked={draft.saveAsTemplate}
                onChange={(saveAsTemplate) => change({ saveAsTemplate })}
              />
            ) : null}
            <div className="flex gap-[12px]">
              <Button
                type="button"
                variant="secondary"
                accent="blue"
                size="md"
                iconPrefix={<DashboardIcon name="arrow-left-solid" size={14} />}
                onClick={() => router.push(backHref)}
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
                {mode === 'create' ? 'Save & continue' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {choosingTemplate ? (
        <ChooseTemplateModal
          templates={templates ?? []}
          currentId={template?.id}
          onBack={() => setChoosingTemplate(false)}
          onOpenTemplates={() => router.push('/dashboard/jobs?tab=templates')}
          onClose={() => setChoosingTemplate(false)}
          onContinue={(id) => {
            setChoosingTemplate(false)
            // The new template replaces whatever was typed, as swapping implies.
            setEdited(null)
            router.replace(`/dashboard/jobs/new?template=${id}`)
          }}
        />
      ) : null}

      {toast ? <JobToast toast={toast} onDismiss={() => setToast(null)} /> : null}
    </div>
  )
}

/** `useSearchParams` needs a Suspense boundary to keep the route statically renderable. */
function NewJobRoute() {
  return (
    <Suspense fallback={null}>
      <NewJobPage />
    </Suspense>
  )
}

export default NewJobRoute
