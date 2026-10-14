import type { FormQuestion } from '../jobs/application-form'

/**
 * Answers and validation for the public application form. Figma: applicant
 * frame 9346:561694 (required marks, the Email and Resume rules).
 */

/** What a candidate typed or picked. Choices hold option labels; uploads hold the picked files. */
type AnswerValue = string | string[] | number | File[]

type ApplicationAnswers = Record<string, AnswerValue>

/** Per question key: the message to show, or null for an invalid field with no copy to show. */
type ApplicationErrors = Record<string, string | null>

type AttachmentKind = 'image' | 'excel' | 'csv' | 'json' | 'word' | 'pdf'

/** The message the auth forms already use for a malformed email. */
const EMAIL_ERROR_MESSAGE = 'Please enter a valid email address.'

const DEFAULT_MAX_MB = 5

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

/** A choice, text or upload has an answer; a scale value always does. */
function isAnswered(value: AnswerValue | undefined): boolean {
  if (value === undefined) return false
  if (typeof value === 'number') return true
  if (typeof value === 'string') return value.trim() !== ''
  return value.length > 0
}

/**
 * The invalid questions of a form. A required question with no answer is
 * invalid with no message, since the design has no copy for it. A malformed
 * email gets the auth forms' message.
 */
function validateApplication(
  questions: readonly FormQuestion[],
  answers: ApplicationAnswers,
): ApplicationErrors {
  const errors: ApplicationErrors = {}
  for (const question of questions) {
    const value = answers[question.key]
    if (question.required && !isAnswered(value)) {
      errors[question.key] = null
      continue
    }
    if (question.type === 'email' && typeof value === 'string' && value.trim() !== '') {
      if (!isValidEmail(value)) errors[question.key] = EMAIL_ERROR_MESSAGE
    }
  }
  return errors
}

/** The kind a file name shows as, from its extension. Unknown names are Word, the default upload format. */
function attachmentKind(fileName: string): AttachmentKind {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (extension === 'pdf') return 'pdf'
  if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(extension)) return 'image'
  if (['xls', 'xlsx'].includes(extension)) return 'excel'
  if (extension === 'csv') return 'csv'
  if (extension === 'json') return 'json'
  return 'word'
}

/**
 * Whether a picked file may be kept: its extension is one the question
 * accepts (entries starting with a dot) and it is within the size limit.
 */
function isAcceptedFile(
  file: { name: string; size: number },
  rules: FormQuestion['config'],
): boolean {
  const extensions = (rules.accept ?? [])
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.startsWith('.'))
  const name = file.name.toLowerCase()
  const typeOk = extensions.length === 0 || extensions.some((extension) => name.endsWith(extension))
  const maxBytes = (rules.max_mb ?? DEFAULT_MAX_MB) * 1024 * 1024
  return typeOk && file.size <= maxBytes
}

export {
  EMAIL_ERROR_MESSAGE,
  attachmentKind,
  isAcceptedFile,
  isAnswered,
  isValidEmail,
  validateApplication,
}
export type { AnswerValue, ApplicationAnswers, ApplicationErrors, AttachmentKind }
