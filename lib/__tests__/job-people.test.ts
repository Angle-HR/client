import { describe, expect, it } from 'vitest'

import { applyFilters, filterOptions } from '../jobs/filters'
import { assignedMessage, listNames } from '../jobs/people'

import type { Job } from '../jobs/types'

const alice = { name: 'Alice', colour: 'green' } as const
const dylan = { name: 'Dylan', colour: 'orange' } as const
const samantha = { name: 'Samantha', colour: 'purple' } as const

describe('listNames', () => {
  it('joins with commas and a final "and"', () => {
    expect(listNames(['Alice'])).toBe('Alice')
    expect(listNames(['Alice', 'Dylan'])).toBe('Alice and Dylan')
    expect(listNames(['Alice', 'Samantha', 'Dylan'])).toBe('Alice, Samantha and Dylan')
  })
})

describe('assignedMessage', () => {
  it('matches the design copy for several jobs and people', () => {
    expect(
      assignedMessage(
        [{ title: 'Frontend Developer' }, { title: 'Content Strategist' }],
        [alice, samantha, dylan],
      ),
    ).toBe(
      'The Frontend Developer, and Content Strategist role has been assigned to Alice, Samantha and Dylan',
    )
  })

  it('handles a single job and person', () => {
    expect(assignedMessage([{ title: 'Data Analyst' }], [alice])).toBe(
      'The Data Analyst role has been assigned to Alice',
    )
  })
})

describe('jobs with several managers', () => {
  const job: Job = {
    id: 'j',
    title: 'Designer',
    department: 'Design',
    employmentType: 'Full-time',
    location: 'UK',
    workplace: 'Remote',
    status: 'open',
    managers: [alice, dylan],
    createdBy: alice,
    totalApplicants: 1,
    newApplicants: 0,
    postedAt: '2026-10-01',
  }

  it('match a manager filter on any of their managers', () => {
    expect(
      applyFilters([job], [{ field: 'managedBy', operator: 'is', values: ['Dylan'] }]),
    ).toHaveLength(1)
    expect(
      applyFilters([job], [{ field: 'managedBy', operator: 'isNot', values: ['Dylan'] }]),
    ).toHaveLength(0)
  })

  it('offer each manager as a filter option', () => {
    expect(filterOptions([job], 'managedBy').map((o) => o.value)).toEqual(['Alice', 'Dylan'])
  })
})
