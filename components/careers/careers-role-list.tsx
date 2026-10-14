'use client'

import { Button } from '@/components/ui'

import type { RoleGroup } from '@/lib/careers/filters'
import type { CareersRole } from '@/lib/careers/types'

interface CareersRoleListProps {
  slug: string
  groups: RoleGroup[]
  /** Roles the filters hide; shown in the empty state. */
  hidden: number
  onClear: () => void
}

/** Team, country, workplace and employment type, dot-separated; missing parts are left out. */
function roleMeta(role: CareersRole): string {
  return [role.team, role.location, role.workplace, role.employmentType]
    .filter((part): part is string => Boolean(part))
    .join(' • ')
}

/** Roles grouped under their team, or the empty state when the filters hide every role. */
function CareersRoleList({
  slug,
  groups,
  hidden,
  onClear,
}: CareersRoleListProps): React.ReactElement {
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center gap-[10px] px-[16px] py-[16px] text-center md:px-[32px]">
        <p className="text-body-s font-semibold text-text-secondary">
          No job matching the filters set
        </p>
        <p className="text-body-s text-text-tertiary">{hidden} issues hidden by filters</p>
        <Button variant="secondary" size="sm" onClick={onClear}>
          Clear Filters
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {groups.map((group) => (
        <section
          key={group.team}
          className="flex flex-col gap-[10px] px-[16px] py-[16px] md:px-[32px]"
        >
          <h3 className="flex items-baseline gap-[4px] px-[8px]">
            <span className="text-body-xl font-semibold text-text-primary">{group.team}</span>
            <span className="text-body-l font-semibold text-text-secondary">
              ({group.roles.length})
            </span>
          </h3>
          <ul className="flex flex-col gap-[10px]">
            {group.roles.map((role) => (
              <li key={role.id}>
                <a
                  href={`/company/${slug}/jobs/${role.id}`}
                  className="flex flex-col gap-[2px] rounded-[14px] px-[8px] py-[10px] transition-colors hover:bg-bg-transparent-light focus-visible:bg-bg-transparent-light focus-visible:outline-none"
                >
                  <span className="text-body-l leading-21 font-medium text-text-primary">
                    {role.title}
                  </span>
                  <span className="text-body-m leading-21 text-text-secondary">
                    {roleMeta(role)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export { CareersRoleList }
