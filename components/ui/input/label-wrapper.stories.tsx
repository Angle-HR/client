import { LabelWrapper } from './label-wrapper'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LabelWrapper> = {
  title: 'UI/Input/LabelWrapper',
  component: LabelWrapper,
}

export default meta
type Story = StoryObj<typeof LabelWrapper>

export const Default: Story = {
  args: { label: 'Email address' },
}

export const Required: Story = {
  args: { label: 'Email address', required: true },
}

export const WithSubtext: Story = {
  args: { label: 'Salary band', subtext: 'Visible only to hiring managers' },
}
