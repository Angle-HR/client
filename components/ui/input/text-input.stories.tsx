import { TextInput } from './text-input'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof TextInput> = {
  title: 'UI/Input/TextInput',
  component: TextInput,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    showLabel: { control: 'boolean' },
    showHelper: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Email',
    placeholder: 'Enter email address',
    size: 'md',
    showLabel: true,
  },
}

export default meta
type Story = StoryObj<typeof TextInput>

export const Default: Story = {}

export const WithHelper: Story = {
  args: { showHelper: true, helperText: 'We will never share your email' },
}

export const WithError: Story = {
  args: { errorText: 'Please enter a valid email address' },
}

export const HiddenLabel: Story = {
  args: { showLabel: false },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-[16px] w-[280px]">
      <TextInput size="sm" label="Small" placeholder="Small input" />
      <TextInput size="md" label="Medium" placeholder="Medium input" />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const Complete: Story = {
  render: () => (
    <div className="flex flex-col gap-[16px] w-[280px]">
      <TextInput
        label="Name"
        placeholder="Full name"
        showHelper
        helperText="As it appears on your ID"
      />
      <TextInput
        label="Email"
        placeholder="you@company.com"
        errorText="This email is already registered"
      />
    </div>
  ),
}
