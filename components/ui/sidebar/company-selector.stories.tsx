import { CompanySelector, type CompanySelectorMenuItem } from './company-selector'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const UserIcon = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.1">
    <circle cx="7" cy="4.5" r="2.5" />
    <path d="M2 12c0-2.5 2.2-4 5-4s5 1.5 5 4" />
  </svg>
)

const CogIcon = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.1">
    <circle cx="7" cy="7" r="2" />
    <path d="M7 1.5v1.2M7 11.3v1.2M1.5 7h1.2M11.3 7h1.2M3.2 3.2l.9.9M9.9 9.9l.9.9M10.8 3.2l-.9.9M4.1 9.9l-.9.9" />
  </svg>
)

const SunIcon = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.1">
    <circle cx="7" cy="7" r="2.5" />
    <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.6 2.6l1 1M10.4 10.4l1 1M11.4 2.6l-1 1M3.6 10.4l-1 1" />
  </svg>
)

const SignOutIcon = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.1">
    <path
      d="M6 1.5H2.5v11H6M9.5 4.5L12.5 7l-3 2.5M12.5 7H5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const menuItems: CompanySelectorMenuItem[] = [
  { key: 'account', label: 'Account settings', icon: UserIcon },
  { key: 'workspace', label: 'Workspace settings', icon: CogIcon },
  {
    key: 'theme',
    label: 'Light mode',
    icon: SunIcon,
    submenu: [
      { key: 'light', label: 'Light mode', selected: true },
      { key: 'dark', label: 'Dark mode' },
      { key: 'system', label: 'System theme' },
    ],
  },
  { key: 'sign-out', label: 'Sign out', icon: SignOutIcon },
]

const meta: Meta<typeof CompanySelector> = {
  title: 'UI/Sidebar/CompanySelector',
  component: CompanySelector,
  args: {
    currentCompany: { name: 'Revolut International' },
    menuItems,
  },
}

export default meta
type Story = StoryObj<typeof CompanySelector>

export const Closed: Story = {}

export const Open: Story = {
  args: { open: true },
}

export const WithCompanySwitching: Story = {
  args: {
    open: true,
    companies: [
      { id: '1', name: 'Revolut International' },
      { id: '2', name: 'Revolut Europe' },
      { id: '3', name: 'Revolut Americas' },
    ],
  },
}
