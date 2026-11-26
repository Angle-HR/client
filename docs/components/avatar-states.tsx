// States grids for the Avatar, drawn from avatar.figma.ts. Each cell is the
// real component.
import { Avatar } from '@/components/ui/avatar'
import { AVATAR_COLOURS, AVATAR_COUNTRY, AVATAR_SIZES } from '@/components/ui/avatar/avatar.figma'

import { StateTable } from './state-table'

const PHOTO = '/dashboard/avatars/alice.png'

function AvatarSizeStates() {
  const columns = [
    'text',
    'text square',
    'icon',
    'icon square',
    'image',
    'image border',
    'country',
    'country square',
    'notification',
  ] as const
  return (
    <StateTable
      columns={columns}
      rows={[...AVATAR_SIZES].reverse().map((size) => ({
        label: `${size}px`,
        cells: [
          <Avatar key="t" size={size} text="L" />,
          <Avatar key="ts" size={size} text="L" circular={false} />,
          <Avatar key="i" size={size} type="icon" />,
          <Avatar key="is" size={size} type="icon" circular={false} />,
          <Avatar key="im" size={size} type="image" src={PHOTO} />,
          <Avatar key="ib" size={size} type="image-border" src={PHOTO} />,
          AVATAR_COUNTRY[size] ? (
            <Avatar key="c" size={size} type="country" countryCode="GB" />
          ) : (
            <span key="c" className="text-caption-m text-text-light">
              —
            </span>
          ),
          AVATAR_COUNTRY[size] ? (
            <Avatar key="cs" size={size} type="country" countryCode="GB" circular={false} />
          ) : (
            <span key="cs" className="text-caption-m text-text-light">
              —
            </span>
          ),
          <Avatar key="n" size={size} text="L" showNotification />,
        ],
      }))}
      caption="Every size and type from Figma. Country only exists at 12–20px. The notification dot sits at the top-left, as in Figma."
    />
  )
}

function AvatarColourStates() {
  return (
    <StateTable
      columns={['text', 'text square', 'icon', 'icon square'] as const}
      rows={AVATAR_COLOURS.map((colour) => ({
        label: colour,
        cells: [
          <Avatar key="t" size={24} text="L" colour={colour} />,
          <Avatar key="ts" size={24} text="L" colour={colour} circular={false} />,
          <Avatar key="i" size={24} type="icon" colour={colour} />,
          <Avatar key="is" size={24} type="icon" colour={colour} circular={false} />,
        ],
      }))}
      caption="Every colour at 24px. Text and icon avatars share the same fill and foreground tokens."
    />
  )
}

export { AvatarColourStates, AvatarSizeStates }
