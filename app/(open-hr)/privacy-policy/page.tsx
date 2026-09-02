import { LegalPage } from '@/components/open-hr/legal/legal-page'
import {
  PRIVACY_POLICY_META,
  PRIVACY_POLICY_SECTIONS,
} from '@/components/open-hr/legal/privacy-policy-content'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Open HR',
  description: 'How Open HR collects, uses, and protects your personal data.',
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      meta={PRIVACY_POLICY_META}
      sections={PRIVACY_POLICY_SECTIONS}
    />
  )
}
