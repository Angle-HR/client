import { Toggle } from './toggle'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Toggle> = {
  title: 'UI/SelectionControls/Toggle',
  component: Toggle,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    toggled: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    size: 'md',
    toggled: false,
    'aria-label': 'Toggle',
  },
}

export default meta
type Story = StoryObj<typeof Toggle>

export const Default: Story = {}

export const On: Story = {
  args: { toggled: true },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-[16px]">
      <Toggle size="sm" aria-label="Small off" />
      <Toggle size="sm" toggled aria-label="Small on" />
      <Toggle size="md" aria-label="Medium off" />
      <Toggle size="md" toggled aria-label="Medium on" />
    </div>
  ),
}

export const Uncontrolled: Story = {
  args: { defaultToggled: true, 'aria-label': 'Uncontrolled toggle' },
}

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-[16px]">
      <Toggle disabled aria-label="Disabled off" />
      <Toggle disabled toggled aria-label="Disabled on" />
    </div>
  ),
}
