import { Tag as UiTag } from '@/components/ui'

import type { Tag, TagColor } from '@/lib/applications/pipeline'
import type { ComponentProps, ReactElement } from 'react'

type UiTagColor = NonNullable<ComponentProps<typeof UiTag>['color']>

/** The server's tag colours as the design system names them. */
const COLOR: Record<TagColor, UiTagColor> = {
  gray: 'grey',
  red: 'red',
  orange: 'orange',
  yellow: 'yellow',
  green: 'green',
  teal: 'teal',
  blue: 'blue',
  purple: 'purple',
  pink: 'fuchsia',
}

interface TagPillProps {
  tag: Tag
  size?: 'sm' | 'xs'
  onRemove?: () => void
}

/** A company tag, in its colour. */
function TagPill({ tag, size = 'xs', onRemove }: TagPillProps): ReactElement {
  return (
    <UiTag
      label={tag.name}
      color={COLOR[tag.color]}
      size={size}
      removable={Boolean(onRemove)}
      onRemove={onRemove}
      className="shrink-0"
    />
  )
}

export { COLOR as TAG_UI_COLOR, TagPill }
export type { TagPillProps }
