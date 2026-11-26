// The /docs sidebar. A page appears here once it exists under app/docs.

interface DocsNavItem {
  label: string
  href: string
}

interface DocsNavGroup {
  key: string
  title: string
  /** File in public/dashboard/icons, without "-outline.svg". */
  icon: string
  items: DocsNavItem[]
}

const DOCS_HOME: DocsNavItem = { label: 'Overview', href: '/docs' }

const DOCS_NAV: DocsNavGroup[] = [
  {
    key: 'foundations',
    title: 'Foundations',
    icon: 'swatch',
    items: [
      { label: 'Colours', href: '/docs/foundations/colours' },
      { label: 'Typography', href: '/docs/foundations/typography' },
      { label: 'Spacing and radius', href: '/docs/foundations/spacing' },
      { label: 'Shadows', href: '/docs/foundations/shadows' },
      { label: 'Icons', href: '/docs/foundations/icons' },
    ],
  },
  {
    key: 'buttons',
    title: 'Buttons',
    icon: 'cursor-arrow-rays',
    items: [
      { label: 'Button', href: '/docs/components/button' },
      { label: 'Icon Button', href: '/docs/components/icon-button' },
      { label: 'Text Button', href: '/docs/components/text-button' },
      { label: 'Flow Button', href: '/docs/components/flow-button' },
      { label: 'Label Button', href: '/docs/components/label-button' },
    ],
  },
  {
    key: 'selection-controls',
    title: 'Selection controls',
    icon: 'check-circle',
    items: [
      { label: 'Checkbox', href: '/docs/components/checkbox' },
      { label: 'Radio Button', href: '/docs/components/radio-button' },
      { label: 'Toggle', href: '/docs/components/toggle' },
    ],
  },
  {
    key: 'tags',
    title: 'Tags',
    icon: 'tag',
    items: [
      { label: 'Tag', href: '/docs/components/tag' },
      { label: 'Chip', href: '/docs/components/chip' },
    ],
  },
  {
    key: 'avatars',
    title: 'Avatars',
    icon: 'user-circle',
    items: [
      { label: 'Avatar', href: '/docs/components/avatar' },
      { label: 'Avatar stack', href: '/docs/components/avatar-stack' },
    ],
  },
  {
    key: 'inputs',
    title: 'Inputs',
    icon: 'pencil-square',
    items: [
      { label: 'Text input', href: '/docs/components/text-input' },
      { label: 'Text area', href: '/docs/components/text-area' },
      { label: 'Group input', href: '/docs/components/group-input' },
      { label: 'OTP input', href: '/docs/components/otp-input' },
      { label: 'Selection', href: '/docs/components/selection' },
      { label: 'Date input', href: '/docs/components/date-input' },
      { label: 'Calendar', href: '/docs/components/calendar' },
    ],
  },
]

export { DOCS_HOME, DOCS_NAV }
export type { DocsNavGroup, DocsNavItem }
