import { Textarea } from './textarea'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea/Textarea',
  component: Textarea,
  argTypes: {
    showLabel: { control: 'boolean' },
    showHelper: { control: 'boolean' },
    showToolbar: { control: 'boolean' },
    showActionButton: { control: 'boolean' },
    showSecondaryActions: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Cover letter',
    placeholder: "Describe why you're a strong fit for this role",
    showLabel: true,
  },
}

export default meta
type Story = StoryObj<typeof Textarea>

export const Default: Story = {}

export const WithHelper: Story = {
  args: { showHelper: true, helperText: 'Minimum 100 words' },
}

export const WithError: Story = {
  args: { errorText: 'Description is required' },
}

export const HiddenLabel: Story = {
  args: { showLabel: false, 'aria-label': 'Cover letter' },
}

export const WithoutToolbar: Story = {
  args: {
    label: 'Internal notes',
    placeholder: 'Add internal notes (not visible to candidates)',
    showToolbar: false,
    rows: 3,
  },
}

export const WithActionButton: Story = {
  args: {
    label: 'Comment',
    placeholder: 'Add a comment...',
    showActionButton: true,
    actionButtonLabel: 'Post',
  },
}

export const WithSecondaryActions: Story = {
  args: {
    label: 'Comment',
    placeholder: 'Add a comment...',
    showActionButton: true,
    showSecondaryActions: true,
    actionButtonLabel: 'Save',
  },
}

export const CharacterCount: Story = {
  args: {
    label: 'Additional notes',
    defaultValue: 'Started onboarding on the 3rd, waiting on ID verification.',
    maxLength: 500,
    helperText: '61 / 500 characters',
    showToolbar: false,
  },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'This field cannot be edited' },
}

export const Complete: Story = {
  render: () => (
    <div className="flex flex-col gap-[24px] w-[360px]">
      <Textarea
        label="Job description"
        placeholder="Describe the role and its key responsibilities"
        required
        helperText="Minimum 100 words"
      />
      <Textarea
        label="Additional notes"
        defaultValue="This role requires occasional weekend availability."
        errorText="This field exceeds the recommended length"
      />
    </div>
  ),
}
