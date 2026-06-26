import { CountryFlag } from './country-flag'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof CountryFlag> = {
  title: 'UI/Avatar/CountryFlag',
  component: CountryFlag,
  args: {
    country: 'Nigeria',
  },
}

export default meta
type Story = StoryObj<typeof CountryFlag>

export const Default: Story = {}

export const MultipleFlags: Story = {
  render: () => (
    <div className="flex items-center gap-[8px]">
      {(
        [
          'Nigeria',
          'United States',
          'United Kingdom',
          'Canada',
          'France',
          'Japan',
          'Brazil',
          'India',
        ] as const
      ).map((country) => (
        <CountryFlag key={country} country={country} />
      ))}
    </div>
  ),
}

export const Fallback: Story = {
  render: () => (
    <div className="flex items-center gap-[8px]">
      {(['Africa', 'Scotland', 'United Nations'] as const).map((country) => (
        <CountryFlag key={country} country={country} />
      ))}
    </div>
  ),
}
