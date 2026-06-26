import { Avatar, getInitials } from './avatar'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar/Avatar',
  component: Avatar,
  argTypes: {
    size: { control: 'select', options: [12, 14, 16, 18, 20, 24, 32, 44] },
    type: {
      control: 'select',
      options: ['initials', 'image', 'image-border', 'icon', 'country'],
    },
    circular: { control: 'boolean' },
    colour: {
      control: 'select',
      options: [
        'green',
        'purple',
        'aqua',
        'orange',
        'yellow',
        'blue',
        'fuchsia',
        'red',
        'grey',
        'teal',
      ],
    },
    showNotification: { control: 'boolean' },
    notificationCount: { control: 'number' },
  },
  args: {
    size: 32,
    type: 'initials',
    text: getInitials('John Doe'),
    colour: 'blue',
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

export const Default: Story = {}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-[8px]">
      {([12, 14, 16, 18, 20, 24, 32, 44] as const).map((size) => (
        <Avatar key={size} size={size} text={getInitials('John Doe')} colour="blue" />
      ))}
    </div>
  ),
}

export const AllColours: Story = {
  render: () => (
    <div className="flex items-center gap-[8px]">
      {(
        [
          'green',
          'purple',
          'aqua',
          'orange',
          'yellow',
          'blue',
          'fuchsia',
          'red',
          'grey',
          'teal',
        ] as const
      ).map((colour) => (
        <Avatar key={colour} size={32} text="JD" colour={colour} />
      ))}
    </div>
  ),
}

export const Square: Story = {
  args: { circular: false, size: 32 },
}

export const Icon: Story = {
  args: { type: 'icon', size: 32 },
}

export const Country: Story = {
  args: { type: 'country', countryCode: 'NG', size: 20 },
}

export const WithNotification: Story = {
  args: { size: 44, showNotification: true, notificationCount: 3 },
}

export const NotificationSizes: Story = {
  render: () => (
    <div className="flex items-end gap-[16px]">
      <Avatar size={16} text="A" showNotification />
      <Avatar size={20} text="B" showNotification />
      <Avatar size={32} text="C" showNotification />
      <Avatar size={44} text="D" showNotification notificationCount={5} />
    </div>
  ),
}

export const ImageFallback: Story = {
  render: () => (
    <div className="flex items-center gap-[8px]">
      <Avatar
        type="image"
        src="https://invalid-url.test/img.png"
        text={getInitials('Fallback User')}
        size={32}
        alt="Fallback User"
      />
    </div>
  ),
}
