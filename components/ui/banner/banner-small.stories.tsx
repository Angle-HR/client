import { BannerSmall } from './banner-small'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof BannerSmall> = {
  title: 'UI/Banner/BannerSmall',
  component: BannerSmall,
  argTypes: {
    state: { control: 'select', options: ['rest', 'success', 'error', 'info'] },
    outline: { control: 'boolean' },
    showCloseButton: { control: 'boolean' },
  },
  args: {
    children: 'Changes saved successfully.',
    state: 'rest',
    outline: true,
    showCloseButton: true,
  },
}

export default meta
type Story = StoryObj<typeof BannerSmall>

export const Default: Story = {}

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-[8px] w-[360px]">
      <BannerSmall state="rest">Neutral message</BannerSmall>
      <BannerSmall state="success">Changes saved successfully</BannerSmall>
      <BannerSmall state="error">Failed to save changes</BannerSmall>
      <BannerSmall state="info">New update available</BannerSmall>
    </div>
  ),
}

export const NoOutline: Story = {
  render: () => (
    <div className="flex flex-col gap-[8px] w-[360px]">
      <BannerSmall state="rest" outline={false}>
        No outline rest
      </BannerSmall>
      <BannerSmall state="success" outline={false}>
        No outline success
      </BannerSmall>
      <BannerSmall state="error" outline={false}>
        No outline error
      </BannerSmall>
      <BannerSmall state="info" outline={false}>
        No outline info
      </BannerSmall>
    </div>
  ),
}

export const NoCloseButton: Story = {
  args: {
    showCloseButton: false,
    state: 'info',
    children: 'Persistent banner',
  },
}

export const Success: Story = {
  args: { state: 'success', children: 'Employee profile updated' },
}

export const Error: Story = {
  args: { state: 'error', children: 'Failed to process payroll' },
}

export const Info: Story = {
  args: { state: 'info', children: 'System maintenance scheduled' },
}

export const WithUndoButton: Story = {
  render: () => (
    <div className="flex flex-col gap-[8px] w-[360px]">
      <BannerSmall state="rest" withButton onUndo={() => {}}>
        Member removed
      </BannerSmall>
      <BannerSmall state="success" withButton onUndo={() => {}}>
        Member removed
      </BannerSmall>
      <BannerSmall state="error" withButton onUndo={() => {}}>
        Member removed
      </BannerSmall>
      <BannerSmall state="info" withButton onUndo={() => {}}>
        Member removed
      </BannerSmall>
    </div>
  ),
}

export const WithUndoButtonNoOutline: Story = {
  render: () => (
    <div className="flex flex-col gap-[8px] w-[360px]">
      <BannerSmall state="rest" outline={false} withButton onUndo={() => {}}>
        Member removed
      </BannerSmall>
      <BannerSmall state="success" outline={false} withButton onUndo={() => {}}>
        Member removed
      </BannerSmall>
      <BannerSmall state="error" outline={false} withButton onUndo={() => {}}>
        Member removed
      </BannerSmall>
      <BannerSmall state="info" outline={false} withButton onUndo={() => {}}>
        Member removed
      </BannerSmall>
    </div>
  ),
}
