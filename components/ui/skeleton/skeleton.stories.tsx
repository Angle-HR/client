import { Skeleton } from './skeleton'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  args: {
    className: 'h-[32px] w-[240px]',
  },
}

export default meta
type Story = StoryObj<typeof Skeleton>

export const Default: Story = {}

export const TextLine: Story = {
  args: { className: 'h-[12px] w-[120px]' },
}

export const InputField: Story = {
  args: { className: 'h-[32px] w-[280px]' },
}

export const Circle: Story = {
  args: { className: 'h-[44px] w-[44px] rounded-full' },
}

export const FormFieldGroup: Story = {
  render: () => (
    <div className="flex flex-col gap-[6px] w-[280px]">
      <Skeleton className="h-[9px] w-[80px]" />
      <Skeleton className="h-[32px] w-full" />
    </div>
  ),
}

export const ComposedForm: Story = {
  render: () => (
    <div className="flex flex-col gap-[18px] w-[280px]">
      <div className="flex flex-col gap-[6px]">
        <Skeleton className="h-[9px] w-[80px]" />
        <Skeleton className="h-[32px] w-full" />
      </div>
      <div className="flex flex-col gap-[6px]">
        <Skeleton className="h-[9px] w-[100px]" />
        <Skeleton className="h-[32px] w-full" />
      </div>
    </div>
  ),
}
