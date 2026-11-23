import { describe, expect, it } from 'vitest'

import { toApplicationBody, toCareersJobPage, toUploadBody } from '../careers/api'

import type { FormQuestion } from '../jobs/application-form'

function question(overrides: Partial<FormQuestion>): FormQuestion {
  return {
    key: 'q1',
    id: 'q1',
    section: 'screening',
    type: 'short_text',
    label: 'Q',
    description: '',
    required: false,
    locked: false,
    options: [],
    scale: null,
    config: {},
    system_key: null,
    ...overrides,
  }
}

describe('toCareersJobPage', () => {
  it('maps the public job onto the careers job', () => {
    const page = toCareersJobPage(
      {
        state: 'open',
        accepting: true,
        markets: ['GB'],
        consent_required: true,
        job: {
          title: 'Designer',
          company: 'Acme',
          department: 'Design',
          employment_type: 'full_time',
          workplace_type: 'onsite',
          location_text: 'London',
          description_sections: { about: { html: '<p>Hi</p>' } },
          questions: [{ id: 'a', type: 'email', section: 'personal_information', label: 'Email' }],
        },
      },
      'pub1',
    )
    expect(page?.company.name).toBe('Acme')
    expect(page?.job).toMatchObject({
      id: 'pub1',
      team: 'Design',
      location: 'London',
      workplace: 'On-site',
      employmentType: 'Full time',
      descriptionHtml: '<section><p>Hi</p></section>',
      markets: ['GB'],
      consentRequired: true,
    })
    expect(page?.job.questions[0]?.id).toBe('a')
  })

  it('is null without a job', () => {
    expect(toCareersJobPage({}, 'x')).toBeNull()
  })
})

describe('toApplicationBody', () => {
  const choice = question({
    key: 'c',
    id: 'c',
    type: 'multiple_choice',
    options: [
      { id: 'o1', label: 'One' },
      { id: 'o2', label: 'Two' },
    ],
  })

  it('keys answers by question id, sends option ids and skips empty answers', () => {
    const body = toApplicationBody({
      questions: [question({}), choice, question({ key: 'n', id: 'n' })],
      answers: { q1: 'hello', c: ['Two'], n: '' },
      uploads: {},
      markets: ['UK'],
      consentRequired: false,
      source: 'linkedin',
    })
    expect(body).toEqual({
      answers: { q1: 'hello', c: ['o2'] },
      candidate_country: 'GB',
      privacy_notice_acknowledged: true,
      consent: undefined,
      source: 'linkedin',
    })
  })

  it('sends the candidate country as an ISO code, the picked market when the job has several', () => {
    const base = { questions: [], answers: {}, uploads: {}, consentRequired: false }
    expect(
      toApplicationBody({ ...base, markets: ['UK', 'US'], market: 'UK' }).candidate_country,
    ).toBe('GB')
    expect(
      toApplicationBody({ ...base, markets: ['UK', 'US'], market: 'US' }).candidate_country,
    ).toBe('US')
  })

  it('swaps files for upload tokens and asks for consent when required', () => {
    const file = new File(['x'], 'cv.pdf', { type: 'application/pdf' })
    const body = toApplicationBody({
      questions: [question({ key: 'cv', id: 'cv', type: 'file_upload' })],
      answers: { cv: [file] },
      uploads: { cv: ['tok'] },
      markets: ['GB', 'US'],
      consentRequired: true,
    })
    expect(body.answers).toEqual({ cv: 'tok' })
    expect(body.consent).toBe(true)
    expect(body.candidate_country).toBeUndefined()
  })
})

describe('toUploadBody', () => {
  it('describes the file for its question', () => {
    const file = new File(['abc'], 'cv.pdf', { type: 'application/pdf' })
    expect(toUploadBody(question({ id: 'cv' }), file)).toEqual({
      question_id: 'cv',
      filename: 'cv.pdf',
      content_type: 'application/pdf',
      size_bytes: 3,
    })
  })
})

describe('public job extras', () => {
  it('shows pay, seniority, experience and skills', () => {
    const page = toCareersJobPage(
      {
        job: {
          title: 'T',
          pay: { currency: 'GBP', min: 5000000, max: 7000000, period: 'year' },
          seniority: 'Senior',
          experience: '3-5 years',
          skills: ['Go', 'SQL'],
        },
      },
      'x',
    )
    expect(page?.job.pay).toBe('GBP 50,000 - 70,000 per year')
    expect(page?.job.seniority).toBe('Senior')
    expect(page?.job.experience).toBe('3-5 years')
    expect(page?.job.skills).toEqual(['Go', 'SQL'])
  })

  it('leaves them out when absent', () => {
    const job = toCareersJobPage({ job: { title: 'T' } }, 'x')?.job
    expect(job?.pay).toBeUndefined()
    expect(job?.skills).toBeUndefined()
  })
})
