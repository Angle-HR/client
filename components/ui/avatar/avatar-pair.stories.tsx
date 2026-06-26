import { Avatar, getInitials } from './avatar'
import { AvatarPair } from './avatar-pair'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof AvatarPair> = {
  title: 'UI/Avatar/AvatarPair',
  component: AvatarPair,
}

export default meta
type Story = StoryObj<typeof AvatarPair>

export const Default: Story = {
  render: () => (
    <AvatarPair
      primary={<Avatar size={44} text={getInitials('John Doe')} colour="blue" />}
      secondary={<Avatar size={16} text={getInitials('Jane Smith')} colour="purple" />}
    />
  ),
}

export const WithCountryFlag: Story = {
  render: () => (
    <AvatarPair
      primary={<Avatar size={44} text={getInitials('Ade Tunji')} colour="green" />}
      secondary={<Avatar size={16} type="country" countryCode="NG" />}
    />
  ),
}
