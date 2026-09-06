import { useState } from 'react'

import { ImageUpload } from './image-upload'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof ImageUpload> = {
  title: 'UI/FileUpload/ImageUpload',
  component: ImageUpload,
}

export default meta
type Story = StoryObj<typeof ImageUpload>

export const Empty: Story = {
  render: () => (
    <div className="w-[300px]">
      <ImageUpload label="Company logo" helperText="Square, at least 400×400px" maxSizeMb={5} />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-[16px]">
      <ImageUpload size="large" />
      <ImageUpload size="medium" />
      <ImageUpload size="small" />
      <ImageUpload size="button" />
    </div>
  ),
}

export const ErrorState: Story = {
  render: () => (
    <div className="w-[300px]">
      <ImageUpload label="Profile photo" errorText="Image is larger than 5 MB" />
    </div>
  ),
}

const sampleImage =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#3e63dd"/><circle cx="100" cy="80" r="40" fill="#fff"/><rect x="40" y="130" width="120" height="60" rx="12" fill="#fff"/></svg>',
  )

export const Uploaded: Story = {
  render: function Render() {
    const [url, setUrl] = useState<string | undefined>(sampleImage)
    return (
      <div className="w-[300px]">
        <ImageUpload
          label="Company logo"
          imageUrl={url}
          imageAlt="Company logo preview"
          onRemoveImage={() => setUrl(undefined)}
          onImageSelected={() => setUrl(sampleImage)}
        />
      </div>
    )
  },
}

export const UploadedSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-[16px]">
      <ImageUpload size="large" imageUrl={sampleImage} imageAlt="Preview" />
      <ImageUpload size="medium" imageUrl={sampleImage} imageAlt="Preview" />
      <ImageUpload size="small" imageUrl={sampleImage} imageAlt="Preview" />
    </div>
  ),
}

export const Interactive: Story = {
  render: function Render() {
    const [url, setUrl] = useState<string | undefined>(undefined)
    return (
      <div className="w-[300px]">
        <ImageUpload
          label="Try dropping or picking an image"
          imageUrl={url}
          onImageSelected={(file) => setUrl(URL.createObjectURL(file))}
          onRemoveImage={() => setUrl(undefined)}
        />
      </div>
    )
  },
}
