'use client'

import { useState } from 'react'

import { Avatar, Checkbox, InputSelection, TextButton, getInitials } from '@/components/ui'
import {
  EMPLOYMENT_TYPES,
  NO_FILTERS,
  filterRoles,
  groupRolesByTeam,
  hasActiveFilters,
  locationOptions,
  teamOptions,
} from '@/lib/careers/filters'
import { useCareersPage } from '@/lib/queries'

import { CareersRoleList } from './careers-role-list'

import type { CareersFilters } from '@/lib/careers/filters'
import type { CareersRole } from '@/lib/careers/types'

interface CareersBoardProps {
  slug: string
}

/** Field width at desktop; the filter fields stack at phone width. */
const FIELD = 'w-full md:w-[260px]'

function toList(value: string | string[]): string[] {
  return Array.isArray(value) ? value : value ? [value] : []
}

/**
 * The public careers page: company header, about text, and the open roles
 * with filters (the design draws no search box). Figma: 9346:561510 (default), 9346:561540
 * (Location open), 9346:561580 (no results), 9346:561611 (filtered).
 */
function CareersBoard({ slug }: CareersBoardProps): React.ReactElement | null {
  const { data: page } = useCareersPage(slug)
  const [filters, setFilters] = useState<CareersFilters>(NO_FILTERS)

  if (!page) return null

  const roles: CareersRole[] = page.roles
  const shown = filterRoles(roles, filters)
  const groups = groupRolesByTeam(shown)
  const hidden = roles.length - shown.length

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col pb-[48px]">
      <header className="flex items-center justify-center gap-[4px] py-[12px]">
        <Avatar
          type="initials"
          text={getInitials(page.company.name)}
          size={24}
          src={page.company.logo}
          alt={page.company.name}
        />
        <span className="text-subtitle-m font-semibold text-text-primary">{page.company.name}</span>
      </header>

      <section className="px-[16px] py-[32px] md:px-[32px]">
        <p className="text-body-l leading-26_5 text-text-primary">{page.company.about}</p>
      </section>

      <section className="flex flex-col gap-[20px] px-[16px] md:px-[32px]">
        <h2 className="flex items-baseline gap-[4px]">
          <span className="text-subtitle-s font-semibold text-text-primary">Open roles</span>
          <span className="text-body-l font-semibold text-text-secondary">({shown.length})</span>
        </h2>

        <div className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[16px] md:flex-row md:flex-wrap">
            <InputSelection
              label="Location"
              showLabel={false}
              showHelper={false}
              placeholder="Location"
              multiple
              listSearchPlaceholder="Search"
              options={locationOptions(roles).map((value) => ({ value, label: value }))}
              value={filters.locations}
              onChange={(value) => setFilters({ ...filters, locations: toList(value) })}
              className={FIELD}
            />
            <InputSelection
              label="Team"
              showLabel={false}
              showHelper={false}
              placeholder="Team"
              options={teamOptions(roles).map((value) => ({ value, label: value }))}
              value={filters.team}
              onChange={(value) => setFilters({ ...filters, team: toList(value)[0] ?? '' })}
              className={FIELD}
            />
            <InputSelection
              label="Employment type"
              showLabel={false}
              showHelper={false}
              placeholder="Employment type"
              multiple
              listSearchPlaceholder="Search"
              options={EMPLOYMENT_TYPES.map((value) => ({ value, label: value }))}
              value={filters.employmentTypes}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  employmentTypes: toList(value) as CareersFilters['employmentTypes'],
                })
              }
              className={FIELD}
            />
            <div className="flex h-[32px] items-center md:w-[260px]">
              <Checkbox
                label="Remote only"
                textPosition="right"
                checked={filters.remoteOnly}
                onChange={(event) => setFilters({ ...filters, remoteOnly: event.target.checked })}
              />
            </div>
          </div>

          {hasActiveFilters(filters) ? (
            <div>
              <TextButton size="sm" onClick={() => setFilters(NO_FILTERS)}>
                Clear filters
              </TextButton>
            </div>
          ) : null}
        </div>
      </section>

      <CareersRoleList
        slug={slug}
        groups={groups}
        hidden={hidden}
        onClear={() => setFilters(NO_FILTERS)}
      />
    </div>
  )
}

export { CareersBoard }
export type { CareersBoardProps }
