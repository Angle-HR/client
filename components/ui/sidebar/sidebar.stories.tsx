import { Button } from '../button/button'
import { Briefcase, Cog6Tooth, Funnel } from '../icons'

import { CompanySelector } from './company-selector'
import { SidebarGroupItem, type SidebarItemData } from './group-item'
import { SidebarItem } from './item'
import { Sidebar } from './sidebar'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const hiringItems: SidebarItemData[] = [
  { label: 'Job Postings', icon: <Briefcase />, href: '#', active: true },
  { label: 'Candidates', icon: <Funnel />, href: '#', notificationCount: 3 },
]

const settingsItems: SidebarItemData[] = [{ label: 'Workspace', icon: <Cog6Tooth />, href: '#' }]

const meta: Meta<typeof Sidebar> = {
  title: 'UI/Sidebar/Sidebar',
  component: Sidebar,
}

export default meta
type Story = StoryObj<typeof Sidebar>

export const Default: Story = {
  render: () => (
    <div className="h-[600px]">
      <Sidebar
        companySelector={<CompanySelector currentCompany={{ name: 'Revolut International' }} />}
        cta={
          <Button variant="primary" size="sm" className="w-full">
            Invite teammate
          </Button>
        }
        footer={<SidebarItem label="Help & support" icon={<Cog6Tooth />} href="#" />}
      >
        <SidebarGroupItem title="Hiring" items={hiringItems} />
        <SidebarGroupItem title="Account" items={settingsItems} />
      </Sidebar>
    </div>
  ),
}
