import { PublicJobPage } from '@/components/careers/public-job-page'

interface ShareLinkApplyPageProps {
  params: Promise<{ publicId: string }>
}

/**
 * Where the server-rendered job page (/j/{public_id}) sends candidates to apply.
 * The same page as the careers job page, without a careers page to go back to.
 */
export default async function ShareLinkApplyPage({
  params,
}: ShareLinkApplyPageProps): Promise<React.ReactElement> {
  const { publicId } = await params
  return (
    <main className="min-h-screen">
      <PublicJobPage slug="" jobId={publicId} />
    </main>
  )
}
