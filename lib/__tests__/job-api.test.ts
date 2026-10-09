import { afterEach, describe, expect, it, vi } from 'vitest'

import { axiosInstance } from '@/config/axios'

import {
  BULK_ACTIONS,
  colourFor,
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
    created_by: 'Owen',
    applicant_count: 0,
    created_at: '2026-10-01T09:30:00Z',
    updated_at: '2026-10-05T10:00:00Z',
    published_at: '2026-10-02T08:00:00Z',
    closing_date: '2026-12-22',
    revision: 7,
  }

  it('turns an API row into the job the screens show', () => {
    expect(toJob(row)).toMatchObject({
      id: 'job_1',
      title: 'Data Analyst',
      status: 'open',
      department: 'Analytics',
      employmentType: 'Part-time',
      workplace: 'On-site',
      location: 'UK, IE',
      managers: [{ id: 'u_1', name: 'Alice' }],
      createdBy: { name: 'Owen' },
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
    expect(Object.keys(BULK_ACTIONS).sort()).toEqual(['archived', 'closed', 'draft', 'paused'])
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
        },
        'u_1',
      ),
    ).toMatchObject({
      id: 't_1',
      title: 'Designer',
      pinned: true,
      timesUsed: 4,
      lastUsedAt: '2026-10-03',
      visibility: 'Everyone',
      ownedByMe: true,
    })
    expect(toTemplate({ id: 't_2', is_default: true }).visibility).toBe('Just me')
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

  it('lists a page of jobs and hands back the cursor for the next', async () => {
    const get = vi.spyOn(axiosInstance, 'get').mockResolvedValue({
      data: {
        data: [{ id: 'job_1', title: 'Analyst', status: 'published' }],
        meta: { has_more: true, next_cursor: 'abc' },
      },
    })
    const page = await requests.listJobs({ status: ['published'], limit: 25 })

    expect(get).toHaveBeenCalledWith('/jobs', { params: { status: 'published', limit: '25' } })
    expect(page.jobs).toHaveLength(1)
    expect(page.jobs[0]).toMatchObject({ id: 'job_1', status: 'open' })
    expect(page.nextCursor).toBe('abc')
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
