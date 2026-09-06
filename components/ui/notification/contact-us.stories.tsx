import { ContactUsButton } from './contact-us'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof ContactUsButton> = {
  title: 'UI/Notification/ContactUsButton',
  component: ContactUsButton,
}

export default meta
type Story = StoryObj<typeof ContactUsButton>

export const Default: Story = {
  render: () => (
    <div className="bg-bg-primary p-[24px]">
      <ContactUsButton />
    </div>
  ),
}

export const FixedCorner: Story = {
  render: () => (
    <div className="relative h-[240px] w-[320px] rounded-lg-10 bg-bg-primary">
      <p className="p-[16px] text-body-s text-text-secondary">Page content</p>
      <ContactUsButton className="absolute right-[16px] bottom-[16px]" />
    </div>
  ),
}
