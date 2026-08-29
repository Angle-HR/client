import { StatusText } from './status-text'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof StatusText> = {
  title: 'UI/FileUpload/StatusText',
  component: StatusText,
}

export default meta
type Story = StoryObj<typeof StatusText>

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-[12px]">
      <StatusText state="neutral" progress={42} />
      <StatusText state="success" progress={100} />
      <StatusText state="error" retryLabel="Retry upload of Resume.pdf" />
    </div>
  ),
}
