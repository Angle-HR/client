import { Button } from '../button/button'

import { CompanySelector } from './company-selector'
import { SidebarGroupItem, type SidebarItemData } from './group-item'
import { SidebarItem } from './item'
import { Sidebar } from './sidebar'

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

const CogIcon = (
  <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.1">
    <circle cx="6.5" cy="6.5" r="2" />
    <path d="M6.5 1.5v1M6.5 10.5v1M1.5 6.5h1M10.5 6.5h1" />
  </svg>
)

const hiringItems: SidebarItemData[] = [
  { label: 'Job Postings', icon: BriefcaseIcon, href: '#', active: true },
  { label: 'Candidates', icon: FunnelIcon, href: '#', notificationCount: 3 },
]

const settingsItems: SidebarItemData[] = [{ label: 'Workspace', icon: CogIcon, href: '#' }]

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
        footer={<SidebarItem label="Help & support" icon={CogIcon} href="#" />}
      >
        <SidebarGroupItem title="Hiring" items={hiringItems} />
        <SidebarGroupItem title="Account" items={settingsItems} />
      </Sidebar>
    </div>
  ),
}
