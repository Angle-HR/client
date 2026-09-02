import { useState } from 'react'

import { Funnel } from '../icons'

import { LabelButton } from './label-button'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LabelButton> = {
  title: 'UI/Button/LabelButton',
  component: LabelButton,
  args: { children: 'Button' },
}

export default meta
type Story = StoryObj<typeof LabelButton>

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-[8px]">
      <LabelButton>Rest</LabelButton>
      <LabelButton selected>Selected</LabelButton>
      <LabelButton disabled>Disabled</LabelButton>
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-[8px]">
      <LabelButton iconLeft={<Funnel />}>Filter</LabelButton>
      <LabelButton iconLeft={<Funnel />} selected>
        Filter
      </LabelButton>
    </div>
  ),
}

export const FilterBar: Story = {
  render: function Render() {
    const [active, setActive] = useState('all')
    const options = ['all', 'active', 'archived']
    return (
      <div className="flex gap-[8px]">
        {options.map((opt) => (
          <LabelButton key={opt} selected={active === opt} onClick={() => setActive(opt)}>
            {opt[0]?.toUpperCase() + opt.slice(1)}
          </LabelButton>
        ))}
      </div>
    )
  },
}
