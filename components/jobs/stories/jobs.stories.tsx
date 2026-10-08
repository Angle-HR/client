import { useState } from 'react'

import { DescriptionField } from '../create/description-field'
import { FirstJobArt, FunnelArt, StartThumbnail } from '../job-art'
import { JobToast } from '../job-toast'
import { ManagersChip } from '../managers-chip'
import { PersonAvatar } from '../person-avatar'

import type { JobToastState } from '../job-toast'
import type { AiAccess } from '@/lib/jobs/ai-description'
import type { JobManager } from '@/lib/jobs/types'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

/**
 * The smaller pieces of the jobs screens. The screens themselves depend on
 * the router and the query cache, so they are covered in the app.
 */
const meta: Meta = {
  title: 'Jobs/Pieces',
}

export default meta
type Story = StoryObj

const alice: JobManager = {
  name: 'Alice',
  colour: 'green',
  avatarUrl: '/dashboard/avatars/alice.png',
}
const owen: JobManager = { name: 'Owen', colour: 'grey', avatarUrl: '/dashboard/avatars/owen.png' }
const jerry: JobManager = { name: 'Jerry', colour: 'fuchsia' }
const lucas: JobManager = { name: 'Lucas', colour: 'blue' }

export const People: Story = {
  render: () => (
    <div className="flex items-center gap-[12px]">
      <PersonAvatar person={alice} />
      <PersonAvatar person={jerry} />
      <PersonAvatar person={alice} size={16} />
      <PersonAvatar person={alice} circular />
      <PersonAvatar person={jerry} circular />
    </div>
  ),
}

/** One manager, two, three, and more than three. */
export const Managers: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-[8px]">
      <ManagersChip managers={[alice]} />
      <ManagersChip managers={[alice, jerry]} />
      <ManagersChip managers={[alice, jerry, owen]} />
      <ManagersChip managers={[alice, jerry, owen, lucas]} />
    </div>
  ),
}

export const Illustrations: Story = {
  render: () => (
    <div className="flex items-end gap-[32px]">
      <FirstJobArt />
      <FunnelArt />
      <StartThumbnail kind="manual" />
      <StartThumbnail kind="template" />
      <StartThumbnail kind="ai" />
    </div>
  ),
}

const TOASTS: Omit<JobToastState, 'id'>[] = [
  { kind: 'undoable', message: 'Job paused', onUndo: () => {} },
  { kind: 'done', message: 'Selection exported' },
  { kind: 'progress', message: 'Exporting selection' },
  {
    kind: 'done',
    message: 'MCP connected.',
    detail: 'You can disconnect it anytime in Account settings then MCPs',
  },
  {
    kind: 'info',
    message: 'AI integration coming soon',
    detail:
      "We're building a way to connect your own AI to Open HR. We'll let you know when it's ready",
  },
  {
    kind: 'info',
    message: 'Admin access needed',
    detail: 'Ask your workspace admin to connect AI tools or give you permission.',
    action: { label: 'Request access', onClick: () => {} },
  },
  {
    kind: 'error',
    message: "MCP couldn't connect.",
    detail: 'Check the endpoint and try again',
    action: { label: 'Try again', onClick: () => {} },
  },
]

/** Every kind of toast, each in the corner of its own frame. */
export const Toasts: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-[16px]">
      {TOASTS.map((toast, index) => (
        <div
          key={toast.message}
          className="relative h-[170px] w-[340px] rounded-lg-10 bg-bg-primary"
        >
          <JobToast toast={{ ...toast, id: index }} onDismiss={() => {}} />
        </div>
      ))}
    </div>
  ),
}

function Description({ access }: { access: AiAccess }) {
  const [value, setValue] = useState('')
  const [current, setCurrent] = useState(access)
  const [toast, setToast] = useState<JobToastState | null>(null)
  return (
    <div className="relative h-[520px] w-[720px] p-[24px]">
      <div className="w-[613px]">
        <DescriptionField
          value={value}
          onChange={setValue}
          title="Product Designer"
          team="Design"
          workspace="Acme"
          access={current}
          onAccessChange={setCurrent}
          onToast={(next) => setToast({ ...next, id: Date.now() })}
        />
      </div>
      {toast ? <JobToast toast={toast} onDismiss={() => setToast(null)} /> : null}
    </div>
  )
}

/** Generate drafts straight away; the draft can then be edited with AI. */
export const DescriptionWithAi: Story = {
  render: () => <Description access="connected" />,
}

/** Generate offers the MCP endpoint first. */
export const DescriptionNotConnected: Story = {
  render: () => <Description access="disconnected" />,
}

export const DescriptionWithoutAi: Story = {
  render: () => <Description access="unavailable" />,
}
