import { ListItemDefault } from '../list/list-item-default'

import { Slots } from './slots'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Slots> = {
  title: 'UI/Slots/Slots',
  component: Slots,
  argTypes: {
    background: { control: 'select', options: ['neutral', 'light'] },
    shadow: { control: 'select', options: ['xsmall', 'small', 'medium'] },
    padding: { control: 'select', options: ['default', 'tight'] },
    scrollable: { control: 'boolean' },
  },
  args: {
    background: 'neutral',
    shadow: 'medium',
    padding: 'default',
  },
}

export default meta
type Story = StoryObj<typeof Slots>

export const Default: Story = {
  render: (args) => (
    <div className="w-[246px]">
      <Slots {...args}>
        <ul className="flex flex-col gap-[2px]">
          <ListItemDefault mainText="Option A" withIcon={false} />
          <ListItemDefault mainText="Option B" withIcon={false} />
          <ListItemDefault mainText="Option C" withIcon={false} />
        </ul>
      </Slots>
    </div>
  ),
}

export const LightBackground: Story = {
  render: (args) => (
    <div className="w-[246px] bg-bg-primary p-[16px]">
      <Slots {...args} background="light">
        <ul className="flex flex-col gap-[2px]">
          <ListItemDefault mainText="Option A" withIcon={false} />
          <ListItemDefault mainText="Option B" withIcon={false} />
        </ul>
      </Slots>
    </div>
  ),
}

export const TightPadding: Story = {
  render: (args) => (
    <div className="w-[246px]">
      <Slots {...args} padding="tight">
        <ul className="flex flex-col gap-[2px]">
          <ListItemDefault mainText="Option A" withIcon={false} />
          <ListItemDefault mainText="Option B" withIcon={false} />
        </ul>
      </Slots>
    </div>
  ),
}

export const Shadows: Story = {
  render: () => (
    <div className="flex gap-[32px]">
      {(['xsmall', 'small', 'medium'] as const).map((shadow) => (
        <div key={shadow} className="flex flex-col items-center gap-[8px]">
          <Slots shadow={shadow} className="w-[160px]">
            <ul>
              <ListItemDefault mainText={shadow} withIcon={false} />
            </ul>
          </Slots>
          <span className="text-body-xs text-text-light">{shadow}</span>
        </div>
      ))}
    </div>
  ),
}

export const Scrollable: Story = {
  render: (args) => (
    <div className="h-[140px] w-[246px]">
      <Slots {...args} scrollable padding="tight" className="h-full">
        <ul className="flex flex-col gap-[2px]">
          {Array.from({ length: 12 }).map((_, i) => (
            <ListItemDefault key={i} mainText={`Option ${i + 1}`} withIcon={false} />
          ))}
        </ul>
      </Slots>
    </div>
  ),
}
