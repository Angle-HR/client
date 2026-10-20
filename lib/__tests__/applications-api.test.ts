import { describe, expect, it } from 'vitest'

import {
  STATUS_TARGETS,
  answerText,
  applicationListParams,
  toApplicant,
  toApplicantDetail,
} from '../applications/api'

describe('toApplicant', () => {
  it('maps a row and marks an unopened one as new', () => {
    expect(
      toApplicant({
        id: 'a',
        name: 'Ada',
        email: 'a@x.io',
        status: 'flagged',
        opened: false,
        flag_count: 2,
      }),
    ).toMatchObject({ id: 'a', status: 'flagged', isNew: true, flagCount: 2, source: 'direct' })
  })

  it('falls back to received for a status it does not know', () => {
    expect(toApplicant({ status: 'mystery' }).status).toBe('received')
  })
})

describe('toApplicantDetail', () => {
  it('shows file answers as links and others as text', () => {
    const detail = toApplicantDetail({
      answers: [
        { question_id: 'q', label: 'Why', value: 'Because' },
        { question_id: 'cv', label: 'CV', file_id: 'f1' },
      ],
      can_decide: true,
      review: { note: 'ok' },
    })
    expect(detail.answers[0]).toMatchObject({ text: 'Because' })
    expect(detail.answers[1]).toMatchObject({ text: '', fileId: 'f1' })
    expect(detail.canDecide).toBe(true)
    expect(detail.reviewNote).toBe('ok')
  })
})

describe('answerText', () => {
  it('flattens lists and numbers', () => {
    expect(answerText(['a', 'b'])).toBe('a, b')
    expect(answerText(7)).toBe('7')
    expect(answerText(null)).toBe('')
  })
})

describe('applicationListParams', () => {
  it('joins statuses and drops empty filters', () => {
    expect(
      applicationListParams({ status: ['received', 'flagged'], q: ' ada ', new: true }, 'c1'),
    ).toEqual({
      status: 'received,flagged',
      q: 'ada',
      new: true,
      cursor: 'c1',
    })
    expect(applicationListParams({ status: [], q: ' ' })).toEqual({})
  })
})

describe('STATUS_TARGETS', () => {
  it('leaves flagged and final statuses to the review or nothing', () => {
    expect(STATUS_TARGETS.flagged).toEqual([])
    expect(STATUS_TARGETS.hired).toEqual([])
    expect(STATUS_TARGETS.in_review).toEqual(['rejected', 'hired', 'withdrawn'])
  })
})
