import { IconButton } from './icon-button'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const PlusIcon = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M7 2v10M2 7h10" />
  </svg>
)

const meta: Meta<typeof IconButton> = {
  title: 'UI/Button/IconButton',
  component: IconButton,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'light'],
    },
    size: { control: 'select', options: ['sm', 'md'] },
    disabled: { control: 'boolean' },
    counter: { control: 'number' },
  },
  args: {
    icon: PlusIcon,
    'aria-label': 'Add item',
    variant: 'secondary',
    size: 'md',
  },
}

export default meta
type Story = StoryObj<typeof IconButton>

export const Default: Story = {}

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-[8px]">
      <IconButton variant="primary" icon={PlusIcon} aria-label="Primary" />
      <IconButton variant="secondary" icon={PlusIcon} aria-label="Secondary" />
      <IconButton variant="tertiary" icon={PlusIcon} aria-label="Tertiary" />
      <IconButton variant="light" icon={PlusIcon} aria-label="Light" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-[8px]">
      <IconButton size="sm" icon={PlusIcon} aria-label="Small" />
      <IconButton size="md" icon={PlusIcon} aria-label="Medium" />
    </div>
  ),
}

export const WithCounter: Story = {
  args: { counter: 5 },
}

export const CounterOverflow: Story = {
  args: { counter: 150 },
}

export const Disabled: Story = {
  args: { disabled: true },
}
