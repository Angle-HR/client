import { PlainJobPage } from '@/components/careers/plain-job-page'

interface JobPageProps {
  params: Promise<{ publicId: string }>
}

/** A job by its public id. Outside the dashboard, so no sign-in. */
export default async function JobPage({ params }: JobPageProps): Promise<React.ReactElement> {
  const { publicId } = await params
  return (
    <main className="mx-auto w-full max-w-[800px] px-[16px] py-[32px]">
      <PlainJobPage publicId={publicId} />
    </main>
  )
}
