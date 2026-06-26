import { HelperText } from './helper-text'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof HelperText> = {
  title: 'UI/Input/HelperText',
  component: HelperText,
  argTypes: {
    state: { control: 'select', options: ['neutral', 'error', 'info'] },
  },
  args: {
    children: 'This is helper text',
    state: 'neutral',
  },
}

export default meta
type Story = StoryObj<typeof HelperText>

export const Default: Story = {}

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-[12px]">
      <HelperText state="neutral">Neutral helper text</HelperText>
      <HelperText state="error">Error helper text</HelperText>
      <HelperText state="info">Info helper text</HelperText>
    </div>
  ),
}
