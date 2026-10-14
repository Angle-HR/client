import { describe, expect, it } from 'vitest'

import {
  addQuestion,
  changeQuestionType,
  createQuestion,
  defaultApplicationForm,
  moveQuestion,
  questionsInSection,
  readyQuestion,
  removeQuestion,
  restoreQuestion,
  setSpecialCategory,
  updateQuestion,
} from '../jobs/application-form'

describe('defaultApplicationForm', () => {
  it('starts with the drawn rows in each section', () => {
    const form = defaultApplicationForm()
    expect(questionsInSection(form, 'personal').map((question) => question.label)).toEqual([
      'Autofill with resume',
      'Full name',
      'Email address',
      'Location',
    ])
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

describe('addQuestion', () => {
  it('adds after the last question of its own section', () => {
    const form = defaultApplicationForm()
    const next = addQuestion(form, {
      ...createQuestion('new', 'short_text', 'profile'),
      label: 'Hi',
    })
    const profile = questionsInSection(next, 'profile').map((question) => question.id)
    expect(profile).toEqual(['cv-resume', 'socials', 'portfolio', 'new'])
    expect(next.questions.findIndex((question) => question.id === 'new')).toBe(
      next.questions.findIndex((question) => question.id === 'portfolio') + 1,
    )
  })
})

describe('updateQuestion', () => {
  it('changes only the question it is given', () => {
    const form = updateQuestion(defaultApplicationForm(), 'location', { required: true })
    expect(form.questions.find((question) => question.id === 'location')?.required).toBe(true)
    expect(form.questions.find((question) => question.id === 'cv-resume')?.required).toBe(false)
  })
})

describe('removeQuestion and restoreQuestion', () => {
  it('will not remove a locked question', () => {
    const form = defaultApplicationForm()
    expect(removeQuestion(form, 'full-name')).toBe(form)
  })

  it('restores a removed question at its old place in the section', () => {
    const form = defaultApplicationForm()
    const removed = form.questions.find((question) => question.id === 'socials')
    if (!removed) throw new Error('fixture missing')
    const index = questionsInSection(form, 'profile').indexOf(removed)
    const without = removeQuestion(form, 'socials')
    expect(questionsInSection(without, 'profile').map((question) => question.id)).toEqual([
      'cv-resume',
      'portfolio',
    ])
    const restored = restoreQuestion(without, removed, index)
    expect(questionsInSection(restored, 'profile').map((question) => question.id)).toEqual([
      'cv-resume',
      'socials',
      'portfolio',
    ])
  })

  it('does not add a question twice when restoring', () => {
    const form = defaultApplicationForm()
    const existing = form.questions.find((question) => question.id === 'full-name')
    if (!existing) throw new Error('fixture missing')
    expect(restoreQuestion(form, existing, 0)).toBe(form)
  })
})

describe('moveQuestion', () => {
  it('reorders within the section only', () => {
    const form = moveQuestion(defaultApplicationForm(), 'portfolio', 0)
    expect(questionsInSection(form, 'profile').map((question) => question.id)).toEqual([
      'portfolio',
      'cv-resume',
      'socials',
    ])
    expect(questionsInSection(form, 'personal')).toHaveLength(4)
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
    const ticked = setSpecialCategory(defaultApplicationForm(), 'health', true)
    expect(ticked.declarations).toEqual([{ category: 'health', legal_condition: '', purpose: '' }])
    const again = setSpecialCategory(ticked, 'health', true)
    expect(again.declarations).toHaveLength(1)
    expect(setSpecialCategory(again, 'health', false).declarations).toEqual([])
  })
})

describe('createQuestion and changeQuestionType', () => {
  it('starts choice questions with two blank options and linear scales at 1 to 10', () => {
    expect(createQuestion('a', 'single_choice', 'screening').options).toEqual(['', ''])
    expect(createQuestion('b', 'linear_scale', 'screening').scale).toEqual({ min: 1, max: 10 })
    expect(createQuestion('c', 'short_text', 'screening').options).toEqual([])
  })

  it('keeps the wording when the type changes', () => {
    const base = { ...createQuestion('a', 'short_text', 'personal'), label: 'Pets?' }
    const changed = changeQuestionType(base, 'checkbox')
    expect(changed.label).toBe('Pets?')
    expect(changed.options).toEqual(['', ''])
  })
})

describe('readyQuestion', () => {
  it('needs a label', () => {
    expect(readyQuestion(createQuestion('a', 'short_text', 'personal'))).toBeNull()
  })

  it('needs at least one non-blank option for a choice question', () => {
    const question = {
      ...createQuestion('a', 'dropdown', 'profile'),
      label: 'Pick one',
      options: ['  ', 'Yes '],
    }
    expect(readyQuestion({ ...question, options: ['', ' '] })).toBeNull()
    expect(readyQuestion(question)?.options).toEqual(['Yes'])
  })

  it('trims the wording and drops options for non-choice types', () => {
    const question = {
      ...createQuestion('a', 'long_text', 'screening'),
      label: '  Tell us  ',
      description: ' more ',
      options: ['ignored'],
    }
    expect(readyQuestion(question)).toMatchObject({
      label: 'Tell us',
      description: 'more',
      options: [],
    })
  })
})
