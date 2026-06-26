import { FlowButton } from './flow-button'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof FlowButton> = {
  title: 'UI/Button/FlowButton',
  component: FlowButton,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
    size: { control: 'select', options: ['xs', 'sm', 'md'] },
    position: { control: 'select', options: ['left', 'right'] },
    disabled: { control: 'boolean' },
  },
  args: {
    children: 'Flow Button',
    variant: 'secondary',
    size: 'sm',
    position: 'left',
  },
}

export default meta
type Story = StoryObj<typeof FlowButton>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-[8px]">
      <FlowButton variant="primary">Primary</FlowButton>
      <FlowButton variant="secondary">Secondary</FlowButton>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-[8px]">
      <FlowButton size="xs">XS</FlowButton>
      <FlowButton size="sm">SM</FlowButton>
      <FlowButton size="md">MD</FlowButton>
    </div>
  ),
}

export const Positions: Story = {
  render: () => (
    <div className="flex items-center">
      <FlowButton position="right">Right (no radius)</FlowButton>
      <FlowButton position="left">Left (rounded)</FlowButton>
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex items-center gap-[8px]">
      <FlowButton
        iconPrefix={
          <svg viewBox="0 0 14 14" fill="currentColor">
            <circle cx="7" cy="7" r="3" />
          </svg>
        }
      >
        Prefix
      </FlowButton>
      <FlowButton
        iconSuffix={
          <svg viewBox="0 0 14 14" fill="currentColor">
            <path d="M5 3l4 4-4 4" />
          </svg>
        }
      >
        Suffix
      </FlowButton>
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}
