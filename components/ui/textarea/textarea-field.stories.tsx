import { Button } from '../button/button'

import { TextareaField } from './textarea-field'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof TextareaField> = {
  title: 'UI/Textarea/TextareaField',
  component: TextareaField,
  argTypes: {
    state: {
      control: 'select',
      options: ['placeholder', 'hover', 'focus', 'selected', 'filled', 'error', 'disabled'],
    },
    showToolbar: { control: 'boolean' },
    showActionButton: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    placeholder: 'Write your feedback here…',
    rows: 4,
    'aria-label': 'Feedback',
  },
}

export default meta
type Story = StoryObj<typeof TextareaField>

export const Default: Story = {}

export const Filled: Story = {
  args: { defaultValue: 'The onboarding flow was smooth and easy to follow.' },
}

export const Error: Story = {
  args: { state: 'error', defaultValue: 'Too short' },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Cannot be edited' },
}

export const WithoutToolbar: Story = {
  args: { showToolbar: false },
}

export const WithActionButton: Story = {
  args: {
    showActionButton: true,
    actionButton: (
      <Button variant="primary" size="sm">
        Post
      </Button>
    ),
  },
}

export const WithSecondaryActions: Story = {
  args: {
    showActionButton: true,
    actionButton: (
      <>
        <Button variant="secondary" size="sm">
          Cancel
        </Button>
        <Button variant="primary" size="sm">
          Save
        </Button>
      </>
    ),
  },
}
