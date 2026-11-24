import { PlainApplyPage } from '@/components/careers/plain-apply-page'

interface ApplyPageProps {
  params: Promise<{ publicId: string }>
}

/** The application form of a job by its public id. Outside the dashboard, so no sign-in. */
export default async function ApplyPage({ params }: ApplyPageProps): Promise<React.ReactElement> {
  const { publicId } = await params
  return (
    <main className="mx-auto w-full max-w-[800px] px-[16px] py-[32px]">
      <PlainApplyPage publicId={publicId} />
    </main>
  )
}
