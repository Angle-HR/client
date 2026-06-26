import { AvatarIcon } from './avatar-icon'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const StarIcon = (
  <svg viewBox="0 0 14 14" fill="currentColor">
    <path d="M7 1l1.8 3.6L13 5.3l-3 2.9.7 4.1L7 10.4 3.3 12.3l.7-4.1-3-2.9 4.2-.7z" />
  </svg>
)

const meta: Meta<typeof AvatarIcon> = {
  title: 'UI/Avatar/AvatarIcon',
  component: AvatarIcon,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    wrapped: { control: 'boolean' },
  },
  args: {
    size: 'sm',
    children: StarIcon,
  },
}

export default meta
type Story = StoryObj<typeof AvatarIcon>

export const Default: Story = {}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-[16px]">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <AvatarIcon key={size} size={size}>
          {StarIcon}
        </AvatarIcon>
      ))}
    </div>
  ),
}

export const Wrapped: Story = {
  render: () => (
    <div className="flex items-center gap-[16px]">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <AvatarIcon key={size} size={size} wrapped>
          {StarIcon}
        </AvatarIcon>
      ))}
    </div>
  ),
}
