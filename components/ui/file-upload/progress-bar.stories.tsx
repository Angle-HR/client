import { ProgressBar } from './progress-bar'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof ProgressBar> = {
  title: 'UI/FileUpload/ProgressBar',
  component: ProgressBar,
}

export default meta
type Story = StoryObj<typeof ProgressBar>

export const AllStates: Story = {
  render: () => (
    <div className="flex w-[217px] flex-col gap-[16px]">
      <ProgressBar progress={42} state="neutral" />
      <ProgressBar progress={100} state="success" />
      <ProgressBar progress={67} state="error" />
    </div>
  ),
}
