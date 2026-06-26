import { GroupInput } from './group-input'
import { GroupInputField } from './group-input-field'
import { GroupInputLeftCurrency } from './group-input-left-currency'
import { GroupInputLeftFlag } from './group-input-left-flag'
import { GroupInputLeftText } from './group-input-left-text'
import { GroupInputRightText } from './group-input-right-text'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof GroupInput> = {
  title: 'UI/GroupInput/GroupInput',
  component: GroupInput,
  argTypes: {
    showLabel: { control: 'boolean' },
    showHelper: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Phone number',
    showLabel: true,
  },
}

export default meta
type Story = StoryObj<typeof GroupInput>

export const WithFlag: Story = {
  render: (args) => (
    <GroupInput {...args}>
      <GroupInputLeftFlag countryCode="NG" />
      <GroupInputField placeholder="Enter phone number" />
    </GroupInput>
  ),
}

export const WithCurrency: Story = {
  render: () => (
    <GroupInput label="Amount">
      <GroupInputLeftCurrency value="NGN" />
      <GroupInputField placeholder="0.00" />
    </GroupInput>
  ),
}

export const WithTextPrefix: Story = {
  render: () => (
    <GroupInput label="Website">
      <GroupInputLeftText text="https://" />
      <GroupInputField placeholder="example.com" />
    </GroupInput>
  ),
}

export const WithTextSuffix: Story = {
  render: () => (
    <GroupInput label="Domain">
      <GroupInputField placeholder="mysite" position="center" />
      <GroupInputRightText text=".com" />
    </GroupInput>
  ),
}

export const PrefixAndSuffix: Story = {
  render: () => (
    <GroupInput label="Subdomain">
      <GroupInputLeftText text="https://" />
      <GroupInputField placeholder="mysite" position="center" />
      <GroupInputRightText text=".anglehr.com" />
    </GroupInput>
  ),
}

export const WithError: Story = {
  render: () => (
    <GroupInput label="Phone" errorText="Phone number is required">
      <GroupInputLeftFlag countryCode="NG" />
      <GroupInputField placeholder="Enter phone" />
    </GroupInput>
  ),
}

export const WithHelper: Story = {
  render: () => (
    <GroupInput label="Phone" showHelper helperText="Include country code">
      <GroupInputLeftFlag countryCode="US" />
      <GroupInputField placeholder="(555) 000-0000" />
    </GroupInput>
  ),
}

export const Disabled: Story = {
  render: () => (
    <GroupInput label="Phone" disabled>
      <GroupInputLeftFlag countryCode="NG" />
      <GroupInputField placeholder="Enter phone" />
    </GroupInput>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-[16px]">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <GroupInput key={size} label={`Size: ${size}`}>
          <GroupInputLeftFlag countryCode="NG" height={size} />
          <GroupInputField size={size} placeholder="Enter phone" />
        </GroupInput>
      ))}
    </div>
  ),
}
