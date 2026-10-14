'use client'

import { useRef, useState } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { QuestionEditor, TYPE_ICONS } from '@/components/jobs/create/application-question-editor'
import { JobToast } from '@/components/jobs/job-toast'
import { Button, Checkbox, Divider, Modal, TextButton, Toggle } from '@/components/ui'
import {
  QUESTION_SECTIONS,
  QUESTION_TYPES,
  SPECIAL_CATEGORIES,
  addQuestion,
  createQuestion,
  isSpecialCategoryChecked,
  moveQuestion,
  questionsInSection,
  removeQuestion,
  restoreQuestion,
  setSpecialCategory,
  updateQuestion,
} from '@/lib/jobs/application-form'

import type { JobToastState } from '@/components/jobs/job-toast'
import type {
  ApplicationForm,
  FormQuestion,
  QuestionSection,
  QuestionType,
} from '@/lib/jobs/application-form'
import type { Dispatch, DragEvent, SetStateAction } from 'react'

/**
 * The left column of "Create Application Form": the rows of each section, the
 * inline editor, the Add a question modal and the footer. Figma: 9270:375985
 * (default), 9270:376125 (type dropdown), 9270:377879 (Add a question), 9270:377778
 * (Question deleted toast).
 *
 * Save & continue, Save as draft and Preview have no API behind them yet, so
 * they do nothing here.
 */

const SECTION_TITLES: Record<QuestionSection, string> = {
  personal: 'PERSONAL INFORMATION',
  profile: 'PROFILE',
  eligibility: 'ELIGIBILITY, AVAILABILITY & COMPENSATION',
  screening: 'SCREENING QUESTIONS',
}

const SECTION_NOTES: Partial<Record<QuestionSection, string>> = {
  screening: 'Ask to important questions to qualify applicants.',
}

const SECTION_HEADING =
  'flex h-[7px] items-center text-caption-s leading-none font-semibold text-text-secondary'
const SECTION_NOTE = 'text-body-xs leading-19_2 text-text-tertiary'

interface ApplicationFormBuilderProps {
  /** Where the Back buttons go: the job details step for this job. */
  backHref: string
  /** The form, owned by the page so the phone preview can show it live. */
  form: ApplicationForm
  onFormChange: Dispatch<SetStateAction<ApplicationForm>>
}

function ApplicationFormBuilder({
  backHref,
  form,
  onFormChange: setForm,
}: ApplicationFormBuilderProps) {
  // The question being added, in the section it was added to. Only one at a time.
  const [draft, setDraft] = useState<FormQuestion | null>(null)
  // The section whose "Add a question" modal is open.
  const [pickingFor, setPickingFor] = useState<QuestionSection | null>(null)
  const [dragging, setDragging] = useState<{ id: string; section: QuestionSection } | null>(null)
  const [toast, setToast] = useState<JobToastState | null>(null)
  const [keepForFuture, setKeepForFuture] = useState(false)
  // Toast ids only need to change between toasts; a counter keeps them stable in render.
  const toastIds = useRef(0)

  function removeRow(question: FormQuestion) {
    const index = questionsInSection(form, question.section).indexOf(question)
    setForm((current) => removeQuestion(current, question.id))
    toastIds.current += 1
    setToast({
      id: toastIds.current,
      kind: 'undoable',
      message: 'Question deleted',
      onUndo: () => setForm((current) => restoreQuestion(current, question, index)),
    })
  }

  function startDraft(type: QuestionType) {
    if (!pickingFor) return
    setDraft(createQuestion(crypto.randomUUID(), type, pickingFor))
    setPickingFor(null)
  }

  function saveDraft(question: FormQuestion) {
    setForm((current) => addQuestion(current, question))
    setDraft(null)
  }

  return (
    <div className="flex flex-col gap-[40px]">
      <div className="flex h-[24px] items-center">
        <TextButton
          size="md"
          className="text-text-primary!"
          iconLeft={<DashboardIcon name="chevron-left-solid" size={11} />}
          href={backHref}
        >
          Back
        </TextButton>
      </div>

      <div className="flex flex-col gap-[16px]">
        <h1 className="-my-[9px] text-[21.1px] leading-[33.1px] font-semibold text-text-primary">
          Create Application Form
        </h1>
        <p className="-my-[5px] text-body-xs leading-19_2 font-medium text-text-secondary">
          Set the questions candidates answer when they apply.
        </p>
      </div>

      <div className="flex h-[4px] shrink-0 items-center">
        <Divider />
      </div>

      {QUESTION_SECTIONS.map((section) => {
        const rows = questionsInSection(form, section)
        return (
          <section key={section} className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[8px]">
              <h2 className={SECTION_HEADING}>{SECTION_TITLES[section]}</h2>
              {SECTION_NOTES[section] ? (
                <p className={SECTION_NOTE}>{SECTION_NOTES[section]}</p>
              ) : null}
            </div>

            <ul className="flex flex-col gap-[10px]">
              {rows.map((question, index) => (
                <QuestionRow
                  key={question.id}
                  question={question}
                  dragging={dragging?.id === question.id}
                  onDragStart={() => setDragging({ id: question.id, section })}
                  onDragEnd={() => setDragging(null)}
                  onDragOver={(event) => {
                    // Rows only accept drops from their own section.
                    if (dragging?.section === section) event.preventDefault()
                  }}
                  onDrop={(event) => {
                    event.preventDefault()
                    if (dragging?.section === section) {
                      const dragged = dragging.id
                      setForm((current) => moveQuestion(current, dragged, index))
                    }
                    setDragging(null)
                  }}
                  onRequiredChange={(required) =>
                    setForm((current) => updateQuestion(current, question.id, { required }))
                  }
                  onRemove={() => removeRow(question)}
                />
              ))}
            </ul>

            {draft?.section === section ? (
              <QuestionEditor
                question={draft}
                onChange={setDraft}
                onSave={saveDraft}
                onDelete={() => setDraft(null)}
              />
            ) : null}

            <div>
              <TextButton
                size="md"
                iconLeft={<DashboardIcon name="plus-solid" size={11} />}
                onClick={() => setPickingFor(section)}
              >
                Add a question
              </TextButton>
            </div>
          </section>
        )
      })}

      <div className="flex h-[4px] shrink-0 items-center">
        <Divider />
      </div>

      <section className="flex flex-col gap-[24px]">
        <div className="flex flex-col gap-[8px]">
          <h2 className={SECTION_HEADING}>SPECIAL CATEGORY DATA</h2>
          <p className={SECTION_NOTE}>
            Will this role collect any of the following? Each category requires an additional Art. 9
            / equivalent condition documented separately.
          </p>
        </div>
        <ul className="flex flex-col gap-[10px]">
          {SPECIAL_CATEGORIES.map((category) => (
            <li key={category.key}>
              <Checkbox
                label={category.label}
                checked={isSpecialCategoryChecked(form, category.key)}
                onChange={(event) =>
                  setForm((current) =>
                    setSpecialCategory(current, category.key, event.target.checked),
                  )
                }
              />
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col items-start gap-[10px] pt-[10px]">
        <div className="flex items-center gap-[10px]">
          <span className="text-body-s text-text-secondary">
            Keep this setup for my future jobs
          </span>
          <Toggle
            size="sm"
            toggled={keepForFuture}
            aria-label="Keep this setup for my future jobs"
            onChange={setKeepForFuture}
          />
        </div>
        <div className="flex gap-[12px]">
          <Button
            type="button"
            variant="secondary"
            accent="blue"
            size="md"
            iconPrefix={<DashboardIcon name="arrow-left-solid" size={14} />}
          >
            Back
          </Button>
          <Button
            type="button"
            variant="primary"
            accent="blue"
            size="md"
            iconSuffix={<DashboardIcon name="check-circle-solid" size={14} />}
          >
            Save &amp; continue
          </Button>
        </div>
      </div>

      <Modal
        open={pickingFor !== null}
        title="Add a question"
        titleAccent="blue"
        icon={<DashboardIcon name="plus-solid" size={11} />}
        width={700}
        onClose={() => setPickingFor(null)}
      >
        <div className="grid grid-cols-3 gap-[24px]">
          {(['Input', 'Choice', 'Others'] as const).map((group) => (
            <div key={group} className="flex flex-col gap-[4px]">
              <span className="px-[8px] pb-[6px] text-body-xs font-medium text-text-tertiary">
                {group}
              </span>
              {QUESTION_TYPES.filter((option) => option.group === group).map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => startDraft(option.type)}
                  className="flex h-[32px] items-center gap-[8px] rounded-[7px] px-[8px] text-left text-body-s text-text-secondary hover:bg-bg-transparent-light"
                >
                  <DashboardIcon name={TYPE_ICONS[option.type]} size={12} />
                  {option.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </Modal>

      {toast ? <JobToast toast={toast} onDismiss={() => setToast(null)} /> : null}
    </div>
  )
}

interface QuestionRowProps {
  question: FormQuestion
  dragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onDragOver: (event: DragEvent<HTMLLIElement>) => void
  onDrop: (event: DragEvent<HTMLLIElement>) => void
  onRequiredChange: (required: boolean) => void
  onRemove: () => void
}

/** One saved question: drag handle, label, Required and its toggle, and the trash. */
function QuestionRow({
  question,
  dragging,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onRequiredChange,
  onRemove,
}: QuestionRowProps) {
  const showsToggle = question.type !== 'autofill_resume'
  // Drawn as the row's right-hand text: the description when there is one, otherwise "Required".
  const rightText = question.description || (showsToggle ? 'Required' : '')

  return (
    <li
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`group flex h-[28px] items-center gap-[10px] rounded-[7px] px-[8px] transition-opacity hover:bg-light-grey-2 ${dragging ? 'opacity-40' : ''}`}
    >
      <span
        draggable={!question.locked}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = 'move'
          event.dataTransfer.setData('text/plain', question.id)
          onDragStart()
        }}
        onDragEnd={onDragEnd}
        aria-label={question.locked ? undefined : 'Drag to reorder'}
        className={`flex size-[14px] shrink-0 items-center justify-center text-text-tertiary ${
          question.locked
            ? 'cursor-default text-light-grey-7'
            : 'cursor-grab active:cursor-grabbing'
        }`}
      >
        <DashboardIcon name="grip-vertical-solid" size={12} />
      </span>

      <span className="min-w-0 flex-1 truncate text-body-s text-text-secondary">
        {question.label}
      </span>

      {rightText ? (
        <span className="max-w-[260px] shrink truncate text-body-xs text-light-grey-7">
          {rightText}
        </span>
      ) : null}

      {showsToggle ? (
        <Toggle
          size="sm"
          toggled={question.required}
          disabled={question.locked}
          aria-label={`Required: ${question.label}`}
          onChange={onRequiredChange}
        />
      ) : null}

      <button
        type="button"
        onClick={onRemove}
        disabled={question.locked}
        aria-label={`Delete ${question.label}`}
        className="flex size-[24px] shrink-0 items-center justify-center rounded-[7px] text-text-secondary hover:bg-bg-transparent-light disabled:cursor-not-allowed disabled:text-light-grey-7 disabled:hover:bg-transparent"
      >
        <DashboardIcon name="trash-solid" size={14} />
      </button>
    </li>
  )
}

export { ApplicationFormBuilder }
export type { ApplicationFormBuilderProps }
