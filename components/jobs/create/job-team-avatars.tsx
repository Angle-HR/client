import { PersonAvatar } from '@/components/jobs/person-avatar'
import { AvatarStack } from '@/components/ui'
import { colourFor } from '@/lib/jobs/api'
import { accessSentence } from '@/lib/jobs/publish-step'

import type { HeaderMember } from '@/lib/jobs/publish-step'
import type { ReactNode } from 'react'

/**
 * The job's team as overlapping avatars in the header. Hovering shows the
 * first person and their access. Figma: avatar/avatar-stack 9270:377327 and
 * the "Tool tip" 9270:377328.
 */

/** The header draws two faces; the tooltip names the first. */
const SHOWN = 2

function JobTeamAvatars({ team }: { team: HeaderMember[] }): ReactNode {
  const [first] = team
  if (!first) return null
  return (
    <span
      role="img"
      aria-label={`Team: ${team.map((member) => member.name).join(', ')}`}
      className="group relative inline-flex shrink-0 items-center"
    >
      {/* Figma: 20px standard stack of 2, no "more" tile, first face on top. */}
      <AvatarStack size={20} maxVisible={SHOWN} showOverflow={false}>
        {team.map((member) => (
          <PersonAvatar
            key={member.id}
            person={{ name: member.name, colour: colourFor(member.id) }}
            size={20}
            circular
          />
        ))}
      </AvatarStack>
      <span className="pointer-events-none absolute top-[calc(100%+8px)] left-1/2 z-20 hidden -translate-x-1/2 flex-col gap-[10px] rounded-lg-12 bg-dark-grey-1 px-[10px] py-[10px] whitespace-nowrap group-hover:flex">
        <span className="text-body-xs leading-19_2 font-medium text-text-inverted">
          {first.name}
        </span>
        <span className="text-body-xs leading-19_2 text-[#999999]">
          {accessSentence(first.level)}
        </span>
      </span>
    </span>
  )
}

export { JobTeamAvatars }
