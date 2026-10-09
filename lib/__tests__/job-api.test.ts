import { afterEach, describe, expect, it, vi } from 'vitest'

import { axiosInstance } from '@/config/axios'

import {
  BULK_ACTIONS,
  apiMessage,
  serverJobQuery,
  colourFor,
  countsByStatus,
  jobListParams,
  toJob,
  toManager,
  toStatus,
  toTemplate,
  transitionFor,
} from '../jobs/api'
import { requests } from '../requests'

describe('toJob', () => {
  const row = {
    id: 'job_1',
    title: ' Data Analyst ',
    status: 'published',
    department_name: 'Analytics',
    employment_type: 'part_time',
    workplace_type: 'onsite',
    location_mode: 'specific_area',
    markets: ['UK', 'IE'],
    managers: [{ user_id: 'u_1', name: 'Alice' }],
    created_by: 'u_9',
    applicant_count: 0,
    created_at: '2026-10-01T09:30:00Z',
    updated_at: '2026-10-05T10:00:00Z',
    published_at: '2026-10-02T08:00:00Z',
    closing_date: '2026-12-22',
    revision: 7,
  }

  it('turns an API row into the job the screens show', () => {
    expect(toJob(row, { people: new Map([['u_9', 'Owen']]) })).toMatchObject({
      id: 'job_1',
      title: 'Data Analyst',
      status: 'open',
      department: 'Analytics',
      employmentType: 'Part-time',
      workplace: 'On-site',
      location: 'UK, IE',
      managers: [{ id: 'u_1', name: 'Alice' }],
      createdBy: { id: 'u_9', name: 'Owen' },
      totalApplicants: 0,
      newApplicants: 0,
      postedAt: '2026-10-02',
      createdAt: '2026-10-01',
      lastModifiedAt: '2026-10-05',
      closingDate: '2026-12-22',
      revision: 7,
    })
  })

  it('dates an unpublished job by when it was created, and names an anywhere job', () => {
    const draft = toJob({
      ...row,
      status: 'draft',
      published_at: undefined,
      location_mode: 'anywhere',
      markets: [],
      closing_date: undefined,
    })
    expect(draft).toMatchObject({ status: 'draft', postedAt: '2026-10-01', location: 'Anywhere' })
    expect(draft.closingDate).toBeUndefined()
  })

  it('survives a row with nothing in it', () => {
    expect(toJob({})).toMatchObject({
      id: '',
      title: 'Untitled job',
      status: 'draft',
      managers: [],
    })
  })
})

describe('statuses', () => {
  it('reads the API statuses, with published as open', () => {
    expect(['published', 'paused', 'draft', 'closed', 'archived', 'expired'].map(toStatus)).toEqual(
      ['open', 'paused', 'draft', 'closed', 'archived', 'expired'],
    )
  })

  it('picks the single-job action for a change of status', () => {
    expect(transitionFor('draft', 'open')).toBe('publish')
    expect(transitionFor('paused', 'open')).toBe('resume')
    expect(transitionFor('closed', 'open')).toBe('reopen')
    expect(transitionFor('open', 'paused')).toBe('pause')
    expect(transitionFor('open', 'draft')).toBe('to-draft')
    expect(transitionFor('open', 'open')).toBeNull()
    // Jobs expire on their own; nothing asks for it.
    expect(transitionFor('open', 'expired')).toBeNull()
  })

  it('knows which changes the bulk endpoint can make', () => {
    expect(BULK_ACTIONS).toEqual({
      pause: 'pause',
      resume: 'resume',
      close: 'close',
      reopen: 'reopen',
      archive: 'archive',
      'to-draft': 'to_draft',
    })
    // Publishing is done one job at a time.
    expect(BULK_ACTIONS.publish).toBeUndefined()
  })

  it('adds the counts of the API statuses up into the statuses the screens show', () => {
    expect(
      countsByStatus({
        all: 12,
        by_status: {
          published: 4,
          paused: 1,
          draft: 3,
          scheduled: 2,
          closed: 0,
          archived: 1,
          expired: 1,
        },
      }),
    ).toEqual({ open: 4, paused: 1, draft: 5, closed: 0, archived: 1, expired: 1 })
    expect(countsByStatus({})).toEqual({
      open: 0,
      paused: 0,
      draft: 0,
      closed: 0,
      archived: 0,
      expired: 0,
    })
  })
})

describe('people and templates', () => {
  it('gives a person the same tint every time', () => {
    expect(colourFor('u_1')).toBe(colourFor('u_1'))
    expect(toManager({ user_id: 'u_1', name: 'Alice' })).toEqual({
      id: 'u_1',
      name: 'Alice',
      colour: colourFor('u_1'),
    })
  })

  it('reads a template row', () => {
    expect(
      toTemplate(
        {
          id: 't_1',
          name: 'Designer',
          created_by: 'u_1',
          pinned: true,
          use_count: 4,
          last_used_at: '2026-10-03T00:00:00Z',
          payload: { department_id: 'd_1', employment_type: 'part_time' },
        },
        {
          me: 'u_1',
          people: new Map([['u_1', 'Alice']]),
          departments: new Map([['d_1', 'Design']]),
        },
      ),
    ).toMatchObject({
      id: 't_1',
      title: 'Designer',
      department: 'Design',
      employmentType: 'Part-time',
      createdBy: { name: 'Alice' },
      pinned: true,
      timesUsed: 4,
      lastUsedAt: '2026-10-03',
      visibility: 'Everyone',
      ownedByMe: true,
    })
    expect(toTemplate({ id: 't_2', is_default: true }).visibility).toBe('Just me')
  })
})

describe('apiMessage', () => {
  it('prefers the field message of a validation error', () => {
    const error = {
      response: {
        data: {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'some fields need attention',
            details: {
              fields: [{ path: 'closing_date', message: 'closing date cannot be in the past' }],
            },
          },
        },
      },
    }
    expect(apiMessage(error)).toBe('Closing date cannot be in the past')
  })

  it('falls back to the error message, then to a general one', () => {
    expect(apiMessage({ response: { data: { error: { message: 'not found' } } } })).toBe(
      'Not found',
    )
    expect(apiMessage(new Error('network'))).toBe('Something went wrong. Please try again.')
  })
})

describe('serverJobQuery', () => {
  const people = [{ id: 'u_1', name: 'Alice', colour: 'green' as const }]
  const today = new Date(2026, 9, 9)

  it('hands the API what it can apply itself', () => {
    expect(
      serverJobQuery({
        search: ' analyst ',
        filters: [
          { field: 'status', operator: 'is', values: ['open', 'paused'] },
          { field: 'employmentType', operator: 'is', values: ['Part-time'] },
          { field: 'createdBy', operator: 'is', values: ['Alice'] },
          { field: 'location', operator: 'is', values: ['UK'] },
          { field: 'createdOn', operator: 'is', values: ['30d'] },
        ],
        sort: { field: 'dateCreated', direction: 'asc' },
        people,
        today,
      }),
    ).toEqual({
      q: 'analyst',
      status: ['published', 'paused'],
      employmentType: 'part_time',
      createdBy: 'u_1',
      market: 'UK',
      createdFrom: '2026-09-09',
      sort: 'created_at',
      order: 'asc',
    })
  })

  it('leaves to the page what the API cannot express', () => {
    expect(
      serverJobQuery({
        search: '',
        filters: [
          { field: 'status', operator: 'isNot', values: ['draft'] },
          { field: 'employmentType', operator: 'is', values: ['Part-time', 'Contract'] },
          { field: 'managedBy', operator: 'and', values: ['Alice'] },
          { field: 'applicants', operator: 'is', values: ['1-10'] },
          { field: 'team', operator: 'is', values: ['Design'] },
        ],
        sort: { field: 'totalApplicants', direction: 'desc' },
        people,
        today,
      }),
    ).toEqual({})
  })
})

describe('jobListParams', () => {
  it('sends only what is set, under the names the API uses', () => {
    expect(
      jobListParams({
        status: ['draft', 'published'],
        q: '  analyst ',
        assignee: 'u_1',
        createdFrom: '2026-01-01',
        sort: 'created_at',
        order: 'asc',
        limit: 100,
      }),
    ).toEqual({
      status: 'draft,published',
      q: 'analyst',
      assignee: 'u_1',
      created_from: '2026-01-01',
      sort: 'created_at',
      order: 'asc',
      limit: '100',
    })
    expect(jobListParams({ status: [], q: ' ' })).toEqual({})
  })
})

describe('hiring requests', () => {
  afterEach(() => vi.restoreAllMocks())

  it('follows the cursor to the last page and names each creator', async () => {
    const get = vi.spyOn(axiosInstance, 'get').mockImplementation(async (url, config) => {
      if (url === '/hiring/people') {
        return { data: { data: [{ user_id: 'u_9', name: 'Owen' }] } }
      }
      const cursor = (config?.params as Record<string, string>).cursor
      return cursor
        ? { data: { data: [{ id: 'job_2', created_by: 'u_9' }], meta: { has_more: false } } }
        : {
            data: {
              data: [{ id: 'job_1', status: 'published', created_by: 'u_9' }],
              meta: { has_more: true, next_cursor: 'abc' },
            },
          }
    })
    const jobs = await requests.getJobs({ status: ['published'] })

    expect(jobs.map((job) => job.id)).toEqual(['job_1', 'job_2'])
    expect(jobs[0]).toMatchObject({ status: 'open', createdBy: { name: 'Owen' } })
    expect(get).toHaveBeenCalledWith('/jobs', {
      params: { status: 'published', limit: '100', cursor: 'abc' },
    })
  })

  it('sends the revision it loaded when it changes a job', async () => {
    const post = vi.spyOn(axiosInstance, 'post').mockResolvedValue({ data: {} })
    await requests.transitionJob('job_1', 'pause', 7)
    expect(post).toHaveBeenCalledWith('/jobs/job_1/pause', undefined, {
      headers: { 'If-Match': '7' },
    })
  })

  it('asks for a JSON export of chosen jobs', async () => {
    const get = vi.spyOn(axiosInstance, 'get').mockResolvedValue({ data: '[]' })
    await requests.exportJobs({ ids: ['a', 'b'], format: 'json' })
    expect(get).toHaveBeenCalledWith(
      '/jobs/export',
      expect.objectContaining({ params: { ids: 'a,b', format: 'json' } }),
    )
  })

  it('renames and pins a template', async () => {
    const patch = vi.spyOn(axiosInstance, 'patch').mockResolvedValue({ data: {} })
    await requests.updateTemplate('t_1', { pinned: true })
    expect(patch).toHaveBeenCalledWith('/hiring/templates/t_1', { pinned: true })
  })
})
