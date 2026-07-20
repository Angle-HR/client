'use client'

import { IconButton } from '@/components/ui'

import { LinkedInIcon, XIcon } from './icons'

import type { WaitlistStep } from '@/lib/types'

// Figma footer (Frame 60): centred social IconButtons (transparent, no counter)
// over a centred legal link row. Legal text: body-xs / weight 500 /
// text-secondary. Gap 14 between rows, gap 10 within the legal row.
const legalLinks = [
  { label: '©2026 OpenHR' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms & Conditions', href: '#' },
]

const socialLinks = [
  { label: 'Open HR on X', href: 'https://x.com/tryopenhr', icon: <XIcon /> },
  {
    label: 'Open HR on LinkedIn',
    href: 'https://www.linkedin.com/company/try-open-hr/',
    icon: <LinkedInIcon />,
  },
]

interface WaitlistFooterProps {
  step: WaitlistStep
}

function WaitlistFooter({ step }: WaitlistFooterProps) {
  // The intro step already shows its own "By continuing… Terms & Conditions"
  // line above the submit button, so the footer's copy would be a second,
  // redundant one stacked right below it on mobile. Hide it there only; every
  // other step relies on the footer as the sole legal link.
  const hideTermsOnMobile = step === 'intro'

  return (
    <footer className="flex flex-col items-center gap-[14px] py-[5px]">
      <div className="flex items-center gap-[8px] text-text-secondary">
        {socialLinks.map((social) => (
          <IconButton
            key={social.label}
            variant="tertiary"
            size="md"
            iconSize={20}
            aria-label={social.label}
            icon={social.icon}
            onClick={() => window.open(social.href, '_blank', 'noopener,noreferrer')}
          />
        ))}
      </div>
      <nav className="flex items-center justify-center gap-[10px]">
        {legalLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={`text-body-xs font-medium leading-19_2 text-text-secondary ${
              link.href ? 'underline' : 'no-underline'
            } ${link.label === 'Terms & Conditions' && hideTermsOnMobile ? 'hidden md:inline' : ''}`}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  )
}

export { WaitlistFooter }
