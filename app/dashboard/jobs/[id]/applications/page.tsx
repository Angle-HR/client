'use client'

import { useParams } from 'next/navigation'

import { ApplicationsView } from '@/components/applications/applications-view'
import { fromShortId } from '@/lib/short-id'

/** The applicants of one job. */
export default function JobApplicationsPage() {
  const { id } = useParams<{ id: string }>()
  return <ApplicationsView jobId={fromShortId(id)} />
}
