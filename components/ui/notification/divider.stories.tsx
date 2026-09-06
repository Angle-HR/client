import { Divider } from './divider'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Divider> = {
  title: 'UI/Notification/Divider',
  component: Divider,
  argTypes: {
    width: { control: 'select', options: ['hairline', 'thin', 'medium'] },
    double: { control: 'boolean' },
    dashed: { control: 'boolean' },
    padded: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Divider>

export const Default: Story = {
  render: (args) => (
    <div className="w-[240px]">
      <Divider {...args} />
    </div>
  ),
}

export const Widths: Story = {
  render: () => (
    <div className="flex w-[240px] flex-col gap-[16px]">
      <Divider width="hairline" />
      <Divider width="thin" />
      <Divider width="medium" />
    </div>
  ),
}

export const Double: Story = {
  render: () => (
    <div className="w-[240px]">
      <Divider width="medium" double />
    </div>
  ),
}

export const Dashed: Story = {
  render: () => (
    <div className="w-[240px]">
      <Divider dashed />
    </div>
  ),
}

export const Padded: Story = {
  render: () => (
    <div className="w-[240px] bg-bg-primary">
      <Divider padded />
    </div>
  ),
}
