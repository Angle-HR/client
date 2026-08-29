import { useState } from 'react'

import { SidebarGroupItem, type SidebarItemData } from './group-item'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const BriefcaseIcon = (
  <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.1">
    <rect x="1" y="4" width="11" height="7" rx="1" />
    <path d="M4.5 4V2.5a1 1 0 011-1h2a1 1 0 011 1V4" />
  </svg>
)

const FunnelIcon = (
  <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.1">
    <path d="M1.5 2h10L7.5 7v4l-2-1V7L1.5 2z" strokeLinejoin="round" />
  </svg>
)

const items: SidebarItemData[] = [
  { label: 'Job Postings', icon: BriefcaseIcon, href: '#' },
  { label: 'Candidates', icon: FunnelIcon, href: '#', notificationCount: 3 },
]

const meta: Meta<typeof SidebarGroupItem> = {
  title: 'UI/Sidebar/GroupItem',
  component: SidebarGroupItem,
  args: {
    title: 'Hiring',
    items,
  },
}

export default meta
type Story = StoryObj<typeof SidebarGroupItem>

export const Open: Story = {}

export const Closed: Story = {
  args: { open: false },
}

export const Interactive: Story = {
  render: (args) => {
    function Wrapper() {
      const [open, setOpen] = useState(true)
      return <SidebarGroupItem {...args} open={open} onToggle={setOpen} />
    }
    return <Wrapper />
  },
}
