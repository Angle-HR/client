import { describe, expect, it } from 'vitest'

import {
  EMAIL_ERROR_MESSAGE,
  attachmentKind,
  isAcceptedFile,
  isAnswered,
  isValidEmail,
  validateApplication,
} from '../careers/application'
import { REVOLUT, jobForRole } from '../careers/fixtures'

import type { ApplicationAnswers } from '../careers/application'
import type { FormQuestion } from '../jobs/application-form'

const REQUIRED_KEYS = [
  'full-name',
  'email-address',
  'phone-number',
  'location',
  'resume',
  'portfolio',
]

function questionsOf(keys: Array<Pick<FormQuestion, 'key' | 'type' | 'required'>>): FormQuestion[] {
  return keys.map((item) => ({
    section: 'personal_information',
    label: item.key,
    description: '',
    locked: false,
    options: [],
    scale: null,
    config: {},
    system_key: null,
    ...item,
  }))
}

describe('isValidEmail', () => {
  it('accepts an address with a domain and rejects the rest', () => {
    expect(isValidEmail('jerry@example.com')).toBe(true)
    expect(isValidEmail(' jerry@example.com ')).toBe(true)
    expect(isValidEmail('jerry@example')).toBe(false)
    expect(isValidEmail('jerry example.com')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
  })
})

describe('isAnswered', () => {
  it('treats blank text and empty lists as unanswered, and any scale value as answered', () => {
    expect(isAnswered(undefined)).toBe(false)
    expect(isAnswered('   ')).toBe(false)
    expect(isAnswered('Jerry')).toBe(true)
    expect(isAnswered([])).toBe(false)
    expect(isAnswered(['Email'])).toBe(true)
    expect(isAnswered(0)).toBe(true)
  })
})

describe('validateApplication', () => {
  const questions = questionsOf([
    { key: 'full-name', type: 'short_text', required: true },
    { key: 'email-address', type: 'email', required: true },
    { key: 'nickname', type: 'short_text', required: false },
  ])

  it('marks a required question with no answer invalid, without copy', () => {
    const errors = validateApplication(questions, { 'email-address': 'jerry@example.com' })
    expect(errors).toEqual({ 'full-name': null })
  })

  it('shows the auth forms message for a malformed email', () => {
    const answers: ApplicationAnswers = {
      'full-name': 'Jerry',
      'email-address': 'jerry@example',
    }
    expect(validateApplication(questions, answers)).toEqual({
      'email-address': EMAIL_ERROR_MESSAGE,
    })
  })

  it('passes when every required question is answered and optional ones are blank', () => {
    const answers: ApplicationAnswers = {
      'full-name': 'Jerry',
      'email-address': 'jerry@example.com',
    }
    expect(validateApplication(questions, answers)).toEqual({})
  })

  it('treats an optional blank email as valid', () => {
    const optional = questionsOf([{ key: 'alt', type: 'email', required: false }])
    expect(validateApplication(optional, { alt: '' })).toEqual({})
  })

  it('requires an uploaded file on a required upload question', () => {
    const upload = questionsOf([{ key: 'resume', type: 'file_upload', required: true }])
    expect(validateApplication(upload, {})).toEqual({ resume: null })
    const file = new File(['cv'], 'cv.pdf', { type: 'application/pdf' })
    expect(validateApplication(upload, { resume: [file] })).toEqual({})
  })
})

describe('isAcceptedFile', () => {
  const resume: FormQuestion['config'] = { accept: ['.docx', '.dotx', '.pdf'], max_mb: 5 }

  it('keeps a file of an accepted extension within the size limit', () => {
    expect(isAcceptedFile({ name: 'CV.PDF', size: 1024 }, resume)).toBe(true)
    expect(isAcceptedFile({ name: 'cv.docx', size: 5 * 1024 * 1024 }, resume)).toBe(true)
  })

  it('refuses another extension or a file over the limit', () => {
    expect(isAcceptedFile({ name: 'cv.exe', size: 1024 }, resume)).toBe(false)
    expect(isAcceptedFile({ name: 'cv.pdf', size: 5 * 1024 * 1024 + 1 }, resume)).toBe(false)
  })

  it('accepts any extension when the question lists none, and limits to 5 MB by default', () => {
    expect(isAcceptedFile({ name: 'anything.bin', size: 1024 }, {})).toBe(true)
    expect(isAcceptedFile({ name: 'big.bin', size: 6 * 1024 * 1024 }, {})).toBe(false)
  })
})

describe('attachmentKind', () => {
  it('maps a file name to the kind its row shows', () => {
    expect(attachmentKind('cv.pdf')).toBe('pdf')
    expect(attachmentKind('photo.PNG')).toBe('image')
    expect(attachmentKind('sheet.xlsx')).toBe('excel')
    expect(attachmentKind('cv.docx')).toBe('word')
  })
})

describe('jobForRole', () => {
  it('resolves every fixture role to a job with the drawn form', () => {
    for (const role of REVOLUT.roles) {
      const job = jobForRole(role)
      expect(job.id).toBe(role.id)
      expect(job.title).toBe(role.title)
      expect(job.team).toBe(role.team)
      const required = job.questions.filter((question) => question.required).map((q) => q.key)
      expect(required).toEqual(REQUIRED_KEYS)
      expect(job.questions[0]?.required).toBe(false)
    }
  })

  it('renders the description as the drawn sections', () => {
    const job = jobForRole(REVOLUT.roles[0]!)
    expect(job.descriptionHtml).toContain('<strong>About the job</strong>')
    expect(job.descriptionHtml).toContain('Top 3 skills needed for this role:')
    expect(job.placeholders['email-address']).toBe('hello@example.com...')
  })
})
