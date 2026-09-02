import { RichTextInput } from './rich-text-input'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof RichTextInput> = {
  title: 'UI/RichTextInput/RichTextInput',
  component: RichTextInput,
  argTypes: {
    showLabel: { control: 'boolean' },
    showHelper: { control: 'boolean' },
    showToolbar: { control: 'boolean' },
    showActionButton: { control: 'boolean' },
    showSecondaryActions: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Job description',
    placeholder: 'Describe the role, responsibilities, and requirements...',
    showLabel: true,
  },
}

export default meta
type Story = StoryObj<typeof RichTextInput>

export const Default: Story = {}

export const WithHelper: Story = {
  args: { showHelper: true, helperText: 'Formatting is preserved when the job is published' },
}

export const WithError: Story = {
  args: { errorText: 'Job description is required' },
}

export const WithActionButton: Story = {
  args: {
    label: 'Offer letter body',
    showActionButton: true,
    actionButtonLabel: 'Publish',
  },
}

export const HiddenLabel: Story = {
  args: { showLabel: false, 'aria-label': 'Job description' },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'This field cannot be edited' },
}
