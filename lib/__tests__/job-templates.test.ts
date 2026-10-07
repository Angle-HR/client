import { describe, expect, it } from 'vitest'

import {
  templateFromDetails,
  validateTemplateDetails,
  duplicateName,
  duplicateTemplates,
  exportTemplates,
  groupTemplates,
  markTemplateUsed,
  partitionDeletable,
  searchTemplates,
  sortTemplates,
} from '../jobs/templates'

import type { JobTemplate } from '../jobs/templates'

const me = { name: 'Alice', colour: 'green' } as const

function template(overrides: Partial<JobTemplate>): JobTemplate {
  return {
    id: 't',
    title: 'Frontend Developer',
    department: 'Development',
    employmentType: 'Full-time',
    createdBy: me,
    visibility: 'Everyone',
    timesUsed: 3,
    lastUsedAt: '2026-10-01',
    pinned: false,
    ownedByMe: true,
    ...overrides,
  }
}

describe('groupTemplates', () => {
  it('puts pinned before others and drops empty groups', () => {
    const groups = groupTemplates([template({ id: 'a' }), template({ id: 'b', pinned: true })])
    expect(groups.map((g) => [g.key, g.templates.map((t) => t.id)])).toEqual([
      ['pinned', ['b']],
      ['others', ['a']],
    ])
    expect(groupTemplates([template({})]).map((g) => g.key)).toEqual(['others'])
  })
})

describe('searchTemplates', () => {
  it('ranks title matches above department matches', () => {
    const list = [
      template({ id: 'a', title: 'Brand Lead', department: 'Design' }),
      template({ id: 'b', title: 'Design Manager', department: 'Product' }),
    ]
    expect(searchTemplates(list, 'design').map((t) => t.id)).toEqual(['b', 'a'])
  })
})

describe('duplicateName', () => {
  it('appends -2 and steps past names already taken', () => {
    expect(duplicateName('Frontend Developer', ['Frontend Developer'])).toBe('Frontend Developer-2')
    expect(
      duplicateName('Frontend Developer', ['Frontend Developer', 'Frontend Developer-2']),
    ).toBe('Frontend Developer-3')
    expect(duplicateName('Frontend Developer-2', ['Frontend Developer-2'])).toBe(
      'Frontend Developer-3',
    )
  })
})

describe('duplicateTemplates', () => {
  it('makes unpinned, unused copies owned by the current user', () => {
    const all = [template({ id: 'a', pinned: true, ownedByMe: false, timesUsed: 9 })]
    const [copy] = duplicateTemplates(all, ['a'], me, 1)
    expect(copy).toMatchObject({
      title: 'Frontend Developer-2',
      pinned: false,
      ownedByMe: true,
      timesUsed: 0,
      createdBy: me,
    })
    expect(copy?.id).not.toBe('a')
  })

  it('gives each copy in one batch a distinct name', () => {
    const all = [template({ id: 'a' }), template({ id: 'b' })]
    expect(duplicateTemplates(all, ['a', 'b'], me, 1).map((t) => t.title)).toEqual([
      'Frontend Developer-2',
      'Frontend Developer-3',
    ])
  })
})

describe('partitionDeletable', () => {
  it('only lets the creator delete', () => {
    const all = [template({ id: 'mine' }), template({ id: 'theirs', ownedByMe: false })]
    expect(partitionDeletable(all, ['mine', 'theirs'])).toEqual({ deletable: ['mine'], blocked: 1 })
  })
})

describe('exportTemplates', () => {
  it('writes CSV with a header', () => {
    const [header, row] = exportTemplates([template({})], 'csv').split('\n')
    expect(header).toBe(
      'Title,Department,Employment type,Created by,Visibility,Times used,Last used',
    )
    expect(row).toBe('Frontend Developer,Development,Full-time,Alice,Everyone,3,2026-10-01')
  })
})

describe('sortTemplates', () => {
  const list = [
    template({ id: 'a', title: 'Zebra', timesUsed: 1, lastUsedAt: '2026-01-01' }),
    template({ id: 'b', title: 'Apple', timesUsed: 9, lastUsedAt: '2025-01-01' }),
    template({ id: 'c', title: 'Mango', timesUsed: 4, lastUsedAt: '2026-06-01' }),
  ]
  const ids = (sort: Parameters<typeof sortTemplates>[1]) =>
    sortTemplates(list, sort).map((t) => t.id)

  it('orders by use, recency, creation and name', () => {
    expect(ids('mostUsed')).toEqual(['b', 'c', 'a'])
    expect(ids('recentlyUsed')).toEqual(['c', 'a', 'b'])
    expect(ids('recentlyCreated')).toEqual(['c', 'b', 'a'])
    expect(ids('name')).toEqual(['b', 'c', 'a'])
  })
})

describe('markTemplateUsed', () => {
  it('counts the use and stamps today', () => {
    expect(
      markTemplateUsed(template({ timesUsed: 3 }), new Date('2026-10-07T10:00:00Z')),
    ).toMatchObject({
      timesUsed: 4,
      lastUsedAt: '2026-10-07',
    })
  })
})

describe('saving job details as a template', () => {
  const owner = { name: 'Alice', colour: 'green' } as const

  it('accepts a name and an optional plain description', () => {
    expect(
      validateTemplateDetails({ name: '🎨 Product design Template', description: '' }, []),
    ).toEqual({})
    expect(
      validateTemplateDetails(
        { name: 'Designer', description: "For the team's design hires." },
        [],
      ),
    ).toEqual({})
  })

  it('refuses an empty or duplicate name', () => {
    expect(validateTemplateDetails({ name: '  ', description: '' }, []).name).toBe(
      'Enter a name for the template.',
    )
    expect(validateTemplateDetails({ name: 'designer', description: '' }, ['Designer']).name).toBe(
      'A template with this name already exists.',
    )
  })

  it('holds the description to its hint: no special characters, 30 words', () => {
    expect(
      validateTemplateDetails({ name: 'A', description: 'Great #1 role!' }, []).description,
    ).toBe('Remove special characters from the description.')
    const long = Array.from({ length: 31 }, () => 'word').join(' ')
    expect(validateTemplateDetails({ name: 'A', description: long }, []).description).toBe(
      'Keep the description to 30 words or fewer.',
    )
  })

  it('builds the template, shared or private', () => {
    const job = { department: 'Design', employmentType: 'Full-time' } as const
    const shared = templateFromDetails(
      { name: ' Designer ', description: ' For design hires ', shared: true },
      job,
      owner,
      'tpl-1',
      '2026-10-08',
    )
    expect(shared).toMatchObject({
      id: 'tpl-1',
      title: 'Designer',
      description: 'For design hires',
      visibility: 'Everyone',
      ownedByMe: true,
      timesUsed: 0,
    })
    expect(
      templateFromDetails(
        { name: 'X', description: '', shared: false },
        job,
        owner,
        't',
        '2026-10-08',
      ),
    ).toMatchObject({ visibility: 'Just me', description: undefined })
  })
})
