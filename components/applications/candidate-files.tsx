'use client'

import { useEffect, useState, type ReactElement } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { TextButton } from '@/components/ui'
import { useApplicationFileLink } from '@/lib/queries'
import { requests } from '@/lib/requests'

import type { ApplicantFile } from '@/lib/applications/api'

/** Opens one of an application's files in a new tab, through a link that works for five minutes. */
async function openApplicationFile(jobId: string, appId: string, fileId: string): Promise<void> {
  const link = await requests.getApplicationFileLink(jobId, appId, fileId)
  if (link.url) window.open(link.url, '_blank', 'noopener')
}

/**
 * A local copy of a file for drawing in a frame. The storage link is signed as
 * an attachment, so a browser would download it instead of showing it.
 */
function useObjectUrl(url: string | undefined): string | null {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!url) return
    let created: string | null = null
    let cancelled = false
    void fetch(url)
      .then((response) => (response.ok ? response.blob() : null))
      .then((blob) => {
        if (!blob || cancelled) return
        created = URL.createObjectURL(blob)
        setObjectUrl(created)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
      if (created) URL.revokeObjectURL(created)
    }
  }, [url])
  return objectUrl
}

/** The first PDF the candidate uploaded, taken as their resume. */
function findResume(files: ApplicantFile[]): ApplicantFile | undefined {
  return files.find(
    (file) => file.contentType === 'application/pdf' || /\.pdf$/i.test(file.filename),
  )
}

function SectionTitle({ children }: { children: string }): ReactElement {
  return (
    <h3 className="text-caption-m leading-17_6 font-semibold tracking-wide text-text-tertiary uppercase">
      {children}
    </h3>
  )
}

interface ResumeProps {
  jobId: string
  appId: string
  file: ApplicantFile
  onError: (cause: unknown) => void
}

/**
 * The resume as the candidate uploaded it, drawn in a frame. Parsed is drawn
 * but has no data behind it yet, so it is disabled.
 */
function Resume({ jobId, appId, file, onError }: ResumeProps): ReactElement {
  const link = useApplicationFileLink(jobId, appId, file.id)
  const preview = useObjectUrl(link.data?.url)
  return (
    <section className="flex flex-col gap-[12px]">
      <div className="flex items-center justify-between gap-[12px]">
        <SectionTitle>Applicant resume</SectionTitle>
        <div className="flex items-center gap-[8px]">
          <div className="flex rounded-sm-7 bg-bg-transparent-light p-[2px] text-caption-m">
            <span className="rounded-xs-5 bg-bg-primary px-[8px] py-[2px] text-text-primary">
              Original
            </span>
            <span className="px-[8px] py-[2px] text-text-tertiary">Parsed</span>
          </div>
          <TextButton
            size="sm"
            onClick={() =>
              void openApplicationFile(jobId, appId, file.id).catch((cause: unknown) =>
                onError(cause),
              )
            }
          >
            Download
          </TextButton>
        </div>
      </div>
      {preview ? (
        <iframe
          // The design draws the page alone, without the browser's PDF toolbar and thumbnails.
          src={`${preview}#toolbar=0&navpanes=0`}
          title={file.filename}
          className="h-[640px] w-full rounded-lg-10 border-0 bg-bg-secondary"
        />
      ) : null}
    </section>
  )
}

interface AttachmentsProps {
  jobId: string
  appId: string
  files: ApplicantFile[]
  onError: (cause: unknown) => void
}

/** The files other than the resume, each with a download. */
function Attachments({ jobId, appId, files, onError }: AttachmentsProps): ReactElement | null {
  if (files.length === 0) return null
  return (
    <section className="flex flex-col gap-[12px]">
      <SectionTitle>Other attachments</SectionTitle>
      <ul className="flex flex-col gap-[8px]">
        {files.map((file) => (
          <li
            key={file.id}
            className="flex items-center justify-between gap-[12px] rounded-lg-10 bg-bg-transparent-lighter px-[12px] py-[8px]"
          >
            <span className="flex min-w-0 items-center gap-[8px] text-body-xs leading-19_2 text-text-primary">
              <span className="inline-flex text-text-tertiary">
                <DashboardIcon name="document-text-solid" size={13} />
              </span>
              <span className="truncate">{file.filename}</span>
            </span>
            <TextButton
              size="sm"
              onClick={() =>
                void openApplicationFile(jobId, appId, file.id).catch((cause: unknown) =>
                  onError(cause),
                )
              }
            >
              Download
            </TextButton>
          </li>
        ))}
      </ul>
    </section>
  )
}

export { Attachments, Resume, SectionTitle, findResume, openApplicationFile }
