import { ListItemButton } from './list-item-button'
import { ListItemDefault } from './list-item-default'
import { ListItemLocation } from './list-item-location'
import { ListItemMultiSelect } from './list-item-multi-select'
import { ListItemSelected } from './list-item-selected'
import { ListItemToggle } from './list-item-toggle'
import { ListItemWithIcon } from './list-item-with-icon'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const FileIcon = (
  <svg viewBox="0 0 14 14" fill="currentColor" className="h-full w-full">
    <path d="M3 1h5.5L12 4.5V12a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1z" />
  </svg>
)

const TrashIcon = (
  <svg
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    className="h-full w-full"
  >
    <path d="M2 4h10M5 4V2.5h4V4M3.5 4v8h7V4" />
  </svg>
)

const InfoIcon = (
  <svg viewBox="0 0 14 14" fill="currentColor" className="h-full w-full">
    <path d="M7 1a6 6 0 100 12A6 6 0 007 1zm-.5 4a.5.5 0 011 0v3a.5.5 0 01-1 0V5zM7 3.75a.625.625 0 110 1.25.625.625 0 010-1.25z" />
  </svg>
)

const defaultMeta: Meta<typeof ListItemDefault> = {
  title: 'UI/List/ListItemDefault',
  component: ListItemDefault,
  args: {
    mainText: 'List item',
  },
}

export default defaultMeta
type DefaultStory = StoryObj<typeof ListItemDefault>

export const Default: DefaultStory = {}

export const WithIcon: DefaultStory = {
  args: { icon: FileIcon },
}

export const WithIconContainer: DefaultStory = {
  args: { icon: FileIcon, iconContainer: true },
}

export const WithSubText: DefaultStory = {
  args: {
    mainText: 'Main text',
    subText: 'Sub text',
    subTextAlignment: 'none',
  },
}

export const Danger: DefaultStory = {
  args: { danger: true, mainText: 'Delete item' },
}

export const Disabled: DefaultStory = {
  args: { disabled: true },
}

export const ButtonVariant: StoryObj<typeof ListItemButton> = {
  render: () => (
    <ListItemButton
      mainText="Item with action"
      alwaysShowButton
      trailingButton={
        <button
          type="button"
          className="h-[24px] w-[24px] flex items-center justify-center rounded-sm-7 hover:bg-bg-transparent-light"
        >
          <span className="h-[14px] w-[14px]">{TrashIcon}</span>
        </button>
      }
    />
  ),
}

export const TwoButtons: StoryObj<typeof ListItemButton> = {
  render: () => (
    <ListItemButton
      mainText="Two actions"
      button="two"
      alwaysShowButton
      trailingButton={
        <button
          type="button"
          className="h-[24px] w-[24px] flex items-center justify-center rounded-sm-7 hover:bg-bg-transparent-light"
        >
          <span className="h-[14px] w-[14px]">{TrashIcon}</span>
        </button>
      }
      trailingButton2={
        <button
          type="button"
          className="h-[24px] w-[24px] flex items-center justify-center rounded-sm-7 hover:bg-bg-transparent-light"
        >
          <span className="h-[14px] w-[14px]">{InfoIcon}</span>
        </button>
      }
    />
  ),
}

export const Location: StoryObj<typeof ListItemLocation> = {
  render: () => (
    <div className="flex flex-col gap-[4px] w-[300px]">
      <ListItemLocation address="123 Victoria Island, Lagos" state="selected" showCheckMark />
      <ListItemLocation address="456 Lekki Phase 1, Lagos" state="rest" />
      <ListItemLocation address="789 Ikoyi, Lagos" state="rest" />
    </div>
  ),
}

export const MultiSelect: StoryObj<typeof ListItemMultiSelect> = {
  render: () => (
    <div className="flex flex-col gap-[4px]">
      <ListItemMultiSelect mainText="Engineering" selected withCheckbox />
      <ListItemMultiSelect mainText="Design" selected={false} withCheckbox />
      <ListItemMultiSelect mainText="Product" selected withCheckbox />
    </div>
  ),
}

export const MultiSelectTags: StoryObj<typeof ListItemMultiSelect> = {
  render: () => (
    <div className="flex flex-col gap-[4px]">
      <ListItemMultiSelect type="tag" tagLabel="Active" tagColor="green" selected />
      <ListItemMultiSelect type="tag" tagLabel="Inactive" tagColor="red" selected={false} />
    </div>
  ),
}

export const Selected: StoryObj<typeof ListItemSelected> = {
  render: () => (
    <div className="flex flex-col gap-[4px]">
      <ListItemSelected mainText="Engineering" selected />
      <ListItemSelected mainText="Design" selected={false} />
      <ListItemSelected mainText="Product" selected />
    </div>
  ),
}

export const SelectedTags: StoryObj<typeof ListItemSelected> = {
  render: () => (
    <div className="flex flex-col gap-[4px]">
      <ListItemSelected type="tag" tagLabel="Active" tagColor="green" selected />
      <ListItemSelected type="tag" tagLabel="Pending" tagColor="yellow" selected={false} />
    </div>
  ),
}

export const ToggleItem: StoryObj<typeof ListItemToggle> = {
  render: () => (
    <div className="flex flex-col gap-[4px]">
      <ListItemToggle mainText="Email notifications" checked />
      <ListItemToggle mainText="Push notifications" checked={false} />
      <ListItemToggle mainText="SMS alerts" disabled />
    </div>
  ),
}

export const WithTrailingIcon: StoryObj<typeof ListItemWithIcon> = {
  render: () => (
    <ListItemWithIcon
      mainText="View profile"
      trailingIcon={<span className="h-[14px] w-[14px]">{InfoIcon}</span>}
    />
  ),
}
