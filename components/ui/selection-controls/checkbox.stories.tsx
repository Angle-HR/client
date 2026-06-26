import { Checkbox } from './checkbox'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Checkbox> = {
  title: 'UI/SelectionControls/Checkbox',
  component: Checkbox,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    checked: { control: 'select', options: [false, true, 'indeterminate'] },
    textPosition: { control: 'select', options: ['right', 'left', 'none'] },
    hoverable: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Checkbox label',
    size: 'lg',
    checked: false,
    textPosition: 'right',
  },
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {}

export const Checked: Story = {
  args: { checked: true },
}

export const Indeterminate: Story = {
  args: { checked: 'indeterminate' },
}

export const AllStates: Story = {
  render: () => (
    <div className="flex items-center gap-[16px]">
      <Checkbox label="Unchecked" checked={false} />
      <Checkbox label="Checked" checked />
      <Checkbox label="Indeterminate" checked="indeterminate" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-[16px]">
      <Checkbox size="sm" checked label="Small" />
      <Checkbox size="md" checked label="Medium" />
      <Checkbox size="lg" checked label="Large" />
    </div>
  ),
}

export const TextPositions: Story = {
  render: () => (
    <div className="flex items-center gap-[24px]">
      <Checkbox textPosition="left" checked label="Left" />
      <Checkbox textPosition="right" checked label="Right" />
      <Checkbox textPosition="none" checked aria-label="No label" />
    </div>
  ),
}

export const Uncontrolled: Story = {
  args: { defaultChecked: true, label: 'Toggle me (uncontrolled)' },
}

export const Hoverable: Story = {
  args: { hoverable: true, checked: true },
}

export const Disabled: Story = {
  args: { disabled: true, checked: true },
}
