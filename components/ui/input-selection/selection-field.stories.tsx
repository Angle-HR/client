import { Tag } from '../tags/tag'

import { SelectionField } from './selection-field'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const BuildingIcon = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25">
    <rect x="2" y="1.5" width="7" height="11" rx="0.5" />
    <path d="M9 6h3v6.5H9M4.5 4h1M4.5 6.5h1M4.5 9h1" strokeLinecap="round" />
  </svg>
)

const meta: Meta<typeof SelectionField> = {
  title: 'UI/InputSelection/SelectionField',
  component: SelectionField,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    state: {
      control: 'select',
      options: ['placeholder', 'hover', 'focus', 'filled', 'disabled', 'error'],
    },
    showPrefixIcon: { control: 'boolean' },
    withSelection: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    placeholder: 'Select a department',
    size: 'md',
    'aria-label': 'Demo selection field',
  },
}

export default meta
type Story = StoryObj<typeof SelectionField>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-[8px] w-[280px]">
      <SelectionField size="sm" placeholder="Small" aria-label="Small" />
      <SelectionField size="md" placeholder="Medium" aria-label="Medium" />
      <SelectionField size="lg" placeholder="Large" aria-label="Large" />
    </div>
  ),
}

export const Filled: Story = {
  args: { state: 'filled', value: 'Engineering' },
}

export const WithPrefixIcon: Story = {
  args: { showPrefixIcon: true, prefixIcon: BuildingIcon, state: 'filled', value: 'Engineering' },
}

export const WithSelectionTags: Story = {
  args: {
    withSelection: true,
    state: 'filled',
    tags: [
      <Tag key="js" label="JavaScript" removable />,
      <Tag key="ts" label="TypeScript" removable />,
    ],
  },
}

export const Error: Story = {
  args: { state: 'error' },
}

export const Disabled: Story = {
  args: { disabled: true, value: 'Engineering' },
}
