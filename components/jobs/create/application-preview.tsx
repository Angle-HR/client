'use client'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import {
  Button,
  Checkbox,
  FileDropzoneText,
  InputSelection,
  RadioButton,
  Tabs,
  Textarea,
  TextInput,
} from '@/components/ui'

import type { FormQuestion } from '@/lib/jobs/application-form'
import type { PreviewJob } from '@/lib/jobs/application-preview'
import type { ReactElement } from 'react'

/**
 * The phone card on the right of "Create Application Form", showing the job
 * and the form as a candidate sees it. Figma: 9270:375985 (summary and fields),
 * 9270:376424 (loading), 9270:378222 (Overview tab), 9346:562575 (each
 * question type, the "Live on the website = yes" variants).
 *
 * The fields are display only: the card is inert, so nothing takes focus or
 * input. The candidate-facing form is a separate section.
 */

type PreviewTab = 'overview' | 'application'

const TABS: ReadonlyArray<{ key: PreviewTab; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'application', label: 'Application' },
]

const SUMMARY_ROWS: ReadonlyArray<{
  label: string
  value: (job: PreviewJob) => string
}> = [
  { label: 'Location', value: (job) => job.location },
  { label: 'Workplace type', value: (job) => job.workplace },
  { label: 'Employment type', value: (job) => job.employmentType },
  { label: 'Team', value: (job) => job.team },
]

const IMAGE_FORMATS: readonly string[] = ['SVG', 'WebP', 'PNG', 'JPEG']
const FILE_FORMATS: readonly string[] = ['DOCX', 'DOTX', 'PDF']
const MAX_UPLOAD_MB = 5
/** The linear scale in the preview, when the question has no scale of its own. */
const DEFAULT_SCALE_MIN = 1
const DEFAULT_SCALE_MAX = 10

interface ApplicationPreviewProps {
  /** The job's summary, or null while the job loads (Figma 9270:376424). */
  job: PreviewJob | null
  /** The questions as the builder has them now, in order. */
  questions: readonly FormQuestion[]
  tab: PreviewTab
  onTabChange: (tab: PreviewTab) => void
}

function ApplicationPreview({
  job,
  questions,
  tab,
  onTabChange,
}: ApplicationPreviewProps): ReactElement {
  // Loading: the card with only its notch pill, as drawn in 9270:376424.
  if (!job) {
    return (
      <div className="flex h-[612px] w-[283px] flex-col rounded-[32px] border-[0.5px] border-border-transparent-medium bg-bg-secondary">
        <Notch />
      </div>
    )
  }

  const initial = job.companyName.trim().charAt(0).toUpperCase()

  return (
    // A fixed 612px phone (9270:375985); a long form scrolls inside it.
    <div className="flex h-[612px] w-[283px] flex-col overflow-hidden rounded-[32px] border-[0.5px] border-border-transparent-medium bg-bg-secondary">
      <Notch />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div inert className="flex flex-col">
          {initial ? (
            <div className="flex items-center gap-[4px] px-[18px] py-[12px]">
              {/* The company logo is not in the API, so its first letter stands in for it. */}
              <span
                aria-hidden="true"
                className="flex size-[12px] items-center justify-center rounded-[3px] bg-bg-logo text-[7px] leading-none font-semibold text-text-logo"
              >
                {initial}
              </span>
              <span className="text-[12px] leading-[19.2px] font-medium text-text-primary">
                {job.companyName}
              </span>
            </div>
          ) : null}

          <h2 className="px-[18px] py-[12px] text-[14px] leading-[21px] font-semibold text-text-primary">
            {job.title}
          </h2>

          <dl className="flex flex-col gap-[6px] px-[18px] pt-[4px] pb-[12px]">
            {SUMMARY_ROWS.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-[2px] border-b-[0.5px] border-border-transparent-medium py-[6px]"
              >
                <dt className="text-[9px] leading-[14.4px] font-medium text-text-tertiary">
                  {row.label}
                </dt>
                <dd className="text-[12px] leading-[19.2px] font-medium text-text-primary">
                  {row.value(job)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <Tabs tabs={TABS} value={tab} onValueChange={onTabChange} aria-label="Job preview" />

        <div inert className="flex flex-col">
          {tab === 'overview' ? (
            <OverviewTab job={job} />
          ) : (
            <div className="flex flex-col gap-[9.6px] px-[14.4px] py-[9.6px]">
              {questions.map((question) => (
                <PreviewField key={question.key} question={question} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** The status bar with the notch pill. Figma: 9270:376087. */
function Notch(): ReactElement {
  return (
    <div className="flex h-[33px] shrink-0 justify-center pt-[12px]">
      <span aria-hidden="true" className="h-[10px] w-[78px] rounded-full bg-bg-primary" />
    </div>
  )
}

/** The job description and the Apply button. Figma: 9270:378222 (Overview view). */
function OverviewTab({ job }: { job: PreviewJob }): ReactElement {
  return (
    <div className="flex flex-col gap-[16px] px-[18px] py-[16px]">
      <h3 className="text-[12px] leading-[19.2px] font-semibold text-text-primary">
        About the job
      </h3>
      {/* Job descriptions are written in the app's own rich text editor by the hiring team. */}
      <div
        className="text-[11px] leading-[17px] text-text-secondary"
        dangerouslySetInnerHTML={{ __html: job.descriptionHtml }}
      />
      <Button type="button" variant="primary" accent="blue" size="md" className="w-full">
        Apply for the job
      </Button>
    </div>
  )
}

/** One question: its label, required mark and description, then the input for its type. */
function PreviewField({ question }: { question: FormQuestion }): ReactElement {
  return (
    <div className="flex flex-col gap-[6.4px]">
      <div className="flex flex-col gap-[2px]">
        <span className="text-[9.6px] leading-[15.4px] font-medium text-text-primary">
          {question.label}
          {question.required ? <span className="ml-[2px] text-text-error">*</span> : null}
        </span>
        {question.description ? (
          <span className="text-[9.6px] leading-[15.4px] text-text-tertiary">
            {question.description}
          </span>
        ) : null}
      </div>
      <QuestionInput question={question} />
    </div>
  )
}

/** The input for each question type, as drawn in 9346:562575. */
function QuestionInput({ question }: { question: FormQuestion }): ReactElement {
  switch (question.type) {
    case 'autofill_resume':
      return (
        <div>
          <Button
            type="button"
            variant="primary"
            accent="default"
            size="sm"
            iconPrefix={<DashboardIcon name="arrow-up-tray-solid" size={11} />}
          >
            Upload file
          </Button>
        </div>
      )
    case 'long_text':
      return <Textarea placeholder="Description" />
    case 'single_choice':
      return (
        <div className="flex flex-col gap-[6px]">
          {question.options.map((option, index) => (
            <RadioButton
              key={`${index}-${option.label}`}
              name={question.key}
              label={option.label}
            />
          ))}
        </div>
      )
    case 'multiple_choice':
    case 'checkbox':
      return (
        <div className="flex flex-col gap-[6px]">
          {question.options.map((option, index) => (
            <Checkbox key={`${index}-${option.label}`} label={option.label} />
          ))}
        </div>
      )
    case 'dropdown':
      return (
        <InputSelection
          options={question.options.map((option) => ({ value: option.label, label: option.label }))}
          placeholder="Search for an option..."
        />
      )
    case 'linear_scale':
      return <LinearScale min={question.scale?.min} max={question.scale?.max} />
    case 'image_upload':
      return (
        <div className="rounded-[10px] border border-dashed border-border-transparent-medium p-[12px]">
          <FileDropzoneText formats={[...IMAGE_FORMATS]} maxSizeMb={MAX_UPLOAD_MB} />
        </div>
      )
    case 'file_upload':
      return (
        <div className="rounded-[10px] border border-dashed border-border-transparent-medium p-[12px]">
          <FileDropzoneText formats={[...FILE_FORMATS]} maxSizeMb={MAX_UPLOAD_MB} />
        </div>
      )
    default:
      // Short text, number, email, phone, link and date all show one line.
      return <TextInput placeholder="Description" />
  }
}

/** Numbered boxes from the minimum to the maximum. Figma: 9346:562575 (Linear scale). */
function LinearScale({ min, max }: { min?: number; max?: number }): ReactElement {
  const from = min ?? DEFAULT_SCALE_MIN
  const to = max ?? DEFAULT_SCALE_MAX
  const values = Array.from({ length: Math.max(0, to - from + 1) }, (_, index) => from + index)
  return (
    <div className="flex flex-wrap gap-[4px]">
      {values.map((value) => (
        <span
          key={value}
          className="flex h-[25px] min-w-[25px] flex-1 items-center justify-center rounded-[6px] bg-bg-input-filled text-[10px] text-text-secondary"
        >
          {value}
        </span>
      ))}
    </div>
  )
}

export { ApplicationPreview }
export type { ApplicationPreviewProps, PreviewTab }
