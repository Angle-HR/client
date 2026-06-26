import { Button } from './button'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Button> = {
  title: 'UI/Button/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
    },
    accent: { control: 'select', options: ['default', 'blue', 'red'] },
    size: { control: 'select', options: ['sm', 'md'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    children: 'Button',
    variant: 'primary',
    accent: 'default',
    size: 'md',
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-[16px]">
      {(['default', 'blue', 'red'] as const).map((accent) => (
        <div key={accent} className="flex items-center gap-[8px]">
          <span className="w-[64px] shrink-0 text-xs text-text-secondary">{accent}</span>
          <Button variant="primary" accent={accent}>
            Primary
          </Button>
          <Button variant="secondary" accent={accent}>
            Secondary
          </Button>
          <Button variant="tertiary" accent={accent}>
            Tertiary
          </Button>
        </div>
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-[8px]">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex items-center gap-[8px]">
      <Button
        iconPrefix={
          <svg viewBox="0 0 14 14" fill="currentColor">
            <circle cx="7" cy="7" r="3" />
          </svg>
        }
      >
        Prefix
      </Button>
      <Button
        iconSuffix={
          <svg viewBox="0 0 14 14" fill="currentColor">
            <path d="M5 3l4 4-4 4" />
          </svg>
        }
      >
        Suffix
      </Button>
      <Button
        iconPrefix={
          <svg viewBox="0 0 14 14" fill="currentColor">
            <circle cx="7" cy="7" r="3" />
          </svg>
        }
        iconSuffix={
          <svg viewBox="0 0 14 14" fill="currentColor">
            <path d="M5 3l4 4-4 4" />
          </svg>
        }
      >
        Both
      </Button>
    </div>
  ),
}

export const Loading: Story = {
  args: { loading: true },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const DisabledAllAccents: Story = {
  render: () => (
    <div className="flex items-center gap-[8px]">
      <Button disabled accent="default">
        Default
      </Button>
      <Button disabled accent="blue">
        Blue
      </Button>
      <Button disabled accent="red">
        Red
      </Button>
    </div>
  ),
}
