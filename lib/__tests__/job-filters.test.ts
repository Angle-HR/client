import { describe, expect, it } from 'vitest'

import { applyFilters, applySort, filterOptions, summariseValues } from '../jobs/filters'

import type { Job } from '../jobs/types'

const alice = { name: 'Alice', colour: 'green' } as const
const bob = { name: 'Bob', colour: 'yellow' } as const

function job(overrides: Partial<Job>): Job {
  return {
    id: 'job',
    title: 'Product Designer',
    department: 'Design',
    employmentType: 'Full-time',
    location: 'UK',
    workplace: 'Remote',
    status: 'open',
    managers: [alice],
    createdBy: alice,
    totalApplicants: 30,
    newApplicants: 7,
    postedAt: '2026-10-01',
    ...overrides,
  }
}

const today = new Date('2026-10-07T12:00:00Z')

const jobs = [
  job({
    id: 'a',
    status: 'open',
    department: 'Design',
    managers: [alice],
    totalApplicants: 30,
    postedAt: '2026-10-05',
  }),
  job({
    id: 'b',
    status: 'paused',
    department: 'Marketing',
    managers: [bob],
    totalApplicants: 5,
    postedAt: '2026-09-20',
  }),
  job({
    id: 'c',
    status: 'draft',
    department: 'Design',
    managers: [bob],
    totalApplicants: 0,
    postedAt: '2025-01-10',
  }),
]

const ids = (list: Job[]) => list.map((j) => j.id)

describe('applyFilters', () => {
  it('lets everything through when no values are chosen', () => {
    expect(
      ids(applyFilters(jobs, [{ field: 'status', operator: 'is', values: [] }], today)),
    ).toEqual(['a', 'b', 'c'])
  })

  it('matches any of the chosen values', () => {
    expect(
      ids(
        applyFilters(jobs, [{ field: 'status', operator: 'is', values: ['open', 'draft'] }], today),
      ),
    ).toEqual(['a', 'c'])
  })

  it('inverts with "is not"', () => {
    expect(
      ids(applyFilters(jobs, [{ field: 'team', operator: 'isNot', values: ['Design'] }], today)),
    ).toEqual(['b'])
  })

  it('requires every filter to pass', () => {
    expect(
      ids(
        applyFilters(
          jobs,
          [
            { field: 'team', operator: 'is', values: ['Design'] },
            { field: 'managedBy', operator: 'is', values: ['Bob'] },
          ],
          today,
        ),
      ),
    ).toEqual(['c'])
  })

  it('buckets dates and applicant counts into ranges', () => {
    expect(
      ids(applyFilters(jobs, [{ field: 'createdOn', operator: 'is', values: ['7d'] }], today)),
    ).toEqual(['a'])
    expect(
      ids(applyFilters(jobs, [{ field: 'createdOn', operator: 'is', values: ['older'] }], today)),
    ).toEqual(['c'])
    expect(
      ids(
        applyFilters(jobs, [{ field: 'applicants', operator: 'is', values: ['0', '1-10'] }], today),
      ),
    ).toEqual(['b', 'c'])
  })
})

describe('filterOptions', () => {
  it('lists every status in a fixed order', () => {
    expect(filterOptions(jobs, 'status').map((o) => o.value)).toEqual([
      'open',
      'paused',
      'draft',
      'closed',
      'archived',
      'expired',
    ])
  })

  it('lists distinct values from the jobs, alphabetically, with avatars for people', () => {
    expect(filterOptions(jobs, 'team').map((o) => o.label)).toEqual(['Design', 'Marketing'])
    expect(filterOptions(jobs, 'managedBy')).toEqual([
      { value: 'Alice', label: 'Alice', avatarColour: 'green' },
      { value: 'Bob', label: 'Bob', avatarColour: 'yellow' },
    ])
  })
})

describe('summariseValues', () => {
  const options = filterOptions(jobs, 'managedBy')

  it('names a single value and counts the rest', () => {
    expect(summariseValues(options, ['Alice'])).toBe('Alice')
    expect(summariseValues(options, ['Alice', 'Bob'])).toBe('Alice and 1 other')
    expect(summariseValues(options, ['Alice', 'Bob', 'Cara'])).toBe('Alice and 2 others')
  })
})

describe('applySort', () => {
  it('returns the list untouched without a sort', () => {
    expect(applySort(jobs, null)).toBe(jobs)
  })

  it('sorts numbers and names in either direction', () => {
    expect(ids(applySort(jobs, { field: 'totalApplicants', direction: 'asc' }))).toEqual([
      'c',
      'b',
      'a',
    ])
    expect(ids(applySort(jobs, { field: 'totalApplicants', direction: 'desc' }))).toEqual([
      'a',
      'b',
      'c',
    ])
    expect(ids(applySort(jobs, { field: 'managedBy', direction: 'asc' }))).toEqual(['a', 'b', 'c'])
  })

  it('keeps jobs without a closing date last', () => {
    const dated = [job({ id: 'x' }), job({ id: 'y', closingDate: '2026-12-01' })]
    expect(ids(applySort(dated, { field: 'closingDate', direction: 'asc' }))).toEqual(['y', 'x'])
    expect(ids(applySort(dated, { field: 'closingDate', direction: 'desc' }))).toEqual(['y', 'x'])
  })
})
