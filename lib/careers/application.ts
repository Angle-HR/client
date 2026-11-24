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

/** Codes Intl names that are regions or reservations, not countries a candidate lives in. */
const NOT_COUNTRIES: ReadonlySet<string> = new Set(
  (
    'EU UN EZ ZZ QO XA XB AC CP DG EA IC TA CQ' +
    // Retired codes Intl still names: Dahomey, Upper Volta, Zaire, Netherlands Antilles, Metropolitan France,
    // East Germany, Burma, USSR, Yugoslavia, Serbia and Montenegro, East Timor, the UK's old code, New Hebrides,
    // North and South Vietnam, South Yemen, Rhodesia.
    ' DY HV ZR AN FX DD BU SU YU CS TP UK NH VD YD RH'
  ).split(' '),
)

interface CountryOption {
  code: string
  name: string
}

/**
 * Every ISO 3166-1 country the browser can name, sorted by name. A job open
 * "Anywhere" accepts any candidate, so the list is not limited to its markets.
 */
function allCountries(): CountryOption[] {
  const names = new Intl.DisplayNames(['en'], { type: 'region' })
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const found: CountryOption[] = []
  for (const a of letters) {
    for (const b of letters) {
      const code = `${a}${b}`
      let name: string | undefined
      try {
        name = names.of(code)
      } catch {
        continue
      }
      // Unassigned codes come back as the code itself; EU, UN and the like are not countries.
      if (name && name !== code && !NOT_COUNTRIES.has(code)) found.push({ code, name })
    }
  }
  // A name can still repeat (a renamed code); keep the first.
  const unique = found.filter((c, i) => found.findIndex((o) => o.name === c.name) === i)
  return unique.sort((x, y) => x.name.localeCompare(y.name, 'en'))
}

interface Declaration {
  country: string
  privacyAcknowledged: boolean
  consent: boolean
}

/** What the candidate must still confirm: a country, the privacy notice and, when asked, consent. */
function validateDeclaration(
  declaration: Declaration,
  consentRequired: boolean,
): Partial<Record<keyof Declaration, string>> {
  const errors: Partial<Record<keyof Declaration, string>> = {}
  if (!declaration.country) errors.country = 'Select the country you live in.'
  if (!declaration.privacyAcknowledged)
    errors.privacyAcknowledged = 'Confirm that you have read the privacy notice.'
  if (consentRequired && !declaration.consent) errors.consent = 'Give your consent to continue.'
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
  allCountries,
  validateDeclaration,
  attachmentKind,
  isAcceptedFile,
  isAnswered,
  isValidEmail,
  validateApplication,
}
export type {
  CountryOption,
  Declaration,
  AnswerValue,
  ApplicationAnswers,
  ApplicationErrors,
  AttachmentKind,
}
