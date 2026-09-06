import { FileDropzoneText } from './file-dropzone-text'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof FileDropzoneText> = {
  title: 'UI/FileUpload/FileDropzoneText',
  component: FileDropzoneText,
}

export default meta
type Story = StoryObj<typeof FileDropzoneText>

export const Rest: Story = {
  args: { formats: ['SVG', 'WebP', 'PNG', 'JPEG'], maxSizeMb: 5 },
}

export const ErrorState: Story = {
  args: { state: 'error', formats: ['PDF', 'DOCX'], maxSizeMb: 10 },
}
