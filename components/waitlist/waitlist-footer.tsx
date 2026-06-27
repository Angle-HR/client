import { IconButton } from '@/components/ui'

import { LinkedInIcon, XIcon } from './icons'

// Figma footer (Frame 60): centred social IconButtons (transparent, no counter)
// over a centred legal link row. Legal text: body-xs / weight 500 /
// text-secondary. Gap 14 between rows, gap 10 within the legal row.
const legalLinks = [
  { label: '©2026 OpenHR', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms & Conditions', href: '#' },
]

function WaitlistFooter() {
  return (
    <footer className="flex flex-col items-center gap-[14px] py-[5px]">
      <div className="flex items-center gap-[8px] text-text-secondary">
        <IconButton
          variant="tertiary"
          size="md"
          iconSize={20}
          aria-label="Open HR on X"
          icon={<XIcon />}
        />
        <IconButton
          variant="tertiary"
          size="md"
          iconSize={20}
          aria-label="Open HR on LinkedIn"
          icon={<LinkedInIcon />}
        />
      </div>
      <nav className="flex items-center justify-center gap-[10px]">
        {legalLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-body-xs font-medium leading-19_2 text-text-secondary"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  )
}

export { WaitlistFooter }
