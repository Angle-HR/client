import { Avatar } from '@/components/ui'

import type { JobManager } from '@/lib/jobs/types'

interface PersonAvatarProps {
  person: Pick<JobManager, 'name' | 'colour' | 'avatarUrl'>
  size?: 14 | 16
  /** Filter chips draw people as circles; everywhere else they are square. */
  circular?: boolean
}

/**
 * A person as the jobs screens draw them: a square 4px-radius avatar with a
 * hairline edge, showing their photo when there is one and their initial when
 * there is not. Figma: avatar/avatar with Circular=no, or yes on filter chips.
 */
function PersonAvatar({ person, size = 14, circular = false }: PersonAvatarProps) {
  return (
    <Avatar
      size={size}
      circular={circular}
      type={person.avatarUrl ? 'image' : 'initials'}
      src={person.avatarUrl}
      text={person.name.charAt(0)}
      colour={person.colour}
      className="outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-light"
    />
  )
}

export { PersonAvatar }
export type { PersonAvatarProps }
