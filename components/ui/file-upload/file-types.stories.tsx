import { FileTypes } from './file-types'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof FileTypes> = {
  title: 'UI/FileUpload/FileTypes',
  component: FileTypes,
}

export default meta
type Story = StoryObj<typeof FileTypes>

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-[24px] bg-bg-primary p-[16px]">
      <FileTypes fileTypes="image" />
      <FileTypes fileTypes="document" />
      <FileTypes fileTypes="spreadsheet" />
    </div>
  ),
}
