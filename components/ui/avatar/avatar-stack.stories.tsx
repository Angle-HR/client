import { Avatar, getInitials } from './avatar'
import { AvatarStack } from './avatar-stack'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const colors = ['blue', 'green', 'purple', 'red', 'orange', 'teal', 'fuchsia'] as const
const names = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace']

const meta: Meta<typeof AvatarStack> = {
  title: 'UI/Avatar/AvatarStack',
  component: AvatarStack,
  argTypes: {
    size: { control: 'select', options: [12, 14, 16, 18, 20, 24, 32, 44] },
    density: { control: 'select', options: ['standard', 'tight'] },
    maxVisible: { control: 'number' },
    showOverflow: { control: 'boolean' },
  },
  args: {
    size: 24,
    density: 'standard',
    maxVisible: 4,
    showOverflow: true,
  },
}

export default meta
type Story = StoryObj<typeof AvatarStack>

export const Default: Story = {
  render: (args) => (
    <AvatarStack {...args}>
      {names.map((name, i) => (
        <Avatar
          key={name}
          size={args.size}
          text={getInitials(name)}
          colour={colors[i % colors.length]}
        />
      ))}
    </AvatarStack>
  ),
}

export const Densities: Story = {
  render: () => (
    <div className="flex flex-col gap-[16px]">
      <div className="flex items-center gap-[8px]">
        <span className="w-[80px] shrink-0 text-xs text-text-secondary">Standard</span>
        <AvatarStack size={24} density="standard">
          {names.slice(0, 5).map((name, i) => (
            <Avatar
              key={name}
              size={24}
              text={getInitials(name)}
              colour={colors[i % colors.length]}
            />
          ))}
        </AvatarStack>
      </div>
      <div className="flex items-center gap-[8px]">
        <span className="w-[80px] shrink-0 text-xs text-text-secondary">Tight</span>
        <AvatarStack size={24} density="tight">
          {names.slice(0, 5).map((name, i) => (
            <Avatar
              key={name}
              size={24}
              text={getInitials(name)}
              colour={colors[i % colors.length]}
            />
          ))}
        </AvatarStack>
      </div>
    </div>
  ),
}

export const MultipleSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-[16px]">
      {([16, 24, 32, 44] as const).map((size) => (
        <div key={size} className="flex items-center gap-[8px]">
          <span className="w-[40px] shrink-0 text-xs text-text-secondary">{size}px</span>
          <AvatarStack size={size} maxVisible={3}>
            {names.slice(0, 5).map((name, i) => (
              <Avatar
                key={name}
                size={size}
                text={getInitials(name)}
                colour={colors[i % colors.length]}
              />
            ))}
          </AvatarStack>
        </div>
      ))}
    </div>
  ),
}

export const NoOverflow: Story = {
  render: () => (
    <AvatarStack size={24} showOverflow={false}>
      {names.map((name, i) => (
        <Avatar key={name} size={24} text={getInitials(name)} colour={colors[i % colors.length]} />
      ))}
    </AvatarStack>
  ),
}
