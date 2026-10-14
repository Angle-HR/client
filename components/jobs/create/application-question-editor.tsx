'use client'

import { useEffect, useRef, useState } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Button, TextButton, TextInput, Toggle } from '@/components/ui'
import {
  QUESTION_TYPES,
  changeQuestionType,
  hasRequiredToggle,
  isChoiceType,
  readyQuestion,
  typeOption,
} from '@/lib/jobs/application-form'

import type { FormQuestion, QuestionType } from '@/lib/jobs/application-form'

/**
 * The inline editor for a question being added. Figma: "While Building" for
 * every type (9346:562575), and the new-question editor at 9270:376285.
 *
 * The type pill opens the type list (9270:376125). The upload, date and link
 * blocks are drawn as static previews of how the candidate will see them.
 */

const TYPE_ICONS: Record<QuestionType, string> = {
  short_text: 'short-text-solid',
  long_text: 'long-text-solid',
  number: 'hashtag-solid',
  email: 'at-symbol-solid',
  phone: 'phone-solid',
  single_choice: 'radio-single-choice-solid',
  multiple_choice: 'list-bullet-solid',
  checkbox: 'checkbox-solid',
  dropdown: 'chevron-double-down-solid',
  linear_scale: 'linear-scale-solid',
  image_upload: 'photo-upload-solid',
  file_upload: 'arrow-up-tray-solid',
  link: 'link-solid',
  date: 'calendar-solid',
  autofill_resume: 'document-check-solid',
}

/** The bullet drawn in front of each option, by choice type. */
const BULLET_CLASS: Partial<Record<QuestionType, string>> = {
  single_choice: 'rounded-full',
  multiple_choice: 'rounded-[3px]',
  checkbox: 'rounded-[3px]',
}

const SHORT_TEXT_DESCRIPTION_LIMIT = 24

interface QuestionEditorProps {
  question: FormQuestion
  onChange: (question: FormQuestion) => void
  onSave: (question: FormQuestion) => void
  onDelete: () => void
}

function QuestionEditor({ question, onChange, onSave, onDelete }: QuestionEditorProps) {
  const ready = readyQuestion(question)
  const isShortText = question.type === 'short_text'

  return (
    <div className="flex flex-col gap-[16px] rounded-[10px] border-[0.5px] border-border-transparent-medium bg-bg-primary p-[16px]">
      <TypePicker
        type={question.type}
        onChange={(type) => onChange(changeQuestionType(question, type))}
      />

      <TextInput
        label="Question"
        required
        placeholder="Question"
        value={question.label}
        onChange={(event) => onChange({ ...question, label: event.target.value })}
      />

      <TextInput
        label={
          isShortText
            ? `Description (Optional, ${SHORT_TEXT_DESCRIPTION_LIMIT} characters max)`
            : 'Description (Optional)'
        }
        placeholder="Description (Optional)"
        value={question.description}
        onChange={(event) =>
          onChange({
            ...question,
            // The short text description is capped at the limit its label states.
            description: isShortText
              ? event.target.value.slice(0, SHORT_TEXT_DESCRIPTION_LIMIT)
              : event.target.value,
          })
        }
      />

      <TypeFields question={question} onChange={onChange} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[10px]">
          {/* Save stays off until the question can be saved as it is. */}
          <Button
            type="button"
            variant="primary"
            accent="blue"
            size="sm"
            disabled={!ready}
            onClick={() => {
              if (ready) onSave(ready)
            }}
            iconSuffix={<DashboardIcon name="check-circle-solid" size={14} />}
          >
            Save
          </Button>
          <Button type="button" variant="secondary" accent="blue" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
        {hasRequiredToggle(question.type) ? (
          <div className="flex items-center gap-[10px]">
            <span className="text-body-s text-text-secondary">Required</span>
            <Toggle
              size="sm"
              toggled={question.required}
              aria-label="Required"
              onChange={(required) => onChange({ ...question, required })}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

/** The pill at the top of the editor. Opens the list of every question type. */
function TypePicker({
  type,
  onChange,
}: {
  type: QuestionType
  onChange: (type: QuestionType) => void
}) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  // A click anywhere else closes the list, as the dropdown does in the design.
  useEffect(() => {
    if (!open) return
    function handlePointerDown(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  return (
    <div ref={root} className="relative self-start">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-[24px] items-center gap-[6px] rounded-[7px] bg-bg-transparent-blue-accent-lighter px-[8px] text-body-s font-medium text-text-blue-accent"
      >
        <DashboardIcon name={TYPE_ICONS[type]} size={12} />
        {typeOption(type).pillLabel}
        <DashboardIcon name="chevron-down-solid" size={10} />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label="Question type"
          className="absolute top-[30px] left-0 z-10 max-h-[260px] w-[200px] overflow-y-auto rounded-[10px] border-[0.5px] border-border-transparent-medium bg-bg-primary p-[4px] shadow-md"
        >
          {QUESTION_TYPES.map((option) => (
            <li key={option.type} role="option" aria-selected={option.type === type}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.type)
                  setOpen(false)
                }}
                className="flex h-[28px] w-full items-center gap-[8px] rounded-[7px] px-[8px] text-left text-body-s text-text-secondary hover:bg-bg-transparent-light"
              >
                <DashboardIcon name={TYPE_ICONS[option.type]} size={12} />
                <span className="flex-1">{option.label}</span>
                {option.type === type ? <DashboardIcon name="check-solid" size={12} /> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/** The fields that depend on the type: options, the scale, or a drawn upload or date block. */
function TypeFields({
  question,
  onChange,
}: {
  question: FormQuestion
  onChange: (question: FormQuestion) => void
}) {
  if (isChoiceType(question.type)) {
    return <OptionsEditor question={question} onChange={onChange} />
  }

  switch (question.type) {
    case 'linear_scale': {
      const scale = question.scale ?? { min: 1, max: 10 }
      const values = Array.from(
        { length: scale.max - scale.min + 1 },
        (_, index) => scale.min + index,
      )
      return (
        <div className="flex flex-col gap-[8px]">
          <span className="text-caption-s font-semibold text-text-secondary">Scale</span>
          <div className="flex flex-wrap gap-[6px]">
            {values.map((value) => (
              <span
                key={value}
                className="flex h-[28px] min-w-[28px] items-center justify-center rounded-[7px] border-[0.5px] border-border-transparent-medium text-body-s font-medium text-text-primary"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      )
    }
    case 'image_upload':
      return <UploadPreview icon="photo-upload-solid" formats="SVG, WebP, PNG, JPEG" />
    case 'file_upload':
      return <UploadPreview icon="arrow-up-tray-solid" formats="DOCX, DOTX, PDF" />
    case 'date':
      return (
        <div className="flex h-[32px] items-center justify-between rounded-[7px] border-[0.5px] border-border-transparent-medium px-[10px] text-body-s text-light-grey-7">
          <span>DD · MM · YYYY</span>
          <DashboardIcon name="calendar-solid" size={14} />
        </div>
      )
    case 'link':
      return (
        <div className="flex h-[32px] items-center gap-[4px] rounded-[7px] border-[0.5px] border-border-transparent-medium px-[10px] text-body-s text-text-tertiary">
          https://
        </div>
      )
    case 'autofill_resume':
      return (
        <div>
          <Button
            type="button"
            variant="secondary"
            accent="default"
            size="sm"
            iconPrefix={<DashboardIcon name="arrow-up-tray-solid" size={11} />}
          >
            Upload file
          </Button>
        </div>
      )
    default:
      return null
  }
}

/** The option list for the four choice types, each with its bullet and "Add Option". */
function OptionsEditor({
  question,
  onChange,
}: {
  question: FormQuestion
  onChange: (question: FormQuestion) => void
}) {
  const bullet = BULLET_CLASS[question.type]
  const placeholders = ['1st Option', '2nd Option']

  return (
    <div className="flex flex-col gap-[8px]">
      <span className="text-caption-s font-semibold text-text-secondary">Options</span>
      {question.options.map((option, index) => (
        <div key={index} className="flex items-center gap-[8px]">
          {question.type === 'dropdown' ? (
            <DashboardIcon name="chev-down-outline" size={10} />
          ) : (
            <span
              aria-hidden="true"
              className={`size-[12px] shrink-0 border-[1px] border-light-grey-7 ${bullet ?? ''}`}
            />
          )}
          <input
            aria-label={`Option ${index + 1}`}
            value={option}
            placeholder={placeholders[index] ?? 'Option'}
            onChange={(event) =>
              onChange({
                ...question,
                options: question.options.map((item, position) =>
                  position === index ? event.target.value : item,
                ),
              })
            }
            className="h-[28px] min-w-0 flex-1 rounded-[7px] border-[0.5px] border-border-transparent-medium bg-bg-primary px-[8px] text-body-s text-text-primary placeholder:text-light-grey-7 focus:border-blue-8 focus:outline-none"
          />
        </div>
      ))}
      <div>
        <TextButton
          size="md"
          className="text-text-tertiary!"
          onClick={() => onChange({ ...question, options: [...question.options, ''] })}
        >
          Add Option
        </TextButton>
      </div>
    </div>
  )
}

/** A drawn upload area: the icon, the Attach action and the accepted formats. */
function UploadPreview({ icon, formats }: { icon: string; formats: string }) {
  return (
    <div className="flex flex-col items-center gap-[6px] rounded-[10px] border-[0.5px] border-border-transparent-medium p-[16px]">
      <DashboardIcon name={icon} size={16} />
      <div className="flex items-center gap-[6px] text-body-xs">
        <span className="font-medium text-text-blue-accent">Attach</span>
        <span className="text-text-secondary">or drag and drop here</span>
      </div>
      <span className="text-caption-s text-text-tertiary">{formats} · Max 5 MB</span>
    </div>
  )
}

export { QuestionEditor, TYPE_ICONS }
