import { Logo } from './logo'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Logo> = {
  title: 'UI/Banner/Logo',
  component: Logo,
}

export default meta
type Story = StoryObj<typeof Logo>

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-[24px] bg-bg-primary p-[24px]">
      <Logo size="sm" />
      <Logo size="lg" />
      <Logo size="favicon" />
    </div>
  ),
}
