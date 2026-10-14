import { describe, expect, it } from 'vitest'

import {
  addQuestion,
  changeQuestionType,
  createQuestion,
  defaultApplicationForm,
  formFromApi,
  formToApi,
  moveQuestion,
  questionsInSection,
  readyQuestion,
  removeQuestion,
  restoreQuestion,
  setSpecialCategory,
  updateQuestion,
} from '../jobs/application-form'

import type { ApiApplicationForm } from '../jobs/api-types'

/** The six rows a fresh job's form comes back with, as the API sends them. */
const serverForm: ApiApplicationForm = {
  job_id: 'job-1',
  job_revision: 3,
  automated_screening_enabled: false,
  warnings: [],
  declarations: [],
  questions: [
    {
      id: 'q-name',
      section: 'personal_information',
      position: 0,
      type: 'short_text',
      label: 'Full name',
      required: true,
      locked: true,
      system_key: 'full_name',
    },
    {
      id: 'q-email',
      section: 'personal_information',
      position: 1,
      type: 'email',
      label: 'Email',
      required: true,
      locked: true,
      system_key: 'email',
    },
    {
      id: 'q-phone',
      section: 'personal_information',
      position: 2,
      type: 'phone_number',
      label: 'Phone number',
      required: false,
      locked: false,
      system_key: null,
    },
    {
      id: 'q-location',
      section: 'personal_information',
      position: 3,
      type: 'short_text',
      label: 'Location',
      required: false,
      locked: false,
      system_key: 'location',
    },
    {
      id: 'q-cv',
      section: 'profile',
      position: 4,
      type: 'file_upload',
      label: 'CV',
      required: true,
      locked: true,
      system_key: 'cv',
      config: { accept: ['pdf'], max_mb: 5 },
    },
    {
      id: 'q-autofill',
      section: 'profile',
      position: 5,
      type: 'autofill_resume',
      label: 'Autofill with resume',
      required: false,
      locked: true,
      system_key: 'autofill_resume',
      config: { accept: ['pdf'], max_mb: 5 },
    },
  ],
}

describe('defaultApplicationForm', () => {
  it('starts with the drawn rows in each section', () => {
    const form = defaultApplicationForm()
    expect(
      questionsInSection(form, 'personal_information').map((question) => question.label),
    ).toEqual(['Autofill with resume', 'Full name', 'Email address', 'Location'])
    expect(questionsInSection(form, 'profile')).toHaveLength(3)
    expect(questionsInSection(form, 'eligibility')).toHaveLength(3)
    expect(questionsInSection(form, 'screening')).toHaveLength(1)
  })

  it('locks Full name and Email, which are required', () => {
    const form = defaultApplicationForm()
    const locked = form.questions.filter((question) => question.locked)
    expect(locked.map((question) => question.label)).toEqual(['Full name', 'Email address'])
    expect(locked.every((question) => question.required)).toBe(true)
  })

  it('starts with no special categories checked', () => {
    expect(defaultApplicationForm().declarations).toEqual([])
  })
})

describe('formFromApi and formToApi', () => {
  it('round-trips the server form without changing it', () => {
    expect(formToApi(formFromApi(serverForm))).toEqual({
      questions: serverForm.questions,
      declarations: [],
    })
  })

  it('loads the questions in position order', () => {
    const shuffled = {
      ...serverForm,
      questions: [...(serverForm.questions ?? [])].reverse(),
    }
    expect(formFromApi(shuffled).questions.map((question) => question.id)).toEqual(
      serverForm.questions?.map((question) => question.id),
    )
  })

  it('keeps the ids and the options of saved choice questions', () => {
    const withChoice: ApiApplicationForm = {
      ...serverForm,
      questions: [
        ...(serverForm.questions ?? []),
        {
          id: 'q-right',
          section: 'eligibility',
          position: 6,
          type: 'single_choice',
          label: 'Right to work',
          required: true,
          locked: false,
          system_key: null,
          config: {
            options: [
              { id: 'o-yes', label: 'Yes' },
              { id: 'o-no', label: 'No' },
            ],
          },
        },
      ],
    }
    const form = formFromApi(withChoice)
    expect(form.questions.find((question) => question.id === 'q-right')?.options).toEqual([
      { id: 'o-yes', label: 'Yes' },
      { id: 'o-no', label: 'No' },
    ])
    expect(formToApi(form).questions?.[6]).toEqual(withChoice.questions?.[6])
  })

  it('renumbers positions in display order and leaves ids off new questions', () => {
    const form = formFromApi(serverForm)
    const added = addQuestion(form, {
      ...createQuestion('new-key', 'short_text', 'profile'),
      label: 'Notice period',
    })
    const sent = formToApi(added).questions ?? []
    // The new question sits after the profile rows, so it is sent at position 6.
    expect(sent.map((question) => question.position)).toEqual([0, 1, 2, 3, 4, 5, 6])
    expect(sent[6]).toMatchObject({ label: 'Notice period', section: 'profile', position: 6 })
    expect(sent[6]).not.toHaveProperty('id')
  })

  it('sends a linear scale as max, min and labels', () => {
    const base = createQuestion('scale', 'linear_scale', 'screening')
    const question = {
      ...base,
      label: 'Rate yourself',
      scale: { min: 0, max: 5, min_label: 'Low', max_label: 'High' },
    }
    const form = formFromApi({ questions: [] })
    const sent = formToApi(addQuestion(form, question)).questions?.[0]
    expect(sent?.config).toEqual({ min: 0, max: 5, min_label: 'Low', max_label: 'High' })
  })

  it('sends special categories as category only', () => {
    const form = setSpecialCategory(formFromApi(serverForm), 'health_disability', true)
    expect(formToApi(form).declarations).toEqual([{ category: 'health_disability' }])
  })

  it('reads the special categories the API returns', () => {
    const form = formFromApi({
      ...serverForm,
      declarations: [
        {
          category: 'criminal_records',
          legal_condition: 'Art. 10 condition',
          purpose: 'Right to work checks',
        },
      ],
    })
    expect(form.declarations).toEqual([{ category: 'criminal_records' }])
  })
})

describe('addQuestion', () => {
  it('adds after the last question of its own section', () => {
    const form = defaultApplicationForm()
    const next = addQuestion(form, {
      ...createQuestion('new', 'short_text', 'profile'),
      label: 'Hi',
    })
    const profile = questionsInSection(next, 'profile').map((question) => question.key)
    expect(profile).toEqual(['cv-resume', 'socials', 'portfolio', 'new'])
    expect(next.questions.findIndex((question) => question.key === 'new')).toBe(
      next.questions.findIndex((question) => question.key === 'portfolio') + 1,
    )
  })
})

describe('updateQuestion', () => {
  it('changes only the question it is given', () => {
    const form = updateQuestion(defaultApplicationForm(), 'location', { required: true })
    expect(form.questions.find((question) => question.key === 'location')?.required).toBe(true)
    expect(form.questions.find((question) => question.key === 'cv-resume')?.required).toBe(false)
  })
})

describe('removeQuestion and restoreQuestion', () => {
  it('will not remove a locked question', () => {
    const form = defaultApplicationForm()
    expect(removeQuestion(form, 'full-name')).toBe(form)
  })

  it('restores a removed question at its old place in the section', () => {
    const form = defaultApplicationForm()
    const removed = form.questions.find((question) => question.key === 'socials')
    if (!removed) throw new Error('fixture missing')
    const index = questionsInSection(form, 'profile').indexOf(removed)
    const without = removeQuestion(form, 'socials')
    expect(questionsInSection(without, 'profile').map((question) => question.key)).toEqual([
      'cv-resume',
      'portfolio',
    ])
    const restored = restoreQuestion(without, removed, index)
    expect(questionsInSection(restored, 'profile').map((question) => question.key)).toEqual([
      'cv-resume',
      'socials',
      'portfolio',
    ])
  })

  it('does not add a question twice when restoring', () => {
    const form = defaultApplicationForm()
    const existing = form.questions.find((question) => question.key === 'full-name')
    if (!existing) throw new Error('fixture missing')
    expect(restoreQuestion(form, existing, 0)).toBe(form)
  })
})

describe('moveQuestion', () => {
  it('reorders within the section only', () => {
    const form = moveQuestion(defaultApplicationForm(), 'portfolio', 0)
    expect(questionsInSection(form, 'profile').map((question) => question.key)).toEqual([
      'portfolio',
      'cv-resume',
      'socials',
    ])
    expect(questionsInSection(form, 'personal_information')).toHaveLength(4)
  })

  it('refuses a move that would shift a locked row', () => {
    const form = defaultApplicationForm()
    // Moving Location above Full name would push a locked row out of place.
    expect(moveQuestion(form, 'location', 0)).toBe(form)
    // Locked rows themselves cannot move.
    expect(moveQuestion(form, 'full-name', 2)).toBe(form)
  })
})

describe('setSpecialCategory', () => {
  it('keeps one declaration per ticked category and drops it when unticked', () => {
    const ticked = setSpecialCategory(defaultApplicationForm(), 'health_disability', true)
    expect(ticked.declarations).toEqual([{ category: 'health_disability' }])
    const again = setSpecialCategory(ticked, 'health_disability', true)
    expect(again.declarations).toHaveLength(1)
    expect(setSpecialCategory(again, 'health_disability', false).declarations).toEqual([])
  })
})

describe('createQuestion and changeQuestionType', () => {
  it('starts choice questions with two blank options and linear scales at 1 to 10', () => {
    expect(createQuestion('a', 'single_choice', 'screening').options).toEqual([
      { label: '' },
      { label: '' },
    ])
    expect(createQuestion('b', 'linear_scale', 'screening').scale).toEqual({ min: 1, max: 10 })
    expect(createQuestion('c', 'short_text', 'screening').options).toEqual([])
  })

  it('keeps the wording when the type changes', () => {
    const base = { ...createQuestion('a', 'short_text', 'personal_information'), label: 'Pets?' }
    const changed = changeQuestionType(base, 'checkbox')
    expect(changed.label).toBe('Pets?')
    expect(changed.options).toEqual([{ label: '' }, { label: '' }])
  })
})

describe('readyQuestion', () => {
  it('needs a label', () => {
    expect(readyQuestion(createQuestion('a', 'short_text', 'personal_information'))).toBeNull()
  })

  it('needs at least one non-blank option for a choice question', () => {
    const question = {
      ...createQuestion('a', 'dropdown', 'profile'),
      label: 'Pick one',
      options: [{ label: '  ' }, { label: 'Yes ' }],
    }
    expect(readyQuestion({ ...question, options: [{ label: '' }, { label: ' ' }] })).toBeNull()
    expect(readyQuestion(question)?.options).toEqual([{ label: 'Yes' }])
  })

  it('trims the wording and drops options for non-choice types', () => {
    const question = {
      ...createQuestion('a', 'long_text', 'screening'),
      label: '  Tell us  ',
      description: ' more ',
      options: [{ label: 'ignored' }],
    }
    expect(readyQuestion(question)).toMatchObject({
      label: 'Tell us',
      description: 'more',
      options: [],
    })
  })
})
