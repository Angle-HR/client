import { SidebarTitle } from './title'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof SidebarTitle> = {
  title: 'UI/Sidebar/Title',
  component: SidebarTitle,
  argTypes: {
    hoverable: { control: 'boolean' },
    closed: { control: 'boolean' },
  },
  args: {
    label: 'Hiring',
  },
}

export default meta
type Story = StoryObj<typeof SidebarTitle>

export const Open: Story = {}

export const Closed: Story = {
  args: { closed: true },
}

export const Static: Story = {
  args: { hoverable: false },
}
