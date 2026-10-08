import { DashboardIcon } from '@/components/dashboard/nav-config'
import { PersonAvatar } from '@/components/jobs/person-avatar'
import { Chip } from '@/components/ui'
import { listNames } from '@/lib/jobs/people'

import type { JobManager } from '@/lib/jobs/types'

/**
 * Who manages a job, as shown in the "Managed by" column and on cards.
 * Figma: the "Managed by state when the number of assignee changes" frame
 * (7964:213086).
 *
 * One manager shows an avatar and a name. Several show a stack of up to three
 * avatars and a trailing tile — a plus up to three people, an ellipsis beyond —
 * on a chip that darkens from the third person on.
 */
function ManagersChip({ managers }: { managers: JobManager[] }) {
  const [first] = managers
  if (!first) return null

  if (managers.length === 1) {
    return (
      <Chip
        fill="transparent"
        tone="secondary"
        label={first.name}
        icon={<PersonAvatar person={first} />}
        className="max-w-full min-w-0"
      />
    )
  }

  const shown = managers.slice(0, 3)
  return (
    <span
      role="img"
      aria-label={`Managed by ${listNames(managers.map((manager) => manager.name))}`}
      title={listNames(managers.map((manager) => manager.name))}
      className={`inline-flex h-[20px] shrink-0 items-center rounded-sm-7 px-[3px] ${managers.length > 2 ? 'bg-bg-transparent-medium' : 'bg-bg-transparent-light'}`}
    >
      {shown.map((manager, index) => (
        <span key={manager.name} className={index === 0 ? 'inline-flex' : '-ml-[4px] inline-flex'}>
          <PersonAvatar person={manager} />
        </span>
      ))}
      <span className="-ml-[4px] inline-flex size-[14px] items-center justify-center rounded-xs-4 bg-bg-avatar-blue text-text-avatar-blue outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-light">
        <DashboardIcon
          name={managers.length > 3 ? 'ellipsis-horizontal-solid' : 'plus-solid'}
          size={10}
        />
      </span>
    </span>
  )
}

export { ManagersChip }
