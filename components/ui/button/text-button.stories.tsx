import { TextButton } from './text-button'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const ArrowIcon = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M5 3l4 4-4 4" />
  </svg>
)

const meta: Meta<typeof TextButton> = {
  title: 'UI/Button/TextButton',
  component: TextButton,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    bold: { control: 'boolean' },
    underline: { control: 'boolean' },
  },
  args: {
    children: 'Text Button',
    size: 'md',
  },
}

export default meta
type Story = StoryObj<typeof TextButton>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-[16px]">
      <TextButton size="sm">Small</TextButton>
      <TextButton size="md">Medium</TextButton>
      <TextButton size="lg">Large</TextButton>
    </div>
  ),
}

export const Bold: Story = {
  args: { bold: true },
}

export const Underline: Story = {
  args: { underline: true },
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex items-center gap-[16px]">
      <TextButton iconLeft={ArrowIcon}>Left icon</TextButton>
      <TextButton iconRight={ArrowIcon}>Right icon</TextButton>
    </div>
  ),
}

export const WithAvatar: Story = {
  render: () => (
    <div className="flex items-center gap-[16px]">
      <TextButton
        size="md"
        avatar={
          <span className="h-[14px] w-[14px] rounded-full bg-bg-avatar-blue text-text-avatar-blue text-[7px] flex items-center justify-center font-medium">
            JD
          </span>
        }
      >
        John Doe
      </TextButton>
      <TextButton
        size="sm"
        avatar={
          <span className="h-[14px] w-[14px] rounded-full bg-bg-avatar-blue text-text-avatar-blue text-[7px] flex items-center justify-center font-medium">
            JD
          </span>
        }
      >
        Hidden at sm
      </TextButton>
    </div>
  ),
}

export const AsLink: Story = {
  args: {
    href: '#',
    children: 'Link Button',
  },
}

export const Disabled: Story = {
  args: { disabled: true },
}
