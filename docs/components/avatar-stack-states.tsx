// States grid for the AvatarStack, drawn from avatar-stack.figma.ts. Each cell
// is the real component, laid out like the Figma set: with and without the
// "more" tile, 2 or 4 faces, standard and tight.
import { Avatar } from '@/components/ui/avatar'
import { AvatarStack } from '@/components/ui/avatar/avatar-stack'
import { AVATAR_STACK_OVERLAP } from '@/components/ui/avatar/avatar-stack.figma'
import { AVATAR_SIZES } from '@/components/ui/avatar/avatar.figma'

import { StateTable } from './state-table'

import type { AvatarSize } from '@/components/ui/avatar'
import type { StackDensity } from '@/components/ui/avatar/avatar-stack.figma'

const PHOTO = '/dashboard/avatars/alice.png'

const faces = (size: AvatarSize, n: number) =>
  Array.from({ length: n }, (_, i) => (
    <Avatar key={i} size={size} type="image-border" src={PHOTO} alt="" />
  ))

function stack(size: AvatarSize, density: StackDensity, shown: number, more: boolean) {
  // With the tile: `shown` faces and one hidden. Without: exactly `shown` faces.
  return (
    <AvatarStack size={size} density={density} maxVisible={shown}>
      {faces(size, more ? shown + 1 : shown)}
    </AvatarStack>
  )
}

function AvatarStackStates({ density }: { density: StackDensity }) {
  return (
    <StateTable
      columns={['4', '2', '3 + more', '2 + more'] as const}
      rows={[...AVATAR_SIZES].reverse().map((size) => ({
        label: `${size}px · −${AVATAR_STACK_OVERLAP[density][size]}`,
        cells: [
          <span key="4">{stack(size, density, 4, false)}</span>,
          <span key="2">{stack(size, density, 2, false)}</span>,
          <span key="3m">{stack(size, density, 3, true)}</span>,
          <span key="2m">{stack(size, density, 2, true)}</span>,
        ],
      }))}
      caption={
        density === 'standard'
          ? 'Standard overlap at every size. Without the "more" tile the first face is on top; with it, each later face is, and the tile is topmost.'
          : 'Tight overlap at every size.'
      }
    />
  )
}

export { AvatarStackStates }
