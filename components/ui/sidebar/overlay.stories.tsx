import { Overlay } from './overlay'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Overlay> = {
  title: 'UI/Sidebar/Overlay',
  component: Overlay,
}

export default meta
type Story = StoryObj<typeof Overlay>

export const Default: Story = {
  render: () => (
    <div className="relative h-[240px] w-[400px] bg-bg-primary">
      <div className="p-[16px] text-body-s text-text-primary">Page content behind the overlay</div>
      <Overlay className="absolute" />
    </div>
  ),
}
