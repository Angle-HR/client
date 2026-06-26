import { Tag } from './tag'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Tag> = {
  title: 'UI/Tags/Tag',
  component: Tag,
  argTypes: {
    color: {
      control: 'select',
      options: [
        'empty',
        'red',
        'green',
        'teal',
        'aqua',
        'blue',
        'purple',
        'grey',
        'yellow',
        'fuchsia',
        'orange',
      ],
    },
    weight: { control: 'select', options: ['regular', 'medium'] },
    removable: { control: 'boolean' },
  },
  args: {
    label: 'Tag',
    color: 'blue',
  },
}

export default meta
type Story = StoryObj<typeof Tag>

export const Default: Story = {}

export const AllColors: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-[8px]">
      {(
        [
          'empty',
          'red',
          'green',
          'teal',
          'aqua',
          'blue',
          'purple',
          'grey',
          'yellow',
          'fuchsia',
          'orange',
        ] as const
      ).map((color) => (
        <Tag key={color} label={color} color={color} />
      ))}
    </div>
  ),
}

export const Removable: Story = {
  args: { removable: true, onRemove: () => {} },
}

export const RemovableAllColors: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-[8px]">
      {(
        [
          'empty',
          'red',
          'green',
          'teal',
          'aqua',
          'blue',
          'purple',
          'grey',
          'yellow',
          'fuchsia',
          'orange',
        ] as const
      ).map((color) => (
        <Tag key={color} label={color} color={color} removable onRemove={() => {}} />
      ))}
    </div>
  ),
}

export const MediumWeight: Story = {
  args: { weight: 'medium' },
}
