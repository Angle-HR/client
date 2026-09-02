import { useState } from 'react'

import { ListItemRadioSelection } from './list-item-radio-selection'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof ListItemRadioSelection> = {
  title: 'UI/List/ListItemRadioSelection',
  component: ListItemRadioSelection,
  args: { label: 'Suggested Address:', value: '123 Main St, Springfield, IL 62704' },
}

export default meta
type Story = StoryObj<typeof ListItemRadioSelection>

export const AllStates: Story = {
  render: () => (
    <div className="flex w-[280px] flex-col gap-[8px]">
      <ListItemRadioSelection label="Suggested Address:" value="123 Main St, Springfield" />
      <ListItemRadioSelection label="Suggested Address:" value="123 Main St, Springfield" selected />
      <ListItemRadioSelection label="Suggested Address:" value="123 Main St, Springfield" disabled />
    </div>
  ),
}

export const WithInfoIcon: Story = {
  args: { infoIcon: true },
  render: (args) => (
    <div className="w-[280px]">
      <ListItemRadioSelection {...args} />
    </div>
  ),
}

export const AddressGroup: Story = {
  render: function Render() {
    const options = [
      { id: 'a', label: 'Suggested Address:', value: '123 Main St, Springfield, IL 62704' },
      { id: 'b', label: 'Current Address:', value: '456 Oak Ave, Springfield, IL 62701' },
    ]
    const [selected, setSelected] = useState('a')
    return (
      <div role="radiogroup" aria-label="Choose your address" className="flex w-[300px] flex-col gap-[8px]">
        {options.map((opt) => (
          <ListItemRadioSelection
            key={opt.id}
            label={opt.label}
            value={opt.value}
            selected={selected === opt.id}
            onSelect={() => setSelected(opt.id)}
          />
        ))}
      </div>
    )
  },
}
