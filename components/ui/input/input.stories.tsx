import { Input } from './input'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const SearchIcon = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="6" cy="6" r="4" />
    <path d="M9.5 9.5L13 13" />
  </svg>
)

const EyeIcon = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" />
    <circle cx="7" cy="7" r="2" />
  </svg>
)

const meta: Meta<typeof Input> = {
  title: 'UI/Input/Input',
  component: Input,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    suffix: { control: 'select', options: ['none', 'icon', 'button'] },
    showPrefixIcon: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    placeholder: 'Enter text...',
    size: 'md',
    'aria-label': 'Demo input',
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-[8px] w-[280px]">
      <Input size="sm" placeholder="Small" aria-label="Small" />
      <Input size="md" placeholder="Medium" aria-label="Medium" />
      <Input size="lg" placeholder="Large" aria-label="Large" />
    </div>
  ),
}

export const WithPrefixIcon: Story = {
  args: { showPrefixIcon: true, prefixIcon: SearchIcon },
}

export const WithSuffixIcon: Story = {
  args: { suffix: 'icon', suffixIcon: EyeIcon },
}

export const WithSuffixButton: Story = {
  args: {
    suffix: 'button',
    suffixButton: (
      <button type="button" className="text-body-xs text-text-blue-accent px-1">
        Clear
      </button>
    ),
  },
}

export const Error: Story = {
  args: { 'aria-invalid': true, defaultValue: 'bad@input' },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Disabled' },
}
