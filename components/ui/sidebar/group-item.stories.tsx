import { useState } from 'react'

import { Briefcase, Funnel } from '../icons'

import { SidebarGroupItem, type SidebarItemData } from './group-item'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const items: SidebarItemData[] = [
  { label: 'Job Postings', icon: <Briefcase />, href: '#' },
  { label: 'Candidates', icon: <Funnel />, href: '#', notificationCount: 3 },
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
