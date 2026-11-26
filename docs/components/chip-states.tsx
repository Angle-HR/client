'use client'

// States grid for the Chip. Each cell is the real component with its Figma
// state pinned through the `state` prop (fills come from chip.figma.ts).
import { Avatar } from '@/components/ui/avatar'
import { Chip } from '@/components/ui/tags'
import { CHIP_FILLS } from '@/components/ui/tags/chip.figma'

import { StateTable } from './state-table'

const icon = (
  <Avatar
    size={14}
    type="image-border"
    circular={false}
    src="/dashboard/avatars/alice.png"
    alt=""
  />
)

function ChipStates() {
  const columns = ['rest', 'hover', 'placeholder', 'disabled', 'removable', 'loading'] as const
  return (
    <StateTable
      columns={columns}
      rows={CHIP_FILLS.map((fill) => ({
        label: fill,
        cells: [
          <Chip key="rest" label="Alice" fill={fill} icon={icon} />,
          <Chip key="hover" label="Alice" fill={fill} icon={icon} state="hover" />,
          <Chip key="ph" label="Select" fill={fill} icon={icon} state="placeholder" />,
          <Chip key="dis" label="Alice" fill={fill} icon={icon} disabled />,
          <Chip key="rm" label="Alice" fill={fill} icon={icon} removable onRemove={() => {}} />,
          <Chip key="load" label="Alice" fill={fill} state="loading" />,
        ],
      }))}
      caption="Every fill in each Figma state, pinned with the state prop. Hover the examples above to see the 50ms fade."
    />
  )
}

export { ChipStates }
