'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { JobDetailsForm } from '@/components/jobs/create/job-details-form'
import { JobFlowHeader } from '@/components/jobs/create/job-flow-header'
import { SaveTemplateModal } from '@/components/jobs/create/save-template-modal'
import { ChooseTemplateModal } from '@/components/jobs/create/start-modals'
import { JobToast } from '@/components/jobs/job-toast'
import { Button, Divider, ListItemToggle, TextButton } from '@/components/ui'
import { apiMessage } from '@/lib/jobs/api'
import { EMPTY_DRAFT, validateDraft } from '@/lib/jobs/draft'
import { draftErrorsFrom, draftFromView, draftToBody } from '@/lib/jobs/draft-api'
import {
  useDepartments,
  useHiringCatalog,
  useHiringMe,
  useJob,
  useJobTemplates,
  useMe,
  useSkills,
} from '@/lib/queries'
import { queryKeys } from '@/lib/query-keys'
import { requests } from '@/lib/requests'

import type { JobToastState } from '@/components/jobs/job-toast'
import type { AiAccess } from '@/lib/jobs/ai-description'
import type { DraftErrors, JobDraft } from '@/lib/jobs/draft'
import type { TemplateDetails } from '@/lib/jobs/templates'

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
 * Everything is saved through the hiring API. The later steps (Application
 * form, Permissions, Publish) are not designed yet, so once the details are
 * saved the list is shown again.
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

  const job = useJob(jobId).data
  const templates = useJobTemplates().data
  const template = templateId ? templates?.find((item) => item.id === templateId) : undefined
  const departments = useDepartments().data
  const catalog = useHiringCatalog().data
  const skills = useSkills().data
  // The lists that turn the form's names into the API's ids, and back.
  const companyAddress = useHiringMe().data?.company_address
  const lookups = useMemo(
    () => ({ departments, catalog, skills, companyAddress }),
    [departments, catalog, skills, companyAddress],
  )

  const startingDraft = useMemo<JobDraft>(() => {
    if (job) return draftFromView(job, lookups)
    if (template)
      return { ...draftFromView(template.details ?? {}, lookups), title: template.title }
    return EMPTY_DRAFT
  }, [job, template, lookups])
  // Null until the user edits, so data that loads late still fills the form.
  const [edited, setEdited] = useState<JobDraft | null>(null)
  const draft = edited ?? startingDraft
  const [errors, setErrors] = useState<DraftErrors>({})
  const [choosingTemplate, setChoosingTemplate] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [toast, setToast] = useState<JobToastState | null>(null)
  const [saving, setSaving] = useState(false)
  // A new job, once its first save has created it: later saves update it.
  const [created, setCreated] = useState<{ id: string; revision?: number } | null>(null)
  // "Save as template" details, kept until there is a job to make the template from.
  const [pendingTemplate, setPendingTemplate] = useState<TemplateDetails | null>(null)
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

  function showProblem(error: unknown) {
    const { errors: fieldErrors, other } = draftErrorsFrom(error)
    setErrors(fieldErrors)
    // Once the errors are on the page, bring the first one into view.
    requestAnimationFrame(() =>
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ block: 'center' }),
    )
    // Problems with a field that shows no error of its own are said in a toast.
    if (other.length > 0 || Object.keys(fieldErrors).length === 0) {
      setToast({ id: Date.now(), kind: 'error', message: other[0] ?? apiMessage(error) })
    }
  }

  async function save(requireComplete: boolean) {
    if (saving) return
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

    setSaving(true)
    try {
      // The API keeps a template's name and pin, not its job details.
      if (mode === 'edit-template' && template) {
        await requests.updateTemplate(template.id, { name: draft.title.trim() })
        await queryClient.invalidateQueries({ queryKey: queryKeys.jobTemplates })
        router.push('/dashboard/jobs?tab=templates&saved=changes')
        return
      }

      const body = draftToBody(draft, lookups, new Date())

      if (mode === 'edit-job' && jobId) {
        await requests.updateJob(jobId, body, job?.revision)
        await queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
        router.push('/dashboard/jobs?saved=changes')
        return
      }

      let current = created
      if (current) {
        const saved = await requests.updateJob(current.id, body, current.revision)
        current = { id: current.id, revision: saved.revision }
      } else {
        // Starting from a template counts as a use of it.
        const saved = await requests.createJob(
          mode === 'create' && template ? { ...body, template_id: template.id } : body,
        )
        current = { id: saved.id ?? '', revision: saved.revision }
      }
      setCreated(current)
      await queryClient.invalidateQueries({ queryKey: queryKeys.jobs })

      if (requireComplete) {
        const saved = await requests.completeJobDetails(current.id, body, current.revision)
        setCreated({ id: current.id, revision: saved.revision })
      }
      if (pendingTemplate) {
        await requests.saveJobAsTemplate(current.id, pendingTemplate.name.trim())
        setPendingTemplate(null)
        await queryClient.invalidateQueries({ queryKey: queryKeys.jobTemplates })
      }
      router.push('/dashboard/jobs?saved=draft')
    } catch (error) {
      showProblem(error)
    } finally {
      setSaving(false)
    }
  }

  // A template is made from a saved job, so its details wait for the job's
  // first save unless the job is already there.
  async function saveTemplate(details: TemplateDetails) {
    setSavingTemplate(false)
    if (!created) {
      setPendingTemplate(details)
      return
    }
    try {
      await requests.saveJobAsTemplate(created.id, details.name.trim())
      await queryClient.invalidateQueries({ queryKey: queryKeys.jobTemplates })
      setToast({ id: Date.now(), kind: 'done', message: 'Template saved' })
    } catch (error) {
      change({ saveAsTemplate: false })
      setToast({ id: Date.now(), kind: 'error', message: apiMessage(error) })
    }
  }

  const backHref = mode === 'edit-template' ? '/dashboard/jobs?tab=templates' : '/dashboard/jobs'

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <JobFlowHeader current="Job details" mode={mode} onSave={() => void save(false)} />

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
                // Switching it on asks for the template's details; they are
                // saved from that dialog, and cancelling switches it back off.
                onChange={(saveAsTemplate) => {
                  change({ saveAsTemplate })
                  if (saveAsTemplate) setSavingTemplate(true)
                  else setPendingTemplate(null)
                }}
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

      {savingTemplate ? (
        <SaveTemplateModal
          defaultName={draft.title.trim() ? `${draft.title.trim()} Template` : ''}
          existingNames={(templates ?? []).map((item) => item.title)}
          onSave={(details) => void saveTemplate(details)}
          onClose={() => {
            setSavingTemplate(false)
            setPendingTemplate(null)
            change({ saveAsTemplate: false })
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
