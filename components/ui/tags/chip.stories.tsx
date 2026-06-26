import { Chip } from './chip'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const PersonIcon = (
  <svg viewBox="0 0 14 14" fill="currentColor">
    <path d="M7 7a3 3 0 100-6 3 3 0 000 6zM2 13c0-2.76 2.24-5 5-5s5 2.24 5 5" />
  </svg>
)

const meta: Meta<typeof Chip> = {
  title: 'UI/Tags/Chip',
  component: Chip,
  argTypes: {
    fill: { control: 'select', options: ['default', 'accent', 'transparent'] },
    removable: { control: 'boolean' },
    boldText: { control: 'boolean' },
    withIcon: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Victoria Island',
    fill: 'default',
  },
}

export default meta
type Story = StoryObj<typeof Chip>

export const Default: Story = {}

export const AllFills: Story = {
  render: () => (
    <div className="flex items-center gap-[8px]">
      <Chip label="Default" fill="default" />
      <Chip label="Accent" fill="accent" />
      <Chip label="Transparent" fill="transparent" />
    </div>
  ),
}

export const WithIcon: Story = {
  args: { withIcon: true, icon: PersonIcon },
}

export const Removable: Story = {
  args: { removable: true, onRemove: () => {} },
}

export const RemovableAccent: Story = {
  args: { fill: 'accent', removable: true, onRemove: () => {} },
}

export const BoldText: Story = {
  args: { boldText: true },
}

export const Clickable: Story = {
  args: { onClick: () => alert('Clicked!') },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const Loading: Story = {
  args: { state: 'loading' },
}

export const Placeholder: Story = {
  args: { state: 'placeholder' },
}
