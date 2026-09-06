import { Notification } from './notification'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Notification> = {
  title: 'UI/Notification/Notification',
  component: Notification,
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large', 'xlarge'] },
    withText: { control: 'boolean' },
    plainText: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Notification>

export const Dot: Story = {
  args: { size: 'medium' },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-[16px]">
      <Notification size="small" />
      <Notification size="medium" />
      <Notification size="large" />
      <Notification size="xlarge" />
    </div>
  ),
}

export const Pill: Story = {
  args: { withText: true, count: 12 },
}

export const PillOverMax: Story = {
  args: { withText: true, count: 240 },
}

export const PlainText: Story = {
  args: { withText: true, plainText: true, count: 3 },
}
