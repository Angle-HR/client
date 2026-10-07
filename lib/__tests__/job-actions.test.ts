import { describe, expect, it } from 'vitest'

import {
  exportJobs,
  parseFutureDate,
  searchJobs,
  statusChangeMessage,
  statusTargets,
} from '../jobs/actions'

import type { Job } from '../jobs/types'

function job(overrides: Partial<Job>): Job {
  return {
    id: 'job-1',
    title: 'Product Designer',
    department: 'Design',
    employmentType: 'Full-time',
    location: 'UK',
    workplace: 'Remote',
    status: 'open',
    manager: { name: 'Alice', colour: 'green' },
    createdBy: { name: 'Alice', colour: 'green' },
    totalApplicants: 30,
    newApplicants: 7,
    postedAt: '2026-10-15',
    ...overrides,
  }
}

describe('statusTargets', () => {
  it('offers every status when the selection spans statuses', () => {
    expect(statusTargets([job({ status: 'open' }), job({ status: 'draft' })])).toEqual([
      'open',
      'paused',
      'closed',
      'draft',
      'archived',
      'expired',
    ])
  })

  it('leaves out the current status for a single-status selection', () => {
    expect(statusTargets([job({ status: 'open' })])).not.toContain('open')
  })

  it('does not let closed or draft jobs be paused', () => {
    expect(statusTargets([job({ status: 'closed' })])).toEqual([
      'open',
      'draft',
      'archived',
      'expired',
    ])
    expect(statusTargets([job({ status: 'draft' })])).toEqual([
      'open',
      'closed',
      'archived',
      'expired',
    ])
  })
})

describe('statusChangeMessage', () => {
  it('uses the single-job copy for one job', () => {
    expect(statusChangeMessage('open', 1)).toBe('Job reopened')
    expect(statusChangeMessage('draft', 1)).toBe('Moved to draft')
  })

  it('counts the jobs for several', () => {
    expect(statusChangeMessage('paused', 3)).toBe('3 jobs paused')
    expect(statusChangeMessage('expired', 2)).toBe('2 jobs moved to expired')
  })
})

describe('searchJobs', () => {
  const jobs = [
    job({ id: 'a', title: 'Brand Lead', department: 'Design' }),
    job({ id: 'b', title: 'Design Manager', department: 'Product' }),
    job({ id: 'c', title: 'Engineer', department: 'Development' }),
  ]

  it('returns everything for an empty query', () => {
    expect(searchJobs(jobs, '  ')).toHaveLength(3)
  })

  it('matches title or department, ranking title matches first', () => {
    expect(searchJobs(jobs, 'design').map((j) => j.id)).toEqual(['b', 'a'])
  })
})

describe('exportJobs', () => {
  it('writes a CSV with a header row and quoted commas', () => {
    const csv = exportJobs([job({ title: 'Designer, Senior' })], 'csv')
    const [header, row] = csv.split('\n')
    expect(header).toBe(
      'Title,Department,Status,Managed by,Date posted,Closing date,Total applicants,New applicants',
    )
    expect(row).toBe('"Designer, Senior",Design,open,Alice,2026-10-15,,30,7')
  })

  it('writes JSON rows', () => {
    expect(JSON.parse(exportJobs([job({})], 'json'))[0]).toMatchObject({
      title: 'Product Designer',
      managedBy: 'Alice',
    })
  })
})

describe('parseFutureDate', () => {
  const today = new Date(2026, 9, 7)

  it('accepts today and later', () => {
    expect(parseFutureDate('7', '10', '2026', today)).toBe('2026-10-07')
    expect(parseFutureDate('22', '12', '2026', today)).toBe('2026-12-22')
  })

  it('rejects past dates, impossible dates and partial input', () => {
    expect(parseFutureDate('6', '10', '2026', today)).toBeNull()
    expect(parseFutureDate('31', '02', '2027', today)).toBeNull()
    expect(parseFutureDate('', '12', '2026', today)).toBeNull()
  })
})
