import { NotificationBadge } from './notification-badge'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof NotificationBadge> = {
  title: 'UI/Avatar/NotificationBadge',
  component: NotificationBadge,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    count: { control: 'number' },
    showNumber: { control: 'boolean' },
  },
  args: {
    size: 'md',
  },
}

export default meta
type Story = StoryObj<typeof NotificationBadge>

export const Default: Story = {}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-[16px]">
      <NotificationBadge size="sm" />
      <NotificationBadge size="md" />
      <NotificationBadge size="lg" />
      <NotificationBadge size="xl" />
    </div>
  ),
}

export const WithCount: Story = {
  args: { size: 'xl', showNumber: true, count: 5 },
}

export const CountOverflow: Story = {
  args: { size: 'xl', showNumber: true, count: 150 },
}
