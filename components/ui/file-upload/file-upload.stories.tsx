import { useState } from 'react'

import { FileUpload, type UploadedFile } from './file-upload'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof FileUpload> = {
  title: 'UI/FileUpload/FileUpload',
  component: FileUpload,
}

export default meta
type Story = StoryObj<typeof FileUpload>

export const Empty: Story = {
  render: () => (
    <div className="w-[300px]">
      <FileUpload
        label="Supporting documents"
        helperText="We only use these for your application"
        fileType="document"
        maxSizeMb={5}
      />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-[16px]">
      <FileUpload size="large" fileType="document" maxSizeMb={5} />
      <FileUpload size="medium" fileType="document" maxSizeMb={5} />
      <FileUpload size="small" fileType="document" maxSizeMb={5} />
      <FileUpload size="button" fileType="spreadsheet" multiple={false} />
    </div>
  ),
}

export const FileTypeVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-[16px]">
      <FileUpload fileType="document" maxSizeMb={5} />
      <FileUpload fileType="spreadsheet" maxSizeMb={5} />
      <FileUpload fileType="all" maxSizeMb={5} />
    </div>
  ),
}

export const ErrorState: Story = {
  render: () => (
    <div className="w-[300px]">
      <FileUpload
        label="Proof of address"
        fileType="document"
        errorText="File is larger than 5 MB"
      />
    </div>
  ),
}

const seedFiles: UploadedFile[] = [
  { id: '1', name: 'Resume.pdf', type: 'pdf', state: 'loading', progress: 42 },
  { id: '2', name: 'Cover-letter.docx', type: 'word', state: 'success' },
  { id: '3', name: 'Portfolio.zip', type: 'csv', state: 'error', progress: 67 },
]

export const UploadedList: Story = {
  render: function Render() {
    const [files, setFiles] = useState(seedFiles)
    return (
      <div className="w-[300px]">
        <FileUpload
          label="Supporting documents"
          uploadedLayout="list"
          files={files}
          onRemoveFile={(id) => setFiles((f) => f.filter((file) => file.id !== id))}
          onRetryFile={(id) =>
            setFiles((f) => f.map((file) => (file.id === id ? { ...file, state: 'loading' } : file)))
          }
        />
      </div>
    )
  },
}

export const UploadedListPlain: Story = {
  render: () => (
    <div className="w-[300px]">
      <FileUpload
        label="Supporting documents"
        uploadedLayout="list-plain"
        files={seedFiles.map((f) => ({ ...f, state: 'completed' as const }))}
      />
    </div>
  ),
}

export const UploadedGrid: Story = {
  render: () => (
    <div className="w-[400px]">
      <FileUpload
        label="Supporting documents"
        uploadedLayout="grid"
        files={seedFiles.map((f) => ({ ...f, state: 'completed' as const }))}
      />
    </div>
  ),
}

export const UploadedSingle: Story = {
  render: () => (
    <div className="w-[300px]">
      <FileUpload label="CSV import" uploadedLayout="single" files={seedFiles.slice(1, 2)} />
    </div>
  ),
}

export const Interactive: Story = {
  render: function Render() {
    const [files, setFiles] = useState<UploadedFile[]>([])
    return (
      <div className="w-[300px]">
        <FileUpload
          label="Try dropping or picking a file"
          helperText="Any format accepted in this demo"
          files={files}
          onFilesSelected={(picked) => {
            setFiles((prev) => [
              ...prev,
              ...picked.map((file, i) => ({
                id: `${Date.now()}-${i}`,
                name: file.name,
                type: 'pdf' as const,
                state: 'success' as const,
              })),
            ])
          }}
          onRemoveFile={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
        />
      </div>
    )
  },
}
