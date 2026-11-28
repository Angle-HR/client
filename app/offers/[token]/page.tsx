import { PublicOfferPage } from '@/components/offers/public-offer-page'

import type { Metadata } from 'next'

interface OfferPageProps {
  params: Promise<{ token: string }>
}

// The link is the candidate's credential: keep it out of search results and referrers.
export const metadata: Metadata = {
  title: 'Your offer',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

/** An offer by the token in its email link. Outside the dashboard, so no sign-in. */
export default async function OfferPage({ params }: OfferPageProps): Promise<React.ReactElement> {
  const { token } = await params
  return (
    <main className="mx-auto w-full max-w-[720px] px-[16px] py-[32px]">
      <PublicOfferPage token={token} />
    </main>
  )
}
