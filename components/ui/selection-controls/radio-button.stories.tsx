import { RadioButton } from './radio-button'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof RadioButton> = {
  title: 'UI/SelectionControls/RadioButton',
  component: RadioButton,
  argTypes: {
    textPosition: { control: 'select', options: ['right', 'left', 'none'] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Radio option',
    checked: false,
  },
}

export default meta
type Story = StoryObj<typeof RadioButton>

export const Default: Story = {}

export const Checked: Story = {
  args: { checked: true },
}

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-[16px]">
      <RadioButton label="Unselected" checked={false} />
      <RadioButton label="Selected" checked={true} />
    </div>
  ),
}

export const TextPositions: Story = {
  render: () => (
    <div className="flex items-center gap-[24px]">
      <RadioButton textPosition="left" checked={true} label="Left" />
      <RadioButton textPosition="right" checked={true} label="Right" />
      <RadioButton textPosition="none" checked={true} />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-[16px]">
      <RadioButton label="Disabled off" disabled />
      <RadioButton label="Disabled on" disabled checked />
    </div>
  ),
}
