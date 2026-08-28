import Image from 'next/image'

const paragraphs = [
  "Nobody starts a company thinking they'll manage applicants in spreadsheets. But that's where many founders and small businesses end up.",
  'This isn\'t a "you" problem — it\'s a market problem. Most HR solutions are built for big companies with bigger budgets and dedicated HR teams.',
  "Leaving startups with two choices: an expensive platform full of features they'll never use, or a patchwork of forms, spreadsheets, and free tools that don't talk to each other.",
  'Neither fits a 5-10 person team making its first hire or trying to stay compliant.',
]

function StorySection() {
  return (
    <section
      id="story"
      className="flex justify-center px-[20px] py-[64px] md:px-[32px] md:py-[100px]"
    >
      <div className="flex w-full max-w-[1116px] flex-col items-center gap-[48px] md:flex-row md:items-center md:gap-[152px]">
        <div className="hidden md:flex md:w-[396px] md:shrink-0 md:justify-end">
          <Image src="/open-hr/story-graphic.svg" alt="" width={277} height={321} />
        </div>
        <div className="flex max-w-[558px] flex-col gap-[26px] text-[1rem] leading-[1.78] text-[color:var(--oh-text-primary)] md:gap-[52.4px] md:text-[1.1625rem]">
          <p>
            <a
              href="https://www.linkedin.com/company/try-open-hr"
              target="_blank"
              rel="noreferrer"
              className="rounded-sm-6 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected"
            >
              OpenHR
            </a>{' '}
            started as a simple frustration.
          </p>
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  )
}

export { StorySection }
