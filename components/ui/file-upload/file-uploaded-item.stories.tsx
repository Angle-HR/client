import { FileUploadedItem } from './file-uploaded-item'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof FileUploadedItem> = {
  title: 'UI/FileUpload/FileUploadedItem',
  component: FileUploadedItem,
  args: { fileName: 'Resume.pdf', fileType: 'pdf' },
}

export default meta
type Story = StoryObj<typeof FileUploadedItem>

export const AllStates: Story = {
  render: () => (
    <div className="flex w-[217px] flex-col gap-[16px]">
      <FileUploadedItem fileName="Resume.pdf" fileType="pdf" state="loading" progress={42} />
      <FileUploadedItem fileName="Resume.pdf" fileType="pdf" state="success" />
      <FileUploadedItem fileName="Resume.pdf" fileType="pdf" state="error" progress={67} />
      <FileUploadedItem fileName="Resume.pdf" fileType="pdf" state="completed" />
    </div>
  ),
}

export const Wrapped: Story = {
  render: () => (
    <div className="flex w-[217px] flex-col gap-[16px]">
      <FileUploadedItem
        fileName="Very-long-supporting-document-file-name.pdf"
        fileType="pdf"
        state="loading"
        progress={42}
        wrapped
      />
    </div>
  ),
}

export const AllFormats: Story = {
  render: () => (
    <div className="flex w-[217px] flex-col gap-[12px]">
      <FileUploadedItem fileName="Report.docx" fileType="word" state="completed" />
      <FileUploadedItem fileName="Data.csv" fileType="csv" state="completed" />
      <FileUploadedItem fileName="Budget.xlsx" fileType="excel" state="completed" />
      <FileUploadedItem fileName="Config.json" fileType="json" state="completed" />
      <FileUploadedItem fileName="Photo.png" fileType="image" state="completed" />
    </div>
  ),
}
