/**
 * The application form a candidate fills in when they apply. Figma: "Create
 * Application Form" 9270:375985 for the default rows, 9346:562575 for the
 * question types.
 *
 * Sections, types and config are the hiring API's own names (`/jobs/{id}/application-form`).
 * The design's section headings map onto the API's four sections. Position is
 * the order inside the array; it is renumbered when the form is saved.
 */

import type {
  ApiApplicationForm,
  ApiApplicationFormBody,
  ApiFormConfig,
  ApiFormOption,
  ApiFormQuestion,
} from './api-types'

type QuestionSection = 'personal_information' | 'profile' | 'eligibility' | 'screening'

type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'number'
  | 'email'
  | 'phone_number'
  | 'single_choice'
  | 'multiple_choice'
  | 'checkbox'
  | 'dropdown'
  | 'linear_scale'
  | 'image_upload'
  | 'file_upload'
  | 'link'
  | 'date'
  | 'autofill_resume'

type SpecialCategoryKey =
  | 'health_disability'
  | 'race_ethnicity'
  | 'religion_belief'
  | 'criminal_records'

interface FormOption {
  /** Absent on an option not yet saved. */
  id?: string
  label: string
}

interface QuestionScale {
  min: number
  max: number
  min_label?: string
  max_label?: string
}

/** Upload limits, as the API gives them. Only file, image and resume questions keep them. */
type UploadRules = Pick<ApiFormConfig, 'accept' | 'max_mb'>

interface FormQuestion {
  /** Keys the row in the builder. A saved question uses its API id; a new one a local key. */
  key: string
  /** The API's id. Absent until the question is saved, and then not sent. */
  id?: string
  section: QuestionSection
  type: QuestionType
  label: string
  description: string
  helper_text?: string
  required: boolean
  /** Locked rows cannot be removed, moved or made optional. Set by the server. */
  locked: boolean
  /** Choice types only: the options, in the order shown. */
  options: FormOption[]
  /** Linear scale only. */
  scale: QuestionScale | null
  config: UploadRules
  system_key: string | null
  /** Not drawn in the design; sent back exactly as received. */
  knockout?: ApiFormQuestion['knockout']
  special_category?: ApiFormQuestion['special_category']
}

/** One special category the candidate is asked about, with the recruiter's lawful basis. */
interface FormDeclaration {
  category: SpecialCategoryKey
  /** The API's condition value. Empty until the recruiter chooses one. */
  legalCondition: string
  /** Why the data is collected. Empty until the recruiter writes it. */
  purpose: string
}

interface ApplicationForm {
  questions: FormQuestion[]
  declarations: FormDeclaration[]
}

interface QuestionTypeOption {
  type: QuestionType
  /** The name in the "Add a question" modal and the type dropdown. */
  label: string
  /** The name on the type pill while an editor is open. */
  pillLabel: string
  group: 'Input' | 'Choice' | 'Others'
}

/** Figma 9270:377879 (Add a question) and 9270:376125 (type dropdown). */
const QUESTION_TYPES: readonly QuestionTypeOption[] = [
  { type: 'short_text', label: 'Short text', pillLabel: 'Short text Field', group: 'Input' },
  { type: 'long_text', label: 'Long text', pillLabel: 'Long text Field', group: 'Input' },
  { type: 'number', label: 'Number', pillLabel: 'Number', group: 'Input' },
  { type: 'email', label: 'Email', pillLabel: 'Email', group: 'Input' },
  { type: 'phone_number', label: 'Phone number', pillLabel: 'Phone number', group: 'Input' },
  { type: 'single_choice', label: 'Single choice', pillLabel: 'Single choice', group: 'Choice' },
  {
    type: 'multiple_choice',
    label: 'Multiple choice',
    pillLabel: 'Multiple choice',
    group: 'Choice',
  },
  { type: 'checkbox', label: 'Checkbox', pillLabel: 'Checkbox', group: 'Choice' },
  { type: 'dropdown', label: 'Dropdown', pillLabel: 'Dropdown', group: 'Choice' },
  { type: 'linear_scale', label: 'Linear scale', pillLabel: 'Linear scale', group: 'Choice' },
  { type: 'image_upload', label: 'Image upload', pillLabel: 'Image', group: 'Others' },
  { type: 'file_upload', label: 'File upload', pillLabel: 'File upload', group: 'Others' },
  { type: 'link', label: 'Link', pillLabel: 'Link', group: 'Others' },
  { type: 'date', label: 'Date Picker', pillLabel: 'Date Picker', group: 'Others' },
  {
    type: 'autofill_resume',
    label: 'Autofill with resume',
    pillLabel: 'Autofill with resume',
    group: 'Others',
  },
]

/**
 * The API's four sections, in the order the design shows them. The design's
 * headings: PERSONAL INFORMATION, PROFILE, ELIGIBILITY, AVAILABILITY &
 * COMPENSATION (under "Eligibility") and SCREENING QUESTIONS.
 */
const QUESTION_SECTIONS: readonly QuestionSection[] = [
  'personal_information',
  'profile',
  'eligibility',
  'screening',
]

/** Figma 9270:375985 "Special category data" checkboxes, in the order shown. */
const SPECIAL_CATEGORIES: readonly { key: SpecialCategoryKey; label: string }[] = [
  { key: 'health_disability', label: 'Health / disability (reasonable adjustments)' },
  { key: 'race_ethnicity', label: 'Race / ethnicity (diversity monitoring)' },
  { key: 'religion_belief', label: 'Religion or belief' },
  { key: 'criminal_records', label: 'Criminal records' },
]

/** The longest purpose the API accepts, in characters. */
const PURPOSE_MAX_LENGTH = 300

const ART_9_CONDITIONS: readonly { value: string; label: string }[] = [
  { value: 'explicit_consent', label: 'Explicit consent' },
  { value: 'employment_law', label: 'Employment and social security law' },
  { value: 'legal_claims', label: 'Establishment or defence of legal claims' },
  { value: 'substantial_public_interest', label: 'Substantial public interest' },
  { value: 'occupational_medicine', label: 'Occupational medicine' },
]

const ART_10_CONDITIONS: readonly { value: string; label: string }[] = [
  { value: 'law_authorised', label: 'Authorised by law' },
  { value: 'official_authority', label: 'Under the control of official authority' },
]

/** The legal conditions a category can be collected under: Art. 10 for criminal records, else Art. 9. */
function legalConditionsFor(
  category: SpecialCategoryKey,
): readonly { value: string; label: string }[] {
  return category === 'criminal_records' ? ART_10_CONDITIONS : ART_9_CONDITIONS
}

const CHOICE_TYPES: readonly QuestionType[] = [
  'single_choice',
  'multiple_choice',
  'checkbox',
  'dropdown',
]

/** The types whose config the API keeps: the upload limits. */
const UPLOAD_TYPES: readonly QuestionType[] = ['image_upload', 'file_upload', 'autofill_resume']

const DEFAULT_SCALE: QuestionScale = { min: 1, max: 10 }

function isChoiceType(type: QuestionType): boolean {
  return CHOICE_TYPES.includes(type)
}

/** Autofill with resume is drawn without a Required toggle. */
function hasRequiredToggle(type: QuestionType): boolean {
  return type !== 'autofill_resume'
}

function typeOption(type: QuestionType): QuestionTypeOption {
  const found = QUESTION_TYPES.find((option) => option.type === type)
  if (!found) throw new Error(`Unknown question type: ${type}`)
  return found
}

/**
 * The rows the form starts with, as drawn. Used only when there is no job to
 * load a form for. Full name and Email are locked, so they stay on the form.
 */
function defaultApplicationForm(): ApplicationForm {
  const row = (
    key: string,
    section: QuestionSection,
    type: QuestionType,
    label: string,
    extra: Partial<FormQuestion> = {},
  ): FormQuestion => ({
    key,
    section,
    type,
    label,
    description: '',
    required: false,
    locked: false,
    options: [],
    scale: null,
    config: {},
    system_key: null,
    ...extra,
  })

  return {
    questions: [
      row('autofill-resume', 'personal_information', 'autofill_resume', 'Autofill with resume', {
        system_key: 'autofill_resume',
      }),
      row('full-name', 'personal_information', 'short_text', 'Full name', {
        required: true,
        locked: true,
        system_key: 'full_name',
      }),
      row('email-address', 'personal_information', 'email', 'Email address', {
        required: true,
        locked: true,
        system_key: 'email',
      }),
      row('location', 'personal_information', 'short_text', 'Location'),
      row('cv-resume', 'profile', 'file_upload', 'CV / Resume'),
      // The design reads "Linkedln"; a default label should not ship that typo.
      row('socials', 'profile', 'link', 'Socials - LinkedIn / Twitter'),
      row('portfolio', 'profile', 'link', 'Portfolio Link / Github'),
      row('right-to-work', 'eligibility', 'single_choice', 'Right to work'),
      row('notice-period', 'eligibility', 'short_text', "What's your notice period?"),
      row('salary-expectations', 'eligibility', 'number', 'What are your salary expectations?'),
      // The design cuts this label off with "..."; the full wording is not in the file.
      row(
        'screening-expectations',
        'screening',
        'long_text',
        'Describe a situation where you had to manage expectations fr...',
      ),
    ],
    declarations: [],
  }
}

/** The questions of one section, in the order they are shown. */
function questionsInSection(form: ApplicationForm, section: QuestionSection): FormQuestion[] {
  return form.questions.filter((question) => question.section === section)
}

/** A blank question of a type, not yet saved. The editor fills it in. */
function createQuestion(key: string, type: QuestionType, section: QuestionSection): FormQuestion {
  return {
    key,
    section,
    type,
    label: '',
    description: '',
    required: false,
    locked: false,
    // Two blank options to start, shown with the editor's placeholders.
    options: isChoiceType(type) ? [{ label: '' }, { label: '' }] : [],
    scale: type === 'linear_scale' ? DEFAULT_SCALE : null,
    config: {},
    system_key: null,
  }
}

/** Switches the type of a question being edited, keeping its wording. */
function changeQuestionType(question: FormQuestion, type: QuestionType): FormQuestion {
  return {
    ...question,
    type,
    options:
      isChoiceType(type) && question.options.length === 0
        ? [{ label: '' }, { label: '' }]
        : question.options,
    scale: type === 'linear_scale' ? (question.scale ?? DEFAULT_SCALE) : null,
  }
}

/** Adds a question after the last one in its section. */
function addQuestion(form: ApplicationForm, question: FormQuestion): ApplicationForm {
  const lastInSection = findLastIndex(form.questions, (item) => item.section === question.section)
  const questions = [...form.questions]
  questions.splice(lastInSection + 1, 0, question)
  return { ...form, questions }
}

/** Changes a question. The key and section stay as they are. */
function updateQuestion(
  form: ApplicationForm,
  key: string,
  patch: Partial<Omit<FormQuestion, 'key' | 'section'>>,
): ApplicationForm {
  return {
    ...form,
    questions: form.questions.map((question) =>
      question.key === key ? { ...question, ...patch } : question,
    ),
  }
}

/** Removes a question unless it is locked. */
function removeQuestion(form: ApplicationForm, key: string): ApplicationForm {
  const target = form.questions.find((question) => question.key === key)
  if (!target || target.locked) return form
  return { ...form, questions: form.questions.filter((question) => question !== target) }
}

/**
 * Puts a removed question back where it was, at its index within the section.
 * Used by the Undo on the "Question deleted" toast.
 */
function restoreQuestion(
  form: ApplicationForm,
  question: FormQuestion,
  indexInSection: number,
): ApplicationForm {
  if (form.questions.some((item) => item.key === question.key)) return form
  const sectionIndexes = form.questions.flatMap((item, index) =>
    item.section === question.section ? [index] : [],
  )
  // Before the question that now sits at that index, or after the section's last one.
  const anchor = sectionIndexes[Math.max(indexInSection, 0)]
  const at = anchor ?? (sectionIndexes[sectionIndexes.length - 1] ?? -1) + 1
  const questions = [...form.questions]
  questions.splice(at, 0, question)
  return { ...form, questions }
}

/**
 * Moves a question to an index within its own section, as the drag handle
 * does. A move that would shift a locked row is refused.
 */
function moveQuestion(form: ApplicationForm, key: string, toIndex: number): ApplicationForm {
  const moving = form.questions.find((question) => question.key === key)
  if (!moving || moving.locked) return form

  const sectionQuestions = questionsInSection(form, moving.section)
  const from = sectionQuestions.indexOf(moving)
  const target = Math.min(Math.max(toIndex, 0), sectionQuestions.length - 1)
  if (from === target) return form

  const reordered = [...sectionQuestions]
  reordered.splice(from, 1)
  reordered.splice(target, 0, moving)

  // Locked rows keep their place; a move that displaces one is refused.
  const lockedStayed = sectionQuestions.every(
    (question, index) => !question.locked || reordered[index] === question,
  )
  if (!lockedStayed) return form

  // Write the section's new order back into the slots it already occupies.
  const slots = form.questions.flatMap((question, index) =>
    question.section === moving.section ? [index] : [],
  )
  const questions = [...form.questions]
  slots.forEach((slot, index) => {
    const next = reordered[index]
    if (next) questions[slot] = next
  })
  return { ...form, questions }
}

/** Ticks or unticks a special category. Ticked ones are kept as declarations. */
function setSpecialCategory(
  form: ApplicationForm,
  category: SpecialCategoryKey,
  checked: boolean,
): ApplicationForm {
  const others = form.declarations.filter((item) => item.category !== category)
  if (!checked) return { ...form, declarations: others }
  return { ...form, declarations: [...others, { category, legalCondition: '', purpose: '' }] }
}

/** Sets the legal condition or purpose of a ticked category. */
function updateDeclaration(
  form: ApplicationForm,
  category: SpecialCategoryKey,
  changes: Partial<Pick<FormDeclaration, 'legalCondition' | 'purpose'>>,
): ApplicationForm {
  return {
    ...form,
    declarations: form.declarations.map((item) =>
      item.category === category ? { ...item, ...changes } : item,
    ),
  }
}

/** What is wrong with one ticked category, as messages for its two fields. */
interface DeclarationIssues {
  legalCondition?: string
  purpose?: string
}

/** The ticked categories that cannot be saved yet, by category. Empty when all are complete. */
function declarationIssues(
  form: ApplicationForm,
): Partial<Record<SpecialCategoryKey, DeclarationIssues>> {
  const issues: Partial<Record<SpecialCategoryKey, DeclarationIssues>> = {}
  for (const item of form.declarations) {
    const found: DeclarationIssues = {}
    if (!legalConditionsFor(item.category).some((option) => option.value === item.legalCondition)) {
      found.legalCondition = 'Choose the legal condition for collecting this data'
    }
    const purpose = item.purpose.trim()
    if (!purpose) found.purpose = 'Say why this data is collected'
    else if ([...purpose].length > PURPOSE_MAX_LENGTH) {
      found.purpose = `Keep this to ${PURPOSE_MAX_LENGTH} characters or fewer`
    }
    if (found.legalCondition || found.purpose) issues[item.category] = found
  }
  return issues
}

/**
 * Server field errors (paths like `special_categories[0].legal_condition`, or
 * `declarations[0]...`) as issues by category. The index is the position in the
 * declarations that were sent. Returns the errors it could not place.
 */
function declarationIssuesFromServer(
  form: ApplicationForm,
  fields: { path: string; message: string }[],
): { issues: Partial<Record<SpecialCategoryKey, DeclarationIssues>>; unplaced: string[] } {
  const issues: Partial<Record<SpecialCategoryKey, DeclarationIssues>> = {}
  const unplaced: string[] = []
  for (const field of fields) {
    const match = /^(?:special_categories|declarations)\[(\d+)\]\.(legal_condition|purpose)$/.exec(
      field.path,
    )
    const category = match ? form.declarations[Number(match[1])]?.category : undefined
    if (!match || !category) {
      unplaced.push(field.message)
      continue
    }
    const key = match[2] === 'purpose' ? 'purpose' : 'legalCondition'
    issues[category] = { ...issues[category], [key]: field.message }
  }
  return { issues, unplaced }
}

function isSpecialCategoryChecked(form: ApplicationForm, category: SpecialCategoryKey): boolean {
  return form.declarations.some((item) => item.category === category)
}

/**
 * The question as it is saved: wording trimmed, blank options dropped.
 * Returns null when the question cannot be saved yet.
 */
function readyQuestion(question: FormQuestion): FormQuestion | null {
  const label = question.label.trim()
  if (!label) return null
  const options = question.options
    .map((option) => ({ ...option, label: option.label.trim() }))
    .filter((option) => option.label)
  if (isChoiceType(question.type) && options.length === 0) return null
  return {
    ...question,
    label,
    description: question.description.trim(),
    options: isChoiceType(question.type) ? options : [],
  }
}

/** The API's questions into the form. Questions are ordered by position. */
function formFromApi(view: ApiApplicationForm): ApplicationForm {
  const sorted = [...(view.questions ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  return {
    questions: sorted.map(questionFromApi),
    declarations: (view.declarations ?? []).map((item) => ({
      category: item.category as SpecialCategoryKey,
      legalCondition: item.legal_condition ?? '',
      purpose: item.purpose ?? '',
    })),
  }
}

/**
 * The form as `PUT /jobs/{id}/application-form` takes it. Positions run in the
 * order the form shows them, across all four sections. The whole form is sent.
 */
function formToApi(form: ApplicationForm): ApiApplicationFormBody {
  const questions = QUESTION_SECTIONS.flatMap((section) => questionsInSection(form, section))
  return {
    questions: questions.map((question, position) => questionToApi(question, position)),
    declarations: form.declarations.map((item) => ({
      category: item.category,
      legal_condition: item.legalCondition,
      purpose: item.purpose.trim(),
    })),
  }
}

function questionFromApi(question: ApiFormQuestion): FormQuestion {
  const type = (question.type ?? 'short_text') as QuestionType
  const config = question.config ?? {}
  return {
    key: question.id ?? '',
    id: question.id,
    section: question.section as QuestionSection,
    type,
    label: question.label ?? '',
    description: question.description ?? '',
    helper_text: question.helper_text,
    required: question.required ?? false,
    locked: question.locked ?? false,
    options: (config.options ?? []).map(optionFromApi),
    scale:
      type === 'linear_scale'
        ? {
            min: config.min ?? DEFAULT_SCALE.min,
            max: config.max ?? DEFAULT_SCALE.max,
            min_label: config.min_label,
            max_label: config.max_label,
          }
        : null,
    config: { accept: config.accept, max_mb: config.max_mb },
    system_key: question.system_key ?? null,
    knockout: question.knockout,
    special_category: question.special_category,
  }
}

function questionToApi(question: FormQuestion, position: number): ApiFormQuestion {
  return {
    // A new question has no id: the server assigns one.
    ...(question.id ? { id: question.id } : {}),
    section: question.section,
    position,
    type: question.type,
    label: question.label,
    description: question.description || undefined,
    helper_text: question.helper_text,
    required: question.required,
    locked: question.locked,
    system_key: question.system_key,
    config: configToApi(question),
    knockout: question.knockout,
    special_category: question.special_category,
  }
}

function configToApi(question: FormQuestion): ApiFormConfig | undefined {
  if (isChoiceType(question.type)) {
    return { options: question.options.map(optionToApi) }
  }
  if (question.type === 'linear_scale') {
    const scale = question.scale ?? DEFAULT_SCALE
    return {
      min: scale.min,
      max: scale.max,
      min_label: scale.min_label,
      max_label: scale.max_label,
    }
  }
  if (UPLOAD_TYPES.includes(question.type)) {
    return { accept: question.config.accept, max_mb: question.config.max_mb }
  }
  return undefined
}

function optionFromApi(option: ApiFormOption): FormOption {
  return option.id ? { id: option.id, label: option.label ?? '' } : { label: option.label ?? '' }
}

function optionToApi(option: FormOption): ApiFormOption {
  return option.id ? { id: option.id, label: option.label } : { label: option.label }
}

function findLastIndex<T>(items: readonly T[], test: (item: T) => boolean): number {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index]
    if (item !== undefined && test(item)) return index
  }
  return -1
}

export {
  PURPOSE_MAX_LENGTH,
  QUESTION_SECTIONS,
  QUESTION_TYPES,
  SPECIAL_CATEGORIES,
  addQuestion,
  changeQuestionType,
  createQuestion,
  declarationIssues,
  declarationIssuesFromServer,
  defaultApplicationForm,
  formFromApi,
  formToApi,
  hasRequiredToggle,
  isChoiceType,
  isSpecialCategoryChecked,
  legalConditionsFor,
  moveQuestion,
  questionsInSection,
  readyQuestion,
  removeQuestion,
  restoreQuestion,
  setSpecialCategory,
  typeOption,
  updateDeclaration,
  updateQuestion,
}
export type {
  ApplicationForm,
  DeclarationIssues,
  FormDeclaration,
  FormOption,
  FormQuestion,
  QuestionScale,
  QuestionSection,
  QuestionType,
  QuestionTypeOption,
  SpecialCategoryKey,
}
