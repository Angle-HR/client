'use client'

import { useState, type ChangeEvent, type DragEvent, type ReactElement } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import {
  Button,
  Checkbox,
  FileDropzoneText,
  FileUploadedItem,
  Input,
  InputSelection,
  RadioButton,
  Textarea,
} from '@/components/ui'
import { attachmentKind, isAcceptedFile } from '@/lib/careers/application'

import type { AnswerValue } from '@/lib/careers/application'
import type { FormQuestion, QuestionType } from '@/lib/jobs/application-form'

/**
 * The input for each question type. The builder's phone preview and the
 * candidate form both render through it. Figma: 9346:562575 (each type's
 * states), 9346:561694 (the candidate form's inputs).
 */

/** `card` is the builder's phone preview (display only); `page` is the candidate form. */
type QuestionSurface = 'card' | 'page'

interface QuestionControlProps {
  question: FormQuestion
  surface: QuestionSurface
  /** The id the control's input takes, so a label can point at it. Defaults to the question key. */
  inputId?: string
  placeholder?: string
  /** Set only on the candidate form. Without `onChange` the control is display only. */
  value?: AnswerValue
  onChange?: (value: AnswerValue) => void
  /** The field is invalid: its error state shows, without copy. */
  invalid?: boolean
}

/** Upload formats the design shows under the dropzone. Figma: 9346:561694, 9346:562575. */
const IMAGE_FORMATS: readonly string[] = ['SVG', 'WebP', 'PNG', 'JPEG']
const FILE_FORMATS: readonly string[] = ['DOCX', 'DOTX', 'PDF']
const DEFAULT_MAX_UPLOAD_MB = 5
/** The linear scale when the question has no scale of its own. */
const DEFAULT_SCALE_MIN = 1
const DEFAULT_SCALE_MAX = 10

const INPUT_TYPES: Partial<Record<QuestionType, string>> = {
  email: 'email',
  phone_number: 'tel',
  number: 'number',
}

/** The labels a multi-choice question holds: its answers as strings, not files. */
function pickedLabels(value: AnswerValue | undefined): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function textOf(value: AnswerValue | undefined): string {
  return typeof value === 'string' ? value : ''
}

/** The input for one question. Figma: 9346:562575. */
function QuestionControl({
  question,
  surface,
  inputId,
  placeholder,
  value,
  onChange,
  invalid = false,
}: QuestionControlProps): ReactElement {
  const page = surface === 'page'
  const interactive = onChange !== undefined
  const id = inputId ?? question.key

  switch (question.type) {
    case 'autofill_resume':
      // Inert: no resume parsing service exists yet, so the button is drawn and does nothing.
      return (
        <div>
          <Button
            type="button"
            variant={page ? 'secondary' : 'primary'}
            accent="default"
            size={page ? 'md' : 'sm'}
            iconPrefix={<DashboardIcon name="arrow-up-tray-solid" size={page ? 14 : 11} />}
          >
            Upload file
          </Button>
        </div>
      )

    case 'long_text':
      return (
        <Textarea
          id={id}
          placeholder={placeholder}
          showToolbar={!page}
          {...(interactive
            ? {
                value: textOf(value),
                onChange: (event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value),
              }
            : {})}
        />
      )

    case 'single_choice':
      return (
        <div className="flex flex-col gap-[6px]">
          {question.options.map((option, index) => (
            <RadioButton
              key={`${index}-${option.label}`}
              name={question.key}
              label={option.label}
              {...(interactive
                ? {
                    checked: value === option.label,
                    onChange: () => onChange(option.label),
                  }
                : {})}
            />
          ))}
        </div>
      )

    case 'multiple_choice':
    case 'checkbox': {
      const picked = pickedLabels(value)
      return (
        <div className="flex flex-col gap-[6px]">
          {question.options.map((option, index) => (
            <Checkbox
              key={`${index}-${option.label}`}
              label={option.label}
              {...(interactive
                ? {
                    checked: picked.includes(option.label),
                    onChange: (event: ChangeEvent<HTMLInputElement>) =>
                      onChange(
                        event.target.checked
                          ? [...picked, option.label]
                          : picked.filter((item) => item !== option.label),
                      ),
                  }
                : {})}
            />
          ))}
        </div>
      )
    }

    case 'dropdown':
      return (
        <InputSelection
          options={question.options.map((option) => ({ value: option.label, label: option.label }))}
          placeholder="Search for an option..."
          {...(interactive
            ? {
                value: textOf(value),
                onChange: (next: string | string[]) =>
                  onChange(Array.isArray(next) ? (next[0] ?? '') : next),
              }
            : {})}
        />
      )

    case 'linear_scale': {
      const from = question.scale?.min ?? DEFAULT_SCALE_MIN
      const to = question.scale?.max ?? DEFAULT_SCALE_MAX
      const values = Array.from({ length: Math.max(0, to - from + 1) }, (_, index) => from + index)
      return (
        <div className="flex flex-wrap gap-[4px]">
          {values.map((item) => {
            const selected = interactive && value === item
            return (
              <button
                key={item}
                type="button"
                aria-pressed={interactive ? selected : undefined}
                onClick={interactive ? () => onChange(item) : undefined}
                className={`flex h-[25px] min-w-[25px] flex-1 items-center justify-center rounded-[6px] border bg-bg-input-filled text-[10px] text-text-secondary ${selected ? 'border-border-input-focus' : 'border-transparent'}`}
              >
                {item}
              </button>
            )
          })}
        </div>
      )
    }

    case 'image_upload':
    case 'file_upload':
      return (
        <FileDropzone
          question={question}
          inputId={id}
          invalid={invalid}
          files={
            Array.isArray(value) && value.every((item) => item instanceof File) ? value : undefined
          }
          onFilesChange={interactive ? (files) => onChange(files) : undefined}
        />
      )

    case 'link':
      if (page) {
        return (
          <div
            className={`flex h-[40px] items-center gap-[4px] rounded-lg-10 border px-[12px] transition-colors ${invalid ? 'border-border-input-error bg-bg-input-error' : 'border-border-input-placeholder bg-bg-input-placeholder hover:border-border-input-hover hover:bg-bg-input-hover focus-within:border-border-input-focus! focus-within:bg-bg-input-focus!'}`}
          >
            {/* The protocol is fixed; the candidate types the rest of the link. */}
            <span className="shrink-0 text-[13.8px] leading-[21px] text-text-tertiary">
              https://
            </span>
            <input
              id={id}
              type="text"
              placeholder={placeholder}
              aria-invalid={invalid}
              {...(interactive
                ? {
                    value: textOf(value),
                    onChange: (event: ChangeEvent<HTMLInputElement>) =>
                      onChange(event.target.value),
                  }
                : {})}
              className="min-w-0 flex-1 bg-transparent text-[1rem] text-text-input-filled placeholder:text-text-input-placeholder outline-none md:text-body-m"
            />
          </div>
        )
      }
      return (
        <Input
          id={id}
          size="md"
          placeholder={placeholder}
          aria-invalid={invalid}
          {...(interactive
            ? {
                value: textOf(value),
                onChange: (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value),
              }
            : {})}
        />
      )

    default:
      // Short text, number, email, phone and date all show one line.
      return (
        <Input
          id={id}
          size={page ? 'lg' : 'md'}
          type={INPUT_TYPES[question.type] ?? 'text'}
          placeholder={placeholder}
          aria-invalid={invalid}
          {...(interactive
            ? {
                value: textOf(value),
                onChange: (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value),
              }
            : {})}
        />
      )
  }
}

interface FileDropzoneProps {
  question: FormQuestion
  inputId: string
  invalid: boolean
  /** The files kept for the question. Absent on the card preview. */
  files?: File[]
  onFilesChange?: (files: File[]) => void
}

/**
 * The dropzone for an upload question. One file is kept; a file the question
 * does not accept shows the design's error state. Files are held in state only:
 * there is no upload endpoint yet.
 */
function FileDropzone({
  question,
  inputId,
  invalid,
  files,
  onFilesChange,
}: FileDropzoneProps): ReactElement {
  const [rejected, setRejected] = useState(false)
  const interactive = onFilesChange !== undefined
  const formats = question.type === 'image_upload' ? IMAGE_FORMATS : FILE_FORMATS
  const maxSizeMb = question.config.max_mb ?? DEFAULT_MAX_UPLOAD_MB
  const chosen = files ?? []

  function pick(list: FileList | null): void {
    if (!onFilesChange || !list || list.length === 0) return
    const picked = Array.from(list)
    const accepted = picked.filter((file) => isAcceptedFile(file, question.config))
    setRejected(accepted.length !== picked.length)
    const [first] = accepted
    if (first) onFilesChange([first])
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    if (!interactive) return
    event.preventDefault()
    pick(event.dataTransfer.files)
  }

  const dropzone = (
    <FileDropzoneText
      state={rejected ? 'error' : 'rest'}
      formats={[...formats]}
      maxSizeMb={maxSizeMb}
    />
  )

  return (
    <div className="flex flex-col gap-[8px]">
      <div
        onDragOver={(event) => {
          if (interactive) event.preventDefault()
        }}
        onDrop={handleDrop}
        className={`rounded-[10px] border border-dashed p-[12px] ${invalid ? 'border-border-input-error' : 'border-border-transparent-medium'}`}
      >
        {interactive ? (
          <label htmlFor={inputId} className="block cursor-pointer">
            {dropzone}
          </label>
        ) : (
          dropzone
        )}
        {interactive ? (
          <input
            id={inputId}
            type="file"
            className="sr-only"
            accept={
              question.config.accept?.join(',') ??
              (question.type === 'image_upload' ? 'image/*' : undefined)
            }
            onChange={(event) => {
              pick(event.target.files)
              // Clear the picker so the same file can be picked again after a removal.
              event.target.value = ''
            }}
          />
        ) : null}
      </div>
      {chosen.map((file) => (
        <FileUploadedItem
          key={file.name}
          fileName={file.name}
          fileType={attachmentKind(file.name)}
          onRemove={() => {
            setRejected(false)
            onFilesChange?.([])
          }}
        />
      ))}
    </div>
  )
}

export { QuestionControl, IMAGE_FORMATS, FILE_FORMATS }
export type { QuestionControlProps, QuestionSurface }
