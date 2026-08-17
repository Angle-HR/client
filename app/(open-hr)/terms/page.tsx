import { LegalPage } from '@/components/open-hr/legal/legal-page'
import { TERMS_SECTIONS } from '@/components/open-hr/legal/terms-content'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions — Open HR',
  description: 'The terms governing use of the Open HR platform.',
}

export default function TermsAndConditionsPage() {
  return <LegalPage title="Terms & Conditions" sections={TERMS_SECTIONS} />
}
