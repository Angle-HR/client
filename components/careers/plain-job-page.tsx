'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { usePublicJob } from '@/lib/queries'

import type { ReactElement } from 'react'

/** A plain public job page. The design comes later; this only shows what the API sends. */
function PlainJobPage({ publicId }: { publicId: string }): ReactElement {
  // The endpoint needs the id alone; the slug argument is only a cache key.
  const { data, isPending, isError } = usePublicJob('j', publicId)
  const src = useSearchParams().get('src')

  if (isPending) return <p role="status">Loading job…</p>
  if (isError) return <p role="alert">We could not load this job. Try again later.</p>
  if (!data) return <p role="alert">This job does not exist or is no longer available.</p>

  const { company, job } = data
  const meta = [
    { label: 'Company', value: company.name },
    { label: 'Department', value: job.team },
    { label: 'Location', value: job.location },
    { label: 'Workplace type', value: job.workplace },
    { label: 'Employment type', value: job.employmentType },
    { label: 'Pay', value: job.pay },
    { label: 'Seniority', value: job.seniority },
    { label: 'Experience', value: job.experience },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value))
  const applyHref = `/j/${encodeURIComponent(publicId)}/apply${src ? `?src=${encodeURIComponent(src)}` : ''}`
  const accepting = job.accepting !== false && (job.state ?? 'open') === 'open'

  return (
    <article className="flex flex-col gap-[24px] text-text-primary">
      <header className="flex flex-col gap-[4px]">
        <p className="text-body-s text-text-secondary">{company.name}</p>
        <h1 className="text-[25px] leading-[1.3] font-medium">{job.title}</h1>
      </header>

      <dl className="flex flex-col gap-[8px]">
        {meta.map((row) => (
          <div key={row.label} className="flex gap-[8px] text-body-s">
            <dt className="w-[140px] shrink-0 text-text-tertiary">{row.label}</dt>
            <dd className="font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>

      {job.descriptionHtml ? (
        <div
          className="flex flex-col gap-[24px] text-[14px] leading-[24px] [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:ml-[20px] [&_li]:list-disc [&_section]:flex [&_section]:flex-col [&_section]:gap-[8px] [&_strong]:font-semibold"
          dangerouslySetInnerHTML={{ __html: job.descriptionHtml }}
        />
      ) : null}

      {job.skills?.length ? (
        <section aria-labelledby="skills-heading" className="flex flex-col gap-[8px]">
          <h2 id="skills-heading" className="font-semibold">
            Skills
          </h2>
          <ul className="flex flex-wrap gap-[8px]">
            {job.skills.map((skill) => (
              <li
                key={skill}
                className="rounded-[8px] border border-border-transparent-light px-[8px] py-[2px] text-body-s"
              >
                {skill}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-col gap-[12px]">
        {accepting ? (
          <Link
            href={applyHref}
            className="inline-flex h-[40px] w-fit items-center rounded-[10px] border border-border-btn-blue-pri-rest bg-bg-btn-blue-pri-rest px-[16px] text-body-s font-medium text-text-btn-blue-primary"
          >
            Apply for this role
          </Link>
        ) : (
          <p role="status">This job is not taking applications.</p>
        )}
        {job.privacyNoticeUrl ? (
          <a
            href={job.privacyNoticeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-body-s underline"
          >
            Privacy notice
          </a>
        ) : null}
      </div>
    </article>
  )
}

export { PlainJobPage }
