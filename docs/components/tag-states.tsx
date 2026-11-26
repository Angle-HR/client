// States grid for the Tag. Each cell is the real component; the remove
// button's hover is pinned with the token from tag.figma.ts.
import { Tag } from '@/components/ui/tags'
import { TAG_COLORS, TAG_FIGMA } from '@/components/ui/tags/tag.figma'

import { StateTable } from './state-table'

import type { CSSProperties } from 'react'

const PIN_HOVER = '[&_button]:bg-(--pin-hover)'

function TagStates() {
  const columns = ['large', 'small', 'xSmall', 'removable', 'remove hover'] as const
  return (
    <StateTable
      columns={columns}
      rows={TAG_COLORS.map((color) => ({
        label: color,
        cells: [
          <Tag key="lg" label="Tag" color={color} />,
          <Tag key="sm" label="Tag" color={color} size="sm" />,
          <Tag key="xs" label="Tag" color={color} size="xs" />,
          <Tag key="rm" label="Tag" color={color} removable />,
          <span
            key="hover"
            className={`inline-flex ${PIN_HOVER}`}
            style={{ '--pin-hover': `var(--${TAG_FIGMA.remove.hover.bg})` } as CSSProperties}
          >
            <Tag label="Tag" color={color} removable />
          </span>,
        ],
      }))}
      caption="Every colour at each size, pinned using Figma's tokens. The last column pins the remove button's hover; hover over the examples above to see it fade in."
    />
  )
}

export { TagStates }
