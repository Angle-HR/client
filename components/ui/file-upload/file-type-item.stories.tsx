import { FileTypeItem } from './file-type-item'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof FileTypeItem> = {
  title: 'UI/FileUpload/FileTypeItem',
  component: FileTypeItem,
}

export default meta
type Story = StoryObj<typeof FileTypeItem>

export const AllFormats: Story = {
  render: () => (
    <div className="flex gap-[12px] bg-bg-secondary p-[16px]">
      <FileTypeItem type="word" />
      <FileTypeItem type="pdf" />
      <FileTypeItem type="csv" />
      <FileTypeItem type="excel" />
      <FileTypeItem type="image" />
      <FileTypeItem type="json" />
    </div>
  ),
}
