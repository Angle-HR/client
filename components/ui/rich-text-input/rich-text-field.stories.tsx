import { Button } from '../button/button'

import { RichTextField } from './rich-text-field'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof RichTextField> = {
  title: 'UI/RichTextInput/RichTextField',
  component: RichTextField,
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
    placeholder: 'Describe the role and responsibilities…',
    'aria-label': 'Job description',
  },
}

export default meta
type Story = StoryObj<typeof RichTextField>

export const Default: Story = {}

export const Filled: Story = {
  args: { defaultValue: '<b>Bold</b> and <i>italic</i> formatted text.' },
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
        Publish
      </Button>
    ),
  },
}
