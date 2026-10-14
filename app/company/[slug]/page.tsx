import { CareersBoard } from '@/components/careers/careers-board'

interface CompanyCareersPageProps {
  params: Promise<{ slug: string }>
}

/** Public careers page for a company. Outside the dashboard, so no sign-in. */
export default async function CompanyCareersPage({
  params,
}: CompanyCareersPageProps): Promise<React.ReactElement> {
  const { slug } = await params
  return (
    <main className="min-h-screen">
      <CareersBoard slug={slug} />
    </main>
  )
}
