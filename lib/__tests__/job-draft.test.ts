import { describe, expect, it } from 'vitest'

import {
  EMPTY_DRAFT,
  applyDraftToJob,
  draftFromJob,
  draftToJob,
  formatAmount,
  validateDraft,
  validateTeamName,
} from '../jobs/draft'

import type { Job } from '../jobs/types'

const today = new Date(2026, 9, 7)
const owner = { name: 'Alice', colour: 'green' } as const

describe('validateDraft', () => {
  it('requires a title and a team', () => {
    expect(validateDraft(EMPTY_DRAFT, today)).toMatchObject({
      title: 'Enter a job title.',
      team: 'Choose a team or department.',
    })
  })

  it('rejects long titles and special characters', () => {
    expect(validateDraft({ ...EMPTY_DRAFT, title: 'x'.repeat(71) }, today).title).toMatch(
      /70 characters/,
    )
    expect(validateDraft({ ...EMPTY_DRAFT, title: 'Designer ★' }, today).title).toMatch(
      /special characters/,
    )
    expect(
      validateDraft({ ...EMPTY_DRAFT, title: 'UX/UI Designer (Senior)' }, today).title,
    ).toBeUndefined()
  })

  it('only checks the closing date once something is typed', () => {
    const base = { ...EMPTY_DRAFT, title: 'Designer', team: 'Design' }
    expect(validateDraft(base, today).closingDate).toBeUndefined()
    expect(
      validateDraft({ ...base, closingDate: { day: '1', month: '1', year: '2020' } }, today)
        .closingDate,
    ).toBeDefined()
  })

  it('flags a pay range that runs backwards', () => {
    const draft = {
      ...EMPTY_DRAFT,
      title: 'Designer',
      team: 'Design',
      payMin: '49,000',
      payMax: '39,000',
    }
    expect(validateDraft(draft, today).pay).toBeDefined()
    expect(validateDraft({ ...draft, payMin: '39,000', payMax: '49,000' }, today)).toEqual({})
  })
})

describe('formatAmount', () => {
  it('groups thousands and drops non-digits', () => {
    expect(formatAmount('39000')).toBe('39,000')
    expect(formatAmount('£1,2a50')).toBe('1,250')
    expect(formatAmount('abc')).toBe('')
  })
})

describe('draftToJob', () => {
  it('makes a draft job owned by its creator', () => {
    const job = draftToJob(
      {
        ...EMPTY_DRAFT,
        title: ' Product designer ',
        team: 'Product',
        workplace: 'Hybrid',
        hiringArea: 'area',
        areas: ['Ireland'],
      },
      'job-x',
      owner,
      today,
    )
    expect(job).toMatchObject({
      id: 'job-x',
      title: 'Product designer',
      department: 'Product',
      status: 'draft',
      location: 'Ireland',
      workplace: 'Hybrid',
      totalApplicants: 0,
      managers: [owner],
    })
  })

  it('uses the city of a chosen timezone as the location', () => {
    const job = draftToJob(
      {
        ...EMPTY_DRAFT,
        title: 'x',
        hiringArea: 'timezone',
        timezone: 'Dublin (Greenwich Mean Time) [+01:00]',
      },
      'job-y',
      owner,
      today,
    )
    expect(job.location).toBe('Dublin')
  })
})

describe('editing an existing job', () => {
  const job: Job = {
    id: 'job-9',
    title: 'Data Analyst',
    department: 'Analytics',
    employmentType: 'Part-time',
    location: 'Ireland',
    workplace: 'Remote',
    status: 'open',
    managers: [owner],
    createdBy: owner,
    totalApplicants: 29,
    newApplicants: 4,
    postedAt: '2026-10-15',
    createdAt: '2026-10-15',
    lastModifiedAt: '2026-10-15',
    lastViewedAt: '2026-10-15',
    closingDate: '2026-12-22',
  }

  it('fills the form from the job', () => {
    expect(draftFromJob(job)).toMatchObject({
      title: 'Data Analyst',
      team: 'Analytics',
      employmentType: 'Part-time',
      workplace: 'Remote',
      hiringArea: 'area',
      areas: ['Ireland'],
      closingDate: { day: '22', month: '12', year: '2026' },
    })
  })

  it('treats an "Anywhere" job as hiring anywhere', () => {
    expect(draftFromJob({ ...job, location: 'Anywhere' })).toMatchObject({
      hiringArea: 'anywhere',
      areas: [],
    })
  })

  it('applies edits without touching status, people or applicants', () => {
    const edited = applyDraftToJob(
      job,
      { ...draftFromJob(job), title: 'Senior Data Analyst' },
      today,
    )
    expect(edited).toMatchObject({
      id: 'job-9',
      title: 'Senior Data Analyst',
      status: 'open',
      totalApplicants: 29,
      postedAt: '2026-10-15',
      createdAt: '2026-10-15',
      // Saving stamps the edit with today's date, in local time.
      lastModifiedAt: '2026-10-07',
      lastViewedAt: '2026-10-15',
      closingDate: '2026-12-22',
    })
  })
})

describe('validateTeamName', () => {
  const existing = ['Engineering', 'People/HR']

  it('accepts a new, plainly named team', () => {
    expect(validateTeamName(' Lola ', existing)).toBeNull()
    expect(validateTeamName('R&D / Labs', existing)).toBeNull()
  })

  it('refuses an empty name, special characters and duplicates', () => {
    expect(validateTeamName('  ', existing)).toBe('Enter a team name.')
    expect(validateTeamName('Lola!', existing)).toBe(
      'Remove special characters from the team name.',
    )
    expect(validateTeamName('engineering', existing)).toBe('A team with this name already exists.')
  })
})
