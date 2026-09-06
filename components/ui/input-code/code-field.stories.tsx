import { Button } from '../button/button'

import { CodeField } from './code-field'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof CodeField> = {
  title: 'UI/InputCode/CodeField',
  component: CodeField,
  argTypes: {
    state: {
      control: 'select',
      options: ['placeholder', 'hover', 'focus', 'selected', 'filled', 'error', 'disabled'],
    },
    showActionButtons: { control: 'boolean' },
    showSecondaryAction: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    placeholder: '{\n  "event": "employee.created",\n  "data": {}\n}',
    language: 'json',
    'aria-label': 'Code snippet',
  },
}

export default meta
type Story = StoryObj<typeof CodeField>

export const Default: Story = {}

export const Filled: Story = {
  args: { defaultValue: '{\n  "event": "employee.created"\n}' },
}

export const Error: Story = {
  args: { state: 'error', defaultValue: '{ invalid json' },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: '{}' },
}

export const WithActionButtons: Story = {
  args: {
    primaryActionButton: (
      <Button variant="secondary" size="sm">
        Format
      </Button>
    ),
  },
}

export const WithSecondaryAction: Story = {
  args: {
    showSecondaryAction: true,
    primaryActionButton: (
      <Button variant="secondary" size="sm">
        Format
      </Button>
    ),
    secondaryActionButton: (
      <Button variant="tertiary" size="sm">
        Copy code
      </Button>
    ),
  },
}
