/**
 * The application form a candidate fills in when they apply. Figma: "Create
 * Application Form" 9270:375985 for the default rows, 9346:562575 for the
 * question types.
 *
 * Field names follow the hiring API's FormQuestion where the builder needs
 * them. Position is the order inside the array, not a stored field.
 */

type QuestionSection = 'personal' | 'profile' | 'eligibility' | 'screening'

type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'number'
  | 'email'
  | 'phone'
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

type SpecialCategoryKey = 'health' | 'race' | 'religion' | 'criminal'

interface QuestionScale {
  min: number
  max: number
}

interface FormQuestion {
  id: string
  section: QuestionSection
  type: QuestionType
  label: string
  description: string
  required: boolean
  /** Locked rows cannot be removed, moved or made optional. */
  locked: boolean
  /** Choice types only: the option labels, in the order shown. */
  options: string[]
  /** Linear scale only. */
  scale: QuestionScale | null
  system_key: string | null
}

/** One checked category in "Special category data". Legal wording is filled in later. */
interface FormDeclaration {
  category: SpecialCategoryKey
  legal_condition: string
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
  { type: 'phone', label: 'Phone number', pillLabel: 'Phone number', group: 'Input' },
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

/** Figma 9270:375985 section titles, in the order they are shown. */
const QUESTION_SECTIONS: readonly QuestionSection[] = [
  'personal',
  'profile',
  'eligibility',
  'screening',
]

/** Figma 9270:375985 "Special category data" checkboxes, in the order shown. */
const SPECIAL_CATEGORIES: readonly { key: SpecialCategoryKey; label: string }[] = [
  { key: 'health', label: 'Health / disability (reasonable adjustments)' },
  { key: 'race', label: 'Race / ethnicity (diversity monitoring)' },
  { key: 'religion', label: 'Religion or belief' },
  { key: 'criminal', label: 'Criminal records' },
]

const CHOICE_TYPES: readonly QuestionType[] = [
  'single_choice',
  'multiple_choice',
  'checkbox',
  'dropdown',
]

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
 * The rows the form starts with, as drawn. Full name and Email are locked, so
 * they stay on the form and cannot be made optional.
 */
function defaultApplicationForm(): ApplicationForm {
  const row = (
    id: string,
    section: QuestionSection,
    type: QuestionType,
    label: string,
    extra: Partial<FormQuestion> = {},
  ): FormQuestion => ({
    id,
    section,
    type,
    label,
    description: '',
    required: false,
    locked: false,
    options: [],
    scale: null,
    system_key: null,
    ...extra,
  })

  return {
    questions: [
      row('autofill-resume', 'personal', 'autofill_resume', 'Autofill with resume', {
        system_key: 'autofill_resume',
      }),
      row('full-name', 'personal', 'short_text', 'Full name', {
        required: true,
        locked: true,
        system_key: 'full_name',
      }),
      row('email-address', 'personal', 'email', 'Email address', {
        required: true,
        locked: true,
        system_key: 'email',
      }),
      row('location', 'personal', 'short_text', 'Location'),
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
function createQuestion(id: string, type: QuestionType, section: QuestionSection): FormQuestion {
  return {
    id,
    section,
    type,
    label: '',
    description: '',
    required: false,
    locked: false,
    // Two blank options to start, shown with the editor's placeholders.
    options: isChoiceType(type) ? ['', ''] : [],
    scale: type === 'linear_scale' ? DEFAULT_SCALE : null,
    system_key: null,
  }
}

/** Switches the type of a question being edited, keeping its wording. */
function changeQuestionType(question: FormQuestion, type: QuestionType): FormQuestion {
  return {
    ...question,
    type,
    options: isChoiceType(type) && question.options.length === 0 ? ['', ''] : question.options,
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

/** Changes a question. The id and section stay as they are. */
function updateQuestion(
  form: ApplicationForm,
  id: string,
  patch: Partial<Omit<FormQuestion, 'id' | 'section'>>,
): ApplicationForm {
  return {
    ...form,
    questions: form.questions.map((question) =>
      question.id === id ? { ...question, ...patch } : question,
    ),
  }
}

/** Removes a question unless it is locked. */
function removeQuestion(form: ApplicationForm, id: string): ApplicationForm {
  const target = form.questions.find((question) => question.id === id)
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
  if (form.questions.some((item) => item.id === question.id)) return form
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
function moveQuestion(form: ApplicationForm, id: string, toIndex: number): ApplicationForm {
  const moving = form.questions.find((question) => question.id === id)
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
  return {
    ...form,
    declarations: [...others, { category, legal_condition: '', purpose: '' }],
  }
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
  const options = question.options.map((option) => option.trim()).filter(Boolean)
  if (isChoiceType(question.type) && options.length === 0) return null
  return {
    ...question,
    label,
    description: question.description.trim(),
    options: isChoiceType(question.type) ? options : [],
  }
}

function findLastIndex<T>(items: readonly T[], test: (item: T) => boolean): number {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index]
    if (item !== undefined && test(item)) return index
  }
  return -1
}

export {
  QUESTION_SECTIONS,
  QUESTION_TYPES,
  SPECIAL_CATEGORIES,
  addQuestion,
  changeQuestionType,
  createQuestion,
  defaultApplicationForm,
  hasRequiredToggle,
  isChoiceType,
  isSpecialCategoryChecked,
  moveQuestion,
  questionsInSection,
  readyQuestion,
  removeQuestion,
  restoreQuestion,
  setSpecialCategory,
  typeOption,
  updateQuestion,
}
export type {
  ApplicationForm,
  FormDeclaration,
  FormQuestion,
  QuestionScale,
  QuestionSection,
  QuestionType,
  QuestionTypeOption,
  SpecialCategoryKey,
}
