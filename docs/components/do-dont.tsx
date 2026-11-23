import type { ReactNode } from 'react'

/** A pair of guideline cards: what to do, and what to avoid. */
function DoDont({ children }: { children: ReactNode }) {
  return <div className="not-prose my-[16px] grid gap-[12px] md:grid-cols-2">{children}</div>
}

function Guideline({ kind, children }: { kind: 'do' | 'dont'; children: ReactNode }) {
  const isDo = kind === 'do'
  return (
    <div className="rounded-lg-10 bg-bg-secondary p-[16px] outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium">
      <div
        className={`mb-[6px] body-l-semibold ${isDo ? 'text-text-tags-green' : 'text-text-tags-red'}`}
      >
        {isDo ? 'Do' : "Don't"}
      </div>
      <div className="body-l-regular text-text-secondary">{children}</div>
    </div>
  )
}

export { DoDont, Guideline }
