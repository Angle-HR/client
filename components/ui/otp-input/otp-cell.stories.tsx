import { OTPCell } from './otp-cell'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof OTPCell> = {
  title: 'UI/OTPInput/OTPCell',
  component: OTPCell,
  argTypes: {
    state: {
      control: 'select',
      options: ['placeholder', 'hover', 'focus', 'filled', 'error', 'disabled', 'success'],
    },
    disabled: { control: 'boolean' },
  },
  args: {
    position: 1,
  },
}

export default meta
type Story = StoryObj<typeof OTPCell>

export const Default: Story = {}

export const Filled: Story = {
  args: { value: '4' },
}

export const Error: Story = {
  args: { state: 'error', value: '4' },
}

export const Success: Story = {
  args: { state: 'success', value: '4' },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const AllStates: Story = {
  render: () => (
    <div className="flex items-center gap-[8px]">
      <OTPCell position={1} state="placeholder" />
      <OTPCell position={2} state="hover" />
      <OTPCell position={3} state="focus" />
      <OTPCell position={4} state="filled" value="4" />
      <OTPCell position={1} state="error" value="4" />
      <OTPCell position={1} state="success" value="4" />
      <OTPCell position={1} disabled />
    </div>
  ),
}
