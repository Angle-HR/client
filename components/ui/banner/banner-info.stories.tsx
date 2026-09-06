import { BannerInfo } from './banner-info'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof BannerInfo> = {
  title: 'UI/Banner/BannerInfo',
  component: BannerInfo,
}

export default meta
type Story = StoryObj<typeof BannerInfo>

export const Default: Story = {
  render: () => (
    <div className="w-[400px]">
      <BannerInfo
        title="EU Pay Transparency Directive"
        body='Directive 2023/970 requires a salary range to be disclosed in job postings. Publishing the range is mandatory, you cannot hide it or show "competitive salary".'
      />
    </div>
  ),
}
