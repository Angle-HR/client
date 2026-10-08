import { useState } from 'react'

import { Tabs } from './tabs'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const jobTabs = [
  { key: 'all', label: 'All Job Listing', count: 32 },
  { key: 'drafts', label: 'Drafts', count: 10 },
  { key: 'archived', label: 'Archived', count: 12 },
  { key: 'templates', label: 'Templates', count: 2 },
] as const

type JobTabKey = (typeof jobTabs)[number]['key']

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
}

export default meta
type Story = StoryObj<typeof Tabs>

function JobTabs({ withSlots = false }: { withSlots?: boolean }) {
  const [value, setValue] = useState<JobTabKey>('all')
  return (
    <div className="w-[1054px] bg-bg-secondary">
      <Tabs
        aria-label="Job listings"
        tabs={jobTabs}
        value={value}
        onValueChange={setValue}
        trailing={
          withSlots ? (
            <span className="text-body-xs leading-19_2 text-text-secondary">Trailing slot</span>
          ) : undefined
        }
      />
    </div>
  )
}

export const Default: Story = {
  render: () => <JobTabs />,
}

export const WithTrailingSlot: Story = {
  render: () => <JobTabs withSlots />,
}

export const WithoutCounters: Story = {
  render: () => (
    <div className="w-[600px] bg-bg-secondary">
      <Tabs
        tabs={[
          { key: 'details', label: 'Details' },
          { key: 'activity', label: 'Activity' },
        ]}
        value="details"
        onValueChange={() => undefined}
      />
    </div>
  ),
}
