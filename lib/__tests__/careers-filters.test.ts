import { describe, expect, it } from 'vitest'

import {
  NO_FILTERS,
  filterRoles,
  groupRolesByTeam,
  hasActiveFilters,
  locationOptions,
  teamOptions,
} from '../careers/filters'
import { REVOLUT } from '../careers/fixtures'

import type { CareersFilters } from '../careers/filters'

const roles = REVOLUT.roles

function withFilters(overrides: Partial<CareersFilters>): CareersFilters {
  return { ...NO_FILTERS, ...overrides }
}

function titles(list: { title: string }[]): string[] {
  return list.map((role) => role.title)
}

describe('filterRoles', () => {
  it('returns every role when nothing is set', () => {
    expect(filterRoles(roles, NO_FILTERS)).toHaveLength(roles.length)
  })

  it('matches the search against title and team, ignoring case and spaces', () => {
    expect(titles(filterRoles(roles, withFilters({ query: '  devops ' })))).toEqual([
      'DevOps Engineer - Cloud Solutions',
    ])
    expect(filterRoles(roles, withFilters({ query: 'hr strategy' }))).toHaveLength(2)
  })

  it('keeps roles with any of the chosen locations', () => {
    const result = filterRoles(roles, withFilters({ locations: ['Germany', 'Ireland'] }))
    expect(titles(result)).toEqual([
      'Compensation and Benefits Analyst - Equity Partners',
      'Employee Engagement Coordinator - Happy Workplace',
    ])
  })

  it('drops roles with no location when a location is chosen', () => {
    const result = filterRoles(roles, withFilters({ locations: ['United Kingdom'] }))
    expect(titles(result)).toEqual(['Full-stack Engineer - Creative Agents'])
  })

  it('keeps only the chosen team', () => {
    expect(titles(filterRoles(roles, withFilters({ team: 'Design' })))).toEqual([
      'UX/UI Designer - Bright Ideas',
    ])
  })

  it('keeps roles with any of the chosen employment types', () => {
    const result = filterRoles(roles, withFilters({ employmentTypes: ['Contract', 'Part time'] }))
    expect(result.map((role) => role.employmentType)).toEqual(['Contract', 'Part time'])
  })

  it('keeps only Remote roles when remote only is on', () => {
    const result = filterRoles(roles, withFilters({ remoteOnly: true }))
    expect(result.every((role) => role.workplace === 'Remote')).toBe(true)
    expect(result).toHaveLength(roles.filter((role) => role.workplace === 'Remote').length)
  })

  it('applies every filter together', () => {
    const result = filterRoles(
      roles,
      withFilters({ query: 'hr', team: 'HR & Culture', remoteOnly: false }),
    )
    expect(titles(result)).toEqual(['Employee Engagement Coordinator - Happy Workplace'])
  })
})

describe('groupRolesByTeam', () => {
  it('groups roles under their team, in first-seen order', () => {
    const groups = groupRolesByTeam(roles)
    expect(groups[0]?.team).toBe('Engineering & Product')
    expect(groups).toHaveLength(new Set(roles.map((role) => role.team)).size)
  })

  it('counts each group from the roles it holds', () => {
    const groups = groupRolesByTeam(filterRoles(roles, withFilters({ query: 'engineer' })))
    expect(groups.map((group) => [group.team, group.roles.length])).toEqual([
      ['Engineering & Product', 1],
      ['Engineering', 1],
    ])
  })

  it('returns no groups for no roles', () => {
    expect(groupRolesByTeam([])).toEqual([])
  })
})

describe('hasActiveFilters', () => {
  it('is false with no filters and true when any is set', () => {
    expect(hasActiveFilters(NO_FILTERS)).toBe(false)
    expect(hasActiveFilters(withFilters({ query: '   ' }))).toBe(false)
    expect(hasActiveFilters(withFilters({ query: 'x' }))).toBe(true)
    expect(hasActiveFilters(withFilters({ locations: ['Nigeria'] }))).toBe(true)
    expect(hasActiveFilters(withFilters({ team: 'Sales' }))).toBe(true)
    expect(hasActiveFilters(withFilters({ employmentTypes: ['Contract'] }))).toBe(true)
    expect(hasActiveFilters(withFilters({ remoteOnly: true }))).toBe(true)
  })
})

describe('filter options', () => {
  it('lists each location once, A to Z, and skips roles with none', () => {
    const options = locationOptions(roles)
    expect(options).toEqual([...options].sort((a, b) => a.localeCompare(b)))
    expect(new Set(options).size).toBe(options.length)
    expect(options).not.toContain(undefined)
  })

  it('lists each team once', () => {
    const options = teamOptions(roles)
    expect(new Set(options).size).toBe(options.length)
    expect(options).toContain('HR & Recruitment')
  })
})
