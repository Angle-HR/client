import { InputSelection } from './input-selection'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const departments = [
  { value: 'eng', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'product', label: 'Product' },
  { value: 'sales', label: 'Sales' },
]

const skills = [
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'react', label: 'React' },
  { value: 'node', label: 'Node.js' },
]

const meta: Meta<typeof InputSelection> = {
  title: 'UI/InputSelection/InputSelection',
  component: InputSelection,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    showLabel: { control: 'boolean' },
    showHelper: { control: 'boolean' },
    multiple: { control: 'boolean' },
    withSelection: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Department',
    placeholder: 'Select a department',
    options: departments,
    size: 'md',
    showLabel: true,
  },
}

export default meta
type Story = StoryObj<typeof InputSelection>

export const Default: Story = {}

export const WithHelper: Story = {
  args: { showHelper: true, helperText: 'Select the team this role belongs to' },
}

export const Selected: Story = {
  args: { defaultValue: 'eng' },
}

export const WithError: Story = {
  args: { errorText: 'Please select a department' },
}

export const MultiSelect: Story = {
  args: {
    label: 'Skills required',
    placeholder: 'Select skills',
    options: skills,
    multiple: true,
    withSelection: true,
    defaultValue: ['js', 'ts'],
    helperText: 'Select all that apply',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-[16px] w-[280px]">
      <InputSelection size="sm" label="Small" options={departments} placeholder="Select" />
      <InputSelection size="md" label="Medium" options={departments} placeholder="Select" />
    </div>
  ),
}

export const HiddenLabel: Story = {
  args: { showLabel: false, 'aria-label': 'Department' },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'eng' },
}
