import { SidebarItem } from './item'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const InboxIcon = (
  <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.1">
    <path d="M1 7h3l1.2 2h2.6L9 7h3" strokeLinejoin="round" />
    <rect x="1" y="3" width="11" height="8" rx="1" />
  </svg>
)

const meta: Meta<typeof SidebarItem> = {
  title: 'UI/Sidebar/Item',
  component: SidebarItem,
  argTypes: {
    active: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    label: 'Inbox',
    icon: InboxIcon,
    href: '/inbox',
  },
}

export default meta
type Story = StoryObj<typeof SidebarItem>

export const Rest: Story = {}

export const Active: Story = {
  args: { active: true },
}

export const WithNotification: Story = {
  args: { notificationCount: 12 },
}

export const Loading: Story = {
  args: { loading: true },
}

export const AllStates: Story = {
  render: () => (
    <div className="flex w-[204px] flex-col gap-[2px]">
      <SidebarItem label="Rest" icon={InboxIcon} href="#" />
      <SidebarItem label="Active" icon={InboxIcon} href="#" active />
      <SidebarItem label="With badge" icon={InboxIcon} href="#" notificationCount={12} />
      <SidebarItem loading />
    </div>
  ),
}
