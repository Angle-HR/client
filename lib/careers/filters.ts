import type { CareersEmploymentType, CareersRole } from './types'

/**
 * Search, filtering and grouping for the public careers page. Figma: applicant
 * frames 9346:561510 (default), 9346:561540 (Location open), 9346:561611
 * (filtered).
 */

interface CareersFilters {
  /** Matched against the role title and team. */
  query: string
  /** Any of these locations. Empty means every location. */
  locations: string[]
  /** One team. Empty means every team. */
  team: string
  /** Any of these employment types. Empty means every type. */
  employmentTypes: CareersEmploymentType[]
  /** Only roles whose workplace is Remote. */
  remoteOnly: boolean
}

interface RoleGroup {
  team: string
  roles: CareersRole[]
}

const NO_FILTERS: CareersFilters = {
  query: '',
  locations: [],
  team: '',
  employmentTypes: [],
  remoteOnly: false,
}

const EMPLOYMENT_TYPES: CareersEmploymentType[] = ['Full time', 'Part time', 'Contract']

function hasActiveFilters(filters: CareersFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.locations.length > 0 ||
    filters.team !== '' ||
    filters.employmentTypes.length > 0 ||
    filters.remoteOnly
  )
}

/** The roles that pass every filter, in their original order. */
function filterRoles(roles: CareersRole[], filters: CareersFilters): CareersRole[] {
  const term = filters.query.trim().toLowerCase()
  return roles.filter((role) => {
    if (
      term !== '' &&
      !role.title.toLowerCase().includes(term) &&
      !role.team.toLowerCase().includes(term)
    ) {
      return false
    }
    if (
      filters.locations.length > 0 &&
      (!role.location || !filters.locations.includes(role.location))
    ) {
      return false
    }
    if (filters.team !== '' && role.team !== filters.team) return false
    if (
      filters.employmentTypes.length > 0 &&
      !filters.employmentTypes.includes(role.employmentType)
    ) {
      return false
    }
    if (filters.remoteOnly && role.workplace !== 'Remote') return false
    return true
  })
}

/** Roles under their team, teams in the order their first role appears. */
function groupRolesByTeam(roles: CareersRole[]): RoleGroup[] {
  const groups = new Map<string, CareersRole[]>()
  for (const role of roles) {
    const bucket = groups.get(role.team)
    if (bucket) {
      bucket.push(role)
    } else {
      groups.set(role.team, [role])
    }
  }
  return [...groups].map(([team, teamRoles]) => ({ team, roles: teamRoles }))
}

/** The distinct locations the roles are open in, A to Z. */
function locationOptions(roles: CareersRole[]): string[] {
  const locations = new Set<string>()
  for (const role of roles) {
    if (role.location) locations.add(role.location)
  }
  return [...locations].sort((a, b) => a.localeCompare(b))
}

/** The distinct teams of the roles, A to Z. */
function teamOptions(roles: CareersRole[]): string[] {
  return [...new Set(roles.map((role) => role.team))].sort((a, b) => a.localeCompare(b))
}

export {
  EMPLOYMENT_TYPES,
  NO_FILTERS,
  filterRoles,
  groupRolesByTeam,
  hasActiveFilters,
  locationOptions,
  teamOptions,
}
export type { CareersFilters, RoleGroup }
