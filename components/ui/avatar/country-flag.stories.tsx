import { CountryFlag } from './country-flag'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof CountryFlag> = {
  title: 'UI/Avatar/CountryFlag',
  component: CountryFlag,
  args: {
    code: 'NG',
    name: 'Nigeria',
  },
}

export default meta
type Story = StoryObj<typeof CountryFlag>

export const Default: Story = {}

export const MultipleFlags: Story = {
  render: () => (
    <div className="flex items-center gap-[8px]">
      {(['NG', 'US', 'GB', 'CA', 'FR', 'JP', 'BR', 'IN', 'DE', 'KE'] as const).map((code) => (
        <CountryFlag key={code} code={code} />
      ))}
    </div>
  ),
}

// `EU` is the only region the backend returns today; `UK` is aliased to `GB`.
export const RegionsAndAliases: Story = {
  render: () => (
    <div className="flex items-center gap-[8px]">
      {(['EU', 'UK', 'UN', 'scotland'] as const).map((code) => (
        <CountryFlag key={code} code={code} />
      ))}
    </div>
  ),
}

// An unknown code renders the neutral placeholder instead of a wrong flag.
export const Fallback: Story = {
  args: { code: 'ZZ', name: 'Unknown' },
}
