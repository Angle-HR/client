// The /docs sidebar. A page appears here once it exists under app/docs.

interface DocsNavItem {
  label: string
  href: string
}

interface DocsNavGroup {
  key: string
  title: string
  items: DocsNavItem[]
}

const DOCS_HOME: DocsNavItem = { label: 'Overview', href: '/docs' }

const DOCS_NAV: DocsNavGroup[] = [
  {
    key: 'foundations',
    title: 'Foundations',
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
    items: [
      { label: 'Button', href: '/docs/components/button' },
      { label: 'Icon Button', href: '/docs/components/icon-button' },
      { label: 'Text Button', href: '/docs/components/text-button' },
      { label: 'Flow Button', href: '/docs/components/flow-button' },
      { label: 'Label Button', href: '/docs/components/label-button' },
    ],
  },
]

export { DOCS_HOME, DOCS_NAV }
export type { DocsNavGroup, DocsNavItem }
