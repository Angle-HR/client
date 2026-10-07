import { describe, expect, it } from 'vitest'

import {
  duplicateName,
  duplicateTemplates,
  exportTemplates,
  groupTemplates,
  partitionDeletable,
  searchTemplates,
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
