import { InputCode } from './input-code'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof InputCode> = {
  title: 'UI/InputCode/InputCode',
  component: InputCode,
  argTypes: {
    showLabel: { control: 'boolean' },
    showHelper: { control: 'boolean' },
    showActionButton: { control: 'boolean' },
    showSecondaryAction: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Webhook payload',
    placeholder: '{\n  "event": "employee.created",\n  "data": {}\n}',
    language: 'json',
    showLabel: true,
  },
}

export default meta
type Story = StoryObj<typeof InputCode>

export const Default: Story = {}

export const WithHelper: Story = {
  args: { showHelper: true, helperText: 'Valid JSON only' },
}

export const WithError: Story = {
  args: { errorText: 'Invalid JSON: unexpected token at line 3' },
}

export const ReadOnlyWithCopy: Story = {
  args: {
    label: 'Embed code',
    defaultValue: '<script src="https://openhr.dev/embed.js"></script>',
    readOnly: true,
    showActionButton: false,
    showSecondaryAction: true,
    secondaryActionLabel: 'Copy code',
    helperText: "Paste this snippet into your website's <head> tag",
  },
}

export const HiddenLabel: Story = {
  args: { showLabel: false, 'aria-label': 'Webhook payload' },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: '{}' },
}
