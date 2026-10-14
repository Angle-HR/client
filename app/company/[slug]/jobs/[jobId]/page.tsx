import { PublicJobPage } from '@/components/careers/public-job-page'

interface CompanyJobPageProps {
  params: Promise<{ slug: string; jobId: string }>
}

/** One public job with its description and application form. Outside the dashboard, so no sign-in. */
export default async function CompanyJobPage({
  params,
}: CompanyJobPageProps): Promise<React.ReactElement> {
  const { slug, jobId } = await params
  return (
    <main className="min-h-screen">
      <PublicJobPage slug={slug} jobId={jobId} />
    </main>
  )
}
