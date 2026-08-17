'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const faqs = [
  {
    question: 'Is OpenHR actually open source?',
    answer:
      'Yes, licensed under AGPLv3, with a sustainable model behind it. Free for individuals, paid for organisations to keep development funded. Open HR will be priced around your server usage, storage costs and support with no markup on top.',
  },
  {
    question: "What's included, and what's not?",
    answer:
      "Everything around people: hiring (jobs, candidates, interviews, workflows), onboarding, employee records and documents, compliance, and analytics. We don't do payroll — a lot of tools already do that well, and we'd rather be great at one thing than mediocre at five.",
  },
  {
    question: 'Is there a free tier?',
    answer:
      'Yes. One active job post, up to 100 applicants, no credit card required, enough to make your first hire before you decide if OpenHR is right for you.',
  },
  {
    question: 'Can I export my data if I cancel?',
    answer:
      'Yes, anytime. Your applicants, employees, and records are yours. No lock-in, no support ticket required.',
  },
  {
    question: 'How is this different from Bamboo, Rippling, or Gusto?',
    answer:
      'Better core job, hiring, onboarding, employee management, compliance, without the price, the lock-in, or paying per module. Free to start, flat pricing as you grow, no sales call.',
  },
  {
    question: 'Do you integrate with payroll?',
    answer:
      "Not yet, and not by accident — we'd rather be excellent at hiring and people management than mediocre at five things. But payroll integrations are on the roadmap.",
  },
  {
    question: 'What happens when we outgrow 10–15 people?',
    answer:
      "OpenHR grows with you. Past 10 people, it's a flat base plus a small per-seat fee, no forced migration, no re-negotiation, no surprise jump to enterprise pricing.",
  },
  {
    question: 'Do you use AI, and does it cost extra?',
    answer:
      "AI will be available across the product, but you bring your own key and pay that provider directly. We don't mark it up, meter it, or lock you into one model. Prefer not to use AI at all? Skip it, the core product works without it.",
  },
]

function FaqIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <span className="relative flex h-[14px] w-[14px] shrink-0 items-center justify-center">
      <span className="absolute top-1/2 left-1/2 h-[1.5px] w-[14px] -translate-x-1/2 -translate-y-1/2 bg-[color:var(--oh-text-primary)]" />
      <span
        className="faq-icon-bar absolute top-1/2 left-1/2 h-[1.5px] w-[14px] bg-[color:var(--oh-text-primary)]"
        style={{ transform: `translate(-50%, -50%) rotate(${isOpen ? 0 : 90}deg)` }}
      />
    </span>
  )
}

function FaqAnswer({ isOpen, children }: { isOpen: boolean; children: string }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | 'auto'>(0)

  useEffect(() => {
    const content = contentRef.current
    if (!content) return

    if (isOpen) {
      setHeight(content.scrollHeight)
      const timeout = setTimeout(() => setHeight('auto'), 200)
      return () => clearTimeout(timeout)
    }

    // Coming from 'auto' (or already 0), pin to a concrete pixel value first
    // so the browser has something to transition *from* — height can't
    // animate out of 'auto' — then collapse it on the next frame.
    setHeight(content.scrollHeight)
    const frame = requestAnimationFrame(() => setHeight(0))
    return () => cancelAnimationFrame(frame)
  }, [isOpen])

  return (
    <div className="faq-answer" style={{ height, opacity: isOpen ? 1 : 0 }}>
      <div
        ref={contentRef}
        className="pt-[10px] pb-[26px] text-[1rem] leading-[1.78] text-[color:var(--oh-text-secondary)] md:text-[1.0375rem]"
      >
        {children}
      </div>
    </div>
  )
}

function FaqSection() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)

  return (
    <section id="faq" className="flex justify-center px-[20px] py-[64px] md:px-[32px] md:py-[80px]">
      <div className="relative flex w-full max-w-[1116px] flex-col items-center gap-[48px] md:block md:min-h-[650px]">
        {/* Absolutely positioned at a fixed offset instead of being centered
            against the FAQ list — a flex sibling would drift up/down as
            accordion items expand or collapse. Offset is calibrated to
            center against the <ul> of questions itself (top of "Is OpenHR..."
            to bottom of "Do you use AI..."), not the heading above it or the
            taller reserved box below it. */}
        <div className="hidden md:absolute md:top-[152px] md:left-[142px] md:block">
          <Image src="/open-hr/faq-graphic.svg" alt="" width={235} height={294} />
        </div>
        <div className="flex w-full max-w-[558px] flex-col items-center gap-[52.4px] md:ml-[548px] md:items-start">
          <h2 className="text-center text-[1.625rem] font-medium tracking-[-0.4px] text-[color:var(--oh-text-primary)] md:text-left md:text-[2rem] md:tracking-[-0.55px]">
            Frequently asked questions
          </h2>
          <ul className="flex w-full flex-col gap-[18px]">
            {faqs.map(({ question, answer }) => {
              const isOpen = openQuestion === question
              return (
                <li key={question} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setOpenQuestion(isOpen ? null : question)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-[10px] text-left"
                  >
                    <span className="text-[1rem] leading-[23px] font-medium text-[color:var(--oh-text-primary)] md:text-[1.0375rem]">
                      {question}
                    </span>
                    <span className="flex shrink-0 items-center justify-center p-[10px]">
                      <FaqIcon isOpen={isOpen} />
                    </span>
                  </button>
                  <FaqAnswer isOpen={isOpen}>{answer}</FaqAnswer>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}

export { FaqSection }
