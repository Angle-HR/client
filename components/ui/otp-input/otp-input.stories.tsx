import { OTPInput } from './otp-input'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof OTPInput> = {
  title: 'UI/OTPInput/OTPInput',
  component: OTPInput,
  argTypes: {
    state: { control: 'select', options: ['rest', 'error', 'success'] },
    showLabel: { control: 'boolean' },
    showHelper: { control: 'boolean' },
    disabled: { control: 'boolean' },
    autoSubmit: { control: 'boolean' },
  },
  args: {
    label: 'Verification code',
    helperText: 'Enter the 4-digit code sent to your email',
    showLabel: true,
  },
}

export default meta
type Story = StoryObj<typeof OTPInput>

export const Default: Story = {}

export const Filled: Story = {
  args: { defaultValue: '12' },
}

export const ErrorState: Story = {
  args: {
    state: 'error',
    defaultValue: '1234',
    errorText: 'Incorrect code. Please try again.',
  },
}

export const SuccessState: Story = {
  args: { state: 'success', defaultValue: '1234' },
}

export const HiddenLabel: Story = {
  args: { showLabel: false, 'aria-label': 'Verification code' },
}

export const Disabled: Story = {
  args: { disabled: true },
}
